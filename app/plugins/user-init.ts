import { useUserStore } from '~/stores/user';
import { userControllerGetProfile } from '~/api';
import type { UserControllerGetProfileResponse } from '~/api';

type UserInfo = UserControllerGetProfileResponse['data'];

export default defineNuxtPlugin(async nuxtApp => {
  const userStore = useUserStore();

  // 检查是否有认证token
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

  // 如果有token，在服务器端和客户端都获取用户信息
  if (authTokenCookie.value) {
    // 恢复token到store
    if (!userStore.token) {
      userStore.setToken(authTokenCookie.value);
    }
    if (refreshTokenCookie.value && !userStore.refreshToken) {
      userStore.setRefreshToken(refreshTokenCookie.value);
    }

    // 使用 useAsyncData 在服务端获取用户信息，自动处理 SSR 水合
    const { data: userInfoData, error } = await useAsyncData(
      'user-profile',
      async () => {
        try {
          const response = await userControllerGetProfile({
            composable: '$fetch'
          });
          return response.data as UserInfo;
        } catch (err) {
          console.warn('Failed to fetch user profile:', err);
          return null;
        }
      },
      {
        // 只在有token时才获取
        server: !!authTokenCookie.value,
        lazy: false,
        // 设置缓存时间
        getCachedData: key => {
          const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
          return data;
        }
      }
    );

    // 如果成功获取用户信息，更新到store
    if (userInfoData.value) {
      userStore.setUserInfo(userInfoData.value);
    } else if (error.value) {
      // 如果获取失败（可能是token过期），清除认证状态
      console.warn('Failed to get user profile, clearing auth state');
      await userStore.clearAuth(false);
    }
  }

  // 在客户端，如果用户已认证但没有用户信息，尝试重新获取
  if (import.meta.client) {
    nuxtApp.hook('app:mounted', async () => {
      if (userStore.isLoggedIn && !userStore.userInfo) {
        try {
          const response = await userControllerGetProfile({
            composable: '$fetch'
          });

          if (response.data) {
            userStore.setUserInfo(response.data);
          }
        } catch (error) {
          console.warn('Client: Failed to refresh user info:', error);
          await userStore.clearAuth(false);
        }
      }
    });
  }
});
