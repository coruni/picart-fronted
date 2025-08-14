import { defineStore } from 'pinia';
import type { UserControllerGetProfileResponse } from '~~/api';
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

    clearAuth() {
      this.token = null;
      this.userInfo = null;
      this.isAuthenticated = false;
      this.rememberedUsername = null;

      // 清除认证相关的cookie
      if (import.meta.client) {
        // 清除所有认证相关的cookie
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        // document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'device-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // 清除localStorage
        try {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('token');
          localStorage.removeItem('device-id');
          localStorage.removeItem('user');
          localStorage.removeItem('app');
        } catch (error) {
          console.warn('Failed to clear localStorage:', error);
        }

        // 强制刷新页面，确保所有状态都被重置
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
