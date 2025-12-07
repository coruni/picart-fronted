import { useUserStore } from '~/stores/user';
import { userControllerGetProfile } from '~/api';
import type { UserControllerGetProfileResponse } from '~/api';

type UserInfo = UserControllerGetProfileResponse['data'];

export default defineNuxtPlugin(async nuxtApp => {
  const userStore = useUserStore();

  // 辅助函数：检查是否有认证token
  const hasAuthToken = () => {
    try {
      const authTokenCookie = useCookie('auth-token', {
        default: () => null,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false
      });
      return !!authTokenCookie.value;
    } catch (error) {
      return false;
    }
  };

  // 辅助函数：获取用户信息
  const fetchUserInfo = async () => {
    if (!hasAuthToken()) {
      return;
    }

    try {
      const response = await userControllerGetProfile({
        key: `user-profile-${Date.now()}`,
        composable: 'useAsyncData',
        cache: 'no-cache'
      });

      // 如果成功获取用户信息，更新到store
      if (response.data && response.data.value) {
        userStore.setUserInfo(response.data.value.data);
      }
    } catch (error) {
      // 如果获取失败（可能是token过期），清除用户信息（不清理token）
      userStore.setUserInfo(null as any);
    }
  };

  // 在服务器端立即尝试获取用户信息（如果存在token）
  if (!import.meta.client) {
    await fetchUserInfo();
  }

  // 在客户端，使用多个时机确保用户信息获取
  if (import.meta.client) {
    // 1. 立即尝试获取
    fetchUserInfo();

    // 2. 在组件挂载后再次尝试
    nuxtApp.hook('app:mounted', async () => {
      await fetchUserInfo();

      // 3. 如果仍然没有用户信息且有token，再次尝试
      if (!userStore.userInfo && hasAuthToken()) {
        setTimeout(async () => {
          await fetchUserInfo();
        }, 100);
      }
    });

    // 4. 在路由完成加载后也尝试一次
    nuxtApp.hook('page:finish', async () => {
      if (!userStore.userInfo && hasAuthToken()) {
        await fetchUserInfo();
      }
    });

    // 5. 监听cookie变化
    const authTokenCookie = useCookie('auth-token');
    watch(authTokenCookie, (newToken, oldToken) => {
      if (newToken !== oldToken) {
        if (newToken) {
          fetchUserInfo();
        } else {
          userStore.setUserInfo(null as any);
          userStore.rememberedUsername = null;
          userStore.$patch({});
        }
      }
    });
  }
});
