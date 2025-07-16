import type { NuxtConfig } from 'nuxt/schema'

// 扩展Nuxt配置类型以支持i18n
declare module 'nuxt/schema' {
  interface NuxtConfig {
    i18n?: {
      locales?: Array<{
        code: string
        name: string
        file?: string
        flag?: string
      }>
      defaultLocale?: string
      langDir?: string
      strategy?: 'prefix_except_default' | 'prefix' | 'prefix_and_default' | 'no_prefix'
      detectBrowserLanguage?: {
        useCookie?: boolean
        cookieKey?: string
        redirectOn?: 'root' | 'no prefix'
        alwaysRedirect?: boolean
        fallbackLocale?: string
      }
      seo?: boolean
      compilation?: {
        strictMessage?: boolean
        escapeHtml?: boolean
      }
    }
  }
}

// i18n 消息类型定义
export interface I18nMessages {
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    confirm: string
    save: string
    delete: string
    edit: string
    back: string
    next: string
    previous: string
    submit: string
    search: string
    filter: string
    reset: string
    refresh: string
    download: string
    upload: string
    close: string
    open: string
    more: string
    less: string
  }
  nav: {
    home: string
    about: string
    contact: string
    features: string
    pricing: string
    blog: string
    help: string
  }
  app: {
    title: string
    description: string
    keywords: string
  }
  theme: {
    light: string
    dark: string
    auto: string
  }
  language: {
    current: string
    select: string
    'zh-CN': string
    en: string
    ja: string
  }
  error: {
    404: {
      title: string
      description: string
      backHome: string
    }
    500: {
      title: string
      description: string
      retry: string
    }
    network: {
      title: string
      description: string
    }
  }
  form: {
    validation: {
      required: string
      email: string
      phone: string
      minLength: string
      maxLength: string
      pattern: string
    }
  }
  time: {
    now: string
    minuteAgo: string
    hourAgo: string
    dayAgo: string
    monthAgo: string
    yearAgo: string
  }
  storage: {
    quota: string
    used: string
    available: string
    clear: string
    clearConfirm: string
  }
}

// 语言环境类型
export type LocaleCode = 'zh-CN' | 'zh' | 'en' | 'ja'

// 语言选项类型
export interface LocaleOption {
  code: LocaleCode
  name: string
  flag?: string
}

// 格式化选项类型
export interface FormatOptions {
  date?: Intl.DateTimeFormatOptions
  number?: Intl.NumberFormatOptions
  currency?: {
    currency: string
    options?: Intl.NumberFormatOptions
  }
}

export {} 