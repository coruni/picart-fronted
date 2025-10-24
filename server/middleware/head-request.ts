export default defineEventHandler(async event => {
  try {
    // 处理 HEAD 请求
    if (event.node.req.method === 'HEAD') {
      // 设置正确的响应头
      setHeader(event, 'Content-Type', 'text/html; charset=utf-8');
      setHeader(event, 'Cache-Control', 'public, max-age=60');
      setHeader(event, 'Allow', 'GET, HEAD, OPTIONS');
      setHeader(event, 'Connection', 'keep-alive');

      // 对于 HEAD 请求，只返回头部信息，不返回内容
      event.node.res.statusCode = 200;
      event.node.res.end();
      return;
    }

    // 处理 OPTIONS 请求
    if (event.node.req.method === 'OPTIONS') {
      setHeader(event, 'Allow', 'GET, HEAD, OPTIONS');
      setHeader(event, 'Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type');
      setHeader(event, 'Connection', 'keep-alive');

      event.node.res.statusCode = 200;
      event.node.res.end();
      return;
    }
  } catch (error) {
    console.error('HEAD request error:', error);
    // 确保连接正确关闭
    if (!event.node.res.headersSent) {
      event.node.res.statusCode = 500;
      event.node.res.end();
    }
  }
});
