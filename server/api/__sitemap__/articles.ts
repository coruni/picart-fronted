import { defineSitemapEventHandler } from '#imports';
import type { SitemapUrl } from '#sitemap/types';

export default defineSitemapEventHandler(async () => {
  const urls: SitemapUrl[] = [];

  try {
    const config = useAppConfig();
    const apiBaseUrl = config.apiBaseUrl;

    // 获取文章数据（返回包含data数组的结构）
    const response = await $fetch<{
      data: number[]; // 文章ID数组
    }>(`${apiBaseUrl}/article/published/ids`);

    if (!response?.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.log('没有获取到文章数据');
      return [];
    }

    const articleIds = response.data;
    console.log(`获取到 ${articleIds.length} 个文章ID`);

    // 处理每个文章ID
    articleIds.forEach(articleId => {
      // 添加多语言URL
      urls.push({
        loc: `/article/${articleId}`,
        lastmod: new Date().toISOString(), // 使用当前时间作为最后修改时间
        changefreq: 'weekly',
        priority: 0.8
      });
    });

    console.log(`文章数据获取完成，总数: ${urls.length}`);
    return urls;
  } catch (error) {
    console.error('获取文章数据失败:', error);
    return [];
  }
});
