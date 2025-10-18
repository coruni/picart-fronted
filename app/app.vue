<template>
  <UApp>
    <NuxtLoadingIndicator color="#615fff" />
    <NuxtLayout>
      <KeepAlive :max="10" :include="keepAliveInclude" :pageey>
        <NuxtPage />
      </KeepAlive>
    </NuxtLayout>
  </UApp>
</template>

<script lang="ts" setup>
  import { configControllerGetPublic } from './api';

  // Keep-alive 配置，使用正则匹配多语言首页路由
  const keepAliveInclude = ref<(string | RegExp)[]>([
    /^index/, // 匹配所有以 index 开头的路由
    'index', // 也包括纯 index
    'index___zh',
    'index___en',
    'index___ja'
  ]);

  const configs = await configControllerGetPublic({
    composable: 'useFetch',
    key: 'siteConfig'
  });
  // 提供配置
  provide('siteConfig', configs.data.value?.data);
  // 提供icon
  useHead({
    link: [{ rel: 'icon', href: configs.data.value?.data?.site_favicon || '/favicon.ico' }]
  });
  // 构建全局元数据和SEO
  useSeoMeta({
    title: configs.data.value?.data?.site_name,
    titleTemplate: '%s - ' + (configs.data.value?.data?.site_name || ''),
    description: configs.data.value?.data?.site_description || '',
    keywords: configs.data.value?.data?.site_keywords || '',
    robots: 'index, follow',
    ogSiteName: configs.data.value?.data?.site_name || '',
    ogLocale: 'zh_CN',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterSite: '@' + (configs.data.value?.data?.site_name || ''),
    twitterCreator: '@' + (configs.data.value?.data?.site_name || ''),
    twitterTitle: configs.data.value?.data?.site_name || '',
    twitterDescription: configs.data.value?.data?.site_description || '',
    twitterImage: configs.data.value?.data?.site_favicon || '/favicon.ico',
    twitterImageAlt: configs.data.value?.data?.site_name || ''
  });
</script>
