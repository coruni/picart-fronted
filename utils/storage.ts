import type { StorageConfig } from '../types'
import { SYSTEM_CONFIG } from '../constants'

// 存储项接口
interface StorageItem<T = any> {
  value: T
  expire?: number
  timestamp: number
}

// 存储类型
type StorageType = 'localStorage' | 'sessionStorage'

// 存储工具类
export class StorageUtil {
  private prefix: string
  private storage: Storage

  constructor(type: StorageType = 'localStorage', config: StorageConfig = {}) {
    this.prefix = config.prefix || SYSTEM_CONFIG.STORAGE_PREFIX
    
    if (import.meta.client) {
      this.storage = type === 'localStorage' ? localStorage : sessionStorage
    } else {
      // 服务端环境的模拟存储
      this.storage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null
      } as Storage
    }
  }

  // 生成完整的key
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  // 设置存储项
  set<T>(key: string, value: T, expire?: number): boolean {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expire: expire ? Date.now() + expire : undefined
      }
      
      this.storage.setItem(this.getKey(key), JSON.stringify(item))
      return true
    } catch (error) {
      console.error('Storage set error:', error)
      return false
    }
  }

  // 获取存储项
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const itemStr = this.storage.getItem(this.getKey(key))
      if (!itemStr) {
        return defaultValue
      }

      const item: StorageItem<T> = JSON.parse(itemStr)
      
      // 检查是否过期
      if (item.expire && Date.now() > item.expire) {
        this.remove(key)
        return defaultValue
      }

      return item.value
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue
    }
  }

  // 移除存储项
  remove(key: string): boolean {
    try {
      this.storage.removeItem(this.getKey(key))
      return true
    } catch (error) {
      console.error('Storage remove error:', error)
      return false
    }
  }

  // 清空所有存储项
  clear(): boolean {
    try {
      // 只清空带有前缀的项
      const keys = this.getKeys()
      keys.forEach(key => {
        this.storage.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  }

  // 获取所有带前缀的key
  getKeys(): string[] {
    const keys: string[] = []
    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keys.push(key)
        }
      }
    } catch (error) {
      console.error('Storage getKeys error:', error)
    }
    return keys
  }

  // 获取所有存储项
  getAll(): Record<string, any> {
    const result: Record<string, any> = {}
    try {
      const keys = this.getKeys()
      keys.forEach(fullKey => {
        const key = fullKey.replace(this.prefix, '')
        const value = this.get(key)
        if (value !== undefined) {
          result[key] = value
        }
      })
    } catch (error) {
      console.error('Storage getAll error:', error)
    }
    return result
  }

  // 检查key是否存在
  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  // 获取存储大小（近似值）
  getSize(): number {
    try {
      let size = 0
      const keys = this.getKeys()
      keys.forEach(key => {
        const value = this.storage.getItem(key)
        if (value) {
          size += value.length
        }
      })
      return size
    } catch (error) {
      console.error('Storage getSize error:', error)
      return 0
    }
  }

  // 检查存储是否可用
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__'
      this.storage.setItem(testKey, 'test')
      this.storage.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }
}

// 创建默认实例
export const storage = new StorageUtil('localStorage')
export const sessionStorageUtil = new StorageUtil('sessionStorage')

// 便捷方法
export const setLocal = <T>(key: string, value: T, expire?: number) => storage.set(key, value, expire)
export const getLocal = <T>(key: string, defaultValue?: T) => storage.get<T>(key, defaultValue)
export const removeLocal = (key: string) => storage.remove(key)
export const clearLocal = () => storage.clear()

export const setSession = <T>(key: string, value: T, expire?: number) => sessionStorageUtil.set(key, value, expire)
export const getSession = <T>(key: string, defaultValue?: T) => sessionStorageUtil.get<T>(key, defaultValue)
export const removeSession = (key: string) => sessionStorageUtil.remove(key)
export const clearSession = () => sessionStorageUtil.clear()

// Token相关便捷方法
export const setToken = (token: string) => setLocal(SYSTEM_CONFIG.TOKEN_KEY, token)
export const getToken = () => getLocal<string>(SYSTEM_CONFIG.TOKEN_KEY)
export const removeToken = () => removeLocal(SYSTEM_CONFIG.TOKEN_KEY)

// 用户信息相关便捷方法
export const setUserInfo = (userInfo: any) => setLocal(SYSTEM_CONFIG.USER_KEY, userInfo)
export const getUserInfo = () => getLocal<any>(SYSTEM_CONFIG.USER_KEY)
export const removeUserInfo = () => removeLocal(SYSTEM_CONFIG.USER_KEY)

// 清除登录信息
export const clearAuth = () => {
  removeToken()
  removeUserInfo()
} 