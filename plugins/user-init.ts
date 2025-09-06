export default defineNuxtPlugin(async () => {
  // 确保用户状态在SSR时正确初始化
  const userStore = useUserStore();

  // 在服务端，尝试从cookie恢复用户状态
  if (import.meta.server) {
    const authTokenCookie = useCookie('auth-token');
    const refreshTokenCookie = useCookie('refresh-token');

    if (authTokenCookie.value && !userStore.token) {
      userStore.setToken(authTokenCookie.value);
    }

    if (refreshTokenCookie.value && !userStore.refreshToken) {
      userStore.setRefreshToken(refreshTokenCookie.value);
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
