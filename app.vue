<template>
  <UApp>
    <NuxtLoadingIndicator />
    <div class="flex flex-col min-h-screen">
      <NuxtLayout />
    </div>
  </UApp>
</template>

<script lang="ts" setup>
  import { configControllerGetPublic } from './api';
  const configs = await configControllerGetPublic({
    composable: 'useLazyAsyncData'
  });
  // 提供配置
  provide('siteConfig', configs.data);

  // 构建元数据
  useHead({
    title: configs.data.value?.data?.site_name || 'PicArt',
    titleTemplate: '%s - ' + (configs.data.value?.data?.site_subname || 'PICA PICA'),
    link: [
      {
        rel: 'icon',
        href: configs.data.value?.data?.site_favicon || '/favicon.ico',
        type: 'image/x-icon',
        sizes: '64x64'
      }
    ],
    meta: [
      {
        name: 'keywords',
        content: configs.data.value?.data?.site_keywords || ''
      },
      {
        name: 'description',
        content: configs.data.value?.data?.site_description || ''
      }
    ]
  });
</script>
