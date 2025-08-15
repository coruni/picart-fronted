<template>
  <div v-if="shouldShow" :class="adContainerClass" :style="adStyle">
    <div v-html="adContent" class="ad-content"></div>
  </div>
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

<style scoped>
  .advertisement-container {
    /* 基础样式 */
  }

  .advertisement-container.fixed {
    /* 固定定位样式 */
  }

  .advertisement-container .ad-content {
    /* 广告内容样式 */
    width: 100%;
  }

  .advertisement-container .ad-content :deep(img) {
    max-width: 100%;
    height: auto;
  }

  .advertisement-container .ad-content :deep(a) {
    text-decoration: none;
  }

  .advertisement-container .ad-content :deep(script) {
    display: none;
  }
</style>
