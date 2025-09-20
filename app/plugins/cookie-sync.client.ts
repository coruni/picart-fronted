import { useUserStore } from '~/stores/user';
import { useAppStore } from '~/stores/app';

export default defineNuxtPlugin(async () => {
  // 只在客户端运行
  if (import.meta.client) {
    // 确保cookie在客户端正确同步
    const deviceIdCookie = useCookie('device-id', {
      default: () => '',
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

    // 初始化设备ID
    if (!deviceIdCookie.value) {
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

        console.log('Generated new device ID:', deviceId);
      } catch (error) {
        console.warn('Failed to generate fingerprint, using fallback:', error);
        const fallbackId = 'device-' + Math.random().toString(36).slice(2, 10);
        deviceIdCookie.value = fallbackId;

        // 立即同步到store
        const appStore = useAppStore();
        if (appStore?.setDeviceId) {
          appStore.setDeviceId(fallbackId);
        }

        // console.log('Using fallback device ID:', fallbackId);
      }
    } else {
      // 如果cookie中已有设备ID，立即同步到store
      const appStore = useAppStore();
      if (appStore?.setDeviceId) {
        appStore.setDeviceId(deviceIdCookie.value);
      }
    }

    // 监听cookie变化，同步到store
    watch(
      deviceIdCookie,
      newValue => {
        if (newValue) {
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

      // 同步设备ID
      if (deviceIdCookie.value && appStore?.setDeviceId) {
        appStore.setDeviceId(deviceIdCookie.value);
      }

      // 同步token
      if (authTokenCookie.value && userStore?.setToken) {
        userStore.setToken(authTokenCookie.value);
      }
    }, 100);
  }
});
