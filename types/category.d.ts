export interface Category {
  id?: number
  name?: string
  description?: string
  parentId?: unknown | number
  parent?: Category
  children?: Category[]
  avatar?: string
  background?: string
  cover?: string
  sort?: number
  status?: string
  articleCount?: number
  followCount?: number
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}
