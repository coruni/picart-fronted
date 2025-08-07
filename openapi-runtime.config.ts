import type { CreateClientConfig } from './api/client.gen';
import appConfig from './app.config';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const createClientConfig: CreateClientConfig = config => {
  return {
    ...config,
    composable: '$fetch',
    baseURL: config?.baseURL || appConfig.apiBaseUrl,
    onRequest: async context => {
      // 获取用户 store 实例
      const pinia = usePinia();
      const userStore = useUserStore(pinia);

      // 生成基于浏览器指纹的唯一设备ID
      let deviceId = 'unknown';
      if (import.meta.client) {
        // 检查localStorage中是否已存在设备ID
        deviceId = localStorage.getItem('device-id') || '';

        // 如果没有存储的设备ID，则生成新的指纹ID
        if (!deviceId) {
          try {
            // 使用FingerprintJS生成浏览器指纹
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            deviceId = result.visitorId;
            // 将指纹ID存储到localStorage
            localStorage.setItem('device-id', deviceId);
          } catch (error) {
            console.error('Failed to generate fingerprint:', error);
            // 如果指纹生成失败，使用备用ID
            deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device-id', deviceId);
          }
        }

        // 更新当前请求的headers
        updateRequestHeaders(context, deviceId, userStore);
      }
      return context;
    },
    onRequestError: context => {
      console.error('Request Error:', context.error);
      // 500错误处理
      if (context.response && context.response.status === 500) {
        console.error('Internal Server Error: Backend server encountered an error');
        // 可以在这里添加用户通知逻辑
      }
      return context;
    },
    onResponse: context => {
      // 只允许200和201状态码继续处理
      if (![200, 201].includes(context.response._data?.code)) {
        const error = new Error(context.response._data?.message);
        // 将响应数据附加到错误上以便调用者访问
        Object.assign(error, { response: context.response });
        throw error;
      }
      return context;
    }
  };
};

// 辅助函数：更新请求headers
function updateRequestHeaders(context: any, deviceId: string, userStore: any) {
  // 初始化 headers，支持多种类型
  if (!context.options.headers) {
    context.options.headers = new Headers();
  }

  // 处理不同类型的 headers
  if (context.options.headers instanceof Headers) {
    // Headers 对象
    context.options.headers.set('Device-Id', deviceId);
  } else {
    // 对象形式: { key: 'value' }
    const headers = context.options.headers as Record<string, string>;
    headers['Device-Id'] = deviceId;
  }

  // 如果用户已认证，使用 store 中的 token
  if (userStore.isAuthenticated && userStore.token) {
    // 处理不同类型的 headers
    if (context.options.headers instanceof Headers) {
      // Headers 对象
      context.options.headers.set('Authorization', `Bearer ${userStore.token}`);
    } else {
      // 对象形式: { key: 'value' }
      const headers = context.options.headers as Record<string, string>;
      headers['Authorization'] = `Bearer ${userStore.token}`;
    }
  }
}
