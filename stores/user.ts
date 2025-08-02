import { defineStore } from 'pinia';

interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  status: string;
  banned: unknown;
  banReason: unknown;
  avatar: string;
  description: unknown;
  address: unknown;
  gender: string;
  birthDate: unknown;
  articleCount: number;
  followerCount: number;
  followingCount: number;
  level: number;
  experience: number;
  score: number;
  wallet: number;
  membershipLevel: number;
  membershipLevelName: string;
  membershipStatus: string;
  membershipStartDate: unknown;
  membershipEndDate: unknown;
  lastLoginAt: unknown;
  lastActiveAt: unknown;
  inviterId: unknown;
  inviteCode: string;
  inviteEarnings: string;
  inviteCount: number;
  roles: Array<{
    id?: number;
    name?: string;
    displayName?: unknown;
    description?: string;
    permissions?: Array<{
      id: number;
      name: string;
      description: string;
    }>;
    createdAt?: string;
    updatedAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

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
      this.setToken(token);
      this.setRefreshToken(refreshToken);
      this.setUserInfo(userInfo);
    },
    setRefreshToken(refreshToken: string) {
      this.refreshToken = refreshToken;
    },

    logout() {
      this.token = null;
      this.refreshToken = null;
      this.userInfo = null;

      this.isAuthenticated = false;
    },

    clearAuth() {
      this.token = null;
      this.userInfo = null;
      this.isAuthenticated = false;
      this.rememberedUsername = null;
    }
  },

  persist: {
    key: 'picart-user-auth',
    pick: ['token', 'userInfo', 'isAuthenticated', 'refreshToken', 'rememberedUsername'],
    storage: typeof localStorage !== 'undefined' ? localStorage : undefined
  }
});
