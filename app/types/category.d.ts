export interface Category {
  parent: any;
  id?: number;
  name?: string;
  description?: string;
  link?: string;
  parentId?: unknown;
  parent?: {
    id?: number;
    name?: string;
  };
  children?: Array<{
    id?: number;
    name?: string;
    description?: string;
    link?: string;
    parentId?: number;
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
}
