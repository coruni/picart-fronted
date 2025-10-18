import { useNuxtApp } from '#app';

export interface LocaleOption {
  code: string;
  name: string;
  flag?: string;
}

export interface I18nComposable {
  // 当前语言
  locale: ComputedRef<string>;
  // 所有可用语言
  locales: ComputedRef<LocaleOption[]>;
  // 翻译函数
  t: (key: string, params?: Record<string, any>) => string;
  // 切换语言
  setLocale: (locale: string) => Promise<void>;
  // 获取本地化路径
  localePath: (route: string, locale?: string) => string;
  // 获取切换语言路径
  switchLocalePath: (locale: string) => string;
  // 格式化日期
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  // 格式化数字
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  // 格式化货币
  formatCurrency: (amount: number, currency?: string) => string;
  // 相对时间格式化
  formatRelativeTime: (date: Date | string) => string;
}

/**
 * i18n 国际化组合式函数
 * 提供完整的国际化功能支持
 */
export const useCustomI18n = (): I18nComposable => {
  const { $i18n } = useNuxtApp();

  // 当前语言
  const locale = computed(() => $i18n.locale.value);

  // 所有可用语言
  const locales = computed(() =>
    $i18n.locales.value.map((locale: any) => ({
      code: locale.code,
      name: locale.name,
      flag: locale.flag
    }))
  );

  // 翻译函数
  const t = (key: string, params?: Record<string, any>): string => {
    return $i18n.t(key, params || {}) as string;
  };

  // 切换语言
  const setLocale = async (newLocale: string): Promise<void> => {
    await $i18n.setLocale(newLocale as any);
  };

  // 获取本地化路径
  const localePath = (route: string, locale?: string): string => {
    return ($i18n as any).localePath(route, locale);
  };

  // 获取切换语言路径
  const switchLocalePath = (locale: string): string => {
    return ($i18n as any).switchLocalePath(locale);
  };

  // 格式化日期
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return new Intl.DateTimeFormat(locale.value, { ...defaultOptions, ...options }).format(dateObj);
  };

  // 格式化数字
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(locale.value, options).format(number);
  };

  // 格式化货币
  const formatCurrency = (amount: number, currency = 'CNY'): string => {
    const currencyMap: Record<string, string> = {
      zh: 'CNY',
      en: 'USD',
      ja: 'JPY'
    };

    const targetCurrency = currencyMap[locale.value] || currency;

    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: targetCurrency
    }).format(amount);
  };

  // 相对时间格式化
  const formatRelativeTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t('time.now');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('time.minuteAgo', { n: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('time.hourAgo', { n: hours });
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return t('time.dayAgo', { n: days });
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return t('time.monthAgo', { n: months });
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return t('time.yearAgo', { n: years });
    }
  };

  return {
    locale,
    locales,
    t,
    setLocale,
    localePath,
    switchLocalePath,
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime
  };
};

/**
 * 语言切换器组合式函数
 * 提供语言切换的状态管理
 */
export const useLanguageSwitcher = () => {
  const { locale, locales, setLocale, switchLocalePath } = useCustomI18n();
  const router = useRouter();

  // 切换语言并跳转
  const switchLanguage = async (newLocale: string) => {
    if (newLocale === locale.value) return;

    try {
      // 获取当前路由对应的新语言路径
      const newPath = switchLocalePath(newLocale);

      // 切换语言
      await setLocale(newLocale);

      // 跳转到新路径
      await router.push(newPath);
    } catch (error) {}
  };

  return {
    locale,
    locales,
    switchLanguage
  };
};

/**
 * 表单验证i18n组合式函数
 * 提供国际化的表单验证消息
 */
export const useFormValidationI18n = () => {
  const { t } = useCustomI18n();

  const getValidationMessage = (rule: string, params?: Record<string, any>): string => {
    const key = `form.validation.${rule}`;
    return t(key, params);
  };

  // 常用验证规则
  const validationRules = {
    required: () => getValidationMessage('required'),
    email: () => getValidationMessage('email'),
    phone: () => getValidationMessage('phone'),
    minLength: (min: number) => getValidationMessage('minLength', { min }),
    maxLength: (max: number) => getValidationMessage('maxLength', { max }),
    pattern: () => getValidationMessage('pattern')
  };

  return {
    getValidationMessage,
    validationRules
  };
};
