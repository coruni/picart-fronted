// 简化的HTTP客户端，主要用于获取外部数据和API调用
export interface SimpleHttpConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

export interface SimpleResponse<T = any> {
  data: T
  status: number
  statusText: string
}

export class HttpClient {
  private config: SimpleHttpConfig
  private baseURL: string
  private timeout: number

  constructor(config: SimpleHttpConfig = {}) {
    this.config = {
      baseURL: '',
      timeout: 10000,
      ...config
    }
    this.baseURL = this.config.baseURL!
    this.timeout = this.config.timeout!
  }

  // 基础请求方法
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<SimpleResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...options.headers
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      let data: T
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text() as T
      }

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('请求超时')
        }
        throw error
      }
      throw new Error('网络请求失败')
    }
  }

  // GET请求
  async get<T>(url: string, params?: Record<string, any>): Promise<SimpleResponse<T>> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
    }

    const queryString = searchParams.toString()
    const fullUrl = queryString ? `${url}?${queryString}` : url

    return this.request<T>(fullUrl, { method: 'GET' })
  }

  // POST请求
  async post<T>(url: string, data?: any): Promise<SimpleResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  // PUT请求
  async put<T>(url: string, data?: any): Promise<SimpleResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  // DELETE请求
  async delete<T>(url: string): Promise<SimpleResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' })
  }
}

// 创建默认实例
export const http = new HttpClient()

// 导出便捷方法
export const { get, post, put, delete: del } = http 