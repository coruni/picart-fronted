<template>
  <NuxtLinkLocale
    :to="`/article/${article.id}`"
    class="overflow-hidden h-full flex flex-col dark:bg-gray-800 transition-all duration-300 group"
  >
    <div class="aspect-[3/4] overflow-hidden cursor-pointer flex-shrink-0 relative rounded-md">
      <NuxtImg
        :src="article.cover ?? article.images?.[0] ?? ''"
        :alt="article.title"
        loading="lazy"
        format="webp"
        quality="85"
        width="400"
        class="w-full h-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-110"
      />

      <!-- 渐变遮罩 -->
      <!-- <div
        class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      ></div> -->

      <!-- 状态图标 - 显示非PUBLISHED状态 -->
      <div
        v-if="article.status && article.status !== 'PUBLISHED' && hasManagePermission"
        class="flex items-center gap-2 absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 rounded-full p-1.5 shadow-md"
        :title="getStatusText(article.status)"
      >
        <Icon
          :name="getStatusIcon(article.status)"
          class="w-4 h-4"
          :class="getStatusColor(article.status)"
        />
      </div>

      <!-- NSFW 标签 -->
      <div
        v-if="hasNsfwTag"
        class="absolute top-2 right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full font-bold shadow-md flex items-center justify-center"
      >
        N
      </div>
    </div>

    <div class="p-4 sm:p-5 flex-grow flex flex-col relative overflow-hidden">
      <h2
        class="text-sm line-clamp-2 sm:text-base md:text-lg font-medium text-gray-800 dark:text-white/90 transition-all duration-300 mb-3"
      >
        {{ article.title }}
      </h2>

      <!-- 描述内容区域 -->
      <div class="flex-grow flex flex-col justify-end">
        <div class="flex items-center justify-between flex-wrap">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-1">
              <Icon name="mynaui:eye" />
              <span class="text-sm font-medium">{{ article.views }}</span>
            </div>
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
  import type { ArticleControllerFindAllResponse } from '~/api';
  import { useUserStore } from '~/stores/user';
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
  const { t } = useI18n();

  // 检查用户是否有文章管理权限
  const hasManagePermission = computed(() => {
    const userStore = useUserStore();
    const userRoles = userStore.currentUser?.roles || [];

    // 检查用户角色中是否有article:manage权限
    return userRoles.some(role =>
      role.permissions?.some(permission => permission.name === 'article:manage')
    );
  });

  // 检查是否有 NSFW 标签
  const hasNsfwTag = computed(() => {
    if (!article.tags || !Array.isArray(article.tags)) {
      return false;
    }

    return article.tags.some(tag => {
      // 处理不同类型的标签数据
      if (typeof tag === 'string') {
        return (tag as string)?.toLowerCase() === 'nsfw' || false;
      }
      if (typeof tag === 'object' && tag !== null) {
        const tagName = (tag as any).name || (tag as any).label || '';
        return tagName.toLowerCase() === 'nsfw';
      }
      return false;
    });
  });

  import {
    getStatusIcon as getStatusIconUtil,
    getStatusColor as getStatusColorUtil,
    getStatusText as getStatusTextUtil
  } from '~/utils/article-status';

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    return getStatusIconUtil(status);
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    return getStatusColorUtil(status);
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    return getStatusTextUtil(status, t);
  };
</script>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
