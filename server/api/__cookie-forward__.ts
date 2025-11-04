// Nitro Hook: 确保 cookie 在 SSR 请求中被正确转发
export default defineEventHandler(async _event => {
  // 这个文件用于确保 SSR 阶段 cookie 正确传递
  // 不需要实际导出任何内容
});
