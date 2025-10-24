export default defineEventHandler(async event => {
  try {
    // 设置请求超时处理
    const timeout = setTimeout(() => {
      if (!event.node.res.headersSent) {
        console.warn('Request timeout, closing connection');
        event.node.res.statusCode = 504;
        event.node.res.end('Gateway Timeout');
      }
    }, 30000); // 30秒超时

    // 监听连接关闭
    event.node.req.on('close', () => {
      clearTimeout(timeout);
    });

    // 监听错误
    event.node.req.on('error', error => {
      console.error('Request error:', error);
      clearTimeout(timeout);
    });

    // 监听响应完成
    event.node.res.on('finish', () => {
      clearTimeout(timeout);
    });

    // 监听响应关闭
    event.node.res.on('close', () => {
      clearTimeout(timeout);
    });

    // 设置响应头
    setHeader(event, 'Connection', 'keep-alive');
    setHeader(event, 'Keep-Alive', 'timeout=8, max=30');
    setHeader(event, 'X-Request-ID', Date.now().toString());

    // 设置请求超时
    event.node.req.setTimeout(8000, () => {
      if (!event.node.res.headersSent) {
        event.node.res.statusCode = 408;
        event.node.res.end('Request Timeout');
      }
    });
  } catch (error) {
    console.error('Middleware error:', error);
    if (!event.node.res.headersSent) {
      event.node.res.statusCode = 500;
      event.node.res.end('Internal Server Error');
    }
  }
});
