// 菜单项类型定义
export interface MenuItem {
  id: string
  label: string
  icon?: string
  to?: string
  badge?: string | number
  children?: MenuItem[]
  type?: 'link' | 'dropdown' | 'divider'
  disabled?: boolean
  external?: boolean
}

// 菜单组类型定义
export interface MenuGroup {
  id: string
  label: string
  items: MenuItem[]
}