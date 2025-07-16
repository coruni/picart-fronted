export default defineNuxtPlugin(() => {
  // 简化的HTTP客户端
  const httpClient = {
    async get(url: string, params?: Record<string, any>) {
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
      
      const response = await fetch(fullUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      }
      
      return await response.json()
    },
    
    async post(url: string, data?: any) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : undefined
      })
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      }
      
      return await response.json()
    }
  }

  // 提供HTTP客户端给整个应用
  return {
    provide: {
      http: httpClient
    }
  }
}) 