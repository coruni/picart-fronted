<template>
  <ClientOnly>
    <template #fallback>
      <!-- SSR时的占位符 -->
      <div class="advertisement-preview">
        <div class="mb-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div class="flex flex-wrap gap-2">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
        <div
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
        >
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div class="bg-white dark:bg-gray-900 rounded p-3 mb-4">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div class="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div class="bg-white dark:bg-gray-900 rounded p-3">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </template>

    <div class="advertisement-preview">
      <div class="mb-4">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ t('admin.settings.adPreview') }}
        </h4>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="position in availablePositions"
            :key="position.value"
            :variant="selectedPosition === position.value ? 'solid' : 'outline'"
            size="xs"
            @click="selectedPosition = position.value"
          >
            {{ position.label }}
          </UButton>
        </div>
      </div>

      <!-- 预览容器 -->
      <div
        class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
      >
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {{ t('admin.settings.adPreviewContainer') }}
        </div>

        <!-- 模拟页面内容 -->
        <div class="bg-white dark:bg-gray-900 rounded p-3 mb-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>

        <!-- 广告预览 -->
        <div v-if="content" :class="previewContainerClass" :style="previewStyle" class="ad-preview">
          <div v-html="content" class="ad-content"></div>
        </div>

        <div v-else class="text-center py-8 text-gray-400 dark:text-gray-500">
          {{ t('admin.settings.adPreviewEmpty') }}
        </div>

        <!-- 模拟页面内容 -->
        <div class="bg-white dark:bg-gray-900 rounded p-3 mt-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
  interface Props {
    type: 'homepage' | 'article-top' | 'article-bottom' | 'global';
    content: string;
    enabled: boolean;
    position?: string;
    style?: string;
  }

  const props = defineProps<Props>();
  const { t } = useI18n();

  // 可用位置选项
  const availablePositions = computed(() => {
    switch (props.type) {
      case 'homepage':
        return [
          { label: t('admin.settings.adPositionTop'), value: 'top' },
          { label: t('admin.settings.adPositionBottom'), value: 'bottom' },
          { label: t('admin.settings.adPositionSidebar'), value: 'sidebar' }
        ];
      case 'global':
        return [
          { label: t('admin.settings.adPositionFixedTop'), value: 'fixed-top' },
          { label: t('admin.settings.adPositionFixedBottom'), value: 'fixed-bottom' },
          { label: t('admin.settings.adPositionFloating'), value: 'floating' }
        ];
      default:
        return [];
    }
  });

  // 选中的位置
  const selectedPosition = ref(props.position || availablePositions.value[0]?.value || '');

  // 预览容器样式类
  const previewContainerClass = computed(() => {
    if (!props.enabled) return '';

    const baseClasses = 'ad-preview-container';

    switch (selectedPosition.value) {
      case 'fixed-top':
        return `${baseClasses} relative top-0 left-0 right-0 z-10`;
      case 'fixed-bottom':
        return `${baseClasses} relative bottom-0 left-0 right-0 z-10`;
      case 'floating':
        return `${baseClasses} relative bottom-4 right-4 z-10`;
      case 'top':
        return `${baseClasses} mb-4`;
      case 'bottom':
        return `${baseClasses} mt-4`;
      case 'sidebar':
        return `${baseClasses} mb-4`;
      default:
        return baseClasses;
    }
  });

  // 预览样式
  const previewStyle = computed(() => {
    if (props.type === 'global' && props.style) {
      return props.style;
    }
    return {};
  });
</script>

<style scoped>
  .ad-preview-container {
    /* 预览容器样式 */
  }

  .ad-preview-container .ad-content {
    /* 广告内容样式 */
    width: 100%;
  }

  .ad-preview-container .ad-content :deep(img) {
    max-width: 100%;
    height: auto;
  }

  .ad-preview-container .ad-content :deep(a) {
    text-decoration: none;
  }

  .ad-preview-container .ad-content :deep(script) {
    display: none;
  }

  /* 浮动广告特殊样式 */
  .ad-preview-container:has(.ad-content) {
    max-width: 300px;
  }
</style>
