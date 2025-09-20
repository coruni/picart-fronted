export default defineNuxtPlugin(() => {
  // 只在服务端运行
  if (!import.meta.client) {
    const event = useRequestEvent();

    if (event) {
      // 在SSR阶段，确保cookie被正确处理
      const cookies = event.node.req.headers.cookie;

      if (cookies) {
        // console.log('SSR: Received cookies from client:', cookies);

        // 解析并设置cookie到响应中，确保客户端能接收到
        const cookieArray = cookies.split(';').map(cookie => cookie.trim());
        const importantCookies = new Map();

        cookieArray.forEach(cookie => {
          const [name, value] = cookie.split('=');
          if (name && value) {
            // 对于重要的cookie，确保它们被正确设置
            if (name === 'device-id' || name === 'auth-token' || name === 'token' || name === 'refresh-token') {
              importantCookies.set(name, value);
            }
          }
        });

        // 设置重要的cookie到响应头中
        if (importantCookies.size > 0) {
          const existingCookies = (event.node.res.getHeader('Set-Cookie') as string[]) || [];
          
          importantCookies.forEach((value, name) => {
            const secure = process.env.NODE_ENV === 'production';
            const sameSite = 'Lax';
            let maxAge = 60 * 60 * 24 * 7; // 默认7天
            
            if (name === 'device-id') {
              maxAge = 60 * 60 * 24 * 365; // 设备ID保存1年
            } else if (name === 'refresh-token') {
              maxAge = 60 * 60 * 24 * 90; // 刷新token保存90天
            }

            const cookieString = `${name}=${value}; Path=/; SameSite=${sameSite}; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
            existingCookies.push(cookieString);
            
            // console.log(`SSR: Preserved cookie ${name} for client`);
          });
          
          event.node.res.setHeader('Set-Cookie', existingCookies);
        }
      }
    }
  }
});
