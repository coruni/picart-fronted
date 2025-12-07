import { messageControllerGetUnreadCount } from '~/api';

export const useMessageCount = () => {
  // 响应式状态
  const unreadCount = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastFetchTime = ref<number>(0);

  // 获取未读消息数量
  const fetchUnreadCount = async (force = false) => {
    // 防止频繁请求，5秒内不重复请求（除非强制刷新）
    const now = Date.now();
    if (!force && now - lastFetchTime.value < 5000) {
      return unreadCount.value;
    }

    if (loading.value) return unreadCount.value;

    try {
      loading.value = true;
      error.value = null;

      const { data: responseData } = await messageControllerGetUnreadCount({
        composable: 'useFetch',
        key: 'unread-message-count'
      });

      if (responseData.value?.data?.data?.total !== undefined) {
        unreadCount.value = responseData.value.data.data.total;
        lastFetchTime.value = now;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取未读消息数量失败';
      // 获取未读消息数量失败时静默处理
    } finally {
      loading.value = false;
    }

    return unreadCount.value;
  };

  // 增加未读数量（当收到新消息时）
  const incrementUnreadCount = () => {
    unreadCount.value++;
  };

  // 减少未读数量（当标记消息为已读时）
  const decrementUnreadCount = (count = 1) => {
    unreadCount.value = Math.max(0, unreadCount.value - count);
  };

  // 重置未读数量（当标记所有消息为已读时）
  const resetUnreadCount = () => {
    unreadCount.value = 0;
  };

  // 设置未读数量（当从服务器获取准确数量时）
  const setUnreadCount = (count: number) => {
    unreadCount.value = Math.max(0, count);
  };

  // 自动刷新未读数量（可选）
  const startAutoRefresh = (interval = 30000) => {
    const timer = setInterval(() => {
      fetchUnreadCount();
    }, interval);

    // 返回清理函数
    return () => {
      clearInterval(timer);
    };
  };

  // 页面可见性变化时刷新
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      fetchUnreadCount();
    }
  };

  // 生命周期管理
  onMounted(() => {
    // 初始获取未读数量
    fetchUnreadCount();

    // 监听页面可见性变化
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  });

  onUnmounted(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  });

  return {
    // 状态
    unreadCount: readonly(unreadCount),
    loading: readonly(loading),
    error: readonly(error),

    // 方法
    fetchUnreadCount,
    incrementUnreadCount,
    decrementUnreadCount,
    resetUnreadCount,
    setUnreadCount,
    startAutoRefresh
  };
};
