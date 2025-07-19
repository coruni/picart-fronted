import type { CreateClientConfig } from "./api/client.gen";
import appConfig from "./app.config";
export const createClientConfig: CreateClientConfig = (config) => {
  return {
    ...config,
    composable: "$fetch",
    baseURL: config?.baseURL || appConfig.apiBaseUrl,
    onRequest: (req) => {
      //   const token = useCookie('token').value;
      //   if (token) {
      //     req.headers = req.headers || {};
      //     req.headers['Authorization'] = `Bearer ${token}`;
      //   }
      return req;
    },
    onResponse: (res) => {
      //   if (res.status >= 400) {
      //     console.error('API Error:', res);
      //   }
      return res;
    },
  };
};
