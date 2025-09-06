import { defineStore } from 'pinia';
import {
  userControllerGetProfile,
  userControllerLogout,
  type UserControllerGetProfileResponse
} from '~~/api';
type UserInfo = UserControllerGetProfileResponse['data'];

interface UserState {
  token: string | null;
  refreshToken: string | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  rememberedUsername: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: null,
    refreshToken: null,
    userInfo: null,
    isAuthenticated: false,
    rememberedUsername: null
  }),

  getters: {
    isLoggedIn: state => state.isAuthenticated && !!state.token,
    userToken: state => state.token,
    currentUser: state => state.userInfo,
    hasRememberedUsername: state => !!state.rememberedUsername
  },

  actions: {
    setToken(token: string) {
      this.token = token;
      this.isAuthenticated = true;
    },

    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
    },

    setRememberedUsername(username: string) {
      this.rememberedUsername = username;
    },

    clearRememberedUsername() {
      this.rememberedUsername = null;
    },

    login(token: string, refreshToken: string, userInfo: UserInfo) {
      this.token = token;
      this.refreshToken = refreshToken;
      this.userInfo = userInfo;
      this.isAuthenticated = true;
    },

    setRefreshToken(refreshToken: string) {
      this.refreshToken = refreshToken;
    },

    async getUserInfo() {
      if (!this.isLoggedIn) return;
      try {
        const { data } = await userControllerGetProfile({
          composable: 'useFetch'
        });
        this.userInfo = data.value?.data!;
      } catch (error) {
        // 获取失败时清空
        this.clearAuth(false);
      }
    },

    async clearAuth(logout: boolean = true) {
      if (import.meta.client && logout) {
        await userControllerLogout({
          composable: '$fetch'
        });
        // 使用与登录时相同的配置来清除 cookie
        const authToken = useCookie('auth-token', {
          default: () => '',
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          httpOnly: false
        });

        const refreshToken = useCookie('refresh-token', {
          default: () => '',
          expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          httpOnly: false
        });

        // 清除 cookie 值
        authToken.value = '';
        refreshToken.value = '';

        // 使用更简单的方式清除 cookie（保留 device-id）
        const cookiesToClear = ['auth-token', 'refresh-token', 'token'];

        cookiesToClear.forEach(cookieName => {
          // 使用 document.cookie 直接清除，不设置额外的属性
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        try {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('refresh-token');
          localStorage.removeItem('user');
          localStorage.removeItem('app');
        } catch (error) {}
        // 强制刷新页面，确保所有状态都被重置
        this.token = null;
        this.userInfo = null;
        this.isAuthenticated = false;
        this.rememberedUsername = null;
        this.refreshToken = null;
        window.location.href = '/';
      }
    }
  },

  persist: {
    storage: import.meta.client
      ? piniaPluginPersistedstate.localStorage()
      : piniaPluginPersistedstate.cookies()
  }
});
