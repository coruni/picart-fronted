<template>
  <UApp>
    <NuxtLoadingIndicator color="#615fff" />
    <div class="flex flex-col min-h-screen">
      <NuxtLayout />
    </div>
  </UApp>
</template>

<script lang="ts" setup>
  import { configControllerGetPublic } from './api';
  const configs = await configControllerGetPublic({
    composable: 'useAsyncData',
    key: 'siteConfig'
  });
  // 提供配置
  provide('siteConfig', configs.data);

  // 构建全局元数据和SEO
  useSeoMeta({
    title: configs.data.value?.data?.site_name || 'PicArt',
    titleTemplate: '%s - ' + (configs.data.value?.data?.site_subname || 'PICA PICA'),
    description:
      configs.data.value?.data?.site_description || '发现和分享精美图片，探索创意艺术作品',
    keywords:
      configs.data.value?.data?.site_keywords || '图片分享,艺术作品,创意图片,设计灵感,PicArt',
    robots: 'index, follow',
    ogSiteName: configs.data.value?.data?.site_name || 'PicArt',
    ogLocale: 'zh_CN',
    ogType: 'website',
    twitterCard: 'summary_large_image'
  });

  useHead({
    link: [
      {
        rel: 'icon',
        href: configs.data.value?.data?.site_favicon || '/favicon.ico',
        type: 'image/x-icon',
        sizes: '64x64'
      }
    ]
  });
</script>
