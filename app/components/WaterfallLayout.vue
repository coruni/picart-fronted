<template>
  <ClientOnly>
    <Waterfall
      :list="items"
      row-key="id"
      :gutter="gap"
      :has-around-gutter="true"
      :breakpoints="breakpoints"
      animation-effect="fadeInUp"
      :animation-duration="800"
      :animation-delay="100"
      background-color="transparent"
      :lazyload="false"
      @after-render="handleAfterRender"
    >
      <template #default="{ item }">
        <slot :item="item"></slot>
      </template>
    </Waterfall>
    <template #fallback>
      <!-- SSR fallback: 渲染实际内容以便爬虫抓取，但对用户隐藏 -->
      <div class="sr-only" aria-hidden="true">
        <div v-for="item in items" :key="item.id">
          <slot :item="item"></slot>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script lang="ts" setup>
  import type { ArticleControllerFindAllResponse } from '~/api';

  type Article = Exclude<ArticleControllerFindAllResponse['data']['data'][0], undefined>;
  type SkeletonItem = { id: string; index: number; isSkeleton: boolean };

  const props = defineProps({
    items: {
      type: Array as PropType<(Article | SkeletonItem)[]>,
      required: true
    },
    columns: {
      type: Number,
      default: 5
    },
    gap: {
      type: Number,
      default: 16
    }
  });

  // 响应式断点配置
  const breakpoints = computed(() => ({
    1600: {
      rowPerView: 5 // 超宽屏 4 列
    },
    1200: {
      rowPerView: 3 // 桌面端 3 列
    },
    900: {
      rowPerView: 3 // 平板 2 列
    },
    600: {
      rowPerView: 2 // 小平板 2 列
    }
  }));

  // 渲染完成回调
  const handleAfterRender = () => {
    // 布局完成
  };

  // 暴露给外部的方法
  defineExpose({
    // vue-waterfall-plugin-next 会自动处理布局
  });
</script>

<style scoped>
  /* 动画样式 */
  :deep(.waterfall-item) {
    transition: all 0.3s ease;
  }
</style>
