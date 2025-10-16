import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useAppStore } from '~/stores/app';

export interface CookieSettings {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentRecord {
  version: string; // 隐私政策版本
  timestamp: string; // ISO 8601 格式
  settings: CookieSettings;
  userAgent?: string; // 可选：用于审计
}

// Clarity 代理类型（用于 useScriptClarity 返回值）
interface ClarityProxy {
  clarity: (action: string, ...args: any[]) => void;
}

export const useCookieConsent = () => {
  const { t } = useI18n();
  const toast = useToast();
  const config = useRuntimeConfig();

  // Cookie 设置
  const cookieSettings = ref<CookieSettings>({
    necessary: true, // 必要 Cookie 始终启用
    functional: false,
    analytics: false,
    marketing: false
  });

  // 检查是否已经同意过 Cookie
  const hasConsented = ref(false);

  // Clarity 实例（仅在客户端且用户同意后初始化）
  let clarityProxy: ClarityProxy | null = null;

  // 初始化
  onMounted(() => {
    checkCookieConsent();
  });

  // 检查 Cookie 同意状态
  const checkCookieConsent = () => {
    const consent = useCookie('cookie-consent', {
      default: () => null,
      maxAge: 60 * 60 * 24 * 365 // 1年
    });

    if (!consent.value) {
      hasConsented.value = false;
    } else {
      hasConsented.value = true;
      // 加载已保存的设置
      loadCookieSettings();
    }
  };

  // 加载已保存的 Cookie 设置
  const loadCookieSettings = () => {
    const settings = useCookie('cookie-settings', {
      default: () => cookieSettings.value
    });
    cookieSettings.value = settings.value;

    // 如果已经同意，立即加载相应的脚本
    if (import.meta.client) {
      setTimeout(() => {
        loadScriptsBasedOnSettings();
      }, 100);
    }
  };

  // 接受所有 Cookie
  const acceptAll = () => {
    cookieSettings.value = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    saveSettings();
  };

  // 拒绝所有非必要 Cookie
  const rejectAll = () => {
    cookieSettings.value = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    saveSettings();
  };

  // 保存设置
  const saveSettings = async () => {
    try {
      // 创建同意记录（符合 GDPR 审计要求）
      const consentRecord: CookieConsentRecord = {
        version: '1.0', // 隐私政策版本号
        timestamp: new Date().toISOString(),
        settings: cookieSettings.value,
        userAgent: import.meta.client ? navigator.userAgent : undefined
      };

      // 保存同意状态
      const consent = useCookie('cookie-consent', {
        default: () => null as string | null,
        maxAge: 60 * 60 * 24 * 180 // 6个月（符合更严格的标准）
      });
      consent.value = 'accepted';

      // 保存具体设置
      const settings = useCookie('cookie-settings', {
        default: () => cookieSettings.value,
        maxAge: 60 * 60 * 24 * 180 // 6个月
      });
      settings.value = cookieSettings.value;

      // 保存同意记录（用于审计）
      const consentRecordCookie = useCookie('cookie-consent-record', {
        default: () => null as CookieConsentRecord | null,
        maxAge: 60 * 60 * 24 * 365 * 2 // 2年（符合 GDPR 审计要求）
      });
      consentRecordCookie.value = consentRecord;

      hasConsented.value = true;

      // 根据设置加载相应的脚本
      loadScriptsBasedOnSettings();

      // 如果同意了必要 Cookie，初始化设备 ID
      if (cookieSettings.value.necessary) {
        await initializeDeviceId();
      }

      // 显示成功消息
      toast.add({
        title: t('cookie.saved'),
        color: 'primary'
      });
    } catch (error) {
      console.error('Failed to save cookie settings:', error);
      toast.add({
        title: t('cookie.saveError'),
        color: 'error'
      });
    }
  };

  // 加载 Clarity 脚本（使用 Nuxt Scripts）
  const loadClarity = () => {
    if (import.meta.client && !clarityProxy && config.public.scripts?.clarity?.id) {
      try {
        // 使用 Nuxt Scripts 提供的全局组合式函数
        const { proxy } = useScriptClarity({
          id: config.public.scripts.clarity.id
        });

        clarityProxy = proxy as ClarityProxy;
        console.log('Clarity script loaded via Nuxt Scripts');
      } catch (error) {
        console.error('Failed to load Clarity:', error);
      }
    }
  };

  // 根据设置加载相应的脚本
  const loadScriptsBasedOnSettings = () => {
    // 这里可以根据 cookieSettings 的值来加载或移除相应的第三方脚本

    if (cookieSettings.value.analytics) {
      // 加载分析脚本 - Microsoft Clarity（使用 Nuxt Scripts）
      console.log('Loading analytics scripts (Clarity)');
      loadClarity();
    } else {
      // 如果用户拒绝分析 Cookie
      if (clarityProxy) {
        console.log('User rejected analytics cookies');
        console.warn(
          'Clarity has already been loaded. Cookie preference will apply on next visit.'
        );
      }
    }

    if (cookieSettings.value.marketing) {
      // 加载营销脚本
      console.log('Loading marketing scripts');
      // Example: loadFacebookPixel()
    }

    if (cookieSettings.value.functional) {
      // 加载功能脚本
      console.log('Loading functional scripts');
      // Example: loadChatWidget()
    }
  };

  // 检查特定类型的 Cookie 是否被允许
  const isCookieAllowed = (type: keyof CookieSettings) => {
    return cookieSettings.value[type];
  };

  // 重置 Cookie 设置（用于测试或重新选择）
  const resetCookieSettings = () => {
    const consent = useCookie('cookie-consent');
    const settings = useCookie('cookie-settings');

    consent.value = null;
    settings.value = null;

    hasConsented.value = false;
    cookieSettings.value = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
  };

  // 初始化设备 ID（在用户同意必要 Cookie 后调用）
  const initializeDeviceId = async () => {
    if (!import.meta.client) return;

    const deviceIdCookie = useCookie('device-id', {
      default: () => '',
      maxAge: 60 * 60 * 24 * 365
    });

    if (!deviceIdCookie.value && cookieSettings.value.necessary) {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const deviceId = result.visitorId;
        deviceIdCookie.value = deviceId;

        const appStore = useAppStore();
        if (appStore?.setDeviceId) {
          appStore.setDeviceId(deviceId);
        }
        console.log('Device ID initialized after consent');
      } catch (error) {
        console.error('Failed to initialize device ID:', error);
      }
    }
  };

  return {
    // 状态
    cookieSettings,
    hasConsented: readonly(hasConsented),

    // 方法
    acceptAll,
    rejectAll,
    saveSettings,
    checkCookieConsent,
    loadCookieSettings,
    isCookieAllowed,
    resetCookieSettings,
    initializeDeviceId
  };
};
