import { defineSitemapEventHandler } from '#imports';
import type { SitemapUrl } from '#sitemap/types';

export default defineSitemapEventHandler(async () => {
  const urls: SitemapUrl[] = [];
  console.log('站点地图: 分类模块被调用');

  try {
    const apiBaseUrl = process.env.NUXT_PUBLIC_API_BASE_URL || 'https://picend.cosfan.cc/api/v1';

    const response = await $fetch<{
      data: { data: Array<{ id: string; updatedAt?: string; createdAt?: string }> };
    }>(`${apiBaseUrl}/category`, {
      query: { page: 1, limit: 100 }
    });

    if (response?.data?.data) {
      console.log('站点地图: 分类数据成功，数量:', response.data.data.length);
      response.data.data.forEach(category => {
        urls.push({
          loc: `/category/${category.id}`,
          lastmod: category.updatedAt || category.createdAt || new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7,
          _i18nTransform: true
        });
      });
    } else {
      console.log('站点地图: 分类数据为空');
    }

    console.log('站点地图: 分类模块生成 URL 数量:', urls.length);
    return urls;
  } catch (error) {
    console.error('站点地图: 获取分类数据失败:', error);
    return [];
  }
});
