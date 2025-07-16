import type { ValidationRule, ValidationRules } from '~/types'
import { REGEX } from '~/constants'

// 验证结果接口
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// 单个字段验证结果
export interface FieldValidationResult {
  valid: boolean
  message?: string
}

// 验证工具类
export class Validator {
  // 验证单个值
  static validateValue(value: any, rules: ValidationRule[]): FieldValidationResult {
    for (const rule of rules) {
      const result = this.applyRule(value, rule)
      if (!result.valid) {
        return result
      }
    }
    return { valid: true }
  }

  // 验证对象
  static validateObject(data: Record<string, any>, rules: ValidationRules): ValidationResult {
    const errors: string[] = []

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field]
      const result = this.validateValue(value, fieldRules)
      
      if (!result.valid && result.message) {
        errors.push(`${field}: ${result.message}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // 应用单个规则
  private static applyRule(value: any, rule: ValidationRule): FieldValidationResult {
    // 必填验证
    if (rule.required && this.isEmpty(value)) {
      return {
        valid: false,
        message: rule.message || '该字段为必填项'
      }
    }

    // 如果值为空且非必填，跳过其他验证
    if (this.isEmpty(value) && !rule.required) {
      return { valid: true }
    }

    // 正则验证
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return {
        valid: false,
        message: rule.message || '格式不正确'
      }
    }

    // 最小长度验证
    if (rule.min !== undefined) {
      const length = typeof value === 'string' ? value.length : Number(value)
      if (length < rule.min) {
        return {
          valid: false,
          message: rule.message || `最小长度为${rule.min}`
        }
      }
    }

    // 最大长度验证
    if (rule.max !== undefined) {
      const length = typeof value === 'string' ? value.length : Number(value)
      if (length > rule.max) {
        return {
          valid: false,
          message: rule.message || `最大长度为${rule.max}`
        }
      }
    }

    // 自定义验证器
    if (rule.validator) {
      const result = rule.validator(value)
      if (result !== true) {
        return {
          valid: false,
          message: typeof result === 'string' ? result : (rule.message || '验证失败')
        }
      }
    }

    return { valid: true }
  }

  // 检查值是否为空
  private static isEmpty(value: any): boolean {
    return value === null || 
           value === undefined || 
           value === '' || 
           (Array.isArray(value) && value.length === 0)
  }
}

// 常用验证规则
export const validationRules = {
  // 必填
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || '该字段为必填项'
  }),

  // 邮箱
  email: (message?: string): ValidationRule => ({
    pattern: REGEX.EMAIL,
    message: message || '请输入有效的邮箱地址'
  }),

  // 手机号
  phone: (message?: string): ValidationRule => ({
    pattern: REGEX.PHONE,
    message: message || '请输入有效的手机号码'
  }),

  // 密码
  password: (message?: string): ValidationRule => ({
    pattern: REGEX.PASSWORD,
    message: message || '密码必须包含大小写字母和数字，长度至少8位'
  }),

  // URL
  url: (message?: string): ValidationRule => ({
    pattern: REGEX.URL,
    message: message || '请输入有效的URL地址'
  }),

  // 中文
  chinese: (message?: string): ValidationRule => ({
    pattern: REGEX.CHINESE,
    message: message || '请输入中文字符'
  }),

  // 身份证
  idCard: (message?: string): ValidationRule => ({
    pattern: REGEX.ID_CARD,
    message: message || '请输入有效的身份证号码'
  }),

  // 长度范围
  length: (min: number, max: number, message?: string): ValidationRule => ({
    min,
    max,
    message: message || `长度必须在${min}-${max}之间`
  }),

  // 最小长度
  minLength: (min: number, message?: string): ValidationRule => ({
    min,
    message: message || `最小长度为${min}`
  }),

  // 最大长度
  maxLength: (max: number, message?: string): ValidationRule => ({
    max,
    message: message || `最大长度为${max}`
  }),

  // 数字范围
  range: (min: number, max: number, message?: string): ValidationRule => ({
    validator: (value: any) => {
      const num = Number(value)
      return !isNaN(num) && num >= min && num <= max
    },
    message: message || `数值必须在${min}-${max}之间`
  }),

  // 自定义验证
  custom: (validator: (value: any) => boolean | string, message?: string): ValidationRule => ({
    validator,
    message: message || '验证失败'
  })
}

// 便捷验证方法
export const validate = {
  // 验证邮箱
  email: (email: string): boolean => REGEX.EMAIL.test(email),

  // 验证手机号
  phone: (phone: string): boolean => REGEX.PHONE.test(phone),

  // 验证密码强度
  password: (password: string): boolean => REGEX.PASSWORD.test(password),

  // 验证URL
  url: (url: string): boolean => REGEX.URL.test(url),

  // 验证中文
  chinese: (text: string): boolean => REGEX.CHINESE.test(text),

  // 验证身份证
  idCard: (idCard: string): boolean => REGEX.ID_CARD.test(idCard),

  // 验证是否为空
  isEmpty: (value: any): boolean => {
    return value === null || 
           value === undefined || 
           value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0)
  },

  // 验证是否为数字
  isNumber: (value: any): boolean => {
    return !isNaN(Number(value)) && isFinite(Number(value))
  },

  // 验证是否为整数
  isInteger: (value: any): boolean => {
    return Number.isInteger(Number(value))
  },

  // 验证是否为正数
  isPositive: (value: any): boolean => {
    return Number(value) > 0
  },

  // 验证是否在范围内
  inRange: (value: any, min: number, max: number): boolean => {
    const num = Number(value)
    return !isNaN(num) && num >= min && num <= max
  },

  // 验证数组长度
  arrayLength: (arr: any[], min?: number, max?: number): boolean => {
    if (!Array.isArray(arr)) return false
    if (min !== undefined && arr.length < min) return false
    if (max !== undefined && arr.length > max) return false
    return true
  },

  // 验证对象属性
  hasProperty: (obj: any, property: string): boolean => {
    return obj && typeof obj === 'object' && property in obj
  }
}

// 表单验证组合器
export class FormValidator {
  private rules: ValidationRules = {}
  private data: Record<string, any> = {}

  // 设置验证规则
  setRules(rules: ValidationRules): FormValidator {
    this.rules = rules
    return this
  }

  // 设置数据
  setData(data: Record<string, any>): FormValidator {
    this.data = data
    return this
  }

  // 添加字段规则
  addRule(field: string, rules: ValidationRule[]): FormValidator {
    this.rules[field] = rules
    return this
  }

  // 验证
  validate(): ValidationResult {
    return Validator.validateObject(this.data, this.rules)
  }

  // 验证单个字段
  validateField(field: string): FieldValidationResult {
    const fieldRules = this.rules[field]
    if (!fieldRules) {
      return { valid: true }
    }
    return Validator.validateValue(this.data[field], fieldRules)
  }

  // 获取所有错误
  getErrors(): Record<string, string> {
    const errors: Record<string, string> = {}
    
    for (const [field, rules] of Object.entries(this.rules)) {
      const result = Validator.validateValue(this.data[field], rules)
      if (!result.valid && result.message) {
        errors[field] = result.message
      }
    }

    return errors
  }

  // 检查是否有错误
  hasErrors(): boolean {
    return !this.validate().valid
  }
} 