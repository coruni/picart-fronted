export default defineNuxtPlugin(() => {
  // 简化的存储工具
  const storageUtils = {
    set: (key: string, value: any) => {
      if (import.meta.client) {
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
          console.warn('存储失败:', error)
        }
      }
    },
    
    get: (key: string, defaultValue: any = null) => {
      if (import.meta.client) {
        try {
          const item = localStorage.getItem(key)
          return item ? JSON.parse(item) : defaultValue
        } catch (error) {
          console.warn('读取存储失败:', error)
          return defaultValue
        }
      }
      return defaultValue
    },
    
    remove: (key: string) => {
      if (import.meta.client) {
        localStorage.removeItem(key)
      }
    }
  }

  // 提供存储工具给整个应用
  return {
    provide: {
      storage: storageUtils
    }
  }
}) 