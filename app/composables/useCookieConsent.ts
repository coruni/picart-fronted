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

export const useCookieConsent = () => {
  const { t } = useI18n();
  const toast = useToast();

  // Cookie 设置
  const cookieSettings = ref<CookieSettings>({
    necessary: true, // 必要 Cookie 始终启用
    functional: false,
    analytics: false,
    marketing: false
  });

  // 检查是否已经同意过 Cookie - 直接从cookie读取，避免状态不同步
  const hasConsented = ref(false);

  // 在客户端挂载时检查并加载设置
  onMounted(() => {
    checkCookieConsent();
  });

  // 检查 Cookie 同意状态
  const checkCookieConsent = () => {
    const consent = useCookie('cookie-consent', {
      default: () => null,
      maxAge: 60 * 60 * 24 * 365, // 1年
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false
    });

    // 设置同意状态
    hasConsented.value = !!consent.value;

    // 如果已同意，加载已保存的设置
    if (consent.value) {
      loadCookieSettings();
    }
  };

  // 加载已保存的 Cookie 设置
  const loadCookieSettings = () => {
    const settings = useCookie('cookie-settings', {
      default: () => cookieSettings.value,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false
    });
    cookieSettings.value = settings.value;
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
        maxAge: 60 * 60 * 24 * 180, // 6个月（符合更严格的标准）
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: false
      });
      consent.value = 'accepted';

      // 保存具体设置
      const settings = useCookie('cookie-settings', {
        default: () => cookieSettings.value,
        maxAge: 60 * 60 * 24 * 180, // 6个月
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: false
      });
      settings.value = cookieSettings.value;

      // 保存同意记录（用于审计）
      const consentRecordCookie = useCookie('cookie-consent-record', {
        default: () => null as CookieConsentRecord | null,
        maxAge: 60 * 60 * 24 * 365 * 2, // 2年（符合 GDPR 审计要求）
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: false
      });
      consentRecordCookie.value = consentRecord;

      // 设置同意状态
      hasConsented.value = true;

      // 如果同意了必要 Cookie，初始化设备 ID
      if (cookieSettings.value.necessary) {
        await initializeDeviceId();
      }
    } catch (error) {
      // 保存 Cookie 设置失败时静默处理
      toast.add({
        title: t('cookie.saveError'),
        color: 'error'
      });
    }
  };

  // 检查特定类型的 Cookie 是否被允许
  const isCookieAllowed = (type: keyof CookieSettings) => {
    return cookieSettings.value[type];
  };

  // 重置 Cookie 设置（用于测试或重新选择）
  const resetCookieSettings = () => {
    const consent = useCookie('cookie-consent', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false
    });
    const settings = useCookie('cookie-settings', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false
    });

    consent.value = null;
    settings.value = null;

    // 设置同意状态
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

    // 不设置 default，避免创建空 cookie
    const deviceIdCookie = useCookie<string | null | undefined>('device-id', {
      maxAge: 60 * 60 * 24 * 365,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: false
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
      } catch (error) {
        // 初始化设备ID失败时静默处理
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
