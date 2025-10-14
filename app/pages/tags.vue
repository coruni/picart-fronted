<template>
  <div class="min-h-[calc(100vh-3.5rem)]">
    <!-- 页面头部 -->
    <div
      class="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
    >
      <div class="md:py-12 lg:py-16">
        <div class="text-center">
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {{ $t('tags.title') }}
          </h1>
          <p
            class="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4"
          >
            {{ $t('tags.description') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div>
      <!-- 搜索和筛选 -->
      <div class="my-8">
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <!-- 搜索框 -->
          <div class="flex-1 max-w-md">
            <UInput
              v-model="searchQuery"
              :placeholder="$t('tags.searchPlaceholder')"
              icon="mynaui:search"
              size="lg"
              class="w-full"
            />
          </div>

          <!-- 排序选择 -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('tags.sortBy') }}:
            </label>
            <USelect v-model="sortBy" :options="sortOptions" size="lg" class="w-40" />
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading && allTags.length === 0" class="flex justify-center items-center py-12">
        <div class="flex items-center justify-center flex-col gap-4">
          <div
            class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
          ></div>
          <p class="text-gray-600 dark:text-gray-400">{{ $t('common.loading.loading') }}</p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error && allTags.length === 0" class="text-center py-12">
        <div class="text-red-500 mb-4">
          <Icon name="mynaui:exclamation-triangle" class="w-12 h-12 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('tags.loadError') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          {{ error }}
        </p>
        <UButton @click="loadTags()" color="primary">
          {{ $t('common.button.retry') }}
        </UButton>
      </div>

      <!-- 标签云 -->
      <div v-else-if="filteredTags.length > 0" class="space-y-8">
        <!-- 标签云视图 -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div class="flex items-center gap-2 mb-6">
            <Icon name="mynaui:cloud" class="w-5 h-5" />
            <h2 class="text-xl font-semibold">{{ $t('tags.cloudView') }}</h2>
          </div>

          <div class="flex flex-wrap gap-3 justify-center">
            <NuxtLink
              v-for="tag in filteredTags"
              :key="tag.id"
              :to="`/tag/${tag.id}`"
              class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
              :class="getTagCloudClass(tag)"
              :style="{ fontSize: getTagFontSize(tag) + 'px' }"
            >
              <UAvatar v-if="tag.avatar" :src="tag.avatar" :alt="tag.name" size="xs" class="mr-2" />
              <div
                v-else
                class="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2"
              >
                <span class="text-white font-semibold text-xs">
                  {{ (tag.name || '').charAt(0).toUpperCase() }}
                </span>
              </div>
              {{ tag.name }}
              <UBadge
                :label="String(tag.articleCount || 0)"
                size="xs"
                color="neutral"
                variant="soft"
                class="ml-2"
              />
            </NuxtLink>
          </div>
        </div>

        <!-- 加载更多指示器 -->
        <div v-if="loading && allTags.length > 0" class="flex justify-center py-4">
          <div class="flex items-center gap-2">
            <div
              class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"
            ></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">{{
              $t('common.loading.loading')
            }}</span>
          </div>
        </div>

        <!-- 没有更多数据提示 -->
        <div v-else-if="!hasMore && allTags.length > 0" class="text-center py-4 text-gray-500">
          {{ $t('common.loading.noMore') }}
        </div>

        <!-- Intersection Observer 观察器元素 -->
        <div ref="observerTarget" class="h-1"></div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12">
        <div class="text-gray-400 dark:text-gray-500 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('tags.noTags') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300">
          {{ $t('tags.noTagsDescription') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { tagControllerFindAll } from '~/api/sdk.gen';
  import type { TagControllerFindAllResponse } from '~/api';
  type Tag = TagControllerFindAllResponse['data']['data'][0];

  // 页面元数据
  useHead({
    title: '标签云',
    meta: [
      { name: 'description', content: '浏览所有标签，发现感兴趣的内容' },
      { name: 'keywords', content: '标签, 标签云, 分类, 内容发现' }
    ]
  });

  // 响应式数据
  const searchQuery = ref('');
  const sortBy = ref('name');
  const pagination = ref({
    page: 1,
    limit: 100
  });
  const loading = ref(false);
  const hasMore = ref(true);
  const allTags = ref<Tag[]>([]);
  const error = ref('');
  const observerTarget = ref<HTMLDivElement | null>(null);
  let observer: IntersectionObserver | null = null;

  // 排序选项
  const sortOptions = [
    { label: '按名称', value: 'name' },
    { label: '按文章数', value: 'articleCount' },
    { label: '按关注数', value: 'followCount' },
    { label: '按创建时间', value: 'createdAt' }
  ];

  // 重置数据
  const resetData = () => {
    pagination.value.page = 1;
    allTags.value = [];
    hasMore.value = true;
    loading.value = false;
    error.value = '';
  };

  // 加载标签数据
  const loadTags = async () => {
    // 添加额外的检查，确保不会重复触发
    if (loading.value || !hasMore.value) return;

    // 如果是第一页且已经有数据（SSR数据），跳过请求
    if (pagination.value.page === 1 && allTags.value.length > 0) {
      return;
    }

    loading.value = true;

    // 如果是第一页，立即清空列表以提供即时反馈
    if (pagination.value.page === 1) {
      allTags.value = [];
    }

    try {
      const response = await tagControllerFindAll({
        composable: 'useFetch',
        key: `tags-${searchQuery.value || 'all'}-${pagination.value.page}`,
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          ...(searchQuery.value && { name: searchQuery.value })
        }
      });

      const newData = response.data.value?.data?.data || [];

      if (pagination.value.page === 1) {
        allTags.value = newData;
      } else {
        allTags.value = [...allTags.value, ...newData];
      }

      // 检查是否还有更多数据
      hasMore.value = newData.length === pagination.value.limit;

      // 更新页码
      if (hasMore.value) {
        pagination.value.page++;
      }

      // 重新初始化 observer（重要修复）
      if (hasMore.value && observerTarget.value) {
        nextTick(() => {
          if (observer) {
            observer.disconnect();
          }
          if (observerTarget.value) {
            observer = new IntersectionObserver(
              entries => {
                const target = entries[0];
                if (target?.isIntersecting && !loading.value && hasMore.value) {
                  loadTags();
                }
              },
              {
                rootMargin: '200px'
              }
            );
            observer.observe(observerTarget.value);
          }
        });
      }
    } catch (err: any) {
      error.value = err.message || '加载失败';
    } finally {
      loading.value = false;
    }
  };

  // 计算属性：排序后的标签数据
  const filteredTags = computed(() => {
    // 由于搜索在服务端进行，这里只需要简单的客户端排序
    let filtered = [...allTags.value];

    // 客户端排序（如果需要的话）
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'articleCount':
          return (b.articleCount || 0) - (a.articleCount || 0);
        case 'followCount':
          return (b.followCount || 0) - (a.followCount || 0);
        case 'createdAt':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        default:
          return 0;
      }
    });

    return filtered;
  });

  const getTagCloudClass = (tag: Tag) => {
    const articleCount = tag.articleCount || 0;
    const classes = [];

    // 根据文章数量确定颜色
    if (articleCount >= 100) {
      classes.push('bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200');
    } else if (articleCount >= 50) {
      classes.push('bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200');
    } else if (articleCount >= 20) {
      classes.push('bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200');
    } else if (articleCount >= 10) {
      classes.push('bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200');
    } else if (articleCount >= 5) {
      classes.push('bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200');
    } else {
      classes.push('bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200');
    }

    return classes.join(' ');
  };

  const getTagFontSize = (tag: Tag) => {
    const articleCount = tag.articleCount || 0;
    const tagCounts = allTags.value.map(t => t.articleCount || 0);
    const maxCount = tagCounts.length > 0 ? Math.max(...tagCounts) : 0;

    if (maxCount === 0) return 14;

    const ratio = articleCount / maxCount;
    return Math.max(12, Math.min(24, 12 + ratio * 12));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 监听器
  watch([searchQuery, sortBy], async () => {
    resetData();
    await loadTags();
  });

  // SSR 数据预取
  const { data: initialTagsData, pending: initialLoading } = await tagControllerFindAll({
    composable: 'useFetch',
    key: `tags-ssr-${searchQuery.value || 'all'}`,
    query: {
      page: 1,
      limit: pagination.value.limit,
      ...(searchQuery.value && { name: searchQuery.value })
    }
  });

  // 初始化 SSR 数据
  if (initialTagsData.value?.data?.data) {
    allTags.value = initialTagsData.value.data.data;
    hasMore.value = initialTagsData.value.data.data.length === pagination.value.limit;
    if (hasMore.value) {
      pagination.value.page = 2;
    }
  }

  // 初始加载（仅在客户端且没有SSR数据时）
  onMounted(() => {
    if (allTags.value.length === 0) {
      loadTags();
    }
  });

  // 初始化 Intersection Observer
  onMounted(() => {
    // 延迟初始化 observer，确保 DOM 完全渲染
    nextTick(() => {
      if (observerTarget.value) {
        observer = new IntersectionObserver(
          entries => {
            const target = entries[0];
            if (target?.isIntersecting && !loading.value && hasMore.value) {
              loadTags();
            }
          },
          {
            rootMargin: '200px' // 提前200px触发加载
          }
        );

        observer.observe(observerTarget.value);
      }
    });
  });

  onUnmounted(() => {
    // 清理 Intersection Observer
    if (observer) {
      observer.disconnect();
    }
  });
</script>
