import {
  messageControllerFindAll,
  messageControllerMarkAsRead,
  messageControllerMarkAllAsRead,
  messageControllerRemove
} from '~/api';

import type { MessageControllerFindAllResponse } from '~/api';

type Message = MessageControllerFindAllResponse['data']['data'][number];

export const useMessage = () => {
  // 响应式状态
  const messages = ref<Message[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const hasMore = ref(true);
  const page = ref(1);
  const pageSize = ref(20);

  // 计算属性
  const unreadCount = computed(() => messages.value.filter((msg: Message) => !msg.isRead).length);
  const totalCount = computed(() => messages.value.length);
  const unreadMessages = computed(() => messages.value.filter((msg: Message) => !msg.isRead));
  const readMessages = computed(() => messages.value.filter((msg: Message) => msg.isRead));

  // 获取消息列表
  const fetchMessages = async (reset = false) => {
    if (loading.value) return;

    try {
      loading.value = true;
      error.value = null;

      if (reset) {
        page.value = 1;
        messages.value = [];
        hasMore.value = true;
      }

      const { data: responseData } = await messageControllerFindAll({
        composable: 'useFetch',
        key: `messages_${page.value}`,
        query: {
          page: page.value,
          limit: pageSize.value
        }
      });
      if (responseData.value?.data?.data) {
        const newMessages = responseData.value.data.data;

        if (reset) {
          messages.value = newMessages;
        } else {
          messages.value.push(...newMessages);
        }

        // 检查是否还有更多数据
        hasMore.value = responseData.value.data.meta.page < responseData.value.data.meta.totalPages;
        if (hasMore.value) {
          page.value++;
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取消息失败';
      console.error('获取消息失败:', err);
    } finally {
      loading.value = false;
    }
  };

  // 标记消息为已读（防重复执行）
  const markAsRead = async (messageId: number) => {
    const message = messages.value.find((msg: Message) => msg.id === messageId);

    // 如果消息不存在或已经是已读状态，则跳过
    if (!message || message.isRead) {
      return;
    }

    try {
      await messageControllerMarkAsRead({
        composable: '$fetch',
        path: { id: String(messageId) }
      });

      // 更新本地状态
      message.isRead = true;
    } catch (err) {
      console.error('标记已读失败:', err);
      throw err;
    }
  };

  // 标记所有消息为已读（只处理未读消息）
  const markAllAsRead = async () => {
    const unreadMessages = messages.value.filter((msg: Message) => !msg.isRead);

    // 如果没有未读消息，直接返回
    if (unreadMessages.length === 0) {
      return;
    }

    try {
      // 使用批量标记所有消息为已读的接口
      await messageControllerMarkAllAsRead({
        composable: '$fetch',
        body: {}
      });

      // 更新本地状态
      unreadMessages.forEach((msg: Message) => {
        msg.isRead = true;
      });
    } catch (err) {
      console.error('标记全部已读失败:', err);
      throw err;
    }
  };

  // 删除消息
  const deleteMessage = async (messageId: number) => {
    try {
      await messageControllerRemove({
        composable: '$fetch',
        path: { id: String(messageId) }
      });

      // 从本地状态中移除
      const index = messages.value.findIndex((msg: Message) => msg.id === messageId);
      if (index > -1) {
        messages.value.splice(index, 1);
      }
    } catch (err) {
      console.error('删除消息失败:', err);
      throw err;
    }
  };

  // 加载更多消息
  const loadMore = async () => {
    if (!hasMore.value || loading.value) return;
    await fetchMessages(false);
  };

  // 刷新消息
  const refresh = async () => {
    await fetchMessages(true);
  };

  // 获取消息类型图标
  const getMessageIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      system: 'mynaui:info-circle',
      notification: 'mynaui:bell',
      private: 'mynaui:lock',
      comment: 'mynaui:chat',
      like: 'mynaui:heart',
      follow: 'mynaui:user-plus',
      order: 'mynaui:shopping-cart',
      payment: 'mynaui:credit-card',
      warning: 'mynaui:warning',
      error: 'mynaui:error',
      success: 'mynaui:check-circle',
      info: 'mynaui:info',
      alert: 'mynaui:warning',
      reminder: 'mynaui:alarm',
      update: 'mynaui:refresh'
    };
    return iconMap[type] || 'mynaui:bell';
  };

  // 获取消息图标样式
  const getMessageIconClass = (type: string) => {
    const classMap: Record<string, string> = {
      system: 'bg-blue-500',
      notification: 'bg-green-500',
      private: 'bg-purple-500',
      comment: 'bg-purple-500',
      like: 'bg-red-500',
      follow: 'bg-orange-500',
      order: 'bg-indigo-500',
      payment: 'bg-emerald-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      success: 'bg-green-500',
      info: 'bg-blue-500',
      alert: 'bg-orange-500',
      reminder: 'bg-indigo-500',
      update: 'bg-cyan-500'
    };
    return classMap[type] || 'bg-gray-500';
  };

  // 获取消息类型标签
  const getMessageTypeLabel = (type: string) => {
    const { t } = useI18n();
    const labelMap: Record<string, string> = {
      system: t('message.type.system'),
      notification: t('message.type.notification'),
      private: t('message.type.private'),
      comment: t('message.type.comment'),
      like: t('message.type.like'),
      follow: t('message.type.follow'),
      order: t('message.type.order'),
      payment: t('message.type.payment')
    };
    return labelMap[type] || t('message.type.unknown');
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const { t } = useI18n();
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return t('message.time.justNow');
    } else if (minutes < 60) {
      return t('message.time.minutesAgo', { minutes });
    } else if (hours < 24) {
      return t('message.time.hoursAgo', { hours });
    } else if (days < 7) {
      return t('message.time.daysAgo', { days });
    } else {
      return date.toLocaleDateString();
    }
  };

  return {
    // 只读状态
    messages: readonly(messages),
    loading: readonly(loading),
    error: readonly(error),
    hasMore: readonly(hasMore),

    // 计算属性
    unreadCount,
    totalCount,
    unreadMessages,
    readMessages,

    // 方法
    fetchMessages,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    loadMore,
    refresh,
    getMessageIcon,
    getMessageIconClass,
    getMessageTypeLabel,
    formatTime
  };
};
