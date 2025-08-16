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
      <div v-html="adContent"></div>
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
  const { isAdEnabled, getAdContent, getAdPosition, getAdStyle, getAdContainerClass } =
    await useAdvertisement();

  // 计算是否应该显示广告
  const shouldShow = computed(() => isAdEnabled(props.type));

  // 获取广告内容
  const adContent = computed(() => getAdContent(props.type));

  // 获取广告位置
  const adPosition = computed(() => {
    if (props.type === 'homepage' || props.type === 'global') {
      return getAdPosition(props.type);
    }
    return props.position || '';
  });

  // 获取广告样式
  const adStyle = computed(() => {
    if (props.type === 'global') {
      return getAdStyle('global');
    }
    return {};
  });

  // 容器样式类
  const adContainerClass = computed(() => getAdContainerClass(props.type, props.position));
</script>

<style scoped></style>
