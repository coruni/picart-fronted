// 应用状态管理 - 使用Pinia，确保数据安全
export const useAppStore = defineStore('app', {
  state: () => ({
    theme: 'light' as 'light' | 'dark',
    language: 'zh' as string,
    loading: false as boolean,
    error: null as string | null,
    deviceId: '' as string,
    // 维护模式状态
    maintenance: {
      enabled: false as boolean,
      message: '' as string
    },
    // i18n相关状态
    i18n: {
      availableLocales: ['zh', 'en', 'ja'] as string[],
      dateFormat: 'default' as string,
      numberFormat: 'default' as string,
      currencyFormat: 'default' as string
    }
  }),

  getters: {
    isDarkMode: state => state.theme === 'dark',
    isLoading: state => state.loading,
    hasError: state => !!state.error,
    currentLocale: state => state.language,
    getDeviceId: state => state.deviceId,
    supportedLocales: state => state.i18n.availableLocales,
    // 维护模式相关getters
    isMaintenanceMode: state => state.maintenance.enabled,
    maintenanceMessage: state => state.maintenance.message
  },

  actions: {
    setTheme(newTheme: 'light' | 'dark') {
      this.theme = newTheme;
      if (import.meta.client) {
        const html = document.documentElement;
        if (newTheme === 'dark') {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      }
    },
    setDeviceId(deviceId: string) {
      this.deviceId = deviceId;
    },

    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
    },

    setLanguage(newLanguage: string) {
      this.language = newLanguage;
    },

    setLoading(isLoading: boolean) {
      this.loading = isLoading;
    },

    setError(errorMessage: string | null) {
      this.error = errorMessage;
    },

    clearError() {
      this.error = null;
    },

    // 维护模式相关操作
    setMaintenanceMode(enabled: boolean) {
      this.maintenance.enabled = enabled;
    },

    setMaintenanceMessage(message: string) {
      this.maintenance.message = message;
    },

    updateMaintenance(config: { enabled: boolean; message: string }) {
      this.maintenance.enabled = config.enabled;
      this.maintenance.message = config.message;
    },

    // i18n相关操作
    setI18nFormat(type: 'date' | 'number' | 'currency', format: string) {
      this.i18n[`${type}Format`] = format;
    },

    updateAvailableLocales(locales: string[]) {
      this.i18n.availableLocales = locales;
    }
  },

  persist: {
    storage: import.meta.client
      ? piniaPluginPersistedstate.localStorage()
      : piniaPluginPersistedstate.cookies()
  }
});
