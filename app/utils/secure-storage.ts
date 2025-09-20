// 安全存储工具 - 确保数据只在客户端存储，绝不泄露到服务端

// 安全存储接口
interface SecureStorageItem<T = any> {
  value: T
  timestamp: number
  expire?: number
  encrypted?: boolean
}

// 安全存储配置
interface SecureStorageConfig {
  prefix?: string
  encrypt?: boolean
  defaultExpire?: number
}

// 安全存储类 - 只在客户端工作
export class SecureStorage {
  private prefix: string
  private storage: Storage | null = null
  private encrypt: boolean

  constructor(config: SecureStorageConfig = {}) {
    this.prefix = config.prefix || 'picart_secure_'
    this.encrypt = config.encrypt || false
    
    // 严格检查：只在客户端初始化存储
    if (import.meta.client && typeof window !== 'undefined' && window.localStorage) {
      this.storage = localStorage
    } else {
      // 服务端或不支持localStorage的环境
      this.storage = null
      if (import.meta.server) {
        console.warn('SecureStorage: 服务端环境，存储功能已禁用')
      }
    }
  }

  // 检查存储是否可用
  private isAvailable(): boolean {
    return this.storage !== null && import.meta.client
  }

  // 生成安全的存储key
  private getSecureKey(key: string): string {
    return `${this.prefix}${key}`
  }

  // 简单的数据混淆（不是真正的加密，只是防止直接读取）
  private obfuscate(data: string): string {
    if (!this.encrypt) return data
    
    // 简单的Base64编码 + 反转
    return btoa(data).split('').reverse().join('')
  }

  // 解混淆
  private deobfuscate(data: string): string {
    if (!this.encrypt) return data
    
    try {
      // 反转 + Base64解码
      return atob(data.split('').reverse().join(''))
    } catch {
      return data // 如果解码失败，返回原数据
    }
  }

  // 设置数据 - 只在客户端执行
  set<T>(key: string, value: T, expireMinutes?: number): boolean {
    // 严格检查：只在客户端执行
    if (!this.isAvailable()) {
      if (import.meta.server) {
        console.warn(`SecureStorage.set: 服务端环境，拒绝存储数据 "${key}"`)
      }
      return false
    }

    try {
      const item: SecureStorageItem<T> = {
        value,
        timestamp: Date.now(),
        expire: expireMinutes ? Date.now() + (expireMinutes * 60 * 1000) : undefined,
        encrypted: this.encrypt
      }

      const serialized = JSON.stringify(item)
      const obfuscated = this.obfuscate(serialized)
      
      this.storage!.setItem(this.getSecureKey(key), obfuscated)
      return true
    } catch (error) {
      console.error('SecureStorage.set 失败:', error)
      return false
    }
  }

  // 获取数据 - 只在客户端执行
  get<T>(key: string, defaultValue?: T): T | undefined {
    // 严格检查：只在客户端执行
    if (!this.isAvailable()) {
      if (import.meta.server) {
        console.warn(`SecureStorage.get: 服务端环境，无法读取数据 "${key}"`)
      }
      return defaultValue
    }

    try {
      const obfuscated = this.storage!.getItem(this.getSecureKey(key))
      if (!obfuscated) {
        return defaultValue
      }

      const serialized = this.deobfuscate(obfuscated)
      const item: SecureStorageItem<T> = JSON.parse(serialized)

      // 检查过期时间
      if (item.expire && Date.now() > item.expire) {
        this.remove(key)
        return defaultValue
      }

      return item.value
    } catch (error) {
      console.error('SecureStorage.get 失败:', error)
      this.remove(key) // 清除损坏的数据
      return defaultValue
    }
  }

  // 移除数据 - 只在客户端执行
  remove(key: string): boolean {
    if (!this.isAvailable()) {
      return false
    }

    try {
      this.storage!.removeItem(this.getSecureKey(key))
      return true
    } catch (error) {
      console.error('SecureStorage.remove 失败:', error)
      return false
    }
  }

  // 清空所有数据 - 只在客户端执行
  clear(): boolean {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const keys = this.getKeys()
      keys.forEach(key => {
        this.storage!.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('SecureStorage.clear 失败:', error)
      return false
    }
  }

  // 获取所有相关的key
  private getKeys(): string[] {
    if (!this.isAvailable()) {
      return []
    }

    const keys: string[] = []
    try {
      for (let i = 0; i < this.storage!.length; i++) {
        const key = this.storage!.key(i)
        if (key && key.startsWith(this.prefix)) {
          keys.push(key)
        }
      }
    } catch (error) {
      console.error('SecureStorage.getKeys 失败:', error)
    }
    return keys
  }

  // 检查key是否存在
  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  // 获取存储大小信息
  getStorageInfo() {
    if (!this.isAvailable()) {
      return {
        available: false,
        totalKeys: 0,
        estimatedSize: 0
      }
    }

    const keys = this.getKeys()
    let estimatedSize = 0

    keys.forEach(key => {
      const value = this.storage!.getItem(key)
      if (value) {
        estimatedSize += value.length
      }
    })

    return {
      available: true,
      totalKeys: keys.length,
      estimatedSize,
      estimatedSizeKB: Math.round(estimatedSize / 1024 * 100) / 100
    }
  }
}

// 创建默认的安全存储实例
export const secureStorage = new SecureStorage({
  prefix: 'picart_',
  encrypt: false // 可以根据需要启用简单混淆
})

// 创建加密存储实例（用于敏感数据）
export const encryptedStorage = new SecureStorage({
  prefix: 'picart_enc_',
  encrypt: true
})

// 便捷方法
export const setSecure = <T>(key: string, value: T, expireMinutes?: number) => 
  secureStorage.set(key, value, expireMinutes)

export const getSecure = <T>(key: string, defaultValue?: T) => 
  secureStorage.get<T>(key, defaultValue)

export const removeSecure = (key: string) => 
  secureStorage.remove(key)

export const clearSecure = () => 
  secureStorage.clear()

// 用户数据相关（使用加密存储）
export const setUserData = (userData: any) => 
  encryptedStorage.set('user_data', userData, 60 * 24) // 24小时过期

export const getUserData = () => 
  encryptedStorage.get('user_data')

export const removeUserData = () => 
  encryptedStorage.remove('user_data')

// 应用设置相关（使用普通存储）
export const setAppSettings = (settings: any) => 
  secureStorage.set('app_settings', settings)

export const getAppSettings = () => 
  secureStorage.get('app_settings')

// 临时数据相关（短期过期）
export const setTempData = (key: string, data: any, minutes = 30) => 
  secureStorage.set(`temp_${key}`, data, minutes)

export const getTempData = (key: string) => 
  secureStorage.get(`temp_${key}`)

export default secureStorage 