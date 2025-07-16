// 应用状态管理 - 使用Pinia，确保数据安全
export const useAppStore = defineStore('app', {
  state: () => ({
    theme: 'light' as 'light' | 'dark',
    language: 'zh-CN' as string,
    loading: false as boolean,
    error: null as string | null,
    // i18n相关状态
    i18n: {
      availableLocales: ['zh-CN', 'en', 'ja'] as string[],
      dateFormat: 'default' as string,
      numberFormat: 'default' as string,
      currencyFormat: 'default' as string
    }
  }),

  getters: {
    isDarkMode: (state) => state.theme === 'dark',
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    currentLocale: (state) => state.language,
    supportedLocales: (state) => state.i18n.availableLocales
  },

  actions: {
    setTheme(newTheme: 'light' | 'dark') {
      this.theme = newTheme
    },

    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    },

    setLanguage(newLanguage: string) {
      this.language = newLanguage
    },

    setLoading(isLoading: boolean) {
      this.loading = isLoading
    },

    setError(errorMessage: string | null) {
      this.error = errorMessage
    },

    clearError() {
      this.error = null
    },

    // i18n相关操作
    setI18nFormat(type: 'date' | 'number' | 'currency', format: string) {
      this.i18n[`${type}Format`] = format
    },

    updateAvailableLocales(locales: string[]) {
      this.i18n.availableLocales = locales
    }
  },

  // 持久化配置 - 确保数据安全，只在客户端存储
  persist: {
    // 自定义key，防止冲突
    key: 'picart-app-settings',
    // 只持久化必要的状态，不包含敏感信息
    pick: ['theme', 'language', 'i18n'],
    // 使用localStorage（客户端专用）
    storage: import.meta.client ? localStorage : undefined
  }
}) 