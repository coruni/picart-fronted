import { useUserStore } from '~/stores/user';

export default defineNuxtPlugin(async () => {
  // 确保用户状态在SSR时正确初始化
  const userStore = useUserStore();

  // 在服务端，尝试从cookie恢复用户状态
  if (import.meta.server) {
    try {
      const authTokenCookie = useCookie('auth-token', {
        default: () => null,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false
      });
      
      const refreshTokenCookie = useCookie('refresh-token', {
        default: () => null,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 90,
        httpOnly: false
      });

      // 从cookie恢复token
      if (authTokenCookie.value && !userStore.token) {
        userStore.setToken(authTokenCookie.value);
      }

      if (refreshTokenCookie.value && !userStore.refreshToken) {
        userStore.setRefreshToken(refreshTokenCookie.value);
      }

      // 如果从cookie没有获取到token，尝试从请求头获取
      if (!authTokenCookie.value) {
        const event = useRequestEvent();
        if (event?.node?.req?.headers?.cookie) {
          const cookies = event.node.req.headers.cookie;
          const cookieArray = cookies.split(';').map(cookie => cookie.trim());
          
          cookieArray.forEach(cookie => {
            const [name, value] = cookie.split('=');
            if (name && value) {
              if (name === 'auth-token' && !userStore.token) {
                userStore.setToken(value);
              } else if (name === 'refresh-token' && !userStore.refreshToken) {
                userStore.setRefreshToken(value);
              }
            }
          });
        }
      }
    } catch (error) {
      console.warn('SSR: Failed to initialize user state from cookies:', error);
    }
  }

  // 在客户端，如果用户已认证但用户信息为空，尝试重新获取用户信息
  if (import.meta.client) {
    await nextTick();
    if (userStore.isLoggedIn) {
      try {
        const { userControllerGetProfile } = await import('~/api');
        const response = await userControllerGetProfile({
          composable: '$fetch'
        });

        if (response.data) {
          userStore.setUserInfo(response.data);
        }
      } catch (error) {
        console.warn('Failed to refresh user info:', error);
        // 如果获取用户信息失败，可能是token过期，清除认证状态
        userStore.clearAuth(false);
      }
    }
  }
});
