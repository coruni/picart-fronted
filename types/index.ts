// 基础类型定义
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface PaginationResponse<T = any> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface BaseEntity {
  id: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  username: string;
  email: string;
  avatar?: string;
  nickname?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'banned';
}

// 重新导出其他类型
export * from './user';

export interface UploadFile {
  name: string;
  url: string;
  size: number;
  type: string;
  uid: string;
}

// HTTP 请求配置
export interface HttpConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

// 存储配置
export interface StorageConfig {
  prefix?: string;
  expire?: number;
}

// 表单验证规则
export interface ValidationRule {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  validator?: (value: any) => boolean | string;
}

export type ValidationRules = Record<string, ValidationRule[]>;
