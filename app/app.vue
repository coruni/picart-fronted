<template>
  <UApp>
    <NuxtLoadingIndicator color="#615fff" />
    <NuxtLayout>
      <KeepAlive :max="10" :include="keepAliveInclude">
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

  // 全局结构化数据 (JSON-LD) - 网站信息
  const siteConfig = configs.data.value?.data;
  const siteUrl = process.env.NUXT_SITE_URL || 'https://www.example.com';

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteConfig?.site_name || 'PicArt',
          description: siteConfig?.site_description || '图片分享社区',
          url: siteUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteUrl}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        })
      },
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: siteConfig?.site_name || 'PicArt',
          description: siteConfig?.site_description || '图片分享社区',
          url: siteUrl,
          logo: {
            '@type': 'ImageObject',
            url: siteConfig?.site_logo || '/favicon.ico'
          },
          sameAs: [] // 可以添加社交媒体链接
        })
      }
    ]
  });

  // 控制台欢迎信息
  if (import.meta.client) {
    console.log(
      '%c ____    _             _             _   \n' +
        '%c|  _ \\  (_)   ___     / \\     _ __  | |_ \n' +
        "%c| |_) | | |  / __|   / _ \\   | '__| | __|\n" +
        '%c|  __/  | | | (__   / ___ \\  | |    | |_ \n' +
        '%c|_|     |_|  \\___| /_/   \\_\\ |_|     \\__|\n' +
        '%c                                          \n\n' +
        '%cGitHub: https://github.com/coruni/picart-fronted',
      'color: #615fff; font-size: 14px; font-weight: bold;',
      'color: #615fff; font-size: 14px; font-weight: bold;',
      'color: #615fff; font-size: 14px; font-weight: bold;',
      'color: #615fff; font-size: 14px; font-weight: bold;',
      'color: #615fff; font-size: 14px; font-weight: bold;',
      'color: #615fff; font-size: 14px; font-weight: bold;',
      'color: #615fff; font-size: 14px; font-weight: bold;'
    );
  }
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
