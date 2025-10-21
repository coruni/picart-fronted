<template>
  <main class="w-full">
    <CommonSwiperClient />
    <ScrollToTop />
    <!-- 首页顶部广告 -->
    <Advertisement type="homepage" position="top" />

    <nav
      class="flex flex-col sm:flex-row justify-end items-center gap-4 my-8"
      aria-label="Content tabs"
    >
      <UTabs
        v-model="currentTab"
        :items="tabs"
        variant="pill"
        class="w-auto"
        :default-value="0"
        :ui="{ trigger: 'cursor-pointer' }"
      >
        <template #default="{ item }">
          <span class="hidden md:inline" v-text="item.label"></span>
        </template>
      </UTabs>
    </nav>

    <!-- 内容区域 (相对定位以便加载动画覆盖) -->
    <section class="relative min-h-[400px]" aria-label="Article list">
      <!-- 加载动画 -->
      <LoadingOverlay :show="tabSwitchLoading" :message="$t('common.loading.loading')" />

      <!-- 网格布局 -->
      <div
        v-if="layoutMode === 'grid'"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6"
        role="list"
      >
        <article v-for="(item, index) in allItems" :key="item.id" role="listitem">
          <CommonArticleCard :data="item" :is-first-screen="index < 10" />
        </article>
        <!-- 网格布局加载骨架屏 -->
        <template v-if="loading">
          <ArticleSkeleton v-for="i in 10" :key="`skeleton-${i}`" />
        </template>
      </div>

      <!-- 瀑布流布局 -->
      <WaterfallLayout v-else :items="displayItems" :gap="16">
        <template #default="{ item, index }">
          <WaterfallSkeleton v-if="(item as any).isSkeleton" :index="(item as any).index" />
          <WaterfallArticleCard v-else :data="item as any" :is-first-screen="index < 10" />
        </template>
      </WaterfallLayout>
    </section>

    <!-- 没有更多数据提示 -->
    <div
      v-if="!hasMore && allItems.length > 0"
      class="col-span-2 md:col-span-4 text-center py-4 text-gray-500"
      role="status"
      aria-live="polite"
    >
      {{ $t('common.loading.noMore') }}
    </div>

    <!-- Intersection Observer 观察器元素 -->
    <div ref="observerTarget" class="col-span-2 md:col-span-4 h-1" aria-hidden="true"></div>
  </main>
</template>

<script lang="ts" setup>
  import type { TabsItem } from '@nuxt/ui';
  import { articleControllerFindAll } from '~/api';
  import type { ConfigControllerGetPublicResponse } from '~/api';
  type SiteConfig = ConfigControllerGetPublicResponse['data'];
  const { t } = useI18n();

  // 定义组件名称，用于 keep-alive 识别
  defineOptions({
    name: 'index'
  });

  // 启用 keep-alive 缓存
  definePageMeta({
    keepalive: true
  });

  // 首页中
  const siteConfig = inject<SiteConfig>('siteConfig');
  const siteName = siteConfig?.site_name || '';
  const siteSubtitle = siteConfig?.site_subtitle || '';
  const homeTitle = siteSubtitle ? `${siteName} - ${siteSubtitle}` : siteName;

  // 或者使用 useSeoMeta 覆盖
  useSeoMeta({
    title: homeTitle,
    titleTemplate: null
  });

  // 统一的tab配置
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

  const currentTab = ref('all');
  // 从 siteConfig 获取布局模式
  const layoutMode = computed(() => (siteConfig as any)?.site_layout || 'waterfall');
  const pagination = ref({
    page: 1,
    limit: 20
  });
  const loading = ref(false);
  const tabSwitchLoading = ref(false); // 切换tab的加载状态
  const hasMore = ref(true);
  const allItems = ref<any[]>([]);
  const observerTarget = ref<HTMLDivElement | null>(null);
  let observer: IntersectionObserver | null = null;

  // 骨架屏占位数据
  const skeletonItems = computed(() =>
    Array.from({ length: 10 }, (_, i) => ({ id: `skeleton-${i}`, index: i, isSkeleton: true }))
  );

  // 使用 useAsyncData 在 SSR 阶段获取首屏数据
  const { data: initialData, refresh: refreshData } = await useAsyncData(
    `home-articles-${currentTab.value}`,
    async () => {
      try {
        const response = await articleControllerFindAll({
          composable: '$fetch',
          query: {
            page: 1,
            limit: pagination.value.limit,
            type: currentTab.value as 'all' | 'popular' | 'latest' | 'following'
          }
        });
        return response.data?.data || [];
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        return [];
      }
    },
    {
      server: true,
      lazy: false
    }
  );

  // 初始化数据
  if (initialData.value) {
    allItems.value = initialData.value;
    hasMore.value = initialData.value.length === pagination.value.limit;
    if (hasMore.value) {
      pagination.value.page = 2; // 下次从第二页开始加载
    }
  }

  // 重置数据
  const resetData = () => {
    pagination.value.page = 1;
    allItems.value = [];
    hasMore.value = true;
    loading.value = false;
  };

  // 重启 observer
  const restartObserver = () => {
    if (observer && observerTarget.value) {
      observer.disconnect();
      observer.observe(observerTarget.value);
    }
  };

  // 监听 tab 切换，刷新数据
  watch(currentTab, async newTab => {
    resetData();
    tabSwitchLoading.value = true; // 显示全局加载动画

    try {
      // 重新获取数据
      const response = await articleControllerFindAll({
        composable: '$fetch',
        query: {
          page: 1,
          limit: pagination.value.limit,
          type: newTab as 'all' | 'popular' | 'latest' | 'following'
        }
      });

      const newData = response.data?.data || [];
      allItems.value = newData;
      hasMore.value = newData.length === pagination.value.limit;

      if (hasMore.value) {
        pagination.value.page = 2;
        // 重启观察器
        restartObserver();
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      tabSwitchLoading.value = false; // 隐藏全局加载动画
    }
  });

  // 加载更多文章数据
  const loadArticles = async () => {
    // 添加额外的检查，确保不会重复触发
    if (loading.value || !hasMore.value) return;

    loading.value = true;

    try {
      const response = await articleControllerFindAll({
        composable: '$fetch',
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          type: currentTab.value as 'all' | 'popular' | 'latest' | 'following'
        }
      });

      const newData = response.data?.data || [];
      allItems.value = [...allItems.value, ...newData];

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
      console.error('Failed to load more articles:', error);
    } finally {
      loading.value = false;
    }
  };

  // 计算显示的项目（包括加载时的骨架屏）
  const displayItems = computed(() => {
    if (layoutMode.value === 'waterfall' && loading.value && allItems.value.length > 0) {
      // 瀑布流模式下加载更多时，将骨架屏混入列表
      return [...allItems.value, ...skeletonItems.value];
    }
    return allItems.value;
  });

  onMounted(() => {
    // 初始化 Intersection Observer
    if (observerTarget.value) {
      observer = new IntersectionObserver(
        entries => {
          const target = entries[0];
          if (target?.isIntersecting && !loading.value && hasMore.value) {
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

  onUnmounted(() => {
    // 清理 Intersection Observer
    if (observer) {
      observer.disconnect();
    }
  });
</script>
