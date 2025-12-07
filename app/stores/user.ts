import { defineStore } from 'pinia';
import {
  userControllerGetProfile,
  userControllerLogout,
  type UserControllerGetProfileResponse
} from '~/api';
type UserInfo = UserControllerGetProfileResponse['data'];

interface UserState {
  rememberedUsername: string | null;
  userInfo: UserInfo | null;
}

// 清理客户端存储的独立函数
async function clearClientStorage() {
  // 清理用户信息cookie
  const userCookie = useCookie('user');
  userCookie.value = null;

  // 清理记住的用户名
  const rememberedUsernameCookie = useCookie('remembered-username');
  rememberedUsernameCookie.value = null;

  // 彻底清理认证相关的所有cookie
  if (import.meta.client) {
    const allCookies = ['auth-token', 'refresh-token', 'token', 'user-session', 'user'];
    allCookies.forEach(cookieName => {
      try {
        // 多种方式清理cookie
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      } catch (error) {
        // Cookie清理失败时静默处理
      }
    });

    // 清除localStorage中可能存储的用户数据
    try {
      const keysToRemove = ['user-info', 'user-data', 'session-data', 'auth-state'];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      // Storage清理失败时静默处理
    }
  }
}

export const useUserStore = defineStore<'user', UserState, {}, {}>('user', {
  state: (): UserState => ({
    rememberedUsername: null,
    userInfo: null
  }),

  getters: {
    isLoggedIn: state => {
      // 从cookie获取token判断是否登录
      const tokenCookie = useCookie('auth-token', {
        default: () => null,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        watch: true
      });
      return !!tokenCookie.value;
    },

    userToken: state => {
      // 从cookie获取token
      const tokenCookie = useCookie('auth-token', {
        default: () => null,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        watch: true
      });
      return tokenCookie.value;
    },

    currentUser: state => state.userInfo,
    hasRememberedUsername: state => !!state.rememberedUsername
  },

  actions: {
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
    },

    setRememberedUsername(username: string) {
      this.rememberedUsername = username;
    },

    clearRememberedUsername() {
      this.rememberedUsername = null;
    },

    login(userInfo: UserInfo) {
      // 只保存用户信息，token已在cookie中
      this.userInfo = userInfo;
    },

    async getUserInfo(forceRefresh: boolean = false) {
      if (!this.userInfo) return;
      try {
        // 直接调用API获取用户信息
        const response = await userControllerGetProfile({
          cache: 'no-cache',
          composable: 'useAsyncData'
        });

        // 如果成功获取用户信息，更新到store
        if (response.data && response.data.value) {
          this.userInfo = response.data.value.data;
        }
      } catch (error) {
        // 获取失败时清空用户信息（不清理token，cookie会自然失效）
        this.userInfo = null;
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
            // 登出API调用失败时静默处理，继续本地清理
          }
        }

        // 清理所有认证相关的状态
        this.userInfo = null;
        this.rememberedUsername = null;

        // 在客户端清理存储
        if (import.meta.client) {
          await clearClientStorage();
        }
      } catch (error) {
        // 即使出错也要清理本地状态
        this.userInfo = null;
        this.rememberedUsername = null;
      }
    }
  },

  persist: {
    storage: piniaPluginPersistedstate.cookies(),
    paths: ['userInfo', 'rememberedUsername']
  }
});
