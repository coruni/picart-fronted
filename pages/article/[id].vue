<template>
  <div class="max-w-7xl mx-auto px-4 py-4 md:py-8">
    <Title>{{ article?.data.title }}</Title>
    <Meta name="description" :content="(article?.data.summary as string) ?? article?.data.title" />
    <Meta name="author" :content="article?.data.author.nickname" />
    <Meta name="keywords" :content="article?.data.tags?.map(tag => tag.name).join(',')" />
    <Meta name="robots" content="index, follow" />
    <Meta name="og:title" :content="article?.data.title" />
    <Meta
      name="og:description"
      :content="(article?.data.summary as string) ?? article?.data.title"
    />
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
      @on-index-change="(oldIndex: number, newIndex: number) => (lightboxIndex = newIndex)"
    >
      <!-- 自定义左右导航按钮 -->
      <template #prev-btn="{ prev }">
        <UButton
          @click="prev"
          v-if="lightboxImages.length > 1"
          variant="link"
          class="backdrop-blur-sm hover:bg-white/80 bg-gray-700/80 cursor-pointer absolute h-8 w-8 rounded-full top-1/2 -translate-y-1/2 left-4 text-white flex items-center justify-center"
        >
          <Icon name="mynaui:chevron-left" />
        </UButton>
      </template>

      <template #next-btn="{ next }">
        <UButton
          @click="next"
          v-if="lightboxImages.length > 1"
          variant="link"
          class="backdrop-blur-sm hover:bg-white/80 bg-gray-700/80 cursor-pointer absolute h-8 w-8 rounded-full top-1/2 -translate-y-1/2 right-4 text-white flex items-center justify-center"
        >
          <Icon name="mynaui:chevron-right" />
        </UButton>
      </template>

      <!-- 自定义工具栏按钮 -->
      <template #toolbar="{ toolbarMethods }">
        <div
          class="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 flex items-center gap-2 bg-gray-700/80 backdrop-blur-sm rounded-full shadow-lg"
        >
          <!-- 放大按钮 -->
          <UButton
            variant="link"
            @click="toolbarMethods.zoomIn"
            class="hover:text-black p-2 w-8 h-8 text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
            title="放大"
          >
            <Icon name="mynaui:plus" class="w-5 h-5" />
          </UButton>

          <!-- 缩小按钮 -->
          <UButton
            variant="link"
            @click="toolbarMethods.zoomOut"
            class="hover:text-black p-2 w-8 h-8 text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
            title="缩小"
          >
            <Icon name="mynaui:minus" class="w-5 h-5" />
          </UButton>
          <!-- 指示器 -->
          <div class="flex items-center gap-2">
            <span class="text-white text-sm"
              >{{ lightboxIndex + 1 }}/{{ lightboxImages.length }}</span
            >
          </div>

          <!-- 逆时针旋转按钮 -->
          <UButton
            variant="link"
            @click="toolbarMethods.rotateLeft"
            class="hover:text-black p-2 w-8 h-8 text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
            title="逆时针旋转"
          >
            <Icon name="mynaui:undo" class="w-5 h-5" />
          </UButton>

          <!-- 顺时针旋转按钮 -->
          <UButton
            variant="link"
            @click="toolbarMethods.rotateRight"
            class="hover:text-black p-2 w-8 h-8 text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
            title="顺时针旋转"
          >
            <Icon name="mynaui:redo" class="w-5 h-5" />
          </UButton>

          <!-- 重置按钮 -->
        </div>
      </template>

      <!-- 自定义关闭按钮 -->
      <template #close-btn>
        <UButton
          variant="link"
          @click="lightboxVisible = false"
          class="font-bold backdrop-blur-sm hover:bg-white/80 bg-gray-700/80 cursor-pointer absolute h-8 w-8 rounded-full right-4 top-4 text-white flex items-center justify-center"
        >
          <Icon name="mynaui:x" size="24" />
        </UButton>
      </template>

      <!-- // 自定义加载 -->
      <template #loading>
        <div class="flex items-center justify-center py-20">
          <div class="flex items-center justify-center flex-col gap-8">
            <div
              class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
            ></div>
          </div>
        </div>
      </template>
    </VueEasyLightbox>
    <!-- 加载状态 -->
    <div v-if="isLoading" class="max-w-7xl mx-auto px-4 py-4 md:py-8">
      <div class="flex flex-col lg:flex-row gap-4 md:gap-8">
        <!-- 左侧主内容区骨架屏 -->
        <div class="flex-1">
          <!-- 文章标题区骨架屏 -->
          <div class="mb-4 md:mb-8">
            <USkeleton class="h-8 md:h-10 w-3/4 mb-3 md:mb-4" />
            <div
              class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4"
            >
              <div class="flex items-center">
                <USkeleton class="h-8 w-8 rounded-full mr-2" />
                <USkeleton class="h-4 w-24" />
              </div>
              <USkeleton class="h-4 w-32" />
              <div class="flex items-center">
                <USkeleton class="h-4 w-4 mr-1" />
                <USkeleton class="h-4 w-16" />
              </div>
            </div>
          </div>

          <!-- 图片展示区骨架屏 -->
          <div class="mb-4 md:mb-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
              <USkeleton class="sm:col-span-2 aspect-[16/9] rounded-md" />
              <USkeleton class="aspect-square rounded-md" />
              <USkeleton class="aspect-square rounded-md" />
            </div>
          </div>

          <!-- 文章内容骨架屏 -->
          <div class="mb-6 md:mb-12 space-y-4">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-5/6" />
            <USkeleton class="h-4 w-4/5" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-4 w-5/6" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-4/5" />
            <USkeleton class="h-4 w-3/4" />
          </div>

          <!-- 标签骨架屏 -->
          <div class="mb-6 md:mb-8">
            <USkeleton class="h-6 w-24 mb-3 md:mb-4" />
            <div class="flex flex-wrap gap-2 md:gap-3">
              <USkeleton class="h-8 w-16 rounded-full" />
              <USkeleton class="h-8 w-20 rounded-full" />
              <USkeleton class="h-8 w-14 rounded-full" />
              <USkeleton class="h-8 w-18 rounded-full" />
            </div>
          </div>

          <!-- 评论区骨架屏 -->
          <div class="mb-6 md:mb-8">
            <USkeleton class="h-6 w-24 mb-4 md:mb-6" />
            <!-- 评论输入框骨架屏 -->
            <div class="mb-6 md:mb-8">
              <div class="flex items-start space-x-3 md:space-x-4">
                <USkeleton class="w-8 h-8 md:w-10 md:h-10 rounded-full" />
                <div class="flex-1">
                  <USkeleton class="h-24 w-full rounded-md mb-2" />
                  <div class="flex justify-end">
                    <USkeleton class="h-8 w-20 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
            <!-- 评论列表骨架屏 -->
            <div class="space-y-6">
              <div v-for="i in 3" :key="i" class="flex space-x-3 md:space-x-4">
                <USkeleton class="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0" />
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <USkeleton class="h-4 w-20" />
                    <USkeleton class="h-4 w-16" />
                  </div>
                  <USkeleton class="h-4 w-full mb-2" />
                  <USkeleton class="h-4 w-3/4 mb-2" />
                  <USkeleton class="h-4 w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧边栏骨架屏 -->
        <div class="w-full lg:w-80 flex-shrink-0 mt-6 lg:mt-0">
          <div class="lg:sticky top-20">
            <!-- 作者信息骨架屏 -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
              <div class="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
                <USkeleton class="w-12 h-12 md:w-16 md:h-16 rounded-full" />
                <div class="flex-1">
                  <USkeleton class="h-4 w-24 mb-2" />
                  <USkeleton class="h-3 w-32" />
                </div>
              </div>
              <div class="flex items-center justify-between mb-4 md:mb-6">
                <div class="text-center">
                  <USkeleton class="h-4 w-8 mx-auto mb-1" />
                  <USkeleton class="h-3 w-12" />
                </div>
                <div class="text-center">
                  <USkeleton class="h-4 w-8 mx-auto mb-1" />
                  <USkeleton class="h-3 w-8" />
                </div>
                <div class="text-center">
                  <USkeleton class="h-4 w-8 mx-auto mb-1" />
                  <USkeleton class="h-3 w-16" />
                </div>
              </div>
              <USkeleton class="h-10 w-full rounded-md" />
            </div>

            <!-- 相关推荐骨架屏 -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
              <USkeleton class="h-6 w-32 mb-3 md:mb-4" />
              <div class="space-y-3 md:space-y-4">
                <div v-for="i in 3" :key="i" class="flex items-center space-x-3">
                  <USkeleton class="w-16 h-16 md:w-20 md:h-20 rounded-md flex-shrink-0" />
                  <div class="flex-1">
                    <USkeleton class="h-4 w-full mb-1" />
                    <USkeleton class="h-3 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="flex items-center justify-center py-20">
      <div class="text-center">
        <Icon name="mynaui:exclamation-triangle" class="text-red-500 text-4xl mb-4" />
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ $t('common.error.title') }}</p>
        <UButton
          @click="handleRetry"
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          {{ $t('common.retry') }}
        </UButton>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-else-if="article?.data" class="flex flex-col lg:flex-row gap-4 md:gap-8 relative">
      <!-- 文章顶部广告 -->
      <Advertisement type="article-top" />
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
            class="flex flex-col items-center space-y-2 group transition-all duration-200 cursor-pointer"
            :class="{ 'pointer-events-none': isLikeLoading }"
          >
            <div class="relative">
              <Icon
                :name="article.data.isLiked ? 'mynaui:heart-solid' : 'mynaui:heart'"
                class="text-2xl cursor-pointer transition-all duration-300 transform group-hover:scale-110"
                :class="[
                  article.data.isLiked ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500',
                  isLikeLoading ? 'animate-pulse' : ''
                ]"
              />
              <!-- 点赞动画效果 -->
              <div v-if="isLikeLoading" class="absolute inset-0 pointer-events-none">
                <Icon name="mynaui:heart-solid" class="text-2xl text-red-500 animate-ping" />
              </div>
            </div>
            <span
              class="text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors group-hover:text-red-500"
            >
              {{ article.data.likes }}
            </span>
          </button>
        </div>
      </div>

      <!-- 左侧主内容区 -->
      <div class="flex-1">
        <!-- 文章标题区 -->
        <div class="mb-4 md:mb-8">
          <h1
            class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4 break-words"
          >
            {{ article?.data.title }}
          </h1>
          <div
            class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs md:text-sm text-gray-600 dark:text-gray-400"
          >
            <NuxtLinkLocale :to="`/author/${article?.data.author.id}`" class="flex items-center">
              <div class="relative flex items-center justify-center mr-2">
                <UAvatar
                  :src="article?.data.author.avatar"
                  :alt="article?.data.author.nickname ?? article?.data.author.username"
                  class="w-8 h-8 rounded-full object-cover"
                  loading="lazy"
                  format="webp"
                  sizes="32px"
                  placeholder
                />
                <div
                  v-if="article?.data.author.isMember"
                  class="absolute -bottom-1 -right-1 bg-primary rounded-full flex items-center justify-center shadow-sm"
                >
                  <Icon name="mynaui:heart-waves" class="w-3 h-3 text-white" />
                </div>
              </div>

              <span>by {{ article?.data.author.nickname ?? article?.data.author.username }}</span>
            </NuxtLinkLocale>
            <div>{{ $t('article.publishAt') }} {{ formatDate(article?.data.createdAt) }}</div>
            <div class="flex items-center">
              <Icon name="mynaui:eye" class="mr-1" />
              <span>{{ article?.data.views }} {{ $t('article.views') }}</span>
            </div>

            <!-- 作者管理按钮 -->
            <div class="flex items-center space-x-2 flex-1">
              <div v-if="isAuthor || hasManagePermission" class="flex items-center space-x-2">
                <UButton
                  @click="handleEdit"
                  variant="ghost"
                  size="sm"
                  class="flex items-center cursor-pointer text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                >
                  <Icon name="mynaui:edit" class="w-4 h-4 mr-1" />
                  <span class="hidden sm:inline text-sm">{{ $t('article.edit') }}</span>
                </UButton>

                <UButton
                  @click="handleDelete"
                  variant="ghost"
                  color="error"
                  size="sm"
                  class="flex items-center cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  <Icon name="mynaui:trash" class="w-4 h-4 mr-1" />
                  <span class="hidden sm:inline text-sm">{{ $t('article.delete') }}</span>
                </UButton>
              </div>

              <div class="flex-1 flex justify-end items-center" v-if="shouldShowDownloads">
                <UButton
                  variant="ghost"
                  color="primary"
                  size="sm"
                  icon="mynaui:arrow-down"
                  class="cursor-pointer"
                  @click="scrollToDownloads"
                >
                  {{ $t('article.scrollToDownloads') }}
                </UButton>
              </div>
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
                'rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-all duration-300 bg-gray-100 dark:bg-gray-800 relative',
                // 动态宽高比：加载时使用4:3，加载完成后使用原始比例
                !imageLoaded[index] || imageErrors[index]
                  ? 'aspect-[4/3]'
                  : imageAspectRatios[index] || 'aspect-[4/3]',
                index === 0 && article?.data.images.length > 1
                  ? 'sm:col-span-2 sm:aspect-[16/9]'
                  : 'sm:aspect-square'
              ]"
              @click="openLightbox(index)"
            >
              <!-- 骨架屏占位 -->
              <div
                v-if="!imageLoaded[index] && !imageErrors[index]"
                class="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-800"
              >
                <!-- 波浪式加载动画 -->
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-gray-400/10 to-transparent animate-shimmer"
                ></div>

                <!-- 图片图标 -->
                <div class="flex items-center justify-center h-full">
                  <div class="text-center">
                    <Icon
                      name="mynaui:image"
                      class="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2 animate-pulse"
                    />
                    <div class="text-xs text-gray-400 dark:text-gray-500">
                      {{ $t('image.loading') }}
                    </div>
                  </div>
                </div>

                <!-- 加载进度条 -->
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                  <div class="h-full bg-primary animate-pulse w-full opacity-60"></div>
                </div>
              </div>

              <!-- 图片加载错误状态 -->
              <div
                v-else-if="imageErrors[index]"
                class="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              >
                <div class="text-center text-gray-400">
                  <Icon name="mynaui:exclamation-triangle" class="w-8 h-8 mx-auto mb-2" />
                  <div class="text-xs">{{ $t('image.loadFailed') }}</div>
                  <button
                    @click.stop="retryImageLoad(index)"
                    class="text-xs text-primary hover:text-primary-600 mt-1 flex items-center mx-auto"
                  >
                    <Icon name="mynaui:refresh" class="w-3 h-3 mr-1" />
                    {{ $t('image.retry') }}
                  </button>
                </div>
              </div>

              <!-- 实际图片 -->
              <NuxtImg
                :src="img"
                :alt="`${article?.data.title} - 图片 ${index + 1}`"
                class="w-full h-full object-cover transition-all duration-500"
                :class="{
                  'opacity-0': !imageLoaded[index] || imageErrors[index],
                  'opacity-100': imageLoaded[index] && !imageErrors[index]
                }"
                loading="lazy"
                format="webp"
                @load="onImageLoad(index)"
                @error="onImageError(index)"
              />

              <!-- 图片序号标识 -->
              <div
                v-if="article?.data.images.length > 1 && imageLoaded[index] && !imageErrors[index]"
                class="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center"
              >
                <Icon name="mynaui:image" class="w-3 h-3 mr-1" />
                {{ index + 1 }}/{{ article?.data.images.length }}
              </div>

              <!-- 放大镜图标提示 -->
              <div
                v-if="imageLoaded[index] && !imageErrors[index]"
                class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20"
              >
                <div
                  class="bg-white/90 flex items-center justify-center dark:bg-gray-800/90 rounded-full p-3"
                >
                  <Icon name="mynaui:search" class="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
              </div>
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
        <ClientOnly v-else-if="restrictionType" id="restriction">
          <ArticleContentRestriction
            :type="restrictionType"
            :price="article?.data.viewPrice"
            :article-title="article?.data.title"
            :author-id="article?.data.author.id"
            :article-id="article?.data.id"
            :refresh-article="refreshArticle"
          />
        </ClientOnly>

        <!-- 移动端点赞按钮 -->
        <div class="lg:hidden flex items-center justify-center mb-6 md:mb-8">
          <div class="flex items-center space-x-4">
            <button
              @click="handleLike"
              :disabled="isLikeLoading"
              class="flex items-center cursor-pointer space-x-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-6 py-3 group transition-all duration-200"
              :class="{ 'pointer-events-none': isLikeLoading }"
            >
              <div class="relative flex items-center justify-center">
                <Icon
                  :name="article.data.isLiked ? 'mynaui:heart-solid' : 'mynaui:heart'"
                  class="text-xl transition-all duration-300 transform group-hover:scale-110"
                  :class="[
                    article.data.isLiked
                      ? 'text-red-500'
                      : 'text-gray-400 group-hover:text-red-500',
                    isLikeLoading ? 'animate-pulse' : ''
                  ]"
                />
                <!-- 点赞动画效果 -->
                <div v-if="isLikeLoading" class="absolute inset-0 pointer-events-none">
                  <Icon name="mynaui:heart-solid" class="text-xl text-red-500 animate-ping" />
                </div>
              </div>
              <span
                class="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors group-hover:text-red-500"
              >
                {{ article.data.isLiked ? $t('article.liked') : $t('article.like') }} ({{
                  article?.data.likes
                }})
              </span>
            </button>
          </div>
        </div>

        <!-- 文章底部广告 -->
        <Advertisement type="article-bottom" />

        <!-- 下载链接展示区 -->
        <div
          v-if="article?.data.downloads && article.data.downloads.length > 0 && shouldShowContent"
          class="mb-6 md:mb-8"
          id="downloads"
        >
          <h3 class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
            {{ $t('article.downloads') }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(download, index) in article.data.downloads"
              :key="index"
              class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <Icon :name="getDownloadTypeIcon(download.type!)" class="w-5 h-5 text-primary" />
                  <span class="font-medium text-gray-900 dark:text-gray-100">
                    {{ getDownloadTypeName(download.type!) }}
                  </span>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400"> #{{ index + 1 }} </span>
              </div>

              <div class="space-y-2">
                <div v-if="download.password" class="flex items-center space-x-2">
                  <Icon name="mynaui:lock" class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ $t('article.downloadPassword') }}: {{ download.password }}
                  </span>
                </div>

                <div v-if="download.extractionCode" class="flex items-center space-x-2">
                  <Icon name="mynaui:key" class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ $t('article.extractionCode') }}: {{ download.extractionCode }}
                  </span>
                </div>
              </div>

              <div class="mt-3">
                <UButton
                  @click="handleDownloadClick(download.url ?? '')"
                  rel="noopener noreferrer"
                  variant="soft"
                  size="sm"
                  class="w-full"
                >
                  <Icon name="mynaui:download" class="w-4 h-4 mr-2" />
                  {{ $t('article.download') }}
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- 标签展示区 -->
        <div v-if="article?.data.tags && article.data.tags.length > 0" class="mb-6 md:mb-8">
          <h3 class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
            {{ $t('article.tags') }}
          </h3>
          <div class="flex flex-wrap gap-2 md:gap-3">
            <NuxtLinkLocale
              v-for="tag in article.data.tags"
              :key="tag.id"
              :to="`/search?q=${encodeURIComponent(tag.name)}`"
              class="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm md:text-base rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 cursor-pointer"
            >
              <UAvatar
                v-if="tag.avatar"
                :src="tag.avatar"
                :alt="tag.name"
                class="w-4 h-4 md:w-5 md:h-5 rounded-full mr-2 object-cover"
                loading="lazy"
                format="webp"
                sizes="20px"
              />
              <span class="font-medium">{{ tag.name }}</span>
            </NuxtLinkLocale>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="mb-6 md:mb-8 comments-section">
          <h3 class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
            {{ $t('article.comments') }}
          </h3>
          <!-- 评论输入框 -->
          <div class="mb-6 md:mb-8">
            <div class="flex items-start space-x-3 md:space-x-4">
              <UAvatar
                :src="userInfo?.avatar"
                :alt="userInfo?.nickname ?? userInfo?.username"
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
                      class="w-full p-3 md:p-4 rounded-md bg-gray-50 dark:bg-gray-700 border-none resize-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-200 text-sm md:text-base"
                      placeholder="分享你的想法..."
                    ></UTextarea>
                  </UFormField>

                  <div class="flex justify-end mt-2">
                    <UButton
                      type="submit"
                      class="cursor-pointer px-3 py-1.5 md:px-4 md:py-2 bg-primary text-white text-sm md:text-base rounded-md hover:bg-primary-600 whitespace-nowrap"
                      :loading="isCommentSubmitting"
                    >
                      {{ $t('article.comment') }}
                    </UButton>
                  </div>
                </UForm>
              </div>
            </div>
          </div>
          <!-- 评论列表 -->
          <div class="space-y-6">
            <CommentItem
              v-for="comment in comments"
              :key="comment.id"
              :comment="comment"
              :article-id="route.params.id"
              @comment-deleted="handleCommentDeleted"
              @reply-added="handleReplyAdded"
            />
            <div v-if="isLoadingComments" class="space-y-6 py-8">
              <CommentSkeleton v-for="i in 2" :key="i" />
            </div>
            <div v-if="hasMoreComments" class="flex justify-center py-8">
              <UButton
                @click="loadMoreComments"
                :loading="commentsPending"
                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
              >
                {{ $t('article.loadMoreComments') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧边栏 -->
      <div class="w-full lg:w-80 flex-shrink-0 mt-6 lg:mt-0">
        <!-- 作者信息 -->
        <div class="lg:sticky top-20">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
            <div class="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
              <NuxtLinkLocale :to="`/author/${article?.data.author.id}`" class="relative">
                <UAvatar
                  :src="article?.data.author.avatar"
                  :alt="article?.data.author.nickname ?? article?.data.author.username"
                  class="w-12 h-12 md:w-16 md:h-16 object-cover rounded-full ring-2 ring-white"
                  loading="lazy"
                  format="webp"
                  sizes="48px md:64px"
                />
                <div
                  v-if="article?.data.author.isMember"
                  class="absolute bottom-1 right-1 bg-primary rounded-full flex items-center justify-center shadow-sm"
                >
                  <Icon name="mynaui:heart-waves" class="w-3 h-3 text-white" />
                </div>
              </NuxtLinkLocale>
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
              :disabled="isFollowLoading"
              :loading="isFollowLoading"
              class="w-full py-2 md:py-2.5 cursor-pointer justify-center items-center flex bg-primary text-white text-sm md:text-base rounded-md hover:bg-primary-600 transition-colors whitespace-nowrap"
            >
              {{
                article?.data.author.isFollowed
                  ? $t('article.unfollow')
                  : $t('article.followAuthor')
              }}
            </UButton>
          </div>
          <!-- 相关推荐 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
            <h4
              class="font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4 flex items-center text-sm md:text-base"
            >
              <Icon name="mynaui:fire" class="text-orange-500 mr-2" />
              {{ $t('article.relatedArticles') }}
            </h4>
            <div class="space-y-3 md:space-y-4">
              <NuxtLinkLocale
                v-for="item in recommend?.data.data"
                :key="item.id"
                :to="`/article/${item.id}`"
                class="group cursor-pointer flex items-center space-x-3"
              >
                <div class="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-md overflow-hidden">
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
  import { useUserStore } from '~/stores/user';
  import { useToast } from '#imports';
  import {
    articleControllerFindOne,
    articleControllerFindRecommend,
    articleControllerLike,
    commentControllerCreate,
    userControllerFollow,
    commentControllerFindAll,
    articleControllerRemove,
    userControllerUnfollow
  } from '~/api';
  import type { CommentControllerFindAllResponse } from '~/api';
  import type { FormSubmitEvent } from '@nuxt/ui';
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();

  // 用户状态管理
  const userStore = useUserStore();
  const userInfo = computed(() => userStore.currentUser);
  const isLoggedIn = computed(() => userStore.isLoggedIn);
  const localePath = useLocalePath();
  // 判断当前用户是否是文章作者
  const isAuthor = computed(() => {
    if (!isLoggedIn.value || !article.value?.data) return false;
    return userStore.userInfo?.id === article.value.data.author.id;
  });

  // 检查用户是否有文章管理权限
  const hasManagePermission = computed(() => {
    const userRoles = userStore.currentUser?.roles || [];

    // 检查用户角色中是否有article:manage权限
    return userRoles.some(role =>
      role.permissions?.some(permission => permission.name === 'article:manage')
    );
  });

  // 内容访问控制
  const shouldShowContent = computed(() => {
    if (!article.value?.data) return false;

    const data = article.value.data;

    // 如果用户有文章管理权限，则不受任何限制
    if (hasManagePermission.value) {
      return true;
    }

    // 如果需要登录但用户未登录
    if (data.requireLogin && !isLoggedIn.value) {
      return false;
    }

    // 如果需要关注但用户未关注作者，且用户不是作者本人
    if (data.requireFollow && !data.author.isFollowed && !isAuthor.value) {
      return false;
    }

    // 如果需要会员但用户不是会员
    if (data.requireMembership && !isMembershipValid.value) {
      return false;
    }

    // 如果需要付费但用户未付费
    if (data.requirePayment && !data.isPaid) {
      return false;
    }

    return true;
  });

  const restrictionType = computed(() => {
    if (!article.value?.data) return null;

    const data = article.value.data;

    // 如果用户有文章管理权限，则不受任何限制
    if (hasManagePermission.value) {
      return null;
    }

    // 按优先级检查限制条件
    if (data.requireLogin && !isLoggedIn.value) {
      return 'login';
    }

    if (data.requireFollow && !data.author.isFollowed && !isAuthor.value) {
      return 'follow';
    }

    if (data.requireMembership && !isMembershipValid.value) {
      return 'membership';
    }

    if (data.requirePayment && !data.isPaid) {
      return 'payment';
    }

    return null;
  });

  // 检查会员状态
  const isMembershipValid = computed(() => {
    if (!isLoggedIn.value) return false;

    const userInfo = userStore.userInfo;
    if (!userInfo) return false;

    // 兜底计算
    const isMember =
      userInfo.membershipLevel > 0 &&
      userInfo.membershipStatus === 'ACTIVE' &&
      (new Date(userInfo.membershipEndDate) > new Date() || userInfo.membershipEndDate === null);

    return userInfo.isMember || isMember;
  });

  // 点赞相关状态
  const isLikeLoading = ref(false);
  const isFollowLoading = ref(false);

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
    refresh: refreshArticle,
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

  const schema = zod.object({
    commentText: zod.string().min(1, t('article.commentText'))
  });

  const state = reactive({
    commentText: ''
  });

  // 评论相关状态
  const isCommentSubmitting = ref(false);
  const comments = ref<
    (CommentControllerFindAllResponse['data']['data'][0] & {
      isLiked: boolean;
    })[]
  >([]);
  const commentsPage = ref(1);
  const hasMoreComments = ref(true);
  const isLoadingComments = ref(false);
  const toast = useToast();

  // 获取评论列表
  const {
    data: commentsData,
    pending: commentsPending,
    refresh: refreshComments
  } = commentControllerFindAll({
    composable: 'useFetch',
    key: `comments_${route.params.id}`,
    path: { id: Number(route.params.id) },
    query: {
      page: 1,
      limit: 20
    }
  });

  // 监听评论数据变化
  watch(
    commentsData,
    newData => {
      if (newData?.data?.data) {
        comments.value = newData.data.data.map(item => ({
          ...item,
          isLiked: false
        }));
        hasMoreComments.value = newData.data.meta.page < newData.data.meta.totalPages;
      }
    },
    { immediate: true }
  );

  const handleSubmit = async (payload: FormSubmitEvent<{ commentText: string }>) => {
    if (!isLoggedIn.value) {
      toast.add({
        title: t('article.loginRequired'),
        color: 'error'
      });
      return;
    }

    try {
      isCommentSubmitting.value = true;
      const text = payload.data.commentText;

      await commentControllerCreate({
        composable: 'useFetch',
        key: `comment_create_${Date.now()}`,
        body: {
          articleId: Number(article.value?.data.id),
          content: text
        }
      });

      // 清空输入框
      state.commentText = '';

      // 刷新评论列表
      await refreshComments();
    } catch (error) {
      console.error('发布评论失败:', error);
    } finally {
      isCommentSubmitting.value = false;
    }
  };

  // 处理评论删除
  const handleCommentDeleted = (commentId: number) => {
    comments.value = comments.value.filter(comment => comment.id !== commentId);
  };

  // 处理回复添加
  const handleReplyAdded = (newReply: any) => {
    // 找到对应的评论并更新回复数量
    const comment = comments.value.find(c => c.id === newReply.parentId);
    if (comment) {
      comment.replyCount = (comment.replyCount || 0) + 1;
    }
  };

  const handleFollow = async () => {
    if (isFollowLoading.value) return;

    isFollowLoading.value = true;
    try {
      // 根据当前关注状态决定调用哪个API
      if (article.value?.data.author.isFollowed) {
        // 如果已关注，则取消关注
        await userControllerUnfollow({
          composable: '$fetch',
          key: `unfollow_${article.value?.data.author.id}`,
          path: {
            id: String(article.value?.data.author.id)
          }
        });
      } else {
        // 如果未关注，则关注
        await userControllerFollow({
          composable: '$fetch',
          key: `follow_${article.value?.data.author.id}`,
          path: {
            id: String(article.value?.data.author.id)
          }
        });
      }

      // 刷新文章数据以更新关注状态
      await refreshArticle();
    } catch (error: any) {
      console.error('关注操作失败:', error);
      // 显示错误提示
      toast.add({
        title: error?.data?.message || t('article.followError'),
        color: 'error'
      });
    } finally {
      isFollowLoading.value = false;
    }
  };

  // 处理点赞
  const handleLike = async () => {
    if (isLikeLoading.value) return;

    try {
      isLikeLoading.value = true;

      await articleControllerLike({
        composable: '$fetch',
        path: {
          id: String(article.value?.data.id)
        },
        body: {
          reactionType: 'like'
        }
      });

      // 切换点赞状态
      if (article.value) {
        article.value.data.isLiked = !article.value.data.isLiked;
        article.value.data.likes += article.value.data.isLiked ? 1 : -1;
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
    } finally {
      isLikeLoading.value = false;
    }
  };

  // 加载更多评论
  const loadMoreComments = async () => {
    if (!hasMoreComments.value || commentsPending.value) return;

    isLoadingComments.value = true;
    try {
      const nextPage = commentsPage.value + 1;
      const response = await commentControllerFindAll({
        composable: 'useFetch',
        key: `comments_${route.params.id}_${nextPage}`,
        path: { id: Number(route.params.id) },
        query: {
          page: nextPage,
          limit: 20
        }
      });

      // 正确处理响应数据
      const responseData = response as any;
      if (responseData?.data?.data) {
        comments.value = [...comments.value, ...responseData.data.data];
        hasMoreComments.value = responseData.data.meta.page < responseData.data.meta.totalPages;
        commentsPage.value = nextPage;
      }
    } catch (error) {
      console.error('加载更多评论失败:', error);
    } finally {
      isLoadingComments.value = false;
    }
  };

  // 处理编辑文章
  const handleEdit = () => {
    if (!isAuthor.value && !hasManagePermission.value) return;

    // 跳转到编辑页面
    router.push(`/user/articles/${route.params.id}`);
  };

  // 处理删除文章
  const handleDelete = async () => {
    if (!isAuthor.value && !hasManagePermission.value) return;

    // 显示确认对话框
    const confirmed = confirm(t('article.deleteConfirm.message'));

    if (!confirmed) return;

    try {
      await articleControllerRemove({
        composable: '$fetch',
        path: { id: String(route.params.id) }
      });

      // 跳转到用户文章列表页面
      router.push(localePath('/user/articles'));
    } catch (error) {}
  };

  // 获取下载类型图标
  const getDownloadTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      baidu: 'mynaui:cloud',
      google: 'mynaui:cloud',
      lanzou: 'mynaui:cloud',
      quark: 'mynaui:cloud',
      dropbox: 'mynaui:cloud',
      direct: 'mynaui:download',
      other: 'mynaui:link',
      mega: 'mynaui:cloud',
      onedrive: 'mynaui:cloud',
      aliyun: 'mynaui:cloud'
    };
    return iconMap[type] || 'mynaui:link';
  };

  // 获取下载类型名称
  const getDownloadTypeName = (type: string) => {
    const nameMap: Record<string, string> = {
      baidu: t('form.downloads.type.baidu'),
      google: t('form.downloads.type.google'),
      lanzou: t('form.downloads.type.lanzou'),
      quark: t('form.downloads.type.quark'),
      dropbox: t('form.downloads.type.dropbox'),
      direct: t('form.downloads.type.direct'),
      other: t('form.downloads.type.other'),
      mega: t('form.downloads.type.mega'),
      onedrive: t('form.downloads.type.onedrive'),
      aliyun: t('form.downloads.type.aliyun')
    };
    return nameMap[type] || t('form.downloads.type.other');
  };

  // 图片加载状态管理
  const imageLoaded = ref(new Array(article.value?.data?.images?.length || 0).fill(false));
  const imageErrors = ref(new Array(article.value?.data?.images?.length || 0).fill(false));
  const imageAspectRatios = ref<string[]>([]);

  // 监听文章数据变化，初始化图片状态
  watch(
    () => article.value?.data?.images,
    newImages => {
      if (newImages) {
        const length = newImages.length;
        imageLoaded.value = new Array(length).fill(false);
        imageErrors.value = new Array(length).fill(false);
        imageAspectRatios.value = new Array(length).fill('aspect-[4/3]');
      }
    },
    { immediate: true }
  );

  const onImageLoad = (index: number) => {
    imageLoaded.value[index] = true;
    imageErrors.value[index] = false;

    // 计算图片的原始宽高比
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let aspectClass = 'aspect-[4/3]';

      // 根据宽高比设置合适的CSS类
      if (aspectRatio > 1.5) {
        aspectClass = 'aspect-[16/9]';
      } else if (aspectRatio > 1.2) {
        aspectClass = 'aspect-[4/3]';
      } else if (aspectRatio > 0.8) {
        aspectClass = 'aspect-square';
      } else {
        aspectClass = 'aspect-[3/4]';
      }

      imageAspectRatios.value[index] = aspectClass;
    };
    img.src = article.value?.data.images?.[index] || '';
  };

  const onImageError = (index: number) => {
    imageLoaded.value[index] = false;
    imageErrors.value[index] = true;
  };

  // 重试加载图片
  const retryImageLoad = (index: number) => {
    imageErrors.value[index] = false;
    imageLoaded.value[index] = false;

    // 强制刷新图片
    const img = new Image();
    img.onload = () => onImageLoad(index);
    img.onerror = () => onImageError(index);
    img.src = `${article.value?.data.images?.[index]}?t=${Date.now()}`;
  };

  const shouldShowDownloads = computed(() => {
    return (
      article.value?.data.downloads &&
      article.value.data.downloads.length > 0 &&
      shouldShowContent.value
    );
  });

  const scrollToDownloads = async () => {
    if (import.meta.client) {
      await nextTick();
      const downloadsElement = document.getElementById('downloads');
      if (downloadsElement) {
        console.log('downloadsElement');
        downloadsElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        const restrictionElement = document.getElementById('restriction');
        if (restrictionElement) {
          restrictionElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const handleDownloadClick = (url: string) => {
    if (import.meta.client) {
      window.open(url, '_blank');
    }
  };
</script>

<style scoped>
  :deep(.vel-modal) {
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  :deep(.vel-img) {
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  }

  /* 波浪式加载动画 */
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .animate-shimmer {
    animation: shimmer 1.5s infinite;
  }
</style>
