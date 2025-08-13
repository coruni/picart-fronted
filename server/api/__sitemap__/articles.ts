import { defineSitemapEventHandler } from '#imports';
import type { SitemapUrl } from '#sitemap/types';

export default defineSitemapEventHandler(async () => {
  const urls: SitemapUrl[] = [];

  try {
    const apiBaseUrl = process.env.NUXT_PUBLIC_API_BASE_URL || 'https://picend.cosfan.cc/api/v1';
    const limit = 100;

    // 首先获取第一页来了解总数据量
    const firstPage = await $fetch<{
      data: {
        data: Array<{ id: string; updatedAt?: string; createdAt?: string; images: string[] }>;
        meta?: {
          total: number;
          totalPages: number;
        };
      };
    }>(`${apiBaseUrl}/article`, {
      query: { page: 1, limit }
    });

    if (!firstPage?.data?.data) {
      return [];
    }

    // 处理第一页数据
    firstPage.data.data.forEach(article => {
      urls.push({
        loc: `/article/${article.id}`,
        lastmod: article.updatedAt || article.createdAt || new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
        _sitemap: 'articles',
        _i18nTransform: true
      });
    });

    // 如果有分页信息，并行获取剩余页面
    if (firstPage.data.meta && firstPage.data.meta.totalPages > 1) {
      const totalPages = firstPage.data.meta.totalPages;
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);

      console.log(`需要获取额外 ${remainingPages.length} 页数据`);

      // 并行获取所有剩余页面
      const remainingPromises = remainingPages.map(page =>
        $fetch<{
          data: {
            data: Array<{ id: string; updatedAt?: string; createdAt?: string; images: string[] }>;
          };
        }>(`${apiBaseUrl}/article`, {
          query: { page, limit }
        }).catch(error => {
          console.error(`获取第 ${page} 页失败:`, error);
          return null;
        })
      );

      const remainingResults = await Promise.all(remainingPromises);

      // 处理并行获取的数据
      remainingResults.forEach((response, index) => {
        if (response?.data?.data) {
          response.data.data.forEach(article => {
            urls.push({
              loc: `/article/${article.id}`,
              lastmod: article.updatedAt || article.createdAt || new Date().toISOString(),
              images: article.images.map(image => ({
                loc: image,
                title: '图片'
              })),
              changefreq: 'weekly',
              priority: 0.8,
              _sitemap: 'articles',
              _i18nTransform: true
            });
          });
        }
      });
    }

    console.log(`文章数据获取完成，总数: ${urls.length}`);
    return urls;
  } catch (error) {
    console.error('获取文章数据失败:', error);
    return [];
  }
});
