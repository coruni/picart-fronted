import { useUserStore } from '~/stores/user';
import { useAppStore } from '~/stores/app';

export default defineNuxtPlugin(async () => {
  // 只在客户端运行
  if (import.meta.client) {
    // 检查 Cookie 同意状态
    const cookieConsent = useCookie('cookie-consent');
    const cookieSettings = useCookie<{ necessary?: boolean }>('cookie-settings');

    // 不使用 default，避免在未同意前创建空 cookie
    // 只有在用户同意后才创建 device-id cookie
    const deviceIdCookie = useCookie<string | null | undefined>('device-id', {
      // 不设置 default，cookie 只有在明确设置时才存在
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      watch: true
    });

    const authTokenCookie = useCookie('auth-token', {
      default: () => null,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      watch: true
    });

    // 初始化设备ID - 只有在用户同意必要 Cookie 后才设置
    // device-id 被认为是必要 Cookie，用于设备识别和安全

    // 只有在用户同意了必要 Cookie 后才处理 deviceId
    if (cookieConsent.value && cookieSettings.value?.necessary) {
      // 用户已同意，检查是否需要生成 device ID
      const existingDeviceId = deviceIdCookie.value;

      if (!existingDeviceId) {
        // 生成新的 deviceId
        try {
          const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
          const fp = await FingerprintJS.default.load();
          const result = await fp.get();
          const deviceId = result.visitorId;
          deviceIdCookie.value = deviceId;

          // 立即同步到store
          const appStore = useAppStore();
          if (appStore?.setDeviceId) {
            appStore.setDeviceId(deviceId);
          }
        } catch (error) {
          console.warn('Failed to generate fingerprint, using fallback:', error);
          const fallbackId = 'device-' + Math.random().toString(36).slice(2, 10);
          deviceIdCookie.value = fallbackId;

          // 立即同步到store
          const appStore = useAppStore();
          if (appStore?.setDeviceId) {
            appStore.setDeviceId(fallbackId);
          }
        }
      } else {
        // 如果cookie中已有设备ID，且用户已同意，才同步到store
        const appStore = useAppStore();
        if (appStore?.setDeviceId) {
          appStore.setDeviceId(existingDeviceId);
        }
      }
    } else {
      // 如果用户未同意必要 Cookie，清除可能存在的空 device-id cookie
      if (deviceIdCookie.value !== null) {
        deviceIdCookie.value = null;
      }

      // 确保完全删除 device-id cookie（使用原生方法）
      if (typeof document !== 'undefined') {
        // 删除 cookie：设置过期时间为过去
        document.cookie = 'device-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
      }
    }

    // 监听 cookie consent 变化，当用户同意后立即初始化 deviceId
    watch([cookieConsent, () => cookieSettings.value?.necessary], async ([consent, necessary]) => {
      if (consent && necessary && !deviceIdCookie.value) {
        // 用户刚刚同意了必要 Cookie，立即生成 deviceId
        try {
          const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
          const fp = await FingerprintJS.default.load();
          const result = await fp.get();
          const deviceId = result.visitorId;
          deviceIdCookie.value = deviceId;

          const appStore = useAppStore();
          if (appStore?.setDeviceId) {
            appStore.setDeviceId(deviceId);
          }
        } catch (error) {
          console.warn('Failed to generate fingerprint after consent:', error);
          const fallbackId = 'device-' + Math.random().toString(36).slice(2, 10);
          deviceIdCookie.value = fallbackId;

          const appStore = useAppStore();
          if (appStore?.setDeviceId) {
            appStore.setDeviceId(fallbackId);
          }
        }
      } else if (!consent || !necessary) {
        // 用户撤销了同意或拒绝了必要 Cookie，删除 device-id
        if (deviceIdCookie.value !== null) {
          deviceIdCookie.value = null;
        }

        // 使用原生方法确保删除
        if (typeof document !== 'undefined') {
          document.cookie =
            'device-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
        }

        // 清除 store 中的 deviceId
        const appStore = useAppStore();
        if (appStore?.setDeviceId) {
          appStore.setDeviceId('');
        }
      }
    });

    // 监听cookie变化，同步到store（仅在用户同意后）
    watch(
      deviceIdCookie,
      newValue => {
        if (newValue && cookieConsent.value && cookieSettings.value?.necessary) {
          const appStore = useAppStore();
          if (appStore?.setDeviceId) {
            appStore.setDeviceId(newValue);
          }
        }
      },
      { immediate: true }
    );

    watch(
      authTokenCookie,
      newValue => {
        if (newValue) {
          const userStore = useUserStore();
          if (userStore?.setToken) {
            userStore.setToken(newValue);
          }
        }
      },
      { immediate: true }
    );

    // 在页面加载完成后，确保cookie同步
    // 使用 nextTick 替代 onMounted，因为在插件中 onMounted 可能不可用
    await nextTick();
    setTimeout(() => {
      const appStore = useAppStore();
      const userStore = useUserStore();

      // 同步设备ID（仅在用户同意必要 Cookie 后）
      if (
        deviceIdCookie.value &&
        cookieConsent.value &&
        cookieSettings.value?.necessary &&
        appStore?.setDeviceId
      ) {
        appStore.setDeviceId(deviceIdCookie.value);
      }

      // 同步token
      if (authTokenCookie.value && userStore?.setToken) {
        userStore.setToken(authTokenCookie.value);
      }
    }, 100);
  }
});
