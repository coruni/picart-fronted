// 日期工具函数

// 格式化日期
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return ''
  }
  
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const seconds = d.getSeconds()
  
  const formatMap: Record<string, string> = {
    'YYYY': year.toString(),
    'YY': year.toString().slice(-2),
    'MM': month.toString().padStart(2, '0'),
    'M': month.toString(),
    'DD': day.toString().padStart(2, '0'),
    'D': day.toString(),
    'HH': hours.toString().padStart(2, '0'),
    'H': hours.toString(),
    'mm': minutes.toString().padStart(2, '0'),
    'm': minutes.toString(),
    'ss': seconds.toString().padStart(2, '0'),
    's': seconds.toString()
  }
  
  return format.replace(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g, (match) => formatMap[match])
}

// 获取相对时间
export function getRelativeTime(date: Date | string | number): string {
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)
  
  if (years > 0) return `${years}年前`
  if (months > 0) return `${months}个月前`
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

// 获取日期范围
export function getDateRange(type: 'today' | 'yesterday' | 'week' | 'month' | 'year'): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date()
  const end = new Date()
  
  switch (type) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'yesterday':
      start.setDate(now.getDate() - 1)
      start.setHours(0, 0, 0, 0)
      end.setDate(now.getDate() - 1)
      end.setHours(23, 59, 59, 999)
      break
    case 'week':
      const dayOfWeek = now.getDay()
      start.setDate(now.getDate() - dayOfWeek)
      start.setHours(0, 0, 0, 0)
      end.setDate(now.getDate() + (6 - dayOfWeek))
      end.setHours(23, 59, 59, 999)
      break
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(now.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'year':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(11, 31)
      end.setHours(23, 59, 59, 999)
      break
  }
  
  return { start, end }
}

// 计算两个日期之间的差异
export function dateDiff(date1: Date | string | number, date2: Date | string | number): {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
} {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diff = Math.abs(d2.getTime() - d1.getTime())
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)
  
  return {
    years,
    months: months % 12,
    days: days % 30,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60
  }
}

// 添加时间
export function addTime(date: Date | string | number, amount: number, unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds'): Date {
  const d = new Date(date)
  
  switch (unit) {
    case 'years':
      d.setFullYear(d.getFullYear() + amount)
      break
    case 'months':
      d.setMonth(d.getMonth() + amount)
      break
    case 'days':
      d.setDate(d.getDate() + amount)
      break
    case 'hours':
      d.setHours(d.getHours() + amount)
      break
    case 'minutes':
      d.setMinutes(d.getMinutes() + amount)
      break
    case 'seconds':
      d.setSeconds(d.getSeconds() + amount)
      break
  }
  
  return d
}

// 获取月份天数
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

// 判断是否为闰年
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

// 获取星期几
export function getWeekday(date: Date | string | number, locale: string = 'zh-CN'): string {
  const d = new Date(date)
  return d.toLocaleDateString(locale, { weekday: 'long' })
}

// 获取月份名称
export function getMonthName(month: number, locale: string = 'zh-CN'): string {
  const date = new Date(2000, month - 1, 1)
  return date.toLocaleDateString(locale, { month: 'long' })
}

// 解析日期字符串
export function parseDate(dateString: string): Date | null {
  // 尝试多种格式
  const formats = [
    /^\d{4}-\d{2}-\d{2}$/,           // YYYY-MM-DD
    /^\d{4}\/\d{2}\/\d{2}$/,         // YYYY/MM/DD
    /^\d{2}-\d{2}-\d{4}$/,           // MM-DD-YYYY
    /^\d{2}\/\d{2}\/\d{4}$/,         // MM/DD/YYYY
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, // YYYY-MM-DD HH:mm:ss
  ]
  
  for (const format of formats) {
    if (format.test(dateString)) {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }
  
  return null
}

// 获取时间戳
export function getTimestamp(date?: Date | string | number): number {
  return date ? new Date(date).getTime() : Date.now()
}

// 从时间戳创建日期
export function fromTimestamp(timestamp: number): Date {
  return new Date(timestamp)
}

// 格式化时间段
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}天 ${hours % 24}小时`
  if (hours > 0) return `${hours}小时 ${minutes % 60}分钟`
  if (minutes > 0) return `${minutes}分钟 ${seconds % 60}秒`
  return `${seconds}秒`
}

// 获取时区偏移
export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset()
}

// 转换为UTC时间
export function toUTC(date: Date | string | number): Date {
  const d = new Date(date)
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000)
}

// 从UTC时间转换为本地时间
export function fromUTC(date: Date | string | number): Date {
  const d = new Date(date)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
}

// 获取季度
export function getQuarter(date: Date | string | number): number {
  const d = new Date(date)
  return Math.floor(d.getMonth() / 3) + 1
}

// 获取年份的第几周
export function getWeekOfYear(date: Date | string | number): number {
  const d = new Date(date)
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekStart = new Date(yearStart)
  weekStart.setDate(yearStart.getDate() - yearStart.getDay())
  
  return Math.floor((d.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
} 