import type { CreateClientConfig } from './api/client.gen';
import appConfig from './app.config';

export const createClientConfig: CreateClientConfig = config => {
  return {
    ...config,
    composable: '$fetch',
    baseURL: config?.baseURL || appConfig.apiBaseUrl,
    onRequest: context => {
      // 开发环境使用配置的token
      if (process.env.NODE_ENV === 'development') {
        console.log(123);

        // 初始化 headers，支持多种类型
        if (!context.options.headers) {
          context.options.headers = new Headers();
        }

        // 处理不同类型的 headers
        if (context.options.headers instanceof Headers) {
          // Headers 对象
          context.options.headers.set('Device-Id', 'uuid-1');
          context.options.headers.set(
            'Authorization',
            `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJkZXZpY2VJZCI6InV1aWQtMSIsImlhdCI6MTc1MzM2NzQ5NywiZXhwIjoxNzUzOTcyMjk3fQ.l8mtYHbScJPceGXsWm8dEmP2y3H6XCey8I224a2V1UM`
          );
        } else {
          // 对象形式: { key: 'value' }
          const headers = context.options.headers as Record<string, string>;
          headers['Device-Id'] = 'uuid-1';
          headers['Authorization'] =
            `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJkZXZpY2VJZCI6InV1aWQtMSIsImlhdCI6MTc1MzM2NzQ5NywiZXhwIjoxNzUzOTcyMjk3fQ.l8mtYHbScJPceGXsWm8dEmP2y3H6XCey8I224a2V1UM`;
        }
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
