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

        cookieArray.forEach(cookie => {
          const [name, value] = cookie.split('=');
          if (name && value) {
            // 对于重要的cookie，确保它们被正确设置
            if (name === 'device-id' || name === 'auth-token' || name === 'token') {
              const secure = process.env.NODE_ENV === 'production';
              const sameSite = 'Lax';
              const maxAge = name === 'device-id' ? 60 * 60 * 24 * 365 : 60 * 60 * 24 * 7;

              const cookieString = `${name}=${value}; Path=/; HttpOnly=false; Secure=${secure}; SameSite=${sameSite}; Max-Age=${maxAge}`;

              // 添加到响应头中
              const existingCookies = (event.node.res.getHeader('Set-Cookie') as string[]) || [];
              existingCookies.push(cookieString);
              event.node.res.setHeader('Set-Cookie', existingCookies);

              // console.log(`SSR: Preserved cookie ${name} for client`);
            }
          }
        });
      }
    }
  }
});
