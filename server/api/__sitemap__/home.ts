export default defineSitemapEventHandler(async event => {
  const baseUrl = 'https://www.picart.cc';

  const sitemap = [];

  // 首页基础URL
  sitemap.push({
    loc: baseUrl,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: 1.0
  });

  // 不同tab的首页
  const tabs = ['all', 'popular', 'latest', 'following'];
  tabs.forEach(tab => {
    sitemap.push({
      loc: `${baseUrl}/?tab=${tab}`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9
    });
  });

  // 为每个tab生成前几页的URL（爬虫友好的分页）
  const maxPages = 10; // 为每个tab生成前10页的URL
  tabs.forEach(tab => {
    for (let page = 2; page <= maxPages; page++) {
      sitemap.push({
        loc: `${baseUrl}/?tab=${tab}&page=${page}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.8 - page * 0.05 // 页码越大，优先级越低
      });
    }
  });

  return sitemap;
});
