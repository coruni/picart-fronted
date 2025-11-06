export default defineAppConfig({
  apiBaseUrl: 'https://api.cosfan.cc/api/v1',
  // Clarity 统计 ID
  clarityId: 'sw54hoqei8',

  // SEO 长尾关键词配置
  seo: {
    // 长尾关键词配置
    longTailKeywords: [
      '高清图片下载',
      '免费图片素材',
      '摄影技巧分享',
      '创意设计灵感',
      '图片社交平台',
      '唯美图片欣赏'
    ],
    // 首页关键词
    homeKeywords: '图片社区,摄影作品,设计灵感,高清图片,创意分享',
    // 作者页关键词
    authorPageKeywords: '摄影师,设计师,艺术家,创作者,作品展示',
    // 文章页关键词
    articlePageKeywords: '摄影教程,设计文章,创作心得,图片故事,技巧分享'
  },
  ui: {
    colors: {
      primary: 'indigo'
    },
    button: {
      variants: {}
    },
    close: 'cursor-pointer',
    icons: {
      arrowLeft: 'mynaui:arrow-left',
      arrowRight: 'mynaui:arrow-right',
      check: 'mynaui:check',
      chevronDoubleLeft: 'mynaui:chevron-double-left',
      chevronDoubleRight: 'mynaui:chevron-double-right',
      chevronDown: 'mynaui:chevron-down',
      chevronLeft: 'mynaui:chevron-left',
      chevronRight: 'mynaui:chevron-right',
      chevronUp: 'mynaui:chevron-up',
      close: 'mynaui:x',
      ellipsis: 'mynaui:dots',
      external: 'mynaui:external-link',
      file: 'mynaui:file',
      folder: 'mynaui:folder',
      folderOpen: 'mynaui:folder-two',
      loading: 'mynaui:circle-notch',
      minus: 'mynaui:minus',
      plus: 'mynaui:plus',
      search: 'mynaui:search',
      upload: 'mynaui:upload'
    }
  },
  icon: {
    mode: 'css',
    cssLayer: 'base'
  }
});
