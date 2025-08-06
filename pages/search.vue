<template>
  <div class="min-h-[calc(100vh-4rem)]">
    <div class="sticky top-16 z-10 bg-white/80 backdrop-blur-md dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div class="flex flex-col items-center justify-center">
          <!-- 搜索输入框 -->
          <div class="w-full max-w-2xl">
            <UInput
              v-model="searchQuery"
              :placeholder="$t('search.placeholder')"
              size="lg"
              class="w-full"
              icon="mynaui:search"
              @keyup.enter="handleSearch"
            >
            </UInput>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <!-- 空状态 -->
      <div v-if="!loading && displayArticles.length === 0 && hasSearched" class="text-center py-16">
        <UIcon name="i-heroicons-magnifying-glass" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
          {{ $t('search.noResults.title') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {{ $t('search.noResults.description') }}
        </p>
      </div>

      <!-- 文章网格 -->
      <div v-if="hasSearched" class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <TransitionGroup name="list" tag="div" class="contents">
          <div
            v-for="article in displayArticles"
            :key="article.id"
            class="transform transition-transform duration-300 hover:-translate-y-1"
          >
            <CommonArticleCard :data="article" />
          </div>
        </TransitionGroup>
      </div>

      <!-- 加载指示器 -->
      <div v-if="loading" class="flex justify-center py-8">
        <div
          class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        ></div>
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
  import { articleControllerArticleSearch } from '~~/api';
  import { onUnmounted } from 'vue';

  const { t } = useI18n();

  // 搜索状态
  const searchQuery = ref('');
  const loading = ref(false);
  const totalResults = ref(0);
  const pagination = ref({
    page: 1,
    limit: 24
  });
  const hasMore = ref(true);
  const hasSearched = ref(false);
  const allArticles = ref<any[]>([]);

  const currentQuery = computed(() => searchQuery.value);
  const displayArticles = computed(() => allArticles.value);

  // 重置数据
  const resetData = () => {
    pagination.value.page = 1;
    allArticles.value = [];
    hasMore.value = true;
    totalResults.value = 0;
  };

  // 搜索功能
  const handleSearch = async () => {
    if (!searchQuery.value.trim()) {
      resetData();
      hasSearched.value = false;
      return;
    }

    loading.value = true;
    hasSearched.value = true;

    try {
      const { data: articles } = await articleControllerArticleSearch({
        composable: 'useFetch',
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          keyword: searchQuery.value
        }
      });

      allArticles.value = articles.value?.data?.data || [];
      totalResults.value = articles.value?.data?.meta?.total || 0;
      hasMore.value = articles.value?.data?.data?.length === pagination.value.limit;

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

  // Intersection Observer 元素引用
  const observerTarget = ref<HTMLDivElement | null>(null);
  let observer: IntersectionObserver | null = null;

  // 监听路由参数
  watch(
    () => useRoute().query.q,
    newQuery => {
      if (newQuery && typeof newQuery === 'string') {
        searchQuery.value = newQuery;
        resetData();
        handleSearch();
      } else if (!newQuery) {
        clearSearch();
      }
    },
    { immediate: true }
  );

  // 监听搜索参数变化
  watch(searchQuery, () => {
    if (searchQuery.value.trim()) {
      resetData();
      handleSearch();
    }
  });

  // 防抖搜索
  const debouncedSearch = debounce(() => {
    if (searchQuery.value.trim()) {
      resetData();
      handleSearch();
    } else {
      clearSearch();
    }
  }, 300);

  watch(searchQuery, () => {
    debouncedSearch();
  });

  // 同步URL参数
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

  // 初始化
  onMounted(() => {
    // 初始化 Intersection Observer
    if (observerTarget.value) {
      observer = new IntersectionObserver(
        entries => {
          const target = entries[0];
          if (
            target.isIntersecting &&
            !loading.value &&
            hasMore.value &&
            searchQuery.value.trim()
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

  // 页面标题
  useHead({
    title: t('search.title')
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
