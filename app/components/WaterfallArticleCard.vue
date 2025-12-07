<template>
  <NuxtLinkLocale
    :to="`/article/${article.id}`"
    class="block overflow-hidden transition-all duration-300 group rounded-lg"
  >
    <!-- 图片容器 -->
    <div
      class="relative overflow-hidden cursor-pointer rounded-lg"
      :style="{ aspectRatio: getRandomAspectRatio() }"
    >
      <NuxtImg
        :src="article.cover ?? article.images?.[0] ?? ''"
        :alt="article.title"
        :loading="isFirstScreen ? 'eager' : 'lazy'"
        :priority="isFirstScreen"
        :preload="isFirstScreen"
        :fetchpriority="isFirstScreen ? 'high' : 'auto'"
        format="webp"
        quality="85"
        width="400"
        height="533"
        sizes="(max-width: 640px) 200px, (max-width: 768px) 250px, (max-width: 1024px) 300px, 400px"
        class="w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      <!-- 渐变遮罩 - 底部始终显示 -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
      />

      <!-- 图片数量标签 -->
      <div
        v-if="imageCount > 1"
        class="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 z-10"
      >
        <span>+{{ imageCount }}</span>
      </div>

      <!-- NSFW 标签 -->
      <div
        v-if="hasNsfwTag"
        class="absolute top-2 right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full font-bold shadow-md flex items-center justify-center z-10"
      >
        N
      </div>

      <!-- 文章信息 - 叠加在图片上 -->
      <div class="absolute bottom-0 left-0 right-0 p-3 z-10">
        <!-- 标题 -->
        <h3 class="text-sm font-medium text-white line-clamp-2 mb-2 drop-shadow-lg">
          {{ article.title }}
        </h3>

        <!-- 底部信息 -->
        <div class="flex items-center justify-between text-xs text-white/90">
          <!-- 左侧统计信息 -->
          <div class="flex items-center gap-3">
            <!-- 点赞数 -->
            <div class="flex items-center gap-1">
              <Icon name="mynaui:heart" class="w-3.5 h-3.5" />
              <span>{{ formatNumber(article.likes || 0) }}</span>
            </div>
            <!-- 评论数 -->
            <div class="flex items-center gap-1">
              <Icon name="mynaui:message" class="w-3.5 h-3.5" />
              <span>{{ formatNumber(article.commentCount || 0) }}</span>
            </div>
          </div>

          <!-- 右侧浏览数 -->
          <div class="flex items-center gap-1">
            <Icon name="mynaui:eye" class="w-3.5 h-3.5" />
            <span>{{ formatNumber(article.views) }}</span>
          </div>
        </div>
      </div>

      <!-- 状态图标 - 显示非PUBLISHED状态 -->
      <div
        v-if="article.status && article.status !== 'PUBLISHED' && hasManagePermission"
        class="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 rounded-full p-1.5 shadow-md z-10 flex items-center justify-center"
        :title="getStatusText(article.status)"
      >
        <Icon
          :name="getStatusIcon(article.status)"
          class="w-4 h-4"
          :class="getStatusColor(article.status)"
        />
      </div>
    </div>
  </NuxtLinkLocale>
</template>

<script lang="ts" setup>
  import type { ArticleControllerFindAllResponse } from '~/api';
  import { useUserStore } from '~/stores/user';

  import {
    getStatusIcon as getStatusIconUtil,
    getStatusColor as getStatusColorUtil,
    getStatusText as getStatusTextUtil
  } from '~/utils/article-status';

  type Article = Exclude<ArticleControllerFindAllResponse['data']['data'][0], undefined> & {
    images: string[] | string;
    commentCount?: number;
  };

  const props = defineProps({
    data: {
      type: Object as PropType<Article>,
      default: () => ({})
    },
    isFirstScreen: {
      type: Boolean,
      default: false
    }
  });

  const article = props.data;
  const { t } = useI18n();

  // 计算图片数量
  const imageCount = computed(() => {
    if (!article.images) return 0;
    if (Array.isArray(article.images)) return article.images.length;
    if (typeof article.images === 'string') {
      try {
        const parsed = JSON.parse(article.images);
        return Array.isArray(parsed) ? parsed.length : 1;
      } catch {
        return 1;
      }
    }
    return 0;
  });

  // 检查用户是否有文章管理权限
  const hasManagePermission = computed(() => {
    const userStore = useUserStore();
    
    // 如果用户信息还未加载完成，返回false
    if (!userStore.userInfo) return false;
    
    const userRoles = userStore.userInfo?.roles || [];
    return userRoles.some(role =>
      role.permissions?.some(permission => permission.name === 'article:manage')
    );
  });

  // 检查是否有 NSFW 标签
  const hasNsfwTag = computed(() => {
    if (!article.tags || !Array.isArray(article.tags)) return false;
    return article.tags.some((tag: any) => {
      if (typeof tag === 'string') return tag.toLowerCase() === 'nsfw';
      if (typeof tag === 'object' && tag !== null) {
        const tagName = tag.name || tag.label || '';
        return String(tagName).toLowerCase() === 'nsfw';
      }
      return false;
    });
  });

  // 格式化数字
  const formatNumber = (num: number | undefined) => {
    if (!num) return 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  // 根据文章 ID 生成固定的宽高比（避免重渲染时变化）
  const getRandomAspectRatio = () => {
    const ratios = ['3/4', '4/5', '2/3', '3/5', '1/1'];
    // 使用文章 ID 作为种子，确保每个文章的宽高比固定
    const seed =
      article.id
        ?.toString()
        .split('')
        .reduce((acc, char) => {
          return acc + char.charCodeAt(0);
        }, 0) || 0;
    return ratios[seed % ratios.length];
  };

  const getStatusIcon = (status: string) => getStatusIconUtil(status);
  const getStatusColor = (status: string) => getStatusColorUtil(status);
  const getStatusText = (status: string) => getStatusTextUtil(status, t);
</script>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
