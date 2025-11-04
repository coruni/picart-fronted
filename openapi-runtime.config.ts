import { usePinia } from '#imports';
import type { CreateClientConfig } from './app/api/client.gen';
import appConfig from './app/app.config';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// 防止重复调用logout的标志位
let isLoggingOut = false;

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
            // console.warn('Failed to get info from stores/cookies:', error);
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
            // console.warn('SSR: Failed to read cookies from request headers:', error);
          }

          // SSR阶段：如果从cookie没有获取到token，尝试从useCookie获取
          if (!token) {
            try {
              const authTokenCookie = useCookie('auth-token', {
                default: () => null,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7,
                httpOnly: false
              });

              const tokenCookie = useCookie('token', {
                default: () => null,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7,
                httpOnly: false
              });

              // 优先使用 auth-token，如果没有则使用 token
              token = authTokenCookie.value || tokenCookie.value;
            } catch (error) {
              // console.warn('SSR: Failed to get token from useCookie:', error);
            }
          }

          // SSR阶段：如果仍然没有token，尝试从用户store获取
          if (!token) {
            try {
              const userStore = useUserStore();
              if (userStore?.isLoggedIn && userStore.userToken) {
                token = userStore.userToken;
              }
            } catch (error) {
              // console.warn('SSR: Failed to get token from user store:', error);
            }
          }
        }

        // 调试日志
        // console.log('onRequest - deviceId:', deviceId, 'token:', token ? '***' : null);

        // 更新请求headers
        await updateRequestHeaders(context, deviceId, token);
      } catch (error) {
        // console.error('Error in onRequest:', error);
        // 即使出错也要继续，使用默认值
        await updateRequestHeaders(context, 'unknown-device', null);
      }

      return context;
    },
    onRequestError: context => {
      // console.error('Request Error:', context.error);
      // 500错误处理
      // if (context.response && context.response.status === 500) {
      //   // console.error('Internal Server Error: Backend server encountered an error');
      //   // 可以在这里添加用户通知逻辑
      //   const toast = useToast();
      //   const { $i18n } = useNuxtApp();
      //   const t = $i18n.t;
      //   toast.add({
      //     title: t('error.serverError'),
      //     color: 'error',
      //     icon: 'mynaui:slash-circle',
      //     ui: { close: 'cursor-pointer' }
      //   });
      // }
      return context;
    },
    onResponse: context => {
      // 只允许200和201状态码继续处理
      if (![200, 201].includes(context.response.status)) {
        if (context.response.status === 401) {
          // 防止重复调用logout
          if (!isLoggingOut) {
            isLoggingOut = true;
            // 使用新的统一登出函数
            performLogout().finally(() => {
              // 重置标志位，延迟重置以避免短时间内多次401响应
              setTimeout(() => {
                isLoggingOut = false;
              }, 2000);
            });
          }
          return;
        }
        const error = new Error((context.response._data as any)?.message || 'Request failed');
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
      if ((context.response._data as any)?.data?.message) {
        const toast = useToast();
        const { $i18n } = useNuxtApp();
        const t = $i18n.t;
        toast.add({
          title: t((context.response._data as any).data.message || 'Success'),
          color: 'primary',
          icon: 'mynaui:check-circle',
          ui: { close: 'cursor-pointer' }
        });
      }
      return context;
    }
  };
};

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

// 用户登出时调用此函数 - 已弃用，请使用 userStore.clearAuth()
export function clearAuthToken(): void {
  console.warn('clearAuthToken() is deprecated. Please use userStore.clearAuth() instead.');

  if (import.meta.client) {
    try {
      // 清理认证相关的cookie
      const cookiesToClear = ['auth-token', 'refresh-token', 'token', 'user-session'];

      cookiesToClear.forEach(cookieName => {
        // 使用多种方式确保cookie被清除
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      });

      // 清理localStorage
      const localStorageKeys = [
        'auth-token',
        'refresh-token',
        'user',
        'app',
        'user-session',
        'pinia-user',
        'pinia-app'
      ];

      localStorageKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove localStorage key ${key}:`, error);
        }
      });

      // 清理sessionStorage
      const sessionStorageKeys = ['auth-token', 'refresh-token', 'user-session'];

      sessionStorageKeys.forEach(key => {
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove sessionStorage key ${key}:`, error);
        }
      });
    } catch (error) {
      console.error('Error in clearAuthToken:', error);
    }
  }
}

// 新的统一登出函数
export async function performLogout(): Promise<void> {
  try {
    // 获取用户store
    const userStore = useUserStore();

    // 在token失效的情况下，不调用logout API，直接清理本地状态
    // 这样可以避免因为token失效而导致logout API调用失败
    if (import.meta.client) {
      await userStore.clearAuth(false); // 不调用API，直接清理本地状态
    }
  } catch (error) {
    console.error('Error during logout:', error);
    // 即使出错也要跳转到首页
    if (import.meta.client) {
      navigateTo('/', { replace: true });
    }
  }
}
