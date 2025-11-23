export default defineEventHandler(async event => {
  try {
    // 统一设置请求超时处理为15秒
    const timeout = setTimeout(() => {
      if (!event.node.res.headersSent) {
        event.node.res.statusCode = 504;
        event.node.res.end('Gateway Timeout');
      }
    }, 60000); // 60秒超时

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
    setHeader(event, 'Keep-Alive', 'timeout=15, max=30');
    setHeader(event, 'X-Request-ID', Date.now().toString());

    // 统一设置请求超时为15秒，避免冲突
    event.node.req.setTimeout(15000, () => {
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
