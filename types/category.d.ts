export interface Category {
  id?: number;
  name?: string;
  description?: string;
  parentId?: unknown | number;
  parent?: Category;
  children?: Array<{
    id?: number;
    name?: string;
    description?: string;
    parentId?: unknown;
    avatar?: string;
    background?: string;
    cover?: string;
    sort?: number;
    status?: string;
    articleCount?: number;
    followCount?: number;
    createdAt?: string;
    updatedAt?: string;
  }>;
  avatar?: string;
  background?: string;
  cover?: string;
  sort?: number;
  status?: string;
  articleCount?: number;
  followCount?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}
