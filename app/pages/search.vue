<template>
  <div class="flex-1 flex-col flex gap-12">
    <div class="sticky top-0 mt-6 z-10 bg-white/80 backdrop-blur-md dark:bg-gray-800">
      <div class="">
        <div class="flex flex-col items-center justify-center">
          <!-- 搜索输入框 -->
          <div class="w-full max-w-2xl flex gap-2">
            <UInput
              v-model="searchQuery"
              :placeholder="$t('search.placeholder')"
              size="lg"
              class="flex-1"
              icon="mynaui:search"
              @keyup.enter="handleManualSearch"
            >
            </UInput>
            <UButton
              @click="handleManualSearch"
              size="lg"
              color="primary"
              :loading="loading"
              icon="mynaui:search"
              class="truncate"
            >
              {{ $t('search.title') }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div>
      <!-- 空状态 -->
      <div v-if="!loading && displayArticles.length === 0 && hasSearched" class="text-center py-16">
        <Icon name="mynaui:search" class="w-16 h-16 text-gray-400 mx-auto mb-4" />

        <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('search.noResults.title') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {{ $t('search.noResults.description') }}
        </p>
      </div>

      <!-- 内容区域 (相对定位以便加载动画覆盖) -->
      <div v-if="hasSearched" class="relative min-h-[400px]">
        <!-- 加载动画 -->
        <LoadingOverlay :show="searchLoading" :message="$t('common.loading.loading')" />

        <!-- 网格布局 -->
        <div v-if="layoutMode === 'grid'" class="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-6">
          <TransitionGroup name="list" tag="div" class="contents">
            <div
              v-for="article in allArticles"
              :key="article.id"
              class="transform transition-transform duration-300 hover:-translate-y-1"
            >
              <CommonArticleCard :data="article" />
            </div>
          </TransitionGroup>
          <!-- 网格布局加载骨架屏 -->
          <template v-if="loading">
            <ArticleSkeleton v-for="i in 12" :key="`skeleton-${i}`" />
          </template>
        </div>

        <!-- 瀑布流布局 -->
        <div v-else>
          <WaterfallLayout :items="displayArticlesWithSkeleton" :gap="16">
            <template #default="{ item }">
              <WaterfallSkeleton v-if="(item as any).isSkeleton" :index="(item as any).index" />
              <WaterfallArticleCard v-else :data="item as any" />
            </template>
          </WaterfallLayout>
        </div>
      </div>

      <!-- 初次加载指示器 -->
      <div v-if="loading && allArticles.length === 0" class="py-8">
        <!-- 网格布局骨架屏 -->
        <div v-if="layoutMode === 'grid'" class="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-6">
          <ArticleSkeleton v-for="i in 12" :key="i" />
        </div>
        <!-- 瀑布流布局骨架屏 -->
        <WaterfallLayout v-else :gap="16" :items="skeletonItems">
          <template #default="{ item }">
            <WaterfallSkeleton :index="(item as any).index" />
          </template>
        </WaterfallLayout>
      </div>

      <!-- 没有更多数据提示 -->
      <div
        v-else-if="!hasMore && displayArticles.length > 0"
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        {{ $t('common.loading.noMore') }}
      </div>

      <!-- Intersection Observer 观察器元素 -->
      <div ref="observerTarget" class="h-1"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { articleControllerArticleSearch } from '~/api';
  import { debounce } from 'lodash-es';
  const { t } = useI18n();
  const route = useRoute();

  // 搜索状态
  const searchQuery = ref('');
  // 从 siteConfig 获取布局模式
  const siteConfig = inject<any>('siteConfig');
  const layoutMode = computed(() => siteConfig?.site_layout || 'waterfall');
  const loading = ref(false);
  const searchLoading = ref(false); // 搜索时的加载状态
  const totalResults = ref(0);
  const pagination = ref({
    page: 1,
    limit: 24
  });
  const hasMore = ref(true);
  const hasSearched = ref(false);
  const allArticles = ref<any[]>([]);

  // 骨架屏占位数据
  const skeletonItems = computed(() =>
    Array.from({ length: 12 }, (_, i) => ({ id: `skeleton-${i}`, index: i, isSkeleton: true }))
  );

  const currentQuery = computed(() => searchQuery.value);
  const displayArticles = computed(() => allArticles.value);

  // 瀑布流显示项目（包括骨架屏）
  const displayArticlesWithSkeleton = computed(() => {
    if (layoutMode.value === 'waterfall' && loading.value && allArticles.value.length > 0) {
      return [...allArticles.value, ...skeletonItems.value];
    }
    return allArticles.value;
  });

  // 重置数据
  const resetData = () => {
    pagination.value.page = 1;
    allArticles.value = [];
    hasMore.value = true;
    totalResults.value = 0;
  };

  // SSR 数据预取 - 从 URL 参数获取搜索关键词
  const initialQuery = (route.query.q as string) || '';
  if (initialQuery) {
    searchQuery.value = initialQuery;
    hasSearched.value = true;
  }

  // SSR 数据获取
  const { data: initialSearchData, pending: initialLoading } = await articleControllerArticleSearch(
    {
      composable: 'useFetch',
      key: `search-ssr-${initialQuery}`,
      query: {
        page: 1,
        limit: pagination.value.limit,
        keyword: initialQuery
      }
    }
  );

  // 初始化 SSR 数据
  if (initialSearchData.value?.data && initialQuery) {
    allArticles.value = initialSearchData.value.data.data;
    totalResults.value = initialSearchData.value.data.meta?.total || 0;
    hasMore.value = initialSearchData.value.data.data.length === pagination.value.limit;
    if (hasMore.value) {
      pagination.value.page = 2;
    }
  }

  // 搜索功能
  const handleSearch = async () => {
    if (!searchQuery.value.trim()) {
      resetData();
      hasSearched.value = false;
      return;
    }

    if (loading.value || !hasMore.value) return;
    loading.value = true;
    hasSearched.value = true;
    try {
      const { data: articles } = await articleControllerArticleSearch({
        composable: '$fetch',
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          keyword: searchQuery.value
        }
      });

      const newArticles = articles?.data || [];
      allArticles.value = [...allArticles.value, ...newArticles];
      totalResults.value = articles?.meta?.total || 0;
      hasMore.value = newArticles.length === pagination.value.limit;

      if (hasMore.value) {
        pagination.value.page++;
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 清空搜索
  const clearSearch = () => {
    searchQuery.value = '';
    resetData();
    hasSearched.value = false;
  };

  // 手动搜索（重置数据后搜索）
  const handleManualSearch = async () => {
    if (searchQuery.value.trim()) {
      searchLoading.value = true; // 显示加载动画
      resetData();
      hasSearched.value = true;
      await handleSearch();
      searchLoading.value = false; // 隐藏加载动画
    }
  };

  // Intersection Observer 元素引用
  const observerTarget = ref<HTMLDivElement | null>(null);
  let observer: IntersectionObserver | null = null;

  // 监听路由参数（仅在客户端执行）
  if (process.client) {
    watch(
      () => useRoute().query.q,
      newQuery => {
        if (newQuery && typeof newQuery === 'string') {
          // 避免重复设置相同值
          if (searchQuery.value !== newQuery) {
            searchQuery.value = newQuery;
          }
        } else if (!newQuery && searchQuery.value) {
          clearSearch();
        }
      },
      { immediate: false } // 不立即执行，因为 SSR 已经处理了初始值
    );
  }

  // 防抖搜索（仅在客户端执行）
  const debouncedSearch = debounce(() => {
    if (searchQuery.value.trim()) {
      // 重置数据并重新搜索
      resetData();
      hasSearched.value = true;
      handleSearch();
    } else {
      clearSearch();
    }
  }, 500);

  // 监听搜索参数变化（使用防抖，仅在客户端执行）
  if (process.client) {
    watch(searchQuery, () => {
      debouncedSearch();
    });

    // 同步URL参数（仅在客户端执行）
    watch(
      searchQuery,
      () => {
        const query: Record<string, string> = {};

        if (searchQuery.value.trim()) {
          query.q = searchQuery.value;
        }

        navigateTo({ query }, { replace: true });
      },
      { deep: true }
    );
  }

  // 初始化
  onMounted(() => {
    // 初始化 Intersection Observer
    if (observerTarget.value) {
      observer = new IntersectionObserver(
        entries => {
          const target = entries[0];
          if (
            target?.isIntersecting &&
            !loading.value &&
            hasMore.value &&
            searchQuery.value.trim() &&
            hasSearched.value
          ) {
            handleSearch();
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

  // 页面标题和 SEO 元数据
  useHead({
    title: computed(() => {
      if (searchQuery.value) {
        return `${t('search.title')} - "${searchQuery.value}"`;
      }
      return t('search.title');
    }),
    meta: [
      {
        name: 'description',
        content: computed(() => {
          if (searchQuery.value) {
            return `${t('search.meta.description')} "${searchQuery.value}"`;
          }
          return t('search.meta.description');
        })
      },
      {
        property: 'og:title',
        content: computed(() => {
          if (searchQuery.value) {
            return `${t('search.title')} - "${searchQuery.value}"`;
          }
          return t('search.title');
        })
      },
      {
        property: 'og:description',
        content: computed(() => {
          if (searchQuery.value) {
            return `${t('search.meta.description')} "${searchQuery.value}"`;
          }
          return t('search.meta.description');
        })
      }
    ]
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

  /* 暗色模式适配 */
  .dark .bg-gray-50 {
    background-color: rgb(15 23 42);
  }

  .dark .bg-white {
    background-color: rgb(30 41 59);
  }

  .dark .border-gray-200 {
    border-color: rgb(51 65 85);
  }

  .dark .text-gray-900 {
    color: rgb(248 250 252);
  }

  .dark .text-gray-600 {
    color: rgb(148 163 184);
  }
</style>
