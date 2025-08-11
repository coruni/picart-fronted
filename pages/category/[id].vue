<template>
  <div class="min-h-[calc(100vh-3.5rem)]">
    <Title>{{ category?.data?.name }}</Title>
    <Meta name="description" :content="category?.data?.description" />
    <Meta name="keywords" :content="category?.data?.name" />
    <Meta name="robots" content="index, follow" />
    <Meta name="og:title" :content="category?.data?.name" />
    <Meta name="og:description" :content="category?.data?.description" />
    <Meta name="og:type" content="website" />
    <Meta name="og:image" :content="category?.data?.cover" />
    <!-- 分类头部信息 -->
    <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
      <div class="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {{ category?.data?.name || $t('category.loading') }}
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {{ category?.data?.description || $t('category.defaultDescription') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 筛选和排序 -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-center mb-8 md:justify-end">
        <UTabs
          :items="tabs"
          :default-value="0"
          v-model="currentTab"
          class="w-auto"
          variant="pill"
          :ui="{ trigger: 'cursor-pointer' }"
        >
        </UTabs>
        <div class="flex items-center space-x-2 ml-4">
          <button
            @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
            class="p-2 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon :name="viewMode === 'grid' ? 'mynaui:grid' : 'mynaui:list'" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- 文章列表 -->
      <div v-if="loading && displayItems.length === 0" class="flex justify-center py-12">
        <div
          class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
        ></div>
      </div>

      <div v-else-if="!loading && displayItems.length === 0" class="text-center py-12">
        <Icon name="mynaui:file-search" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {{ $t('category.noArticles') }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          {{ $t('category.noArticlesDescription') }}
        </p>
      </div>

      <!-- 网格视图 -->
      <div v-else-if="viewMode === 'grid'">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <TransitionGroup name="list" tag="div" class="contents">
            <div
              v-for="item in displayItems"
              :key="item.id"
              class="transform transition-all duration-300 hover:scale-105"
            >
              <CommonArticleCard :data="item" />
            </div>
          </TransitionGroup>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="space-y-4">
        <TransitionGroup name="list" tag="div" class="space-y-4">
          <NuxtLinkLocale
            v-for="item in displayItems"
            :key="item.id"
            :to="`/article/${item.id}`"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex flex-col md:flex-row gap-4">
              <div class="md:w-1/3">
                <NuxtImg
                  :src="item.cover || item.images[0]"
                  :alt="item.title"
                  class="w-full h-48 md:h-32 object-cover rounded-lg"
                  loading="lazy"
                  format="webp"
                />
              </div>
              <div class="md:w-2/3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {{ item.title }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {{ item.description }}
                </p>
                <div
                  class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
                >
                  <div class="flex items-center space-x-4">
                    <span>{{ item.author.nickname }}</span>
                    <span>{{ formatDate(item.createdAt) }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Icon name="mynaui:eye" class="w-4 h-4" />
                    <span>{{ item.views }}</span>
                  </div>
                </div>
              </div>
            </div>
          </NuxtLinkLocale>
        </TransitionGroup>
      </div>

      <!-- 没有更多数据提示 -->
      <div v-if="!hasMore && displayItems.length > 0" class="text-center py-4 text-gray-500">
        {{ $t('common.loading.noMore') }}
      </div>

      <!-- Intersection Observer 观察器元素 -->
      <div ref="observerTarget" class="h-1"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, watch, onUnmounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { categoryControllerFindOne, articleControllerFindAll } from '~~/api';

  const route = useRoute();
  const categoryId = computed(() => route.params.id as string);

  // 简化状态管理，参考index.vue
  const articles = ref<any[]>([]);
  const loading = ref(false);
  const tabs = [
    { label: 'category.latest', value: 'latest' },
    { label: 'category.popular', value: 'popular' }
  ];
  const currentTab = ref('latest');
  const viewMode = ref<'grid' | 'list'>('grid');
  const pagination = ref({
    page: 1,
    limit: 12
  });
  const hasMore = ref(true);
  const observerTarget = ref<HTMLDivElement | null>(null);
  let observer: IntersectionObserver | null = null;

  // 加载分类信息
  const { data: category } = await categoryControllerFindOne({
    composable: 'useAsyncData',
    key: `category-${categoryId.value}`,
    path: { id: categoryId.value }
  });

  // 重置数据，参考index.vue
  const resetData = () => {
    pagination.value.page = 1;
    articles.value = [];
    hasMore.value = true;
  };

  // 加载文章数据，完全模仿index.vue
  const loadArticles = async () => {
    if (loading.value || !hasMore.value) return;

    loading.value = true;
    try {
      const response = await articleControllerFindAll({
        composable: 'useFetch',
        key: `category-articles-${categoryId.value}-${currentTab.value}-${pagination.value.page}`,

        query: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          categoryId: Number(categoryId.value),
          type: currentTab.value as 'latest' | 'popular'
        }
      });

      const newData = response.data.value?.data?.data || [];

      if (pagination.value.page === 1) {
        articles.value = newData;
      } else {
        articles.value = [...articles.value, ...newData];
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
      console.error('加载文章失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 计算显示的项目，参考index.vue
  const displayItems = computed(() => articles.value);

  // 格式化日期
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 图片错误处理

  // 监听状态变化
  watch(currentTab, () => {
    resetData();
    loadArticles();
  });

  watch(categoryId, () => {
    resetData();
    loadArticles();
  });

  // 初始化加载
  loadArticles();

  onMounted(() => {
    // 初始化 Intersection Observer，参考index.vue
    if (observerTarget.value) {
      observer = new IntersectionObserver(
        entries => {
          const target = entries[0];
          if (target.isIntersecting && !loading.value && hasMore.value) {
            loadArticles();
          }
        },
        {
          rootMargin: '200px'
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
</script>

<style scoped>
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

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
