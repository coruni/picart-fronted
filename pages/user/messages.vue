<template>
  <div class="min-h-screen">
    <div class="max-w-4xl mx-auto p-4 sm:p-6">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('message.title') }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1 text-xs">
          {{ $t('message.description') }}
        </p>
      </div>

      <!-- 操作栏 -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <UButton
            v-if="unreadCount > 0"
            @click="handleMarkAllAsRead"
            variant="soft"
            color="primary"
            :loading="markingAllAsRead"
            size="sm"
          >
            <Icon name="mynaui:check" class="w-4 h-4" />
            {{ $t('message.markAllRead') }}
          </UButton>
          <UButton @click="refreshMessages" variant="ghost" :loading="loading" size="sm">
            <Icon v-if="!loading" name="mynaui:refresh" class="w-4 h-4" />
            {{ $t('message.refresh') }}
          </UButton>
        </div>
        <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{{ $t('message.totalCount', { count: totalCount }) }}</span>
          <UBadge v-if="unreadCount > 0" color="error" variant="soft">
            {{ $t('message.unreadCount', { count: unreadCount }) }}
          </UBadge>
        </div>
      </div>

      <!-- 加载状态 -->
      <div
        v-if="(loading || initialLoading) && displayMessages.length === 0"
        class="text-center py-12"
      >
        <UIcon name="mynaui:loading" class="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p class="text-gray-500 dark:text-gray-400">{{ $t('message.loading') }}</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="displayMessages.length === 0" class="text-center py-12">
        <UIcon name="mynaui:bell" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('message.noMessages') }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ $t('message.noMessagesDescription') }}
        </p>
      </div>

      <!-- 消息列表 -->
      <TransitionGroup name="list" tag="div" class="space-y-3">
        <div
          v-for="message in displayMessages"
          :key="message.id"
          class="transform transition-transform hover:scale-105 duration-300"
        >
          <UModal
            :title="message.title"
            :ui="{
              close: 'cursor-pointer'
            }"
            aria-describedby="message-detail-description"
          >
            <!-- 触发器：消息项 -->
            <div
              class="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
            >
              <!-- 消息图标 -->
              <UAvatar
                :icon="getMessageIcon(message.type || '')"
                :color="getMessageIconClass(message.type || '').includes('blue') ? 'blue' : 'gray'"
                size="sm"
              />

              <!-- 消息内容 -->
              <div class="flex-1 min-w-0">
                <!-- 第一行：标题和状态 -->
                <div class="flex items-center justify-between mb-1">
                  <h3 class="font-semibold text-gray-900 dark:text-white truncate text-base">
                    {{ message.title }}
                  </h3>
                  <div class="flex items-center gap-2 ml-2">
                    <UBadge v-if="!message.isRead" color="info" variant="soft" size="xs">
                      {{ $t('message.unread') }}
                    </UBadge>
                    <UDropdownMenu :items="getMessageActions(message)">
                      <UButton
                        variant="ghost"
                        size="xs"
                        icon="mynaui:more-horizontal"
                        @click.stop
                      />
                    </UDropdownMenu>
                  </div>
                </div>

                <!-- 第二行：内容和时间 -->
                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-600 dark:text-gray-300 truncate flex-1">
                    {{ message.content }}
                  </p>
                  <div
                    class="flex items-center gap-2 ml-2 text-xs text-gray-500 dark:text-gray-400"
                  >
                    <UBadge
                      v-if="message.type"
                      :color="getMessageTypeColor(message.type)"
                      variant="soft"
                      size="xs"
                    >
                      {{ getMessageTypeLabel(message.type) }}
                    </UBadge>
                    <span class="whitespace-nowrap">
                      {{ message.createdAt ? formatTime(message.createdAt) : '' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 弹窗内容 -->
            <template #body>
              <div id="message-detail-description">
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {{ message.content }}
                </p>
              </div>
            </template>

            <!-- 弹窗底部操作 -->
            <template #footer>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-2">
                  <UButton
                    v-if="!message.isRead"
                    @click="handleMarkAsRead(message.id || 0)"
                    variant="soft"
                    color="primary"
                    :loading="markingAsRead === message.id"
                    size="sm"
                  >
                    <Icon name="mynaui:check" class="w-4 h-4" />
                    {{ $t('message.markRead') }}
                  </UButton>
                </div>
                <div class="flex items-center gap-2">
                  <UButton
                    @click="handleDeleteMessage(message.id || 0)"
                    variant="ghost"
                    color="error"
                    :loading="deleting === message.id"
                    size="sm"
                  >
                    <Icon name="mynaui:trash" class="w-4 h-4" />
                    {{ $t('message.delete') }}
                  </UButton>
                </div>
              </div>
            </template>
          </UModal>
        </div>
      </TransitionGroup>

      <!-- 没有更多数据提示 -->
      <div
        v-if="!hasMore && displayMessages.length > 0"
        class="text-center py-4 text-gray-500 dark:text-gray-400"
      >
        {{ $t('message.noMoreMessages') }}
      </div>

      <!-- Intersection Observer 观察器元素 -->
      <div ref="observerTarget" class="h-1"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    messageControllerFindAll,
    messageControllerMarkAsRead,
    messageControllerRemove
  } from '~/api';
  import type { MessageControllerFindAllResponse } from '~/api';

  type Message = MessageControllerFindAllResponse['data']['data'][number];

  const { t } = useI18n();

  // 响应式状态 - 参考首页实现
  const messages = ref<Message[]>([]);
  const loading = ref(false);
  const hasMore = ref(true);
  const pagination = ref({
    page: 1,
    limit: 20
  });
  const markingAsRead = ref<number | null>(null);
  const markingAllAsRead = ref(false);
  const deleting = ref<number | null>(null);
  const observerTarget = ref<HTMLDivElement | null>(null);
  let observer: IntersectionObserver | null = null;

  // 计算属性
  const unreadCount = computed(() => messages.value.filter((msg: Message) => !msg.isRead).length);
  const totalCount = computed(() => messages.value.length);

  // 计算显示的消息列表
  const displayMessages = computed(() => {
    return messages.value;
  });

  // 重置数据函数 - 参考首页
  const resetData = () => {
    pagination.value.page = 1;
    messages.value = [];
    hasMore.value = true;
    loading.value = false;
  };

  // SSR 数据获取 - 参考首页实现
  const { data: initialData, pending: initialLoading } = await messageControllerFindAll({
    composable: 'useFetch',
    key: 'messages-initial',
    query: {
      page: 1,
      limit: pagination.value.limit
    }
  });

  // 初始化数据
  if (initialData.value?.data?.data) {
    messages.value = initialData.value.data.data;
    hasMore.value = initialData.value.data.meta.page < initialData.value.data.meta.totalPages;
    if (hasMore.value) {
      pagination.value.page = 2;
    }
  }

  // 加载更多消息数据 - 参考首页的loadArticles函数
  const loadMessages = async () => {
    // 添加额外的检查，确保不会重复触发
    if (loading.value || !hasMore.value) return;

    loading.value = true;

    try {
      const response = await messageControllerFindAll({
        composable: '$fetch',
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit
        }
      });

      const newData = response.data?.data || [];

      if (newData.length > 0) {
        messages.value = [...messages.value, ...newData];
      }

      // 检查是否还有更多数据
      hasMore.value = newData.length === pagination.value.limit;

      // 更新页码
      if (hasMore.value) {
        pagination.value.page++;
      }

      // 如果没有更多数据，可以停止观察
      if (!hasMore.value && observer) {
        observer.disconnect();
      }
    } catch (error) {
      console.error('加载消息失败:', error);
    } finally {
      loading.value = false;
    }
  };
  // 获取消息类型颜色
  const getMessageTypeColor = (type: string) => {
    const colorMap: Record<
      string,
      'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
    > = {
      system: 'neutral',
      notification: 'info',
      private: 'primary',
      warning: 'warning',
      error: 'error',
      success: 'success',
      info: 'info',
      alert: 'warning',
      reminder: 'secondary',
      update: 'info'
    };
    return colorMap[type] || 'neutral';
  };

  // 获取消息类型标签
  const getMessageTypeLabel = (type: string) => {
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

  // 获取消息图标
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
      alert: 'mynaui:alert',
      reminder: 'mynaui:clock',
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

  // 格式化时间
  const formatTime = (dateString: string) => {
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

  // 获取消息操作菜单
  const getMessageActions = (message: any) => {
    const actions = [];

    if (!message.isRead) {
      actions.push({
        label: t('message.markRead'),
        icon: 'mynaui:check',
        click: () => handleMarkAsRead(message.id || 0)
      });
    }

    actions.push({
      label: t('message.delete'),
      icon: 'mynaui:trash',
      click: () => handleDeleteMessage(message.id || 0)
    });

    return [actions];
  };

  // 刷新消息 - 使用 useMessage composable
  const refreshMessages = async () => {
    try {
      loading.value = true;

      // 重置分页状态，但保持 loading 状态
      pagination.value.page = 1;
      messages.value = [];
      hasMore.value = true;

      const response = await messageControllerFindAll({
        composable: '$fetch',
        query: {
          page: 1,
          limit: pagination.value.limit
        }
      });

      if (response.data?.data) {
        messages.value = response.data.data;
        hasMore.value = response.data.meta.page < response.data.meta.totalPages;
        if (hasMore.value) {
          pagination.value.page = 2;
        }
      }
    } catch (error) {
      console.error('刷新消息失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 标记消息为已读（带错误处理）
  const handleMarkAsRead = async (messageId: number) => {
    try {
      markingAsRead.value = messageId;
      await messageControllerMarkAsRead({
        composable: '$fetch',
        path: { id: String(messageId) }
      });

      // 更新本地状态
      const message = messages.value.find((msg: Message) => msg.id === messageId);
      if (message) {
        message.isRead = true;
      }
    } catch (error) {
      console.error('标记已读失败:', error);
    } finally {
      markingAsRead.value = null;
    }
  };

  // 标记所有消息为已读（带错误处理）
  const handleMarkAllAsRead = async () => {
    try {
      markingAllAsRead.value = true;
      const unreadIds = messages.value
        .filter((msg: Message) => !msg.isRead)
        .map((msg: Message) => msg.id);

      // 批量标记为已读
      await Promise.all(
        unreadIds.map(id =>
          messageControllerMarkAsRead({
            composable: '$fetch',
            path: { id: String(id) }
          })
        )
      );

      // 更新本地状态
      messages.value.forEach((msg: Message) => {
        msg.isRead = true;
      });
    } catch (error) {
      console.error('标记全部已读失败:', error);
    } finally {
      markingAllAsRead.value = false;
    }
  };

  // 删除消息（带错误处理）
  const handleDeleteMessage = async (messageId: number) => {
    try {
      deleting.value = messageId;
      await messageControllerRemove({
        composable: '$fetch',
        path: { id: String(messageId) }
      });

      // 从本地状态中移除
      const index = messages.value.findIndex((msg: Message) => msg.id === messageId);
      if (index > -1) {
        messages.value.splice(index, 1);
      }
    } catch (error) {
      console.error('删除消息失败:', error);
    } finally {
      deleting.value = null;
    }
  };

  // 生命周期钩子 - 参考首页实现
  onMounted(() => {
    // 初始化 Intersection Observer
    if (observerTarget.value) {
      observer = new IntersectionObserver(
        entries => {
          const target = entries[0];
          if (target.isIntersecting && !loading.value && hasMore.value) {
            loadMessages();
          }
        },
        {
          rootMargin: '200px' // 提前200px触发加载
        }
      );

      observer.observe(observerTarget.value);
    }
  });

  // 组件销毁时断开观察器
  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  // 页面元数据
  useHead({
    title: t('message.title')
  });
</script>

<style>
  .list-enter-active,
  .list-leave-active {
    transition: all 0.3s ease-out;
  }
  .list-enter-from {
    opacity: 0;
    transform: translateY(20px);
  }
  .list-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }
  .list-move {
    transition: transform 0.3s ease;
  }
</style>
