<template>
  <ClientOnly>
    <template #fallback>
      <!-- SSR时的占位符 -->
      <div v-if="shouldShow">
        <div
          class="ad-content-placeholder bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400"
        >
          {{ $t('common.loading.loading') }}
        </div>
      </div>
    </template>

    <template v-if="shouldShow">
      <div v-html="adContent"/>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
  interface Props {
    type: 'homepage' | 'article-top' | 'article-bottom' | 'global';
    position?: string;
  }

  const props = defineProps<Props>();

  // 使用广告composable
  const { isAdEnabled, getAdContent } = await useAdvertisement();

  // 计算是否应该显示广告
  const shouldShow = computed(() => isAdEnabled(props.type));

  // 获取广告内容
  const adContent = computed(() => getAdContent(props.type));

  </script>

<style scoped></style>
