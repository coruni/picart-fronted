/**
 * 安全 HTTP 头插件
 * 为所有响应添加安全相关的 HTTP 头
 */
export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // 添加安全相关的 HTTP 头
    event.node.res.setHeader('X-Content-Type-Options', 'nosniff');
    event.node.res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    event.node.res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 移除不必要的头
    event.node.res.removeHeader('X-Powered-By');
  });
});
