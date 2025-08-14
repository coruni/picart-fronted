import { usePinia } from '#imports';
import type { CreateClientConfig } from './api/client.gen';
import appConfig from './app.config';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const createClientConfig: CreateClientConfig = config => {
  return {
    ...config,
    baseURL: config?.baseURL || appConfig.apiBaseUrl,
    onRequest: async context => {
      let userStore: any = null;
      let appStore: any = null;

      try {
        // 获取用户 store 实例，添加SSR兼容性检查
        const pinia = usePinia();
        userStore = useUserStore(pinia);
        appStore = useAppStore(pinia);
      } catch (error) {
        console.warn('Failed to initialize stores in SSR context:', error);
      }

      // 获取设备ID
      const deviceId = await getOrCreateDeviceId(appStore);

      // 获取token
      const token = await getTokenFromCookie(userStore);

      // 更新请求headers
      await updateRequestHeaders(context, deviceId, token);

      return context;
    },
    onRequestError: context => {
      console.error('Request Error:', context.error);
      // 500错误处理
      if (context.response && context.response.status === 500) {
        console.error('Internal Server Error: Backend server encountered an error');
        // 可以在这里添加用户通知逻辑
        const toast = useToast();
        const { $i18n } = useNuxtApp();
        const t = $i18n.t;
        toast.add({
          title: t('error.serverError'),
          color: 'error',
          icon: 'mynaui:slash-circle',
          ui: { close: 'cursor-pointer' }
        });
      }
      return context;
    },
    onResponse: context => {
      // 只允许200和201状态码继续处理
      if (![200, 201].includes(context.response.status)) {
        const error = new Error(context.response._data?.message);
        // 将响应数据附加到错误上以便调用者访问
        Object.assign(error, { response: context.response });
        // 发起提示
        const toast = useToast();
        const { $i18n } = useNuxtApp();
        const t = $i18n.t;

        toast.add({
          title: t(error.message),
          color: 'error',
          icon: 'mynaui:slash-circle',
          ui: { close: 'cursor-pointer' }
        });

        throw error;
      }
      return context;
    }
  };
};

// 获取或创建设备ID
async function getOrCreateDeviceId(appStore: any): Promise<string> {
  // 统一使用 Nuxt 的 useCookie
  const deviceIdCookie = useCookie('device-id', {
    default: () => '',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 365, // 1年
    httpOnly: false // 需要在客户端访问
  });

  if (import.meta.client) {
    // 客户端：优先从store获取
    if (appStore?.getDeviceId && appStore.getDeviceId !== 'unknown') {
      return appStore.getDeviceId;
    }

    // 如果cookie中已经有值，同步到store
    if (deviceIdCookie.value) {
      if (appStore?.setDeviceId) {
        appStore.setDeviceId(deviceIdCookie.value);
      }
      return deviceIdCookie.value;
    }

    // 生成新的设备ID
    let deviceId: string;
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      deviceId = result.visitorId;
    } catch (error) {
      console.warn('Failed to generate fingerprint, using fallback:', error);
      deviceId = 'device-' + Math.random().toString(36).slice(2, 10);
    }

    // 设置到cookie和store
    deviceIdCookie.value = deviceId;
    if (appStore?.setDeviceId) {
      console.log('Setting device-id cookie:', deviceId);

      appStore.setDeviceId(deviceId);
    }

    return deviceId;
  } else {
    // 服务器端：直接从cookie获取
    const deviceId = deviceIdCookie.value || 'unknown-device';

    if (!deviceIdCookie.value) {
      console.warn(
        'No device-id found in cookie during SSR. This may cause authentication issues.'
      );
    }

    return deviceId;
  }
}

// 从cookie获取token
async function getTokenFromCookie(userStore: any): Promise<string | null> {
  // 优先从store获取
  if (userStore?.isLoggedIn) {
    return userStore.userToken;
  }

  // 统一使用 Nuxt 的 useCookie
  const authTokenCookie = useCookie('auth-token', {
    default: () => null,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7天
    httpOnly: false // 需要在客户端访问
  });

  if (authTokenCookie.value) {
    return authTokenCookie.value;
  }

  // 尝试其他token cookie名称
  const tokenCookie = useCookie('token', {
    default: () => null,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7天
    httpOnly: false
  });

  return tokenCookie.value || null;
}

// 设置token到cookie的辅助函数
export function setTokenToCookie(token: string): void {
  const authTokenCookie = useCookie('auth-token', {
    default: () => '',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7天
    httpOnly: false
  });
  authTokenCookie.value = token;
}

// 清除token cookie的辅助函数
export function clearTokenCookie(): void {
  const authTokenCookie = useCookie('auth-token', {
    default: () => null,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false
  });

  const tokenCookie = useCookie('token', {
    default: () => null,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false
  });

  authTokenCookie.value = null;
  tokenCookie.value = null;
}

// 辅助函数：更新请求headers
async function updateRequestHeaders(
  context: any,
  deviceId: string,
  token: string | null
): Promise<void> {
  // 初始化 headers，支持多种类型
  if (!context.options.headers) {
    context.options.headers = new Headers();
  }

  // 设置设备ID
  if (context.options.headers instanceof Headers) {
    context.options.headers.set('Device-Id', deviceId);
    if (token) {
      context.options.headers.set('Authorization', `Bearer ${token}`);
    }
  } else {
    // 对象形式: { key: 'value' }
    const headers = context.options.headers as Record<string, string>;
    headers['Device-Id'] = deviceId;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
}

// 在用户登录时调用此函数来设置token
export function setAuthToken(token: string, userStore?: any): void {
  // 设置到cookie
  setTokenToCookie(token);

  // 设置到store
  if (userStore?.setToken) {
    userStore.setToken(token);
  }
}

// 用户登出时调用此函数
export function clearAuthToken(userStore?: any): void {
  // 清除cookie
  clearTokenCookie();

  // 清除store
  if (userStore?.clearToken) {
    userStore.clearToken();
  }

  // 清除localStorage
  if (import.meta.client) {
    try {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('token');
    } catch (error) {
      console.warn('Failed to clear token from localStorage:', error);
    }
  }
}
