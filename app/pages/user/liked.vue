<template>
  <main class="w-full flex flex-col pb-4">
    <!-- 页面标题 -->
    <div class="mb-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <UIcon name="i-heroicons-heart-solid" class="w-6 h-6 mr-2 text-red-500" />
          {{ $t('user.likedArticles') }}
        </h1>
        <UBadge color="neutral" variant="soft"> {{ totalItems }} {{ $t('user.articles') }} </UBadge>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1">
      <!-- 初始加载动画 -->
      <div v-if="initialLoading" class="min-h-[400px] flex items-center justify-center">
        <UIcon name="mynaui:circle" class="w-8 h-8 animate-spin text-primary-500" />
      </div>

      <!-- 文章网格 -->
      <div v-else class="relative">
        <!-- 加载占位动画 -->
        <div
          v-if="pending"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          role="list"
        >
          <div
            v-for="i in itemsPerPage"
            :key="`skeleton-${i}`"
            class="animate-pulse"
            role="listitem"
          >
            <div class="bg-gray-200 dark:bg-gray-700 rounded-xl aspect-[3/4] mb-2"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>

        <!-- 实际文章列表 -->
        <div
          v-else-if="likedArticles.length > 0"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          role="list"
        >
          <article v-for="(article, index) in likedArticles" :key="article.id" role="listitem">
            <CommonArticleCard :data="article" :is-first-screen="index < 8" class="!rounded-xl" />
          </article>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-12">
          <UIcon
            name="i-heroicons-heart"
            class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ $t('user.noLikedArticles') }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            {{ $t('user.startLikingArticles') }}
          </p>
          <UButton color="primary" @click="$router.push('/')">
            {{ $t('user.exploreArticles') }}
          </UButton>
        </div>
      </div>

      <!-- 分页控制 -->
      <UPagination
        v-model:page="currentPage"
        :total="data?.data.meta.total"
        :itemsPerPage="itemsPerPage"
        :sibling-count="1"
        show-edges
        show-controls
        :ui="{
          root: 'flex-1 flex items-center justify-center'
        }"
      />
    </div>
  </main>
</template>

<script lang="ts" setup>
  import { articleControllerGetArticleLiked } from '~/api';
  import { useUserStore } from '~/stores/user';

  const { t } = useI18n();
  const userStore = useUserStore();

  // 检查用户是否已登录
  if (!userStore.isAuthenticated) {
    await navigateTo('/user/login');
  }

  // 分页状态
  const currentPage = ref(1);
  const itemsPerPage = ref(12);
  const totalItems = ref(0);
  const likedArticles = ref<any[]>([]);

  // 使用 API 自带的 useAsyncData composable
  const {
    data,
    pending: initialLoading,
    refresh
  } = await articleControllerGetArticleLiked({
    composable: 'useAsyncData',
    query: {
      page: currentPage.value,
      limit: itemsPerPage.value
    }
  });

  // 创建一个 computed 来追踪 pending 状态(不包括初始加载)
  const pending = computed(() => initialLoading.value && currentPage.value !== 1);

  // 监听数据变化并更新本地状态
  watch(
    data,
    newData => {
      if (newData?.data) {
        likedArticles.value = newData.data.data || [];
        totalItems.value = newData.data.meta?.total || 0;
      }
    },
    { immediate: true }
  );

  // 监听页码变化,触发数据刷新
  watch(currentPage, async (newPage, oldPage) => {
    if (newPage !== oldPage && oldPage !== undefined) {
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 刷新数据
      await refresh();
    }
  });

  // 页面元数据
  useHead({
    title: () => t('user.likedArticles'),
    meta: [
      {
        name: 'description',
        content: t('user.likedArticlesDescription', {
          count: totalItems.value
        })
      },
      {
        name: 'robots',
        content: 'noindex, nofollow'
      }
    ]
  });
</script>
