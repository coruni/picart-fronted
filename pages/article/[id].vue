<template>
  <div class="max-w-7xl mx-auto px-4 py-4 md:py-8">
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
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors !rounded-button"
        >
          {{ $t('common.retry') }}
        </UButton>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-else-if="article?.data" class="flex flex-col lg:flex-row gap-4 md:gap-8">
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
                @error="handleImageError($event as Event, 'avatar')"
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
                @error="handleImageError($event as Event, 'thumbnail')"
              />
            </div>
          </div>
        </div>
        <!-- 文章内容 -->
        <div
          class="prose max-w-none mb-6 md:mb-12 whitespace-pre-wrap text-sm md:text-base dark:prose-invert"
          v-html="article?.data.content"
        ></div>

        <!-- 评论区 -->
        <div class="mb-6 md:mb-8">
          <h3 class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
            {{ $t('article.comments') }}
          </h3>
          <!-- 评论输入框 -->
          <div class="mb-6 md:mb-8">
            <div class="flex items-start space-x-3 md:space-x-4">
              <NuxtImg
                :src="article?.data.author.avatar"
                alt="当前用户头像"
                class="w-8 h-8 md:w-10 md:h-10 rounded-full"
                loading="lazy"
                format="webp"
                sizes="40px md:40px"
                @error="handleImageError($event as Event, 'avatar')"
              />
              <div class="flex-1">
                <textarea
                  v-model="commentText"
                  rows="2"
                  class="w-full p-3 md:p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border-none resize-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-200 text-sm md:text-base"
                  placeholder="分享你的想法..."
                ></textarea>
                <div class="flex justify-end mt-2">
                  <button
                    class="px-3 py-1.5 md:px-4 md:py-2 bg-primary text-white text-sm md:text-base rounded-lg hover:bg-indigo-600 !rounded-button whitespace-nowrap"
                  >
                    {{ $t('article.comment') }}
                  </button>
                </div>
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
                    class="text-gray-500 hover:text-indigo-500 text-sm flex items-center !rounded-button whitespace-nowrap"
                  >
                    <i class="far fa-heart mr-1"></i>
                    <span>{{ comment.likes }}</span>
                  </button>
                  <button
                    class="text-gray-500 hover:text-indigo-500 text-sm !rounded-button whitespace-nowrap"
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
            <button
              class="w-full py-2 md:py-2.5 cursor-pointer bg-primary text-white text-sm md:text-base rounded-lg hover:bg-indigo-600 transition-colors !rounded-button whitespace-nowrap"
            >
              {{ $t('article.followAuthor') }}
            </button>
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
                    @error="handleImageError($event as Event, 'thumbnail')"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h5
                    class="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-500 transition-colors line-clamp-2 mb-1"
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
  import { articleControllerFindOne, articleControllerFindRecommend } from '~~/api';
  const route = useRoute();
  const router = useRouter();
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
    composable: 'useFetch',
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
  const { handleImageError } = useImageError();
  useHead({
    title: () => article.value?.data.title || '文章详情',
    meta: [
      {
        name: 'description',
        content: () => String(article.value?.data.summary) || ''
      },
      {
        name: 'keywords',
        content: () => article.value?.data.tags?.map(tag => tag.name).join(',') || ''
      },
      {
        name: 'author',
        content: () => article.value?.data.author.nickname || ''
      }
    ]
  });

  const commentText = ref('');
</script>
