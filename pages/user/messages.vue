<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {{ $t('message.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('message.description') }}
        </p>
      </div>

      <!-- 操作栏 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
        >
          <div class="flex flex-wrap items-center gap-3">
            <UButton
              v-if="unreadCount > 0"
              @click="handleMarkAllAsRead"
              variant="soft"
              color="primary"
              :loading="markingAllAsRead"
              size="sm"
            >
              <Icon name="mynaui:check" class="w-4 h-4 mr-2" />
              {{ $t('message.markAllRead') }}
            </UButton>
            <UButton @click="refreshMessages" variant="ghost" :loading="loading" size="sm">
              <Icon v-if="!loading" name="mynaui:refresh" class="w-4 h-4 mr-2" />
              {{ $t('message.refresh') }}
            </UButton>
          </div>
          <div class="flex items-center space-x-4 text-sm">
            <span class="text-gray-500 dark:text-gray-400">
              {{ $t('message.totalCount', { count: totalCount }) }}
            </span>
            <span v-if="unreadCount > 0" class="text-red-500 font-medium">
              {{ $t('message.unreadCount', { count: unreadCount }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="space-y-4">
        <div v-if="loading && messages.length === 0" class="text-center py-12">
          <div
            class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"
          ></div>
          <p class="text-gray-500 dark:text-gray-400">{{ $t('message.loading') }}</p>
        </div>

        <div v-else-if="messages.length === 0" class="text-center py-12">
          <Icon name="mynaui:bell" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ $t('message.noMessages') }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            {{ $t('message.noMessagesDescription') }}
          </p>
        </div>

        <div v-else>
          <div
            v-for="message in messages"
            :key="message.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow"
            :class="{
              'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20': !message.isRead
            }"
          >
            <div class="flex items-start space-x-3 sm:space-x-4">
              <!-- 消息图标 -->
              <div class="flex-shrink-0">
                <div
                  class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                  :class="getMessageIconClass(message.type || '')"
                >
                  <Icon
                    :name="getMessageIcon(message.type || '')"
                    class="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  />
                </div>
              </div>

              <!-- 消息内容 -->
              <div class="flex-1 min-w-0">
                <div
                  class="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0"
                >
                  <div class="flex-1">
                    <h3
                      class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2"
                    >
                      {{ message.title }}
                    </h3>
                    <p
                      class="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 leading-relaxed"
                    >
                      {{ message.content }}
                    </p>
                    <div
                      class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
                    >
                      <span>{{ message.type ? getMessageTypeLabel(message.type) : '' }}</span>
                      <span>{{ message.createdAt ? formatTime(message.createdAt) : '' }}</span>
                      <span v-if="!message.isRead" class="text-blue-500 font-medium">
                        {{ $t('message.unread') }}
                      </span>
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="flex items-center space-x-2 sm:ml-4">
                    <UButton
                      v-if="!message.isRead"
                      @click="handleMarkAsRead(message.id || 0)"
                      variant="ghost"
                      size="xs"
                      :loading="markingAsRead === message.id"
                    >
                      <Icon name="mynaui:check" class="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span class="hidden sm:inline">{{ $t('message.markRead') }}</span>
                    </UButton>
                    <UButton
                      @click="handleDeleteMessage(message.id || 0)"
                      variant="ghost"
                      color="error"
                      size="xs"
                      :loading="deleting === message.id"
                    >
                      <Icon name="mynaui:trash" class="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span class="hidden sm:inline">{{ $t('message.delete') }}</span>
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore" class="text-center py-8">
          <UButton @click="loadMoreMessages" :loading="loadingMore" variant="outline" size="lg">
            {{ $t('message.loadMore') }}
          </UButton>
        </div>

        <!-- 没有更多数据 -->
        <div v-else-if="messages.length > 0" class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">
            {{ $t('message.noMoreMessages') }}
          </p>
        </div>
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
    totalCount,
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
  const loadingMore = ref(false);
  const markingAsRead = ref<number | null>(null);
  const markingAllAsRead = ref(false);
  const deleting = ref<number | null>(null);

  const { t } = useI18n();

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
      markingAsRead.value = messageId;
      await markAsRead(messageId);
    } catch (error) {
      // 静默处理错误
    } finally {
      markingAsRead.value = null;
    }
  };

  // 标记所有消息为已读（带错误处理）
  const handleMarkAllAsRead = async () => {
    try {
      markingAllAsRead.value = true;
      await markAllAsRead();
    } catch (error) {
      // 静默处理错误
    } finally {
      markingAllAsRead.value = false;
    }
  };

  // 删除消息（带错误处理）
  const handleDeleteMessage = async (messageId: number) => {
    try {
      deleting.value = messageId;
      await deleteMessage(messageId);
    } catch (error) {
      // 静默处理错误
    } finally {
      deleting.value = null;
    }
  };

  // 页面元数据
  useHead({
    title: t('message.title')
  });

  // 生命周期
  onMounted(() => {
    fetchMessages(true);
  });
</script>
