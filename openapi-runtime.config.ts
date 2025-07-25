import type { CreateClientConfig } from './api/client.gen';
import appConfig from './app.config';
export const createClientConfig: CreateClientConfig = config => {
  return {
    ...config,
    composable: '$fetch',
    baseURL: config?.baseURL || appConfig.apiBaseUrl,
    onRequest: req => {
      //   const token = useCookie('token').value;
      //   if (token) {
      //     req.headers = req.headers || {};
      //     req.headers['Authorization'] = `Bearer ${token}`;
      //   }
      return req;
    },
    onRequestError: error => {
      console.error('Request Error:', error);
      // 500错误处理
      if (error.response && error.response.status === 500) {
        console.error('Internal Server Error: Backend server encountered an error');
        // 可以在这里添加用户通知逻辑
      }
      return error;
    },
    onResponse: res => {
      // 只允许200和201状态码继续处理
      if (![200, 201].includes(res.response._data?.code)) {
        const error = new Error(res.response._data?.message);
        // 将响应对象附加到错误上以便调用者访问
        Object.assign(error, res.error);
        throw error;
      }
      return res;
    }
  };
};
