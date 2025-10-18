/**
 * 图片缓存优化插件
 * 为 Nuxt Image 提供服务器端缓存策略
 * 注意：缓存头已在 nuxt.config.ts 的 routeRules 中配置
 */
export default defineNuxtPlugin({
  name: 'image-cache'
  // 服务器端缓存策略通过 nuxt.config.ts 的 routeRules 配置
  // 无需在此处添加额外逻辑
});
