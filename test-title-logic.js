// 测试标题逻辑
const testTitleLogic = () => {
  const siteName = 'PicArt';
  const siteSubtitle = '图片分享社区';
  
  // 测试首页标题
  const homeTitle = siteSubtitle ? `${siteName} - ${siteSubtitle}` : siteName;
  console.log('首页标题:', homeTitle); // 应该输出: PicArt - 图片分享社区
  
  // 测试其他页面标题模板
  const titleTemplate = `%s - ${siteName}`;
  console.log('其他页面标题模板:', titleTemplate); // 应该输出: %s - PicArt
  
  // 测试文章页面标题
  const articleTitle = '如何制作精美图片';
  const finalArticleTitle = titleTemplate.replace('%s', articleTitle);
  console.log('文章页面标题:', finalArticleTitle); // 应该输出: 如何制作精美图片 - PicArt
};

testTitleLogic();

