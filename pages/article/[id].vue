<template>
  <div class="max-w-7xl mx-auto px-4 py-4 md:py-8">
    <Title>{{ article?.data.title }}</Title>
    <Meta name="description" :content="article?.data.summary as string" />
    <Meta name="author" :content="article?.data.author.nickname" />
    <Meta name="keywords" :content="article?.data.tags?.map(tag => tag.name).join(',')" />
    <Meta name="robots" content="index, follow" />
    <Meta name="og:title" :content="article?.data.title" />
    <Meta name="og:description" :content="article?.data.summary as string" />
    <Meta name="og:type" content="article" />
    <Meta
      name="og:image"
      :content="(article?.data.cover as string) || (article?.data.images?.[0] as string)"
    />
    <Meta
      name="article:author"
      :content="article?.data.author.nickname ?? article?.data.author.username"
    />
    <VueEasyLightbox
      :visible="lightboxVisible"
      :imgs="lightboxImages"
      :index="lightboxIndex"
      @hide="lightboxVisible = false"
    />

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
        <Icon name="mynaui:exclamation-triangle" class="text-red-500 text-4xl mb-4" />
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ $t('common.error') }}</p>
        <UButton
          @click="handleRetry"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors !rounded-button"
        >
          {{ $t('common.retry') }}
        </UButton>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-else-if="article?.data" class="flex flex-col lg:flex-row gap-4 md:gap-8 relative">
      <!-- 点赞悬浮按钮 - 仅在PC端显示 -->
      <div
        ref="likeButtonContainer"
        class="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out z-40"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-3 backdrop-blur-sm"
        >
          <button
            @click="handleLike"
            :disabled="isLikeLoading"
            class="flex flex-col items-center space-y-2 group transition-all duration-200"
            :class="{ 'pointer-events-none': isLikeLoading }"
          >
            <div class="relative">
              <Icon
                :name="isLiked ? 'mynaui:heart-solid' : 'mynaui:heart'"
                class="text-2xl cursor-pointer transition-all duration-300 transform group-hover:scale-110"
                :class="[
                  isLiked ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500',
                  isLikeLoading ? 'animate-pulse' : ''
                ]"
              />
              <!-- 点赞动画效果 -->
              <div v-if="showLikeAnimation" class="absolute inset-0 pointer-events-none">
                <Icon name="mynaui:heart-solid" class="text-2xl text-red-500 animate-ping" />
              </div>
            </div>
            <span
              class="text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors group-hover:text-red-500"
            >
              {{ currentLikeCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- 左侧主内容区 -->
      <div class="flex-1">
        <!-- 文章标题区 -->
        <div class="mb-4 md:mb-8">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4">
            {{ article?.data.title }}
          </h1>
          <div
            class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs md:text-sm text-gray-600 dark:text-gray-400"
          >
            <div class="flex items-center">
              <NuxtImg
                :src="article?.data.author.avatar"
                alt="作者头像"
                class="w-8 h-8 rounded-full mr-2 object-cover"
                loading="lazy"
                format="webp"
                sizes="32px"
                placeholder
              />
              <span>by {{ article?.data.author.nickname ?? article?.data.author.username }}</span>
            </div>
            <div>{{ $t('article.publishAt') }} {{ article?.data.createdAt }}</div>
            <div class="flex items-center">
              <Icon name="mynaui:eye" class="mr-1" />
              <span>{{ article?.data.views }} {{ $t('article.views') }}</span>
            </div>
          </div>
        </div>
        <!-- 图片展示区 -->
        <div class="mb-4 md:mb-8" v-if="article?.data?.images && article?.data?.images.length > 0">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
            <div
              v-for="(img, index) in article?.data.images"
              :key="index"
              :class="[
                'rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity',
                index === 0 && article?.data.images.length > 1
                  ? 'sm:col-span-2 aspect-[16/9]'
                  : 'aspect-square'
              ]"
              @click="openLightbox(index)"
            >
              <NuxtImg
                :src="img"
                :alt="'图片' + (index + 1)"
                class="w-full h-full object-cover"
                loading="lazy"
                format="webp"
              />
            </div>
          </div>
        </div>
        <!-- 文章内容 -->
        <div v-if="shouldShowContent" class="mb-6 md:mb-12">
          <div
            class="prose max-w-none whitespace-pre-wrap text-sm md:text-base dark:prose-invert"
            v-html="article?.data.content"
          ></div>
        </div>

        <!-- 内容限制组件 -->
        <ArticleContentRestriction
          v-else-if="restrictionType"
          :type="restrictionType"
          :price="article?.data.viewPrice"
        />

        <!-- 移动端点赞按钮 -->
        <div class="lg:hidden flex items-center justify-center mb-6 md:mb-8">
          <button
            @click="handleLike"
            :disabled="isLikeLoading"
            class="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-6 py-3 group transition-all duration-200"
            :class="{ 'pointer-events-none': isLikeLoading }"
          >
            <div class="relative">
              <Icon
                :name="isLiked ? 'mynaui:heart-solid' : 'mynaui:heart'"
                class="text-xl transition-all duration-300 transform group-hover:scale-110"
                :class="[
                  isLiked ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500',
                  isLikeLoading ? 'animate-pulse' : ''
                ]"
              />
              <!-- 点赞动画效果 -->
              <div v-if="showLikeAnimation" class="absolute inset-0 pointer-events-none">
                <Icon name="mynaui:heart-solid" class="text-xl text-red-500 animate-ping" />
              </div>
            </div>
            <span
              class="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors group-hover:text-red-500"
            >
              {{ isLiked ? $t('article.liked') : $t('article.like') }} ({{ currentLikeCount }})
            </span>
          </button>
        </div>

        <!-- 评论区 -->
        <div class="mb-6 md:mb-8 comments-section">
          <h3 class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
            {{ $t('article.comments') }}
          </h3>
          <!-- 评论输入框 -->
          <div class="mb-6 md:mb-8">
            <div class="flex items-start space-x-3 md:space-x-4">
              <NuxtImg
                :src="article?.data.author.avatar"
                alt="当前用户头像"
                class="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                loading="lazy"
                format="webp"
                sizes="40px md:40px"
              />
              <div class="flex-1">
                <UForm :schema="schema" :state="state" @submit="handleSubmit">
                  <UFormField name="commentText">
                    <UTextarea
                      v-model="state.commentText"
                      class="w-full p-3 md:p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border-none resize-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-200 text-sm md:text-base"
                      placeholder="分享你的想法..."
                    ></UTextarea>
                  </UFormField>

                  <div class="flex justify-end mt-2">
                    <UButton
                      type="submit"
                      class="cursor-pointer px-3 py-1.5 md:px-4 md:py-2 bg-primary text-white text-sm md:text-base rounded-lg hover:bg-primary-600 !rounded-button whitespace-nowrap"
                    >
                      {{ $t('article.comment') }}
                    </UButton>
                  </div>
                </UForm>
              </div>
            </div>
          </div>
          <!-- 评论列表 -->
          <!-- <div class="space-y-6">
            <div v-for="comment in comments" :key="comment.id" class="flex space-x-4">
              <NuxtImg
                :src="comment.avatar"
                :alt="comment.author"
                class="w-10 h-10 rounded-full"
                loading="lazy"
                format="webp"
                sizes="40px"
                @error="handleImageError($event as Event, 'avatar')"
              />
              <div class="flex-1">
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-gray-900 dark:text-gray-100">{{
                      comment.author
                    }}</span>
                    <span class="text-sm text-gray-500">{{ comment.time }}</span>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300">{{ comment.content }}</p>
                </div>
                <div class="flex items-center space-x-4 mt-2 ml-2">
                  <button
                    class="text-gray-500 hover:text-primary-500 text-sm flex items-center !rounded-button whitespace-nowrap"
                  >
                    <i class="far fa-heart mr-1"></i>
                    <span>{{ comment.likes }}</span>
                  </button>
                  <button
                    class="text-gray-500 hover:text-primary-500 text-sm !rounded-button whitespace-nowrap"
                  >
                    {{ $t('article.reply') }}
                  </button>
                </div>
              </div>
            </div>
          </div> -->
        </div>
      </div>
      <!-- 右侧边栏 -->
      <div class="w-full lg:w-80 flex-shrink-0 mt-6 lg:mt-0">
        <!-- 作者信息 -->
        <div class="lg:sticky top-20">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
            <div class="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
              <div class="relative">
                <NuxtImg
                  :src="article?.data.author.avatar"
                  alt="作者头像"
                  class="w-12 h-12 md:w-16 md:h-16 object-cover rounded-full ring-2 ring-white"
                  loading="lazy"
                  format="webp"
                  sizes="48px md:64px"
                />
                <div
                  class="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-2 border-white"
                ></div>
              </div>
              <div>
                <h4 class="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base">
                  {{ article?.data.author.nickname ?? article?.data.author.username }}
                </h4>
                <p class="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {{ article?.data.author.description }}
                </p>
              </div>
            </div>
            <div class="flex items-center justify-between mb-4 md:mb-6 text-xs md:text-sm">
              <div class="text-center">
                <div class="font-semibold text-gray-900 dark:text-gray-100">
                  {{ article?.data.author.followerCount }}
                </div>
                <div class="text-gray-500 dark:text-gray-400">{{ $t('article.followers') }}</div>
              </div>
              <div class="text-center">
                <div class="font-semibold text-gray-900 dark:text-gray-100">
                  {{ article?.data.likes }}
                </div>
                <div class="text-gray-500 dark:text-gray-400">{{ $t('article.likes') }}</div>
              </div>
              <div class="text-center">
                <div class="font-semibold text-gray-900 dark:text-gray-100">96%</div>
                <div class="text-gray-500 dark:text-gray-400">{{ $t('article.goodReviews') }}</div>
              </div>
            </div>
            <UButton
              @click="handleFollow"
              class="w-full py-2 md:py-2.5 cursor-pointer justify-center items-center flex bg-primary text-white text-sm md:text-base rounded-lg hover:bg-primary-600 transition-colors !rounded-button whitespace-nowrap"
            >
              {{ $t('article.followAuthor') }}
            </UButton>
          </div>
          <!-- 相关推荐 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
            <h4
              class="font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4 flex items-center text-sm md:text-base"
            >
              <i class="fas fa-fire text-orange-500 mr-2"></i>
              {{ $t('article.relatedArticles') }}
            </h4>
            <div class="space-y-3 md:space-y-4">
              <NuxtLinkLocale
                v-for="item in recommend?.data.data"
                :key="item.id"
                :to="`/article/${item.id}`"
                class="group cursor-pointer flex items-center space-x-3"
              >
                <div class="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <NuxtImg
                    :src="item.cover"
                    :alt="item.title"
                    class="w-full h-full object-cover transform transition-transform group-hover:scale-105"
                    loading="lazy"
                    format="webp"
                    sizes="64px md:80px"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h5
                    class="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-500 transition-colors line-clamp-2 mb-1"
                  >
                    {{ item.title }}
                  </h5>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ item.views }} {{ $t('article.views') }}
                  </p>
                </div>
              </NuxtLinkLocale>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import zod from 'zod';
  import {
    articleControllerFindOne,
    articleControllerFindRecommend,
    userControllerFollow
  } from '~/api';
  import type { ArticleControllerFindOneResponse } from '~/api';
  type Article = ArticleControllerFindOneResponse['data'];
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();

  // 用户状态管理
  const userStore = useUserStore();
  const isLoggedIn = computed(() => userStore.isAuthenticated);

  // 内容访问控制
  const shouldShowContent = computed(() => {
    if (!article.value?.data) return false;

    const data = article.value.data;

    // 如果需要登录但用户未登录
    if (data.requireLogin && !isLoggedIn.value) {
      return false;
    }

    // 如果需要关注但用户未关注作者
    if (data.requireFollow && !isFollowingAuthor.value) {
      return false;
    }

    // 如果需要付费但用户未付费
    if (data.requirePayment && !hasPaid.value) {
      return false;
    }

    return true;
  });

  const restrictionType = computed(() => {
    if (!article.value?.data) return null;

    const data = article.value.data;

    // 按优先级检查限制条件
    if (data.requireLogin && !isLoggedIn.value) {
      return 'login';
    }

    if (data.requireFollow && !isFollowingAuthor.value) {
      return 'follow';
    }

    if (data.requirePayment && !hasPaid.value) {
      return 'payment';
    }

    return null;
  });

  // 关注状态
  const isFollowingAuthor = ref(false);

  // 付费状态
  const hasPaid = ref(false);

  // 点赞相关状态
  const isLiked = ref(false);
  const isLikeLoading = ref(false);
  const showLikeAnimation = ref(false);
  const currentLikeCount = ref(0);
  const likeButtonContainer = ref(null);

  // lightbox相关状态
  const lightboxVisible = ref(false);
  const lightboxIndex = ref(0);
  const lightboxImages = computed(() => article.value?.data?.images || []);

  // 打开lightbox
  const openLightbox = (index: number) => {
    if (lightboxImages.value.length > 0) {
      lightboxIndex.value = index;
      lightboxVisible.value = true;
    }
  };
  const {
    data: article,
    pending: articlePending,
    error: articleError
  } = articleControllerFindOne({
    composable: 'useAsyncData',
    key: `article_${route.params.id}`,
    path: {
      id: String(route.params.id)
    }
  });

  const {
    data: recommend,
    pending: recommendPending,
    error: recommendError
  } = articleControllerFindRecommend({
    key: `recommend_${route.params.id}`,
    composable: 'useFetch',
    path: {
      id: String(route.params.id)
    }
  });

  const isLoading = computed(() => articlePending.value || recommendPending.value);
  const hasError = computed(() => articleError.value || recommendError.value);
  const handleRetry = () => {
    location.reload();
  };
  // 图片错误处理

  const schema = zod.object({
    commentText: zod.string().min(1, t('article.commentText'))
  });

  const state = reactive({
    commentText: ''
  });

  const handleSubmit = (payload: SubmitEvent) => {
    console.log(payload);
  };

  const handleFollow = async () => {
    try {
      await userControllerFollow({
        composable: '$fetch',
        key: `follow_${article.value?.data.author.id}`,
        path: {
          id: String(article.value?.data.author.id)
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  // 处理点赞
  const handleLike = async () => {
    if (isLikeLoading.value) return;

    try {
      isLikeLoading.value = true;

      // TODO: 调用点赞/取消点赞 API
      // const result = await articleControllerLike({ ... })

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      // 切换点赞状态
      isLiked.value = !isLiked.value;
      currentLikeCount.value += isLiked.value ? 1 : -1;

      // 显示点赞动画
      if (isLiked.value) {
        showLikeAnimation.value = true;
        setTimeout(() => {
          showLikeAnimation.value = false;
        }, 600);
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
    } finally {
      isLikeLoading.value = false;
    }
  };

  // 初始化点赞数据
  const initializeLikeData = () => {
    if (article.value?.data) {
      currentLikeCount.value = article.value.data.likes || 0;
      // TODO: 检查当前用户是否已点赞
      // isLiked.value = checkUserLikedStatus();
    }
  };

  // 监听文章数据变化
  watch(
    article,
    () => {
      initializeLikeData();
    },
    { immediate: true }
  );
</script>
