export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
  BANNED = 'BANNED',
  REJECTED = 'REJECTED'
}

export interface Article {
  id?: number;

  title?: string;
  description?: string;
  image?: string;
  requireLogin?: boolean;
  requireFollow?: boolean;
  requirePayment?: boolean;
  viewPrice?: string;
  type?: string;
  content?: string;
  images?: unknown;
  summary?: unknown;
  views?: number;
  likes?: number;
  collections?: number;
  status?: ArticleStatus;
  cover?: unknown;
  authorId?: number;
  author: {
    id?: number;
    name?: string;
    avatar?: string | unknown;
    username?: string;
    nickname?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    description?: unknown;
    followerCount?: number;
    followingCount?: number;
  };
  category?: {
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
  };
  tags?: Array<string>;
  createdAt?: string;
  updatedAt?: string;
}
