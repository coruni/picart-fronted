<template>
  <div class="min-h-[calc(100vh-3.5rem)]">
    <Title>{{ tagData?.data?.name }}</Title>
    <Meta name="description" :content="tagData?.data?.description" />
    <Meta name="keywords" :content="tagData?.data?.name" />
    <Meta name="robots" content="index, follow" />
    <Meta name="og:title" :content="tagData?.data?.name" />
    <Meta name="og:description" :content="tagData?.data?.description" />
    <Meta name="og:type" content="website" />
    <Meta name="og:image" :content="tagData?.data?.cover" />
    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="flex items-center justify-center flex-col gap-4">
        <div
          class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
        ></div>
        <p class="text-gray-600 dark:text-gray-400">{{ $t('common.loading.loading') }}</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen">
      <div class="text-red-500 mb-4">
        <Icon name="mynaui:exclamation-triangle" class="w-12 h-12" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('tag.notFound') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        {{ error }}
      </p>
      <UButton to="/tags" color="primary">
        {{ $t('tag.backToTags') }}
      </UButton>
    </div>

    <!-- 标签详情内容 -->
    <div v-else-if="tagData?.data">
      <!-- 标签头部 -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <!-- 背景图片 -->
        <div
          v-if="tagData?.data?.background"
          class="h-48 bg-cover bg-center relative"
          :style="{ backgroundImage: `url(${tagData?.data?.background})` }"
        >
          <div class="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>

        <!-- 标签信息 -->
        <div class="p-6">
          <div class="flex items-start space-x-4">
            <!-- 标签头像 -->
            <div class="flex-shrink-0">
              <UAvatar
                v-if="tagData?.data?.avatar"
                :src="tagData?.data?.avatar"
                :alt="tagData?.data?.name"
                size="3xl"
                class="border-4 border-white dark:border-gray-800 shadow-lg"
              />
              <div v-else>
                <span class="text-white font-bold text-2xl">
                  {{ tagData?.data?.name.charAt(0).toUpperCase() }}
                </span>
              </div>
            </div>

            <!-- 标签详情 -->
            <div class="flex-1 min-w-0">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{ tagData?.data?.name }}
              </h1>
              <p
                v-if="tagData?.data?.description"
                class="text-lg text-gray-600 dark:text-gray-300 mb-4"
              >
                {{ tagData?.data?.description }}
              </p>

              <!-- 统计信息 -->
              <div
                class="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400"
              >
                <div class="flex items-center gap-1">
                  <Icon name="mynaui:file-text" class="w-5 h-5" />
                  <span class="font-medium">{{ tagData?.data?.articleCount || 0 }}</span>
                  <span>{{ $t('tag.articles') }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <Icon name="mynaui:heart" class="w-5 h-5" />
                  <span class="font-medium">{{ tagData?.data?.followCount || 0 }}</span>
                  <span>{{ $t('tag.followers') }}</span>
                </div>
                <div v-if="tagData?.data?.createdAt" class="flex items-center gap-1">
                  <Icon name="mynaui:clock" class="w-5 h-5" />
                  <span>{{ $t('tag.createdAt') }}: {{ formatDate(tagData?.data?.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex-shrink-0">
              <UButton
                v-if="!isFollowing"
                @click="followTag"
                :loading="followLoading"
                color="primary"
                icon="mynaui:heart"
              >
                {{ $t('tag.follow') }}
              </UButton>
              <UButton
                v-else
                @click="unfollowTag"
                :loading="followLoading"
                variant="outline"
                color="primary"
                icon="mynaui:heart"
              >
                {{ $t('tag.following') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- 文章列表部分 -->
      <div class="mt-8">
        <!-- 筛选和排序 -->
        <div
          class="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-4 mb-8"
        >
          <UTabs
            :items="tabs"
            :default-value="0"
            v-model="currentTab"
            class="w-auto"
            variant="pill"
            :ui="{ trigger: 'cursor-pointer' }"
          >
          </UTabs>
          <div class="flex items-center space-x-2">
            <button
              @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
              class="p-2 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Icon :name="viewMode === 'grid' ? 'mynaui:grid' : 'mynaui:list'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- 文章列表 -->
        <div
          v-if="articlesLoading && displayArticles.length === 0"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 py-12 px-4"
        >
          <ArticleSkeleton v-for="i in 8" :key="i" />
        </div>

        <div
          v-else-if="!articlesLoading && displayArticles.length === 0"
          class="text-center py-12 px-4"
        >
          <Icon name="mynaui:file-search" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">暂无文章</h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            该标签下还没有文章，请稍后再来查看。
          </p>
        </div>

        <!-- 网格视图 -->
        <div v-else-if="viewMode === 'grid'">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            <TransitionGroup name="list" tag="div" class="contents">
              <div
                v-for="item in displayArticles"
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
              v-for="item in displayArticles"
              :key="item.id"
              :to="`/article/${item.id}`"
              class="block bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow overflow-hidden"
            >
              <div class="flex flex-col md:flex-row gap-4">
                <div class="w-full md:w-1/3 flex-shrink-0">
                  <NuxtImg
                    :src="item.cover || item.images[0]"
                    :alt="item.title"
                    class="w-full h-48 md:h-32 object-cover rounded-md"
                    loading="lazy"
                    format="webp"
                  />
                </div>
                <div class="w-full md:w-2/3 flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {{ item.title }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {{ item.description }}
                  </p>
                  <div
                    class="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 dark:text-gray-400 gap-2 sm:gap-0"
                  >
                    <div
                      class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-1 sm:gap-0"
                    >
                      <span class="truncate">{{ item.author.nickname }}</span>
                      <span class="truncate">{{ formatDate(item.createdAt) }}</span>
                    </div>
                    <div class="flex items-center space-x-2 flex-shrink-0">
                      <Icon name="mynaui:eye" class="w-4 h-4" />
                      <span>{{ item.views }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </NuxtLinkLocale>
          </TransitionGroup>
        </div>

        <!-- 加载指示器 -->
        <div v-if="articlesLoading && displayArticles.length > 0" class="flex justify-center py-8">
          <div
            class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
          ></div>
        </div>

        <!-- 没有更多数据提示 -->
        <div
          v-if="!hasMore && displayArticles.length > 0"
          class="text-center py-4 px-4 text-gray-500"
        >
          {{ $t('common.loading.noMore') }}
        </div>

        <!-- Intersection Observer 观察器元素 -->
        <div ref="observerTarget" class="h-1"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
  import {
    tagControllerFindOne,
    tagControllerFollow,
    tagControllerUnfollow,
    articleControllerFindAll
  } from '~/api/sdk.gen';
  import type { Tag } from '~/types/tag.d';

  // 获取路由参数
  const route = useRoute();
  const tagId = computed(() => route.params.id as string);

  // 响应式数据
  const isFollowing = ref(false);
  const followLoading = ref(false);

  // 文章相关数据
  const articles = ref<any[]>([]);
  const articlesLoading = ref(false);
  const hasMore = ref(true);
  const pagination = ref({
    page: 1,
    limit: 12
  });
  const currentTab = ref('latest');
  const viewMode = ref<'grid' | 'list'>('grid');
  const observerTarget = ref<HTMLDivElement | null>(null);
  let observer: IntersectionObserver | null = null;

  // SSR 数据预取
  const {
    data: tagData,
    pending: tagPending,
    error: tagError
  } = await tagControllerFindOne({
    composable: 'useFetch',
    key: `tag-${tagId.value}`,
    path: {
      id: tagId.value
    }
  });

  // SSR 文章数据预取
  const { data: initialArticlesData } = await articleControllerFindAll({
    composable: 'useFetch',
    key: `tag-articles-ssr-${tagId.value}`,
    query: {
      page: 1,
      limit: pagination.value.limit,
      title: tagData.value?.data?.name,
      type: currentTab.value as 'latest' | 'popular'
    }
  });

  // 初始化数据
  const loading = computed(() => tagPending.value);
  const error = computed(() => {
    if (tagError.value) {
      return typeof tagError.value === 'string' ? tagError.value : '获取标签失败';
    }
    return '';
  });

  // 初始化文章数据 - 客户端过滤包含该标签的文章
  if (initialArticlesData.value?.data?.data) {
    const allArticles = initialArticlesData.value.data.data;
    const filteredArticles = allArticles.filter(
      article => article.tags && article.tags.some(tag => tag.id === Number(tagId.value))
    );
    articles.value = filteredArticles;
    hasMore.value = allArticles.length === pagination.value.limit;
    if (hasMore.value) {
      pagination.value.page = 2;
    }
  }

  const followTag = async () => {
    if (!tagData.value?.data) return;

    try {
      followLoading.value = true;

      await tagControllerFollow({
        composable: '$fetch',
        path: {
          id: tagId.value
        }
      });

      isFollowing.value = true;
      if (tagData.value?.data) {
        tagData.value.data.followCount = (tagData.value.data.followCount || 0) + 1;
      }
    } catch (err: any) {
      console.error('关注标签失败:', err);
    } finally {
      followLoading.value = false;
    }
  };

  const unfollowTag = async () => {
    if (!tagData.value?.data) return;

    try {
      followLoading.value = true;

      await tagControllerUnfollow({
        composable: '$fetch',
        path: {
          id: tagId.value
        }
      });

      isFollowing.value = false;
      if (tagData.value?.data) {
        tagData.value.data.followCount = Math.max(0, (tagData.value.data.followCount || 0) - 1);
      }
    } catch (err: any) {
      console.error('取消关注标签失败:', err);
    } finally {
      followLoading.value = false;
    }
  };

  // 文章相关函数
  const resetArticlesData = () => {
    pagination.value.page = 1;
    articles.value = [];
    hasMore.value = true;
    articlesLoading.value = false;
  };

  const loadArticles = async () => {
    if (articlesLoading.value || !hasMore.value) return;

    // 如果是第一页且已经有数据（SSR数据），跳过请求
    if (pagination.value.page === 1 && articles.value.length > 0) {
      return;
    }

    articlesLoading.value = true;

    try {
      const response = await articleControllerFindAll({
        composable: 'useFetch',
        key: `tag-articles-${tagId.value}-${currentTab.value}-${pagination.value.page}`,
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          title: tagData.value?.data?.name,
          type: currentTab.value as 'latest' | 'popular'
        }
      });

      const allNewData = response.data.value?.data?.data || [];
      // 客户端过滤包含该标签的文章
      const newData = allNewData.filter(
        article => article.tags && article.tags.some(tag => tag.id === Number(tagId.value))
      );

      if (pagination.value.page === 1) {
        articles.value = newData;
      } else {
        articles.value = [...articles.value, ...newData];
      }

      // 检查是否还有更多数据 - 基于原始数据长度判断
      hasMore.value = allNewData.length === pagination.value.limit;

      // 更新页码
      if (hasMore.value) {
        pagination.value.page++;
      }

      // 重新初始化 observer
      if (hasMore.value && observerTarget.value) {
        nextTick(() => {
          if (observer) {
            observer.disconnect();
          }
          if (observerTarget.value) {
            observer = new IntersectionObserver(
              entries => {
                const target = entries[0];
                if (target?.isIntersecting && !articlesLoading.value && hasMore.value) {
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
      }
    } catch (err: any) {
      console.error('加载文章失败:', err);
    } finally {
      articlesLoading.value = false;
    }
  };

  // 计算显示的文章
  const displayArticles = computed(() => articles.value);

  // 排序选项
  const tabs = [
    { label: '最新', value: 'latest' },
    { label: '热门', value: 'popular' }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 监听器
  watch(currentTab, async () => {
    resetArticlesData();
    await loadArticles();
  });

  // 初始加载（仅在客户端且没有SSR数据时）
  onMounted(() => {
    if (articles.value.length === 0) {
      loadArticles();
    }

    // 初始化 Intersection Observer
    nextTick(() => {
      if (observerTarget.value) {
        observer = new IntersectionObserver(
          entries => {
            const target = entries[0];
            if (target?.isIntersecting && !articlesLoading.value && hasMore.value) {
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
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });
</script>
