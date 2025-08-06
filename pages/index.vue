<template>
  <div>
    <CommonSwiperClient />
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Tab切换 -->
      <div class="flex justify-center mb-8 md:justify-end">
        <UTabs v-model="currentTab" :items="tabs" variant="pill" class="w-auto" :default-value="0">
          <template #default="{ item }">
            <span class="text-sm font-medium cursor-pointer">{{ $t(item.name) }}</span>
          </template>
        </UTabs>
      </div>
      <!-- 瀑布流展示 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
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
      <div v-if="loading" class="col-span-2 md:col-span-4 flex justify-center py-4">
        <div
          class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        ></div>
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
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import { articleControllerFindAll } from '~~/api';

  const tabs: { id: 'all' | 'popular' | 'latest' | 'following'; name: string; value: string }[] = [
    { id: 'all', name: 'home.tab.all', value: 'all' },
    { id: 'popular', name: 'home.tab.popular', value: 'popular' },
    { id: 'latest', name: 'home.tab.latest', value: 'latest' },
    { id: 'following', name: 'home.tab.following', value: 'following' }
  ];
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
  };

  watch(currentTab, () => {
    resetData();
    loadArticles();
  });

  // 加载文章数据
  const loadArticles = async () => {
    // 添加额外的检查，确保不会重复触发
    if (loading.value || !hasMore.value) return;

    loading.value = true;
    try {
      const response = await articleControllerFindAll({
        composable: 'useFetch',
        key: `home-${currentTab.value}`,
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
      console.error('加载文章失败:', error);
    } finally {
      loading.value = false;
    }
  };

  loadArticles();
  // 计算显示的项目
  const displayItems = computed(() => {
    return allItems.value;
  });

  // 移除了节流函数和滚动检查函数，因为现在使用 Intersection Observer

  const notify = () => {
    useNuxtApp().$toast.warn(
      '页面还在开发中，下载资源请<a href="https://drive.cosfan.cc" style="color: #4299e1;" target="_blank">👉点击下载👈</a>',
      {
        dangerouslyHTMLString: true,
        autoClose: 10000,
        position: 'top-center',
        hideProgressBar: true
      }
    );
  };

  onMounted(() => {
    notify();

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
