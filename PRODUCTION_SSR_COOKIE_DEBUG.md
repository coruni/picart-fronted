# 生产环境 SSR Cookie 转发调试指南

## 问题描述
在开发环境中 SSR cookie 转发正常，但在生产环境中 token 没有被转发到后端 API。

## 已实施的修复

### 1. **优化 Cookie 转发逻辑** (`openapi-runtime.config.ts`)
- ✅ 同时设置小写 `cookie` 和大写 `Cookie` 头（兼容性）
- ✅ 使用 `decodeURIComponent` 正确解码 cookie 值
- ✅ 添加详细的调试日志
- ✅ 添加 Authorization header 验证

### 2. **Nitro 配置优化** (`nuxt.config.ts`)
- ✅ 配置 Nitro 路由规则，允许转发原始请求头
- ✅ 创建 server plugin 确保 cookie 在 SSR 渲染过程中可用

### 3. **调试日志**
启用后会在终端看到：
```
[SSR] Incoming cookies from client: device-id=xxx; auth-token=yyy
[SSR] Found device-id in cookie: xxx
[SSR] Found auth-token in cookie
[SSR] Forwarding cookies to backend API
[SSR] onRequest - deviceId: xxx hasToken: true
[SSR] Headers set: { Device-Id: 'xxx', Authorization: 'Bearer yyy...' }
[SSR] Final Authorization header: Set
```

## 生产环境部署检查清单

### 1. **环境变量**
确保以下环境变量正确设置：
```bash
# .env 或生产环境配置
NUXT_SITE_URL=https://your-domain.com
NUXT_API_BASE_URL=https://api.your-domain.com
NODE_ENV=production
```

### 2. **Cookie 配置**
检查 cookie 设置是否正确：
- ✅ `secure: true` (生产环境必须)
- ✅ `sameSite: 'lax'` 或 `'none'`
- ✅ `httpOnly: false` (前端需要访问)

### 3. **反向代理配置**
如果使用 Nginx/Apache，确保：
```nginx
# Nginx 示例
proxy_pass_header Set-Cookie;
proxy_cookie_path / /;
proxy_set_header Cookie $http_cookie;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Real-IP $remote_addr;
```

### 4. **CORS 配置**
确保后端 API 允许：
- ✅ 来自前端域的请求
- ✅ 携带 credentials (cookies)
- ✅ 正确的 Access-Control-Allow-Origin

### 5. **构建和部署**
```bash
# 清理构建
rm -rf .nuxt .output node_modules/.cache

# 重新构建
pnpm build

# 检查构建产物
ls -la .output/server

# 预览生产构建
pnpm preview
```

## 调试步骤

### 步骤 1: 检查日志
在生产环境运行应用，查看终端日志：
```bash
# 应该看到 SSR 日志
[SSR] Incoming cookies from client: ...
[SSR] Found auth-token in cookie
[SSR] Final Authorization header: Set
```

### 步骤 2: 检查网络请求
在浏览器开发者工具中：
1. 打开 Network 标签
2. 查看 SSR 请求的 Headers
3. 确认 `Cookie` 头存在
4. 查看后端 API 请求的 Headers
5. 确认 `Authorization` 头存在

### 步骤 3: 检查 Cookie
在浏览器开发者工具中：
1. Application → Cookies
2. 确认 `auth-token` 和 `device-id` cookie 存在
3. 检查 cookie 的 Domain 和 Path 是否正确

### 步骤 4: 检查后端日志
在后端服务器查看日志：
- 确认收到带有 `Authorization` 头的请求
- 确认 token 验证通过

## 常见问题

### Q1: 生产环境没有 SSR 日志
**原因**: 日志级别设置为 `error`  
**解决**: 临时修改 `nuxt.config.ts`:
```typescript
logLevel: 'warn' // 或 'info'
```

### Q2: Cookie 被浏览器拦截
**原因**: Secure 标志或 SameSite 配置问题  
**解决**: 检查 cookie 配置，确保 HTTPS 环境

### Q3: Token 存在但后端未收到
**原因**: 反向代理未正确转发 cookie  
**解决**: 配置反向代理转发 `Cookie` 头

### Q4: 开发环境正常，生产环境失败
**原因**: 环境变量或构建配置不同  
**解决**: 
1. 对比开发和生产的环境变量
2. 检查构建产物
3. 确认运行时配置

## 临时调试方案

如果问题依然存在，可以临时启用更详细的日志：

```typescript
// openapi-runtime.config.ts
console.log('[SSR] Full context:', {
  hasEvent: !!event,
  hasCookies: !!cookies,
  tokenLength: token?.length,
  deviceId,
  headers: context.options.headers
});
```

## 联系支持

如果以上步骤都无法解决问题，请提供：
1. 完整的 SSR 日志
2. 浏览器 Network 请求截图
3. 后端 API 日志
4. 部署环境信息（服务器、反向代理等）
