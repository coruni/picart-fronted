// 格式化工具函数

// 格式化货币
export function formatCurrency(amount: number, currency: string = 'CNY', locale: string = 'zh-CN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// 格式化百分比
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

// 格式化手机号
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`
  }
  
  return phone
}

// 格式化身份证号
export function formatIdCard(idCard: string): string {
  const cleaned = idCard.replace(/\s/g, '')
  
  if (cleaned.length === 18) {
    return `${cleaned.slice(0, 6)} ${cleaned.slice(6, 10)} ${cleaned.slice(10, 14)} ${cleaned.slice(14)}`
  }
  
  return idCard
}

// 格式化银行卡号
export function formatBankCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '')
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
}

// 脱敏处理
export const mask = {
  // 手机号脱敏
  phone: (phone: string): string => {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  },
  
  // 邮箱脱敏
  email: (email: string): string => {
    const [username, domain] = email.split('@')
    if (username.length <= 3) {
      return `${username[0]}***@${domain}`
    }
    return `${username.slice(0, 3)}***@${domain}`
  },
  
  // 身份证脱敏
  idCard: (idCard: string): string => {
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
  },
  
  // 银行卡脱敏
  bankCard: (cardNumber: string): string => {
    return cardNumber.replace(/(\d{4})\d+(\d{4})/, '$1 **** **** $2')
  },
  
  // 姓名脱敏
  name: (name: string): string => {
    if (name.length <= 2) {
      return name[0] + '*'
    }
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
  },
  
  // 地址脱敏
  address: (address: string): string => {
    if (address.length <= 6) {
      return address.slice(0, 3) + '***'
    }
    return address.slice(0, 6) + '***'
  }
}

// 高亮搜索关键词
export function highlightKeywords(text: string, keywords: string | string[], className: string = 'highlight'): string {
  if (!keywords) return text
  
  const keywordArray = Array.isArray(keywords) ? keywords : [keywords]
  let result = text
  
  keywordArray.forEach(keyword => {
    if (keyword.trim()) {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      result = result.replace(regex, `<span class="${className}">$1</span>`)
    }
  })
  
  return result
}

// 格式化JSON
export function formatJSON(obj: unknown, indent: number = 2): string {
  try {
    return JSON.stringify(obj, null, indent)
  } catch {
    return String(obj)
  }
}

// 格式化XML
export function formatXML(xml: string): string {
  const PADDING = ' '.repeat(2)
  const reg = /(>)(<)(\/*)/g
  const formatted = xml.replace(reg, '$1\r\n$2$3')
  let pad = 0
  
  return formatted.split('\r\n').map(line => {
    let indent = 0
    if (line.match(/.+<\/\w[^>]*>$/)) {
      indent = 0
    } else if (line.match(/^<\/\w/) && pad !== 0) {
      pad -= 1
    } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1
    } else {
      indent = 0
    }
    
    const padding = PADDING.repeat(pad)
    pad += indent
    return padding + line
  }).join('\r\n')
}

// 格式化SQL
export function formatSQL(sql: string): string {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
    'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE',
    'DELETE', 'CREATE', 'ALTER', 'DROP', 'INDEX', 'TABLE', 'DATABASE'
  ]
  
  let formatted = sql
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
    formatted = formatted.replace(regex, `\n${keyword}`)
  })
  
  return formatted
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .join('\n')
}

// 格式化代码
export function formatCode(code: string, _language: string = 'javascript'): string {
  // 简单的代码格式化，实际项目中可能需要使用专门的代码格式化库
  const lines = code.split('\n')
  let indent = 0
  const indentSize = 2
  
  return lines.map(line => {
    const trimmed = line.trim()
    
    if (trimmed.includes('}') && !trimmed.includes('{')) {
      indent = Math.max(0, indent - indentSize)
    }
    
    const formatted = ' '.repeat(indent) + trimmed
    
    if (trimmed.includes('{') && !trimmed.includes('}')) {
      indent += indentSize
    }
    
    return formatted
  }).join('\n')
}

// 格式化URL参数
export function formatURLParams(params: Record<string, unknown>): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
}

// 格式化文件路径
export function formatFilePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/')
}

// 格式化颜色值
export function formatColor(color: string): string {
  // 移除空格并转换为小写
  const cleaned = color.replace(/\s/g, '').toLowerCase()
  
  // 如果是3位hex，转换为6位
  if (/^#[0-9a-f]{3}$/.test(cleaned)) {
    return '#' + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2] + cleaned[3] + cleaned[3]
  }
  
  // 如果是rgb格式，转换为hex
  const rgbMatch = cleaned.match(/rgb\((\d+),(\d+),(\d+)\)/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1])
    const g = parseInt(rgbMatch[2])
    const b = parseInt(rgbMatch[3])
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  }
  
  return cleaned
}

// 格式化版本号
export function formatVersion(version: string): string {
  const parts = version.split('.')
  return parts.map(part => part.padStart(2, '0')).join('.')
}

// 格式化时间间隔
export function formatTimeInterval(start: Date | string, end: Date | string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diff = endDate.getTime() - startDate.getTime()
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}天${hours}小时`
  if (hours > 0) return `${hours}小时${minutes}分钟`
  return `${minutes}分钟`
}

// 格式化列表
export function formatList(items: string[], separator: string = '、'): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return items.join('和')
  
  return items.slice(0, -1).join(separator) + '和' + items[items.length - 1]
}

// 格式化枚举值
export function formatEnum(value: string | number, enumMap: Record<string | number, string>): string {
  return enumMap[value] || String(value)
} 