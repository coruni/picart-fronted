<template>
  <div>
    <!-- 自定义灯箱组件 -->
    <CustomLightbox
      v-model:visible="lightboxVisible"
      :images="lightboxImages"
      :index="lightboxIndex"
      @close="handleLightboxClose"
      @change="handleLightboxChange"
    />
    <ScrollToTop />
    <article>
      <!-- 加载状态 -->
      <div v-if="isLoading">
        <div class="flex flex-col lg:flex-row gap-3 md:gap-8">
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
              <div class="grid grid-cols-1 md:lg:grid-cols-6 gap-3">
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
          <div class="w-full lg:w-80 flex-shrink-0">
            <div class="lg:sticky top-4">
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
          <Icon name="mynaui:warning" class="text-red-500 text-4xl mb-4" />
          <p class="text-gray-600 dark:text-gray-400 mb-4">{{ $t('common.error.title') }}</p>
          <UButton
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
            @click="handleRetry"
          >
            {{ $t('common.retry') }}
          </UButton>
        </div>
      </div>

      <!-- 内容区域 -->
      <div v-else-if="article?.data" class="flex flex-col lg:flex-row gap-3 md:gap-8 relative">
        <!-- 文章内容容器 -->
        <div class="flex flex-col lg:flex-row gap-4 md:gap-8 w-full">
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
                :disabled="isLikeLoading"
                class="flex flex-col items-center space-y-2 group transition-all duration-200 cursor-pointer"
                :class="{ 'pointer-events-none': isLikeLoading }"
                @click="handleLike"
              >
                <div class="relative">
                  <Icon
                    :name="article.data.isLiked ? 'mynaui:heart-solid' : 'mynaui:heart'"
                    class="text-2xl cursor-pointer transition-all duration-300 transform group-hover:scale-110"
                    :class="[
                      article.data.isLiked
                        ? 'text-red-500'
                        : 'text-gray-400 group-hover:text-red-500',
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
          <main class="flex-1">
            <!-- 文章标题区 -->
            <header class="mb-4 md:mb-8">
              <h1
                class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 md:mb-4 break-words"
              >
                {{ article?.data.title }}
              </h1>
              <div
                class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs md:text-sm text-gray-600 dark:text-gray-400"
              >
                <NuxtLinkLocale
                  :to="`/author/${article?.data.author.id}`"
                  class="flex items-center"
                >
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

                  <span
                    >by {{ article?.data.author.nickname ?? article?.data.author.username }}</span
                  >
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
                      variant="ghost"
                      size="sm"
                      class="flex items-center cursor-pointer text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                      @click="handleEdit"
                    >
                      <Icon name="mynaui:edit" class="w-4 h-4 mr-1" />
                      <span class="hidden sm:inline text-sm">{{ $t('article.edit') }}</span>
                    </UButton>

                    <UButton
                      variant="ghost"
                      color="error"
                      size="sm"
                      class="flex items-center cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                      @click="handleDelete"
                    >
                      <Icon name="mynaui:trash" class="w-4 h-4 mr-1" />
                      <span class="hidden sm:inline text-sm">{{ $t('article.delete') }}</span>
                    </UButton>
                  </div>

                  <div v-if="shouldShowDownloads" class="flex-1 flex justify-end items-center">
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
            </header>

            <!-- 图片展示区 -->
            <figure
              v-if="article?.data?.images && article?.data?.images.length > 0"
              class="mb-4 md:mb-8"
            >
              <div class="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div
                  v-for="(img, index) in displayedImages"
                  :key="index"
                  :class="[
                    'rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-all duration-300 bg-gray-100 dark:bg-gray-800 relative',
                    'aspect-[3/4]'
                  ]"
                  @click="openLightbox(index)"
                >
                  <!-- 骨架屏占位 -->
                  <div
                    v-if="!imageLoaded[index] && !imageErrors[index]"
                    class="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
                  />

                  <!-- 图片加载错误状态 -->
                  <div
                    v-else-if="imageErrors[index]"
                    class="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                  >
                    <div class="text-center text-gray-400">
                      <Icon name="mynaui:warning" class="w-8 h-8 mx-auto mb-2" />
                      <div class="text-xs">{{ $t('image.loadFailed') }}</div>
                      <button
                        class="text-xs text-primary hover:text-primary-600 mt-1 flex items-center mx-auto"
                        @click.stop="retryImageLoad(index)"
                      >
                        <Icon name="mynaui:refresh" class="w-3 h-3 mr-1" />
                        {{ $t('image.retry') }}
                      </button>
                    </div>
                  </div>

                  <!-- 实际图片 -->
                  <NuxtImg
                    :src="img"
                    :alt="generateImageAltText(index, article?.data?.images?.length || 0)"
                    :title="generateImageSeoDescription(index, article?.data?.images?.length || 0)"
                    :data-index="index"
                    class="w-full h-full object-cover transition-all duration-500"
                    :class="{
                      'opacity-0': !imageLoaded[index] || imageErrors[index],
                      'opacity-100': imageLoaded[index] && !imageErrors[index]
                    }"
                    :loading="getImageLoadingStrategy(index)"
                    :priority="index === 0"
                    :preload="shouldPreloadImage(index)"
                    :fetchpriority="getFetchPriority(index)"
                    format="webp"
                    :quality="getImageQuality(index)"
                    fit="cover"
                    :sizes="getImageSizes(index)"
                    @load="onImageLoad(index)"
                    @error="onImageError(index)"
                  />

                  <!-- 图片序号标识 -->
                  <!-- <div
                v-if="article?.data.images.length > 1 && imageLoaded[index] && !imageErrors[index]"
                class="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center"
              >
                <Icon name="mynaui:image" class="w-3 h-3 mr-1" />
                {{ index + 1 }}/{{ article?.data.images.length }}
              </div> -->

                  <!-- 放大镜图标提示 -->
                  <!-- <div
                v-if="imageLoaded[index] && !imageErrors[index]"
                class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20"
              >
                <div
                  class="bg-white/90 flex items-center justify-center dark:bg-gray-800/90 rounded-full p-3"
                >
                  <Icon name="mynaui:search" class="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
              </div> -->
                </div>
              </div>

              <!-- 加载更多按钮 -->
              <div v-if="hasMoreImages" class="flex justify-center mt-6">
                <UButton
                  variant="outline"
                  size="lg"
                  icon="mynaui:image"
                  class="cursor-pointer"
                  @click="loadMoreImages"
                >
                  {{ $t('image.loadMore', { count: remainingImagesCount }) }}
                </UButton>
              </div>
            </figure>

            <!-- 文章内容 -->
            <section v-if="shouldShowContent" class="mb-6 md:mb-12">
              <div
                ref="articleContent"
                class="prose max-w-none whitespace-pre-wrap text-sm md:text-base dark:prose-invert"
                v-html="article?.data.content"
              />
            </section>

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
                  :disabled="isLikeLoading"
                  class="flex items-center cursor-pointer space-x-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-6 py-3 group transition-all duration-200"
                  :class="{ 'pointer-events-none': isLikeLoading }"
                  @click="handleLike"
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
              v-if="
                article?.data.downloads && article.data.downloads.length > 0 && shouldShowContent
              "
              id="downloads"
              class="mb-6 md:mb-8"
            >
              <h3
                class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6"
              >
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
                      <Icon
                        :name="getDownloadTypeIcon(download.type!)"
                        class="w-5 h-5 text-primary"
                      />
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
                      rel="noopener noreferrer"
                      variant="soft"
                      size="sm"
                      class="w-full"
                      @click="handleDownloadClick(download.url ?? '')"
                    >
                      <Icon name="mynaui:download" class="w-4 h-4 mr-2" />
                      {{ $t('article.download') }}
                    </UButton>
                  </div>
                </div>
              </div>
            </div>

            <!-- 标签展示区 -->
            <section v-if="article?.data.tags && article.data.tags.length > 0" class="mb-6 md:mb-8">
              <h3
                class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6"
              >
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
                  />
                  <span class="font-medium">{{ tag.name }}</span>
                </NuxtLinkLocale>
              </div>
            </section>

            <!-- 评论区 -->
            <section class="mb-6 md:mb-8 comments-section">
              <h3
                class="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 md:mb-6"
              >
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
                        />
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
                    :loading="commentsPending"
                    class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
                    @click="loadMoreComments"
                  >
                    {{ $t('article.loadMoreComments') }}
                  </UButton>
                </div>
              </div>
            </section>
          </main>
          <!-- 右侧边栏 -->
          <aside class="w-full lg:w-80 flex-shrink-0">
            <!-- 作者信息 -->
            <div class="lg:sticky top-4">
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
                    <div class="text-gray-500 dark:text-gray-400">
                      {{ $t('article.followers') }}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="font-semibold text-gray-900 dark:text-gray-100">
                      {{ article?.data.likes }}
                    </div>
                    <div class="text-gray-500 dark:text-gray-400">{{ $t('article.likes') }}</div>
                  </div>
                  <div class="text-center">
                    <div class="font-semibold text-gray-900 dark:text-gray-100">96%</div>
                    <div class="text-gray-500 dark:text-gray-400">
                      {{ $t('article.goodReviews') }}
                    </div>
                  </div>
                </div>
                <UButton
                  :disabled="isFollowLoading"
                  :loading="isFollowLoading"
                  class="w-full py-2 md:py-2.5 cursor-pointer justify-center items-center flex bg-primary text-white text-sm md:text-base rounded-md hover:bg-primary-600 transition-colors whitespace-nowrap"
                  @click="handleFollow"
                >
                  {{
                    article?.data.author.isFollowed
                      ? $t('article.unfollow')
                      : $t('article.followAuthor')
                  }}
                </UButton>
              </div>
              <!-- 相关推荐 -->
              <aside class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
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
                        quality="85"
                        width="200"
                        height="200"
                        fit="cover"
                        sizes="(max-width: 640px) 150px, 200px"
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
              </aside>
            </div>
          </aside>
        </div>
      </div>
    </article>

    <!-- 删除确认弹窗 -->
    <UModal
      v-model:open="showDeleteConfirm"
      :title="$t('article.deleteConfirm.title')"
      :ui="{ footer: 'justify-end', close: 'cursor-pointer' }"
    >
      <template #body>
        <p class="text-gray-700 dark:text-gray-300">
          {{ $t('article.deleteConfirm.message') }}
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton variant="ghost" class="cursor-pointer" @click="showDeleteConfirm = false">
            {{ $t('common.cancel') }}
          </UButton>
          <UButton
            color="error"
            class="cursor-pointer"
            :loading="isDeleting"
            @click="confirmDeleteArticle"
          >
            {{ $t('common.delete') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
  import zod from 'zod';
  import { useUserStore } from '~/stores/user';
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
  import type { SiteConfig } from '~/types/site-config';
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();

  // 在 setup 函数顶部获取 siteConfig，避免在回调函数中调用
  const siteConfig = inject<SiteConfig>('siteConfig');

  // 确保在SSR阶段等待数据加载完成
  const {
    data: article,
    pending: articlePending,
    refresh: refreshArticle,
    error: articleError
  } = await articleControllerFindOne({
    composable: 'useAsyncData',
    key: `article_${route.params.id}`,
    path: {
      id: String(route.params.id)
    }
  });

  // 推荐文章也使用await确保SSR完成
  const {
    data: recommend,
    pending: recommendPending,
    error: recommendError
  } = await articleControllerFindRecommend({
    key: `recommend_${route.params.id}`,
    composable: 'useLazyAsyncData',
    path: {
      id: String(route.params.id)
    }
  });

  // 评论列表也使用await
  const {
    data: commentsData,
    pending: commentsPending,
    refresh: refreshComments
  } = await commentControllerFindAll({
    composable: 'useLazyAsyncData',
    key: `comments_${route.params.id}`,
    path: { id: Number(route.params.id) },
    query: {
      page: 1,
      limit: 20
    }
  });

  // 生成SEO关键词 - 基于标签与长尾词拼接组合
  const generateSeoKeywords = () => {
    if (!article.value?.data) return '';

    const articleKeywords = siteConfig?.seo_article_page_keywords || '';
    const longTailKeywords = siteConfig?.seo_long_tail_keywords
      ? siteConfig.seo_long_tail_keywords
          .split(',')
          .map((k: string) => k.trim())
          .filter(Boolean)
      : [];

    // 文章标签数组
    const tags = article.value.data.tags?.map(tag => tag.name) || [];

    // 文章标题关键词
    const titleKeywords = article.value.data.title || '';

    // 生成标签与长尾词的组合关键词
    const combinedKeywords: string[] = [];

    // 取前2-3个标签与长尾关键词组合
    const mainTags = tags.slice(0, 3);
    mainTags.forEach(tag => {
      // 为每个标签找到最相关的长尾关键词
      const relatedLongTailKeywords = longTailKeywords
        .filter(keyword => {
          const keywordLower = keyword.toLowerCase();
          return (
            tag.toLowerCase().includes(keywordLower.substring(0, 2)) ||
            titleKeywords.toLowerCase().includes(keywordLower.substring(0, 2)) ||
            keywordLower.includes(tag.substring(0, 2))
          );
        })
        .slice(0, 2); // 每个标签最多2个长尾词

      // 若没有匹配到，使用前2个长尾词作为兜底
      const candidates =
        relatedLongTailKeywords.length > 0 ? relatedLongTailKeywords : longTailKeywords.slice(0, 2);

      // 生成组合词（如：刀剑神域 cosplay, 刀剑神域 高清图片）
      candidates.forEach(longTail => {
        // 提取长尾词的核心部分
        const coreKeyword = longTail
          .split('')
          .filter(
            char => char.trim().length > 0 && !/[，。！？、；：""''（）【】《》〈〉]/.test(char) // 过滤掉标点符号
          )
          .join('');

        if (coreKeyword) {
          combinedKeywords.push(`${tag} ${coreKeyword}`); // 添加空格
        }
      });
    });

    // 选择原始长尾关键词（限制数量）
    const selectedOriginalLongTailKeywords = longTailKeywords
      .filter(keyword => {
        const keywordLower = keyword.toLowerCase();
        return (
          titleKeywords.toLowerCase().includes(keywordLower.substring(0, 2)) ||
          tags.some(tag => tag.toLowerCase().includes(keywordLower.substring(0, 2)))
        );
      })
      .slice(0, 2);

    // 组合所有关键词，控制总数在搜索引擎限制内
    const allKeywords = [
      ...tags, // 原始标签
      ...combinedKeywords, // 标签+长尾词组合
      articleKeywords, // 文章页通用关键词
      ...selectedOriginalLongTailKeywords // 原始长尾关键词
    ].filter(Boolean);

    // 去重并限制关键词数量（Google建议10-15个，Bing类似）
    const uniqueKeywords = [...new Set(allKeywords)];
    // 优先保留最重要的关键词
    const prioritizedKeywords = uniqueKeywords
      .sort((a, b) => {
        // 标签和组合词优先级最高
        const aIsTagOrCombined = tags.includes(a) || combinedKeywords.includes(a);
        const bIsTagOrCombined = tags.includes(b) || combinedKeywords.includes(b);
        if (aIsTagOrCombined && !bIsTagOrCombined) return -1;
        if (!aIsTagOrCombined && bIsTagOrCombined) return 1;
        return 0;
      })
      .slice(0, 14); // 控制在14个以内

    return prioritizedKeywords.join(',');
  };

  // 生成SEO优化的图片alt文本 - 基于标签与长尾词拼接
  const generateImageAltText = (index: number, totalImages: number): string => {
    if (!article.value?.data) return '';

    const title = article.value.data.title || '';
    const author = article.value.data.author?.nickname || article.value.data.author?.username || '';
    const tags = article.value.data.tags?.map(tag => tag.name) || [];

    // 从app.config中获取长尾关键词配置
    const longTailKeywords = siteConfig?.seo_long_tail_keywords
      ? siteConfig.seo_long_tail_keywords
          .split(',')
          .map((k: string) => k.trim())
          .filter(Boolean)
      : [];

    // 为每个标签拼接相关的长尾关键词，创建组合词
    const combinedKeywords: string[] = [];

    // 取前2个标签进行拼接
    const mainTags = tags.slice(0, 2);
    mainTags.forEach(tag => {
      // 为每个标签找到1-2个最相关的长尾关键词
      const relatedLongTailKeywords = longTailKeywords
        .filter(keyword => {
          const keywordLower = keyword.toLowerCase();
          // 检查关键词是否与标签相关（前2个字符匹配）
          return (
            tag.toLowerCase().includes(keywordLower.substring(0, 2)) ||
            // 检查关键词是否与标题相关
            title.toLowerCase().includes(keywordLower.substring(0, 2)) ||
            // 检查标签是否与关键词相关
            keywordLower.includes(tag.substring(0, 2))
          );
        })
        .slice(0, 2);

      // 生成组合关键词
      if (relatedLongTailKeywords.length > 0) {
        relatedLongTailKeywords.forEach(longTail => {
          // 提取长尾词的核心部分进行拼接
          const coreKeyword = longTail
            .split(' ')
            .filter(word => word.trim().length > 0) // 保留所有有意义的词汇
            .join('');
          if (coreKeyword) {
            combinedKeywords.push(`${tag} ${coreKeyword}`); // 添加空格
          }
        });
      }
    });

    // 如果没有组合词，使用前2个通用长尾关键词
    const selectedKeywords =
      combinedKeywords.length > 0 ? combinedKeywords : longTailKeywords.slice(0, 2);

    // 图片位置描述
    const positionKeywords = ['精美图片', '高清图片', '原创图片', '视觉作品', '摄影作品'];
    const positionKeyword = positionKeywords[index % positionKeywords.length];

    // 根据图片数量和位置生成描述
    let positionDescription = '';
    if (totalImages === 1) {
      positionDescription = `完整${positionKeyword}展示`;
    } else if (index === 0) {
      positionDescription = `主图${positionKeyword}预览`;
    } else if (index === totalImages - 1) {
      positionDescription = `结尾${positionKeyword}分享`;
    } else {
      positionDescription = `精选${positionKeyword}欣赏`;
    }

    // 构建SEO友好的alt文本结构
    const altTextComponents = [
      title, // 核心标题
      author, // 作者信息
      positionDescription, // 位置和类型描述
      ...selectedKeywords, // 标签+长尾词组合
      `第${index + 1}张图片`,
      `共${totalImages}张作品集`
    ];

    return altTextComponents.filter(Boolean).join(' - ');
  };

  // 生成图片SEO描述 - 基于标签与长尾词拼接
  const generateImageSeoDescription = (index: number, totalImages: number): string => {
    if (!article.value?.data) return '';

    const title = article.value.data.title || '';
    const author = article.value.data.author?.nickname || article.value.data.author?.username || '';
    const views = article.value.data.views || 0;
    const likes = article.value.data.likes || 0;
    const tags = article.value.data.tags?.map(tag => tag.name) || [];

    // 获取长尾关键词配置
    const longTailKeywords = siteConfig?.seo_long_tail_keywords
      ? siteConfig.seo_long_tail_keywords
          .split(',')
          .map((k: string) => k.trim())
          .filter(Boolean)
      : [];

    // 为每个标签拼接相关的长尾关键词，创建组合词
    const combinedKeywords: string[] = [];

    // 取前2个标签进行拼接
    const mainTags = tags.slice(0, 2);
    mainTags.forEach(tag => {
      // 为每个标签找到1-2个最相关的长尾关键词
      const relatedLongTailKeywords = longTailKeywords
        .filter(keyword => {
          const keywordLower = keyword.toLowerCase();
          return (
            tag.toLowerCase().includes(keywordLower.substring(0, 2)) ||
            title.toLowerCase().includes(keywordLower.substring(0, 2)) ||
            keywordLower.includes(tag.substring(0, 2))
          );
        })
        .slice(0, 2);

      // 生成组合关键词
      if (relatedLongTailKeywords.length > 0) {
        relatedLongTailKeywords.forEach(longTail => {
          // 提取长尾词的核心部分进行拼接
          const coreKeyword = longTail
            .split(' ')
            .filter(word => word.trim().length > 0) // 保留所有有意义的词汇
            .join('')
            .substring(0, 8); // 最多8个字符，包含中英文

          if (coreKeyword) {
            combinedKeywords.push(`${tag} ${coreKeyword}`); // 添加空格
          }
        });
      }
    });

    // 如果没有组合词，选择原始长尾关键词
    const selectedKeywords =
      combinedKeywords.length > 0 ? combinedKeywords : longTailKeywords.slice(0, 2);

    // 图片质量描述词汇
    const qualityTerms = ['高清', '原创', '精美', '优质', '独家'];
    const qualityTerm = qualityTerms[index % qualityTerms.length];

    // 位置描述
    const positionTerms = ['精选', '特色', '推荐', '热门', '新锐'];
    const positionTerm = positionTerms[index % positionTerms.length];

    return `${title} - ${author}创作的${qualityTerm}图片作品，第${index + 1}张${positionTerm}内容，共${totalImages}张高质量图片集合。获得${likes}次点赞，${views}次浏览，包含${selectedKeywords.join('、')}等优质视觉艺术内容分享。`;
  };

  // SEO Meta 标签 - 使用 useSeoMeta 确保 SSR 正确渲染
  useSeoMeta({
    title: () => {
      const title = article.value?.data?.title || '';
      const author =
        article.value?.data?.author?.nickname || article.value?.data?.author?.username || '';
      return title ? `${title} - ${author}的作品` : title;
    },
    description: () => {
      if (!article.value?.data) return '';

      const longTailKeywords = siteConfig?.seo_long_tail_keywords
        ? siteConfig.seo_long_tail_keywords
            .split(',')
            .map((k: string) => k.trim())
            .filter(Boolean)
        : [];
      const author =
        article.value.data.author?.nickname || article.value.data.author?.username || '';
      const imageCount = article.value.data.images?.length || 0;
      const likes = article.value.data.likes || 0;
      const views = article.value.data.views || 0;

      // 选择相关长尾关键词用于描述
      const selectedKeywords = longTailKeywords.slice(0, 2);

      return `${article.value.data.title} - ${author}作品，包含${imageCount}张高清图片。获得${likes}次点赞，${views}次浏览。${selectedKeywords.join('、')}等优质内容分享平台。`;
    },
    author: () =>
      article.value?.data?.author?.nickname || article.value?.data?.author?.username || '',
    keywords: generateSeoKeywords,
    robots: 'index, follow',
    ogTitle: () => {
      const title = article.value?.data?.title || '';
      const author =
        article.value?.data?.author?.nickname || article.value?.data?.author?.username || '';
      return `${title} - ${author}原创作品`;
    },
    ogDescription: () => article.value?.data?.summary || article.value?.data?.title || '',
    ogImage: () => article.value?.data?.cover || article.value?.data?.images?.[0] || undefined,
    ogImageWidth: () => 1200,
    ogImageHeight: () => 630,
    ogImageAlt: () => {
      const title = article.value?.data?.title || '';
      const author =
        article.value?.data?.author?.nickname || article.value?.data?.author?.username || '';
      const longTailKeywords = siteConfig?.seo_long_tail_keywords
        ? siteConfig.seo_long_tail_keywords
            .split(',')
            .map((k: string) => k.trim())
            .filter(Boolean)
        : [];
      const selectedKeywords = longTailKeywords.slice(0, 1);
      return `${title} - ${author}的${selectedKeywords[0]}原创作品，高清图片集`;
    },
    ogType: 'article',
    twitterCard: 'summary_large_image',
    twitterTitle: () => {
      const title = article.value?.data?.title || '';
      const author =
        article.value?.data?.author?.nickname || article.value?.data?.author?.username || '';
      return `${title} - ${author}原创作品`;
    },
    twitterDescription: () => article.value?.data?.summary || article.value?.data?.title || '',
    twitterImage: () => article.value?.data?.cover || article.value?.data?.images?.[0] || undefined,
    twitterImageAlt: () => {
      const title = article.value?.data?.title || '';
      const author =
        article.value?.data?.author?.nickname || article.value?.data?.author?.username || '';
      return `${title} - ${author}的原创作品，高清图片集`;
    }
  });

  // 生成图片结构化数据
  const generateImageStructuredData = () => {
    if (!article.value?.data) return null;

    const images = article.value.data.images || [];
    const authorName =
      article.value.data.author?.nickname || article.value.data.author?.username || '';

    // 为每个图片创建ImageObject
    const imageObjects = images.map((image, index) => ({
      '@type': 'ImageObject',
      url: image,
      name: generateImageAltText(index, images.length),
      description: generateImageSeoDescription(index, images.length),
      author: {
        '@type': 'Person',
        name: authorName
      },
      uploadDate: article.value?.data?.createdAt || '',
      thumbnailUrl: image,
      representativeOfPage: index === 0,
      caption: generateImageAltText(index, images.length)
    }));

    return imageObjects;
  };

  // 结构化数据 (JSON-LD) - 提升 SEO
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.value?.data?.title || '',
          description: article.value?.data?.summary || article.value?.data?.title || '',
          image: generateImageStructuredData(),
          datePublished: article.value?.data?.createdAt || '',
          dateModified: article.value?.data?.updatedAt || article.value?.data?.createdAt || '',
          author: {
            '@type': 'Person',
            name:
              article.value?.data?.author?.nickname || article.value?.data?.author?.username || '',
            url: `/author/${article.value?.data?.author?.id}`
          },
          publisher: {
            '@type': 'Organization',
            name: 'PicArt',
            logo: {
              '@type': 'ImageObject',
              url: '/favicon.ico'
            }
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${route.fullPath}`
          },
          keywords: article.value?.data?.tags?.map(tag => tag.name).join(',') || ''
        })
      },
      // 添加图片集合的结构化数据
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: article.value?.data?.title || '图片集合',
          description: article.value?.data?.summary || article.value?.data?.title || '',
          image: generateImageStructuredData(),
          author: {
            '@type': 'Person',
            name:
              article.value?.data?.author?.nickname || article.value?.data?.author?.username || '',
            url: `/author/${article.value?.data?.author?.id}`
          },
          dateCreated: article.value?.data?.createdAt || '',
          dateModified: article.value?.data?.updatedAt || article.value?.data?.createdAt || '',
          inLanguage: 'zh-CN',
          isAccessibleForFree: !article.value?.data?.requirePayment,
          keywords: [article.value?.data?.tags?.map(tag => tag.name).join(',') || '']
            .filter(Boolean)
            .join(',')
        })
      }
    ]
  });

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

    // mixed 类型的文章不隐藏内容，只隐藏下载
    if (data.type === 'mixed') {
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

    // mixed 类型的文章不显示内容限制组件
    if (data.type === 'mixed') {
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

  // 删除相关状态
  const showDeleteConfirm = ref(false);
  const isDeleting = ref(false);

  // lightbox相关状态
  const lightboxVisible = ref(false);
  const lightboxIndex = ref(0);
  const lightboxImages = computed(() => {
    // 确保始终返回数组，避免undefined
    const articleImages = article.value?.data?.images || [];
    const htmlImages: string[] = [];

    if (articleContent.value) {
      const images = articleContent.value.querySelectorAll('img');
      htmlImages.push(...Array.from(images).map(img => img.src));
    }

    // 合并去重，确保返回数组类型
    const mergedImages = [...new Set([...articleImages, ...htmlImages])];
    return Array.isArray(mergedImages) ? mergedImages : [];
  });
  const articleContent = ref<HTMLElement | null>(null);

  // 打开lightbox
  const openLightbox = (index: number) => {
    if (lightboxImages.value.length > 0) {
      lightboxIndex.value = index;
      lightboxVisible.value = true;
    }
  };

  // 灯箱关闭事件
  const handleLightboxClose = () => {
    lightboxVisible.value = false;
  };

  // 灯箱切换图片事件
  const handleLightboxChange = (index: number) => {
    lightboxIndex.value = index;
  };

  // 简单的图片点击事件处理
  const setupImageClickHandlers = () => {
    // 检查内容是否已加载
    if (!articleContent.value || !article.value?.data?.content) {
      console.log('Content not ready yet, skipping image handler setup');
      return;
    }

    const images = articleContent.value.querySelectorAll('img');

    if (images.length === 0) {
      console.log('No images found in content');
      return;
    }

    console.log(`Setting up click handlers for ${images.length} images`);

    images.forEach(img => {
      // 避免重复绑定事件
      if (img.dataset.clickHandlerBound) return;

      // 添加点击事件
      img.addEventListener('click', () => {
        // 获取所有图片URL
        const htmlImages = Array.from(images).map(img => img.src);
        const articleImages = Array.isArray(lightboxImages.value) ? [...lightboxImages.value] : [];

        // 合并去重
        const uniqueImages = [...new Set([...articleImages, ...htmlImages])];

        // 找到当前图片的索引
        const currentIndex = uniqueImages.indexOf(img.src);

        if (currentIndex !== -1) {
          lightboxIndex.value = currentIndex;
          lightboxVisible.value = true;
        }
      });

      // 添加样式
      img.style.cursor = 'pointer';
      img.style.transition = 'transform 0.2s ease';

      // 悬停效果
      img.addEventListener('mouseenter', () => {
        img.style.transform = 'scale(1.02)';
      });

      img.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
      });

      // 标记已绑定事件
      img.dataset.clickHandlerBound = 'true';
    });
  };

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
  const comments = ref<CommentControllerFindAllResponse['data']['data'][number][]>([]);
  const commentsPage = ref(1);
  const hasMoreComments = ref(true);
  const isLoadingComments = ref(false);
  const toast = useToast();

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
    } catch (error) {
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
      const responseData = response;
      if (responseData?.data?.value?.data) {
        comments.value = [...comments.value, ...responseData.data.value.data.data];
        hasMoreComments.value =
          responseData.data.value.data.meta.page < responseData.data.value.data.meta.totalPages;
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

  // 显示删除确认弹窗
  const handleDelete = () => {
    if (!isAuthor.value && !hasManagePermission.value) return;
    showDeleteConfirm.value = true;
  };

  // 确认删除文章
  const confirmDeleteArticle = async () => {
    try {
      isDeleting.value = true;
      await articleControllerRemove({
        composable: '$fetch',
        path: { id: String(route.params.id) }
      });

      // 跳转到用户文章列表页面
      router.push(localePath('/user/articles'));
    } catch (error) {
      console.error('删除文章失败:', error);
    } finally {
      isDeleting.value = false;
      showDeleteConfirm.value = false;
    }
  };

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

  // 图片分页相关状态
  const imagesPerPage = 18;
  const displayedImagesCount = ref(imagesPerPage);

  // 计算显示的图片
  const displayedImages = computed(() => {
    return article.value?.data?.images?.slice(0, displayedImagesCount.value) || [];
  });

  // 计算是否还有更多图片
  const hasMoreImages = computed(() => {
    return (article.value?.data?.images?.length || 0) > displayedImagesCount.value;
  });

  // 计算剩余图片数量
  const remainingImagesCount = computed(() => {
    return (article.value?.data?.images?.length || 0) - displayedImagesCount.value;
  });

  // 加载更多图片
  const loadMoreImages = () => {
    const totalImages = article.value?.data?.images?.length || 0;
    displayedImagesCount.value = Math.min(displayedImagesCount.value + imagesPerPage, totalImages);
  };

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

  // 监听文章内容变化，设置图片点击事件
  watch(
    () => article.value?.data?.content,
    newContent => {
      if (newContent) {
        nextTick(() => {
          setupImageClickHandlers();
        });
      }
    },
    { flush: 'post' }
  );

  // 监听加载状态变化，确保内容加载完成后绑定事件
  watch(
    () => articlePending.value,
    isPending => {
      if (!isPending && article.value?.data?.content) {
        nextTick(() => {
          setupImageClickHandlers();
        });
      }
    }
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
    // 重置状态
    imageErrors.value[index] = false;
    imageLoaded.value[index] = false;

    // 使用 nextTick 确保状态更新后再触发图片重新加载
    nextTick(() => {
      // 强制刷新图片 - 添加时间戳参数避免缓存
      const originalSrc = article.value?.data.images?.[index];
      if (originalSrc) {
        // 创建新的 Image 对象来预加载
        const img = new Image();
        img.onload = () => {
          // 图片加载成功后，触发 NuxtImg 重新加载
          onImageLoad(index);
        };
        img.onerror = () => {
          onImageError(index);
        };
        // 添加时间戳参数强制刷新
        img.src = `${originalSrc}?t=${Date.now()}`;
      }
    });
  };

  // 图片加载策略优化
  const getImageLoadingStrategy = (index: number) => {
    if (index === 0) return 'eager';
    if (index < 6) return 'lazy';
    return 'lazy';
  };

  // 图片预加载策略
  const shouldPreloadImage = (index: number) => {
    // 只预加载前3张图片
    return index === 0 || index === 1 || index === 2;
  };

  // 获取优先级
  const getFetchPriority = (index: number) => {
    if (index === 0) return 'high';
    if (index < 4) return 'auto';
    return 'low';
  };

  // 动态图片质量优化
  const getImageQuality = (index: number) => {
    if (index === 0) return 95; // 第一张图片最高质量
    if (index < 6) return 85; // 前6张高质量
    if (index < 12) return 75; // 中等质量
    return 65; // 其余图片降低质量提升性能
  };

  // 响应式图片尺寸
  const getImageSizes = (index: number) => {
    const baseSize = '(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1200px';

    if (index === 0) {
      return '(max-width: 640px) 100vw, (max-width: 1024px) 900px, 1500px';
    }

    return baseSize;
  };

  const shouldShowDownloads = computed(() => {
    if (!article.value?.data.downloads || article.value.data.downloads.length === 0) {
      return false;
    }

    const data = article.value.data;

    // 如果用户有文章管理权限，则不受任何限制
    if (hasManagePermission.value) {
      return true;
    }

    // mixed 类型的文章需要根据权限控制下载链接
    if (data.type === 'mixed') {
      // 检查各种权限要求
      if (data.requireLogin && !isLoggedIn.value) {
        return false;
      }
      if (data.requireFollow && !data.author.isFollowed && !isAuthor.value) {
        return false;
      }
      if (data.requireMembership && !isMembershipValid.value) {
        return false;
      }
      if (data.requirePayment && !data.isPaid) {
        return false;
      }
      return true;
    }

    // 其他类型文章使用原来的逻辑
    return shouldShowContent.value;
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

  // 组件挂载后设置图片点击事件
  onMounted(() => {
    // 如果内容已经加载，立即设置
    if (article.value?.data?.content) {
      nextTick(() => {
        setupImageClickHandlers();
      });
    } else {
      // 如果内容还在加载，使用重试机制
      const retrySetup = () => {
        if (article.value?.data?.content && articleContent.value) {
          setupImageClickHandlers();
        } else {
          // 每100ms重试一次，最多重试50次（5秒）
          setTimeout(retrySetup, 100);
        }
      };
      retrySetup();
    }
  });
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
