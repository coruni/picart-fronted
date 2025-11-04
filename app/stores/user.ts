import { defineStore } from 'pinia';
import {
  userControllerGetProfile,
  userControllerLogout,
  type UserControllerGetProfileResponse
} from '~/api';
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
        // 直接调用API获取用户信息
        const response = await userControllerGetProfile({
          composable: 'useAsyncData'
        });

        // 如果成功获取用户信息，更新到store
        if (response.data && response.data.value) {
          this.userInfo = response.data.value.data;
        }
      } catch (error) {
        // 获取失败时清空
        this.clearAuth(false);
      }
    },

    async clearAuth(logout: boolean = true) {
      try {
        // 如果是在客户端且需要调用登出API
        if (import.meta.client && logout) {
          try {
            await userControllerLogout({
              composable: '$fetch'
            });
          } catch (error) {
            console.warn('Logout API call failed, continuing with local cleanup:', error);
          }
        }

        // 清理所有认证相关的状态
        this.token = null;
        this.userInfo = null;
        this.isAuthenticated = false;
        this.rememberedUsername = null;
        this.refreshToken = null;

        // 在客户端清理存储
        if (import.meta.client) {
          await this.clearClientStorage();
        }
      } catch (error) {
        console.error('Error during logout:', error);
        // 即使出错也要清理本地状态
        this.token = null;
        this.userInfo = null;
        this.isAuthenticated = false;
        this.rememberedUsername = null;
        this.refreshToken = null;
      }
    },

    // 清理客户端存储的辅助方法
    async clearClientStorage() {
      try {
        // 清理所有认证相关的cookie
        const cookiesToClear = ['auth-token', 'refresh-token', 'token', 'user-session'];

        const cookies = useCookie('auth-token');
        const refreshTokenCookie = useCookie('refresh-token');
        const tokenCookie = useCookie('token');
        const userSessionCookie = useCookie('user-session');
        const userCookie = useCookie('user');
        cookies.value = null;
        refreshTokenCookie.value = null;
        tokenCookie.value = null;
        userSessionCookie.value = null;
        userCookie.value = null;

        cookiesToClear.forEach(cookieName => {
          // 使用多种方式确保cookie被清除
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        });

        // 清理localStorage
        const localStorageKeys = [
          'auth-token',
          'refresh-token',
          'user',
          'app',
          'user-session',
          'pinia-user',
          'pinia-app'
        ];

        localStorageKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.warn(`Failed to remove localStorage key ${key}:`, error);
          }
        });

        // 清理sessionStorage
        const sessionStorageKeys = ['auth-token', 'refresh-token', 'user-session'];

        sessionStorageKeys.forEach(key => {
          try {
            sessionStorage.removeItem(key);
          } catch (error) {
            console.warn(`Failed to remove sessionStorage key ${key}:`, error);
          }
        });

        // 清理IndexedDB中的用户数据（如果有的话）
        try {
          if ('indexedDB' in window) {
            const deleteRequest = indexedDB.deleteDatabase('user-data');
            deleteRequest.onerror = () => {
              console.warn('Failed to clear IndexedDB user data');
            };
          }
        } catch (error) {
          console.warn('Failed to clear IndexedDB:', error);
        }

        // 延迟跳转，确保清理完成
        setTimeout(() => {
          // 使用navigateTo而不是直接修改window.location，这样更符合Nuxt的规范
          navigateTo('/', { replace: true });
        }, 100);
      } catch (error) {
        console.error('Error clearing client storage:', error);
        // 即使清理失败也要跳转
        navigateTo('/', { replace: true });
      }
    }
  },

  persist: {
    storage: import.meta.client
      ? piniaPluginPersistedstate.localStorage()
      : piniaPluginPersistedstate.cookies(),
    // 在SSR时只持久化token，userInfo通过API获取确保数据最新
    pick: import.meta.server
      ? ['token', 'refreshToken', 'isAuthenticated', 'rememberedUsername']
      : undefined
  }
});
