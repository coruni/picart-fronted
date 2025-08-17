<template>
  <NuxtLinkLocale
    :to="`/article/${article.id}`"
    class="bg-white rounded-md shadow-lg overflow-hidden h-full flex flex-col dark:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:shadow-primary-100/50 dark:hover:shadow-primary-900/30 group border border-primary-100/50 dark:border-primary-900/30"
  >
    <div class="aspect-[3/4] overflow-hidden cursor-pointer flex-shrink-0 relative">
      <NuxtImg
        :src="article.cover ?? article.images?.[0] ?? ''"
        :alt="article.title"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <!-- 渐变遮罩 -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></div>
    </div>

    <div class="p-4 sm:p-5 flex-grow flex flex-col relative overflow-hidden line-clamp-2">
      <UChip v-if="hasNsfwTag" color="error" size="sm" position="top-left">
        <h2
          class="text-sm line-clamp-2 sm:text-base md:text-lg font-medium text-gray-800 dark:text-white/90 transition-all duration-300"
        >
          {{ article.title }}
        </h2>
      </UChip>
      <h2
        v-else
        class="text-sm line-clamp-2 sm:text-base md:text-lg font-medium text-gray-800 dark:text-white/90 transition-all duration-300"
      >
        {{ article.title }}
      </h2>

      <!-- 描述内容区域 -->
      <div class="flex-grow flex flex-col justify-end">
        <div class="flex items-center justify-between flex-wrap">
          <div class="flex items-center space-x-4">
            <UButton
              variant="ghost"
              class="cursor-pointer text-gray-500 dark:text-white/70 flex items-center gap-2 hover:text-red-400 rounded-full px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 whitespace-nowrap group/like"
              :class="article.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-white/70'"
            >
              <Icon
                name="mynaui:heart-solid"
                class="transition-transform duration-300 group-hover/like:scale-110 group-hover/like:text-red-500"
              />
              <span class="text-sm font-medium">{{ article.likes }}</span>
            </UButton>
          </div>
          <div
            @click.stop="$router.push(`/author/${article.author?.id}`)"
            class="flex items-center cursor-pointer"
          >
            <UAvatar
              :src="article.author?.avatar ?? ''"
              :alt="article.author?.nickname ?? article.author?.username"
              class="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm transition-transform duration-300 hover:scale-110"
            />
          </div>
        </div>
      </div>
    </div>
  </NuxtLinkLocale>
</template>

<script lang="ts" setup>
  import type { ArticleControllerFindAllResponse } from '~~/api';
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

  // 检查是否有 NSFW 标签
  const hasNsfwTag = computed(() => {
    if (!article.tags || !Array.isArray(article.tags)) {
      return false;
    }

    return article.tags.some(tag => {
      // 处理不同类型的标签数据
      if (typeof tag === 'string') {
        return tag.toLowerCase() === 'nsfw';
      }
      if (typeof tag === 'object' && tag !== null) {
        const tagName = (tag as any).name || (tag as any).label || '';
        return tagName.toLowerCase() === 'nsfw';
      }
      return false;
    });
  });
</script>
