<template>
  <NuxtLoadingIndicator />
  <div class="flex flex-col min-h-screen">
    <NuxtLayout />
  </div>
</template>

<script lang="ts" setup>
  import { configControllerGetPublic } from './api';
  const configs = await configControllerGetPublic({
    composable: '$fetch'
  });
  // 提供配置
  provide('siteConfig', configs.data);

  // 构建元数据
  useHead({
    title: configs.data.site_name || 'PicArt',
    titleTemplate: '%s - ' + (configs.data.site_name || 'PICA PICA'),
    link: [
      {
        rel: 'icon',
        href: configs.data.site_favicon || '/favicon.ico',
        type: 'image/x-icon',
        sizes: '64x64'
      }
    ],
    meta: [
      {
        name: 'keywords',
        content: configs.data.site_keywords
      },
      {
        name: 'description',
        content: configs.data.site_description
      }
    ]
  });
</script>
