<template>
  <div>
    <CommonSwiperClient />

    <!-- 首页顶部广告 -->
    <Advertisement type="homepage" position="top" />

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Tab切换 -->
      <div class="flex justify-center mb-8 md:justify-end">
        <UTabs
          v-model="currentTab"
          :items="mobileTabs"
          variant="pill"
          class="w-auto"
          :default-value="0"
          :ui="{ trigger: 'cursor-pointer' }"
        />
      </div>
      <!-- 瀑布流展示 -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        <TransitionGroup name="list" tag="div" class="contents">
          <div
            v-for="item in displayItems"
            :key="item.id"
            class="transform transition-transform hover:scale-105 duration-300"
          >
            <CommonArticleCard :data="item" />
          </div>
        </TransitionGroup>
      </div>
      <!-- 加载指示器 -->
      <div
        v-if="loading"
        class="col-span-2 md:col-span-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 py-8"
      >
        <ArticleSkeleton v-for="i in 8" :key="i" />
      </div>

      <!-- 没有更多数据提示 -->
      <div
        v-else-if="!hasMore && displayItems.length > 0"
        class="col-span-2 md:col-span-4 text-center py-4 text-gray-500"
      >
        {{ $t('common.loading.noMore') }}
      </div>

      <!-- Intersection Observer 观察器元素 -->
      <div ref="observerTarget" class="col-span-2 md:col-span-4 h-1"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { TabsItem } from '@nuxt/ui';
  import { articleControllerFindAll } from '~~/api';
  const { t } = useI18n();
  const tabs: TabsItem[] = [
    { id: 'all', label: t('home.tab.all'), value: 'all', icon: 'mynaui:brand-trello' },
    { id: 'popular', label: t('home.tab.popular'), value: 'popular', icon: 'mynaui:fire' },
    { id: 'latest', label: t('home.tab.latest'), value: 'latest', icon: 'mynaui:plus' },
    {
      id: 'following',
      label: t('home.tab.following'),
      value: 'following',
      icon: 'mynaui:heart'
    }
  ];

  // 响应式处理移动端和桌面端的标签显示
  const windowWidth = ref(import.meta.client ? window.innerWidth : 1024);

  // 窗口大小变化处理函数
  const handleResize = () => {
    windowWidth.value = window.innerWidth;
  };

  const mobileTabs = computed(() => {
    const isMobile = windowWidth.value < 768;
    return tabs.map(tab => ({
      ...tab,
      label: isMobile ? '' : tab.label, // 移动端只显示图标，桌面端显示完整标签
      icon: tab.icon
    }));
  });

  const currentTab = ref('all');
  const pagination = ref({
    page: 1,
    limit: 12
  });
  const loading = ref(false);
  const hasMore = ref(true);
  const allItems = ref<any[]>([]);
  const observerTarget = ref<HTMLDivElement | null>(null);
  let observer: IntersectionObserver | null = null;

  // 重置数据
  const resetData = () => {
    pagination.value.page = 1;
    allItems.value = [];
    hasMore.value = true;
    loading.value = false;
  };

  watch(currentTab, async () => {
    resetData();
    await loadArticles();
  });

  // 加载文章数据
  const loadArticles = async () => {
    // 添加额外的检查，确保不会重复触发
    if (loading.value || !hasMore.value) return;

    loading.value = true;

    // 如果是第一页，立即清空列表以提供即时反馈
    if (pagination.value.page === 1) {
      allItems.value = [];
    }
    try {
      const response = await articleControllerFindAll({
        composable: 'useFetch',
        key: `home-${currentTab.value}-${pagination.value.page}`,
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          type: currentTab.value as 'all' | 'popular' | 'latest' | 'following'
        }
      });

      const newData = response.data.value?.data?.data || [];

      if (pagination.value.page === 1) {
        allItems.value = newData;
      } else {
        allItems.value = [...allItems.value, ...newData];
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
    } finally {
      loading.value = false;
    }
  };

  loadArticles();
  // 计算显示的项目
  const displayItems = computed(() => {
    return allItems.value;
  });

  onMounted(() => {
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 初始化 Intersection Observer
    if (observerTarget.value) {
      observer = new IntersectionObserver(
        entries => {
          const target = entries[0];
          if (target.isIntersecting && !loading.value && hasMore.value) {
            loadArticles();
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
    // 清理窗口大小监听器
    window.removeEventListener('resize', handleResize);
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
