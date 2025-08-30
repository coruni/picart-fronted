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
  provide('siteConfig', configs.data.value?.data);

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

  // 监听路由变化，为首页设置特殊的标题格式
  const route = useRoute();
  watch(
    () => route.path,
    newPath => {
      if (newPath === '/' || newPath === '/zh' || newPath === '/en' || newPath === '/ja') {
        // 首页：显示 name - subtitle 格式
        const siteName = configs.data.value?.data?.site_name || '';
        const siteSubtitle = configs.data.value?.data?.site_subtitle || '';
        const homeTitle = siteSubtitle ? `${siteName} - ${siteSubtitle}` : siteName;

        useSeoMeta({
          title: homeTitle,
          titleTemplate: undefined // 首页不使用模板
        });
      } else {
        // 其他页面：使用默认的 titleTemplate
        useSeoMeta({
          title: undefined,
          titleTemplate: '%s - ' + (configs.data.value?.data?.site_name || '')
        });
      }
    },
    { immediate: true }
  );
</script>
