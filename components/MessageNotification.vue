<template>
  <div class="group relative">
    <!-- 消息通知按钮 -->
    <UButton
      @mouseenter="handleMouseEnter"
      @click="handleClick"
      variant="ghost"
      color="neutral"
      class="relative p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Icon name="mynaui:bell" class="w-5 h-5" />
      <!-- 未读消息数量徽章 -->
      <UBadge
        v-if="unreadCount > 0"
        color="error"
        variant="solid"
        size="xs"
        class="absolute -top-1 -right-1"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </UBadge>
    </UButton>

    <!-- 消息面板 -->
    <div
      class="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300"
    >
      <!-- 面板头部 -->
      <div class="flex items-center justify-between p-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t('message.title') }}
        </h3>
        <div class="flex items-center space-x-2">
          <UButton
            v-if="unreadCount > 0"
            @click="handleMarkAllAsRead"
            variant="ghost"
            size="sm"
            class="text-xs"
          >
            {{ $t('message.markAllRead') }}
          </UButton>
          <UButton @click="refreshMessages" variant="ghost" size="sm" :loading="loading">
            <Icon v-if="!loading" name="mynaui:refresh" class="w-4 h-4" />
          </UButton>
        </div>
      </div>

      <!-- 消息列表 -->
      <div ref="messageListRef" class="max-h-96 overflow-y-auto" @scroll="handleScroll">
        <div v-if="loading && messages.length === 0" class="p-4">
          <div class="flex items-center justify-center py-8">
            <div
              class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"
            ></div>
          </div>
        </div>

        <div v-else-if="messages.length === 0" class="p-4 text-center">
          <Icon name="mynaui:bell" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p class="text-gray-500 dark:text-gray-400">{{ $t('message.noMessages') }}</p>
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="message in messages"
            :key="message.id"
            class="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group flex items-center justify-between"
            :class="{ 'bg-blue-50 dark:bg-blue-900/20': !message.isRead }"
            @click="handleMessageClick(message)"
          >
            <div class="flex items-center flex-1 min-w-0">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ message.title || $t('message.noTitle') }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ message.createdAt ? formatTime(message.createdAt) : '' }}
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2 flex-shrink-0">
              <UButton
                v-if="!message.isRead"
                @click.stop="handleMarkAsRead(message.id || 0)"
                variant="ghost"
                size="xs"
                class="text-xs"
              >
                {{ $t('message.markRead') }}
              </UButton>
              <UButton
                @click.stop="handleDeleteMessage(message.id || 0)"
                variant="ghost"
                size="xs"
                color="error"
                class="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon name="mynaui:trash" class="w-3 h-3" />
              </UButton>
            </div>
          </div>
        </div>

        <!-- 加载更多指示器 -->
        <div v-if="hasMore && loadingMore" class="p-4">
          <div class="flex items-center justify-center py-4">
            <div
              class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"
            ></div>
            <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {{ $t('message.loadingMore') }}
            </span>
          </div>
        </div>

        <!-- 没有更多消息提示 -->
        <div v-if="!hasMore && messages.length > 0" class="p-4 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('message.noMoreMessages') }}
          </p>
        </div>
      </div>

      <!-- 面板底部 -->
      <div class="p-4">
        <NuxtLinkLocale
          to="/user/messages"
          class="block text-center text-sm text-primary hover:text-primary-600 dark:hover:text-primary-400"
        >
          {{ $t('message.viewAll') }}
        </NuxtLinkLocale>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 使用消息管理 composable
  const {
    messages,
    loading,
    hasMore,
    unreadCount,
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
  } = useMessage();

  // 响应式状态
  const isMessagePanelOpen = ref(false);
  const loadingMore = ref(false);
  const messageListRef = ref<HTMLElement>();

  const { t } = useI18n();

  // 处理滚动事件，实现无限滚动
  const handleScroll = async (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target || !hasMore.value || loadingMore.value) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    const scrollThreshold = 50; // 距离底部50px时开始加载

    if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
      await loadMoreMessages();
    }
  };

  // 加载更多消息
  const loadMoreMessages = async () => {
    if (!loadingMore.value && hasMore.value) {
      loadingMore.value = true;
      try {
        await loadMore();
      } finally {
        loadingMore.value = false;
      }
    }
  };

  // 刷新消息
  const refreshMessages = async () => {
    try {
      await refresh();
    } catch (error) {
      // 静默处理错误
    }
  };

  // 标记消息为已读（带错误处理）
  const handleMarkAsRead = async (messageId: number) => {
    try {
      await markAsRead(messageId);
    } catch (error) {
      // 静默处理错误
    }
  };

  // 标记所有消息为已读（带错误处理）
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      // 静默处理错误
    }
  };

  // 删除消息（带错误处理）
  const handleDeleteMessage = async (messageId: number) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      // 静默处理错误
    }
  };

  // 处理鼠标悬停事件
  const handleMouseEnter = () => {
    // 在桌面端，鼠标悬停时获取消息
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      fetchMessages(true);
    }
  };

  // 处理点击事件
  const handleClick = () => {
    // 在移动端，点击时切换面板
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      isMessagePanelOpen.value = !isMessagePanelOpen.value;
      if (isMessagePanelOpen.value) {
        fetchMessages(true);
      }
    }
  };

  // 关闭消息面板
  const closeMessagePanel = () => {
    isMessagePanelOpen.value = false;
  };

  // 处理消息点击
  const handleMessageClick = (message: any) => {
    if (!message.isRead) {
      handleMarkAsRead(message.id || 0);
    }
    // 这里可以根据消息类型进行不同的处理
    // 比如跳转到相关页面等
  };

  // 生命周期
  onMounted(() => {
    // 初始加载消息
    fetchMessages(true);
  });

  // 暴露给父组件的方法
  defineExpose({
    refreshMessages,
    unreadCount
  });
</script>

<style scoped></style>
