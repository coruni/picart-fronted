import { defineSitemapEventHandler } from '#imports';
import type { SitemapUrl } from '#sitemap/types';

export default defineSitemapEventHandler(async () => {
  const urls: SitemapUrl[] = [];
  console.log('站点地图: 作者模块被调用');

  try {
    const config = useAppConfig();
    const apiBaseUrl = config.apiBaseUrl;

    const response = await $fetch<{
      data: { data: Array<{ id: string; updatedAt?: string; createdAt?: string }> };
    }>(`${apiBaseUrl}/user`, {
      query: { page: 1, limit: 100 }
    });

    if (response?.data?.data) {
      console.log('站点地图: 作者数据成功，数量:', response.data.data.length);
      response.data.data.forEach(user => {
        urls.push({
          loc: `/author/${user.id}`,
          lastmod: user.updatedAt || user.createdAt || new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.6,
          _i18nTransform: true
        });
      });
    } else {
      console.log('站点地图: 作者数据为空');
    }

    console.log('站点地图: 作者模块生成 URL 数量:', urls.length);
    return urls;
  } catch (error) {
    console.error('站点地图: 获取作者数据失败:', error);
    return [];
  }
});
