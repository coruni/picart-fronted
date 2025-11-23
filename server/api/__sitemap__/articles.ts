import { defineSitemapEventHandler } from '#imports';
import type { SitemapUrl } from '#sitemap/types';

export default defineSitemapEventHandler(async () => {
  const urls: SitemapUrl[] = [];

  try {
    const config = useAppConfig();
    const apiBaseUrl = config.apiBaseUrl;

    // 获取文章数据（返回包含data数组的结构）
    const response = await $fetch<{
      data: {
        id: number;
        updatedAt: string;
      }[]; // 文章ID数组
    }>(`${apiBaseUrl}/article/published/ids`);

    if (!response?.data || !Array.isArray(response.data) || response.data.length === 0) {
      return [];
    }

    const articleIds = response.data;
    console.log(articleIds[0]);

    // 处理每个文章ID
    articleIds.forEach(article => {
      // 添加多语言URL
      urls.push({
        loc: `/article/${article.id}`,
        lastmod: article.updatedAt, // 使用文章更新时间作为最后修改时间
        changefreq: 'weekly',
        priority: 0.8
      });
    });

    return urls;
  } catch (error) {
    return [];
  }
});
