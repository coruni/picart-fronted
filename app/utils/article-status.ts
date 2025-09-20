import type { SelectMenuItem } from '#ui/types';

// 完整的文章状态枚举
export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
  BANNED = 'BANNED',
  REJECTED = 'REJECTED'
}

// API 支持的状态（目前只支持 DRAFT 和 PUBLISHED）
export type ApiSupportedStatus = 'DRAFT' | 'PUBLISHED';

// 状态选项配置
export const getStatusOptions = (t: (key: string) => string): SelectMenuItem[] => [
  {
    label: t('form.status.published'),
    icon: 'mynaui:check',
    class: 'cursor-pointer',
    value: 'PUBLISHED'
  },
  {
    label: t('form.status.pending'),
    icon: 'mynaui:alarm',
    class: 'cursor-pointer',
    value: 'PENDING'
  },
  {
    label: t('form.status.draft'),
    icon: 'mynaui:edit',
    class: 'cursor-pointer',
    value: 'DRAFT'
  },
  {
    label: t('form.status.archived'),
    icon: 'mynaui:archive',
    class: 'cursor-pointer',
    value: 'ARCHIVED'
  },
  {
    label: t('form.status.rejected'),
    icon: 'mynaui:x-circle',
    class: 'cursor-pointer',
    value: 'REJECTED'
  },
  {
    label: t('form.status.banned'),
    icon: 'mynaui:ban',
    class: 'cursor-pointer',
    value: 'BANNED'
  },
  {
    label: t('form.status.deleted'),
    icon: 'mynaui:trash',
    class: 'cursor-pointer',
    value: 'DELETED'
  }
];

// 获取状态图标
export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'DRAFT':
      return 'mynaui:edit';
    case 'PENDING':
      return 'mynaui:alarm';
    case 'PUBLISHED':
      return 'mynaui:check';
    case 'ARCHIVED':
      return 'mynaui:archive';
    case 'REJECTED':
      return 'mynaui:x-circle';
    case 'BANNED':
      return 'mynaui:ban';
    case 'DELETED':
      return 'mynaui:trash';
    default:
      return 'mynaui:info-circle';
  }
};

// 获取状态颜色
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'DRAFT':
      return 'text-gray-500';
    case 'PENDING':
      return 'text-amber-500';
    case 'PUBLISHED':
      return 'text-green-500';
    case 'ARCHIVED':
      return 'text-gray-400';
    case 'REJECTED':
      return 'text-red-500';
    case 'BANNED':
      return 'text-red-600';
    case 'DELETED':
      return 'text-gray-600';
    default:
      return 'text-gray-500';
  }
};

// 获取状态文本
export const getStatusText = (status: string, t: (key: string) => string): string => {
  switch (status) {
    case 'DRAFT':
      return t('form.status.draft');
    case 'PENDING':
      return t('form.status.pending');
    case 'PUBLISHED':
      return t('form.status.published');
    case 'ARCHIVED':
      return t('form.status.archived');
    case 'REJECTED':
      return t('form.status.rejected');
    case 'BANNED':
      return t('form.status.banned');
    case 'DELETED':
      return t('form.status.deleted');
    default:
      return status;
  }
};

// 检查状态是否为 API 支持的状态
export const isApiSupportedStatus = (status: string): status is ApiSupportedStatus => {
  return status === 'DRAFT' || status === 'PUBLISHED';
};

// 将任意状态转换为 API 支持的状态
export const normalizeStatusForApi = (status: string): ApiSupportedStatus => {
  if (isApiSupportedStatus(status)) {
    return status;
  }
  // 如果是不支持的状态，默认转换为 DRAFT
  return 'DRAFT';
};
