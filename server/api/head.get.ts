export default defineEventHandler(async event => {
  // 设置响应头
  setHeader(event, 'Content-Type', 'text/html; charset=utf-8');
  setHeader(event, 'Cache-Control', 'public, max-age=60');
  setHeader(event, 'Allow', 'GET, HEAD, OPTIONS');

  // 返回简单的 HTML 结构用于 HEAD 请求测试
  return '<!DOCTYPE html><html><head><title>PicArt</title></head><body></body></html>';
});
