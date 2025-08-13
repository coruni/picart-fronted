<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-4 md:py-8">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="flex items-center justify-center flex-col gap-8">
          <div
            class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
          ></div>
          <p class="text-gray-600 dark:text-gray-400">{{ $t('common.loading.loading') }}</p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="hasError" class="flex items-center justify-center py-20">
        <div class="text-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {{ $t('common.error.title') }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ $t('common.error.description') }}
          </p>
          <UButton @click="handleRetry" color="primary">
            {{ $t('common.error.retry') }}
          </UButton>
        </div>
      </div>

      <!-- 主要内容 -->
      <div v-else class="flex flex-col lg:flex-row gap-4 md:gap-8 relative">
        <!-- 左侧主内容区 -->
        <div class="flex-1">
          <!-- 作者信息区 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
            <div
              class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6"
            >
              <div class="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                <UAvatar
                  :src="authorInfo?.avatar"
                  :alt="authorInfo?.nickname || authorInfo?.username"
                  class="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full ring-2 ring-white"
                  loading="lazy"
                  format="webp"
                  sizes="96px md:128px"
                />
                <div
                  class="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-2 border-white"
                ></div>
              </div>
              <div class="flex-1">
                <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {{ authorInfo?.nickname || authorInfo?.username }}
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ authorInfo?.description || $t('author.noDescription') }}
                </p>
                <div class="flex flex-wrap items-center gap-4 mt-3">
                  <div class="text-center">
                    <div class="font-semibold text-gray-900 dark:text-white">
                      {{ authorInfo?.articleCount || 0 }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ $t('author.articles') }}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="font-semibold text-gray-900 dark:text-white">
                      {{ authorInfo?.followerCount || 0 }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ $t('author.followers') }}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="font-semibold text-gray-900 dark:text-white">
                      {{ authorInfo?.followingCount || 0 }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ $t('author.following') }}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="font-semibold text-gray-900 dark:text-white">
                      {{ authorInfo?.wallet || 0 }}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      {{ $t('author.wallet') }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex space-x-2">
                <UButton
                  v-if="!isFollowing"
                  @click="handleFollow"
                  :loading="followLoading"
                  class="px-3 py-1.5 cursor-pointer md:px-4 md:py-2 bg-primary text-white text-sm md:text-base rounded-lg hover:bg-primary-600 transition-colors !rounded-button whitespace-nowrap"
                >
                  {{ $t('author.follow') }}
                </UButton>
                <UButton
                  v-else
                  @click="handleUnfollow"
                  :loading="followLoading"
                  class="px-3 py-1.5 cursor-pointer md:px-4 md:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm md:text-base rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors !rounded-button whitespace-nowrap"
                >
                  {{ $t('author.unfollow') }}
                </UButton>
              </div>
            </div>
          </div>

          <!-- 作者文章 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
            <div class="flex items-center justify-between mb-4 md:mb-6">
              <h2 class="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                {{ $t('author.articles') }}
              </h2>
              <!-- Tab切换 -->
              <div class="flex justify-center mb-8 md:justify-end">
                <UTabs
                  v-model="currentArticleType"
                  :items="mobileArticleTabs"
                  variant="pill"
                  class="w-auto"
                  :default-value="0"
                  :ui="{ trigger: 'cursor-pointer' }"
                />
              </div>
            </div>

            <div
              v-if="displayArticles.length > 0"
              class="grid grid-cols-2 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            >
              <template v-for="article in displayArticles" :key="article.id">
                <CommonArticleCard :data="article" class="!rounded-xl" />
              </template>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              {{ $t('author.noArticles') }}
            </div>
            <!-- 加载更多按钮 -->
            <div
              v-if="hasMore && displayArticles.length > 0"
              class="col-span-2 sm:col-span-2 lg:col-span-3 flex justify-center py-4"
            >
              <UButton
                @click="loadAuthorArticles"
                :disabled="loading"
                color="primary"
                class="px-6 py-2 cursor-pointer bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 !rounded-button"
              >
                <div
                  v-if="loading"
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                ></div>
                {{ loading ? $t('common.loading.loading') : $t('common.loadMore') }}
              </UButton>
            </div>

            <!-- 没有更多数据提示 -->
            <div
              v-else-if="!hasMore && displayArticles.length > 0"
              class="col-span-2 sm:col-span-2 lg:col-span-3 text-center py-4 text-gray-500"
            >
              {{ $t('common.loading.noMore') }}
            </div>
          </div>
        </div>

        <!-- 右侧边栏 -->
        <div
          class="w-full lg:w-80 flex-shrink-0 mt-6 lg:mt-0 lg:sticky lg:top-16 self-start z-10"
          style="position: sticky"
        >
          <!-- 会员等级 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
            <h3 class="font-bold text-gray-900 dark:text-white mb-3 md:mb-4 text-sm md:text-base">
              {{ $t('author.membershipLevel') }}
            </h3>
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-gray-700 dark:text-gray-300">{{
                authorInfo?.membershipLevelName || $t('author.basicMember')
              }}</span>
              <span class="text-sm font-medium text-primary-500"
                >Lv.{{ authorInfo?.membershipLevel || 0 }}</span
              >
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="bg-primary h-2 rounded-full"
                :style="{ width: `${(authorInfo?.experience || 0) % 100}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>{{ authorInfo?.experience || 0 }} {{ $t('author.experience') }}</span>
              <span>{{ authorInfo?.score || 0 }} {{ $t('author.score') }}</span>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
            <h3 class="font-bold text-gray-900 dark:text-white mb-3 md:mb-4 text-sm md:text-base">
              {{ $t('author.statistics') }}
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700 dark:text-gray-300">{{
                  $t('author.totalViews')
                }}</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  authorInfo?.totalViews || 0
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700 dark:text-gray-300">{{
                  $t('author.totalLikes')
                }}</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  authorInfo?.totalLikes || 0
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700 dark:text-gray-300">{{
                  $t('author.avgRating')
                }}</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  authorInfo?.avgRating || 0
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { TabsItem } from '@nuxt/ui';
  import {
    userControllerFindOne,
    articleControllerFindArticleByAuthor,
    userControllerFollow,
    userControllerUnfollow
  } from '~~/api';
  import { watch } from 'vue';

  const route = useRoute();
  const { t } = useI18n();
  const toast = useToast();
  const userStore = useUserStore();

  // 作者信息
  const {
    data: authorData,
    pending: authorPending,
    error: authorError
  } = await userControllerFindOne({
    composable: 'useFetch',
    key: `author-${route.params.id}`,
    path: {
      id: String(route.params.id)
    }
  });

  const authorInfo = computed(() => authorData.value?.data);
  const isLoading = computed(() => authorPending.value);
  const hasError = computed(() => authorError.value);

  // 重试函数
  const handleRetry = () => {
    location.reload();
  };

  // 分页状态
  const pagination = ref({
    page: 1,
    limit: 6
  });
  const loading = ref(false);
  const hasMore = ref(true);
  const allArticles = ref<any[]>([]);
  const currentArticleType = ref<'all' | 'popular' | 'latest'>('all');

  // 关注状态
  const isFollowing = ref(false);
  const followLoading = ref(false);

  // 检查关注状态
  const checkFollowStatus = async () => {
    if (!userStore.isAuthenticated) return;

    try {
      // 这里需要根据实际的API来检查关注状态
      // 暂时设置为false，后续可以根据API调整
      isFollowing.value = false;
    } catch (error) {
      console.error('检查关注状态失败:', error);
    }
  };

  // 文章类型选项
  const tabs: TabsItem[] = [
    { id: 'all', label: t('author.allArticles'), value: 'all', icon: 'mynaui:brand-trello' },
    { id: 'popular', label: t('author.popularArticles'), value: 'popular', icon: 'mynaui:fire' },
    { id: 'latest', label: t('author.latestArticles'), value: 'latest', icon: 'mynaui:plus' }
  ];

  // 响应式处理移动端和桌面端的标签显示
  const windowWidth = ref(import.meta.client ? window.innerWidth : 1024);

  // 窗口大小变化处理函数
  const handleResize = () => {
    windowWidth.value = window.innerWidth;
  };

  const mobileArticleTabs = computed(() => {
    const isMobile = windowWidth.value < 768;
    return tabs.map(tab => ({
      ...tab,
      label: isMobile ? '' : tab.label, // 移动端只显示图标，桌面端显示完整标签
      icon: tab.icon
    }));
  });

  // 重置数据
  const resetData = () => {
    pagination.value.page = 1;
    allArticles.value = [];
    hasMore.value = true;
  };

  // 监听文章类型变化
  watch(currentArticleType, async () => {
    resetData();
    await loadAuthorArticles();
  });

  // 加载作者文章
  const loadAuthorArticles = async () => {
    if (loading.value || !hasMore.value) return;

    loading.value = true;
    try {
      const response = await articleControllerFindArticleByAuthor({
        composable: 'useFetch',
        key: `author-articles-${route.params.id}-${currentArticleType.value}-${pagination.value.page}`,
        path: {
          id: String(route.params.id)
        },
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          type: currentArticleType.value
        }
      });

      const newData = response.data.value?.data?.data || [];

      if (pagination.value.page === 1) {
        allArticles.value = newData;
      } else {
        allArticles.value = [...allArticles.value, ...newData];
      }

      // 检查是否还有更多数据
      hasMore.value = newData.length === pagination.value.limit;

      // 更新页码
      if (hasMore.value) {
        pagination.value.page++;
      }
    } catch (error) {
      console.error('加载作者文章失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 计算显示的文章
  const displayArticles = computed(() => {
    return allArticles.value;
  });

  // 处理关注
  const handleFollow = async () => {
    followLoading.value = true;
    try {
      await userControllerFollow({
        composable: '$fetch',
        path: {
          id: String(route.params.id)
        }
      });

      isFollowing.value = true;

      const { data } = await userControllerFollow({
        composable: '$fetch',
        path: {
          id: String(route.params.id)
        }
      });
      toast.add({
        title: t(data.message),
        color: 'primary'
      });
    } catch (error: any) {
    } finally {
      followLoading.value = false;
    }
  };

  // 处理取消关注
  const handleUnfollow = async () => {
    followLoading.value = true;
    try {
      await userControllerUnfollow({
        composable: '$fetch',
        path: {
          id: String(route.params.id)
        }
      });

      isFollowing.value = false;
    } catch (error: any) {
    } finally {
      followLoading.value = false;
    }
  };

  // 初始加载
  loadAuthorArticles();
  checkFollowStatus();

  // 监听窗口大小变化
  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  // 组件销毁时清理监听器
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  // 页面元数据
  useHead({
    title: () =>
      `${authorInfo.value?.nickname || authorInfo.value?.username} - ${t('author.title')}`,
    meta: [
      {
        name: 'description',
        content: authorInfo.value?.description
      },
      {
        name: 'robots',
        content: 'index, follow'
      }
    ]
  });

  // 定义页面元数据
  definePageMeta({
    layout: 'default'
  });
</script>
