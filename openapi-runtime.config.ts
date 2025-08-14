import { usePinia } from '#imports';
import type { CreateClientConfig } from './api/client.gen';
import appConfig from './app.config';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const createClientConfig: CreateClientConfig = config => {
  return {
    ...config,
    baseURL: config?.baseURL || appConfig.apiBaseUrl,
    onRequest: async context => {
      try {
        // 从 store 获取设备ID，从 cookie 获取 token
        let deviceId = 'unknown-device';
        let token: string | null = null;

        // 客户端：从 store 和 cookie 获取信息
        if (import.meta.client) {
          try {
            const pinia = usePinia();
            const userStore = useUserStore(pinia);
            const appStore = useAppStore(pinia);

            // 从 store 获取设备ID
            if (appStore?.deviceId && appStore.deviceId !== 'unknown') {
              deviceId = appStore.deviceId;
            }

            // 从 store 获取 token（优先）
            if (userStore?.isLoggedIn && userStore.userToken) {
              token = userStore.userToken;
            } else {
              // 如果 store 中没有，则从 cookie 获取
              const authTokenCookie = useCookie('auth-token', {
                default: () => null,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7,
                httpOnly: false,
                watch: true
              });

              const tokenCookie = useCookie('token', {
                default: () => null,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7,
                httpOnly: false,
                watch: true
              });

              // 优先使用 auth-token，如果没有则使用 token
              token = authTokenCookie.value || tokenCookie.value;
            }
          } catch (error) {
            console.warn('Failed to get info from stores/cookies:', error);
          }
        } else {
          // SSR阶段：尝试从请求头获取cookie
          try {
            const event = useRequestEvent();
            if (event?.node?.req?.headers?.cookie) {
              const cookies = event.node.req.headers.cookie;
              // console.log('SSR: Reading cookies from request headers:', cookies);

              // 解析cookie字符串
              const cookieArray = cookies.split(';').map(cookie => cookie.trim());
              cookieArray.forEach(cookie => {
                const [name, value] = cookie.split('=');
                if (name && value) {
                  if (name === 'device-id') {
                    deviceId = value;
                  } else if (name === 'auth-token' || name === 'token') {
                    if (!token) token = value; // 优先使用 auth-token
                  }
                }
              });
            }
          } catch (error) {
            console.warn('SSR: Failed to read cookies from request headers:', error);
          }
        }

        // 调试日志
        console.log('onRequest - deviceId:', deviceId, 'token:', token ? '***' : null);

        // 更新请求headers
        await updateRequestHeaders(context, deviceId, token);
      } catch (error) {
        console.error('Error in onRequest:', error);
        // 即使出错也要继续，使用默认值
        await updateRequestHeaders(context, 'unknown-device', null);
      }

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

// 设置token到cookie的辅助函数
export function setTokenToCookie(token: string): void {
  // 这个函数现在在插件中处理
  console.log('setTokenToCookie called with:', token);
}

// 清除token cookie的辅助函数
export function clearTokenCookie(): void {
  // 这个函数现在在插件中处理
  console.log('clearTokenCookie called');
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
    // console.log('Headers set (Headers instance):', {
    //   'Device-Id': deviceId,
    //   Authorization: token ? `Bearer ${token}` : 'not set'
    // });
  } else {
    // 对象形式: { key: 'value' }
    const headers = context.options.headers as Record<string, string>;
    headers['Device-Id'] = deviceId;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // console.log('Headers set (object):', {
    //   'Device-Id': deviceId,
    //   Authorization: token ? `Bearer ${token}` : 'not set'
    // });
  }
}

// 在用户登录时调用此函数来设置token
export function setAuthToken(token: string, userStore?: any): void {
  // 设置到store
  if (userStore?.setToken) {
    userStore.setToken(token);
  }

  // 设置到cookie（通过插件处理）
  if (import.meta.client) {
    const authTokenCookie = useCookie('auth-token', {
      default: () => '',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      watch: true
    });
    authTokenCookie.value = token;
  }
}

// 用户登出时调用此函数
export function clearAuthToken(userStore?: any): void {
  // 清除store
  if (userStore?.clearToken) {
    userStore.clearToken();
  }

  // 清除cookie（通过插件处理）
  if (import.meta.client) {
    const authTokenCookie = useCookie('auth-token', {
      default: () => null,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      watch: true
    });
    const tokenCookie = useCookie('token', {
      default: () => null,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      watch: true
    });
    const deviceIdCookie = useCookie('device-id', {
      default: () => '',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      watch: true
    });

    authTokenCookie.value = null;
    tokenCookie.value = null;
    deviceIdCookie.value = '';
  }

  // 清除localStorage
  if (import.meta.client) {
    try {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('token');
      localStorage.removeItem('device-id');
      localStorage.removeItem('user');
      localStorage.removeItem('app');
    } catch (error) {
      console.warn('Failed to clear token from localStorage:', error);
    }
  }
}
