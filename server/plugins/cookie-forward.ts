// Nitro Plugin: 确保 cookie 在 SSR 请求中被正确转发到后端 API
export default defineNitroPlugin(nitroApp => {
  // 这个插件确保在 SSR 阶段，所有 cookie 都会被正确转发
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // 确保 cookie 在 SSR 渲染过程中可用
    if (event?.node?.req?.headers?.cookie) {
      // 将 cookie 添加到 context 中，供后续使用
      event.context.cookies = event.node.req.headers.cookie;
    }
  });
});
