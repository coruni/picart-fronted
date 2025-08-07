<template>
  <NuxtLinkLocale
    :to="`/article/${article.id}`"
    class="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col dark:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:shadow-pink-100/50 dark:hover:shadow-indigo-900/30 group border border-pink-100/50 dark:border-indigo-900/30"
  >
    <div class="aspect-[3/4] overflow-hidden cursor-pointer flex-shrink-0 relative">
      <NuxtImg
        :src="article.cover ?? article.images?.[0] ?? ''"
        :alt="article.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        @error="handleImageError($event as Event, 'thumbnail')"
      />

      <!-- 渐变遮罩 -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></div>
    </div>

    <div class="p-5 flex-grow flex flex-col relative overflow-hidden line-clamp-2">
      <h3
        class="text-lg font-medium text-gray-800 dark:text-white/90 mb-3 transition-all duration-300"
      >
        {{ article.title }}
      </h3>

      <!-- 描述内容区域 -->
      <div class="flex-grow flex flex-col justify-end">
        <div class="flex items-center justify-between flex-wrap">
          <div class="flex items-center space-x-4">
            <button
              class="cursor-pointer text-gray-500 dark:text-white/70 flex items-center gap-2 hover:text-pink-400 rounded-full px-3 py-1.5 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300 whitespace-nowrap group/like"
            >
              <Icon
                name="mynaui:heart-solid"
                class="transition-transform duration-300 group-hover/like:scale-110 group-hover/like:text-pink-500"
              />
              <span class="text-sm font-medium">{{ article.likes }}</span>
            </button>
          </div>
          <div class="flex items-center">
            <NuxtImg
              :src="article.author?.avatar"
              :alt="article.author?.nickname ?? article.author?.username"
              class="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm transition-transform duration-300 hover:scale-110"
              @error="handleImageError($event as Event, 'avatar')"
            />
          </div>
        </div>
      </div>
    </div>
  </NuxtLinkLocale>
</template>

<script lang="ts" setup>
  import type { ArticleControllerFindAllResponse } from '~~/api';
  const { handleImageError } = useImageError();
  type Article = Exclude<ArticleControllerFindAllResponse['data']['data'][0], undefined> & {
    images: string[] | string;
  };

  const props = defineProps({
    data: {
      type: Object as PropType<Article>,
      default: () => ({})
    }
  });

  const article = props.data;
</script>
