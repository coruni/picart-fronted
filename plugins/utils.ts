export default defineNuxtPlugin(() => {
  // 简化的工具函数插件
  return {
    provide: {
      utils: {
        // 可以在这里添加常用的工具函数
        formatDate: (date: Date, format: string = 'YYYY-MM-DD') => {
          const d = new Date(date)
          const year = d.getFullYear()
          const month = (d.getMonth() + 1).toString().padStart(2, '0')
          const day = d.getDate().toString().padStart(2, '0')
          
          return format
            .replace('YYYY', year.toString())
            .replace('MM', month)
            .replace('DD', day)
        },
        
        formatCurrency: (amount: number) => {
          return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY'
          }).format(amount)
        },
        
        truncateText: (text: string, length: number) => {
          return text.length > length ? text.slice(0, length) + '...' : text
        }
      }
    }
  }
}) 