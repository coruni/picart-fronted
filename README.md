# PicArt Frontend

一个基于 Nuxt 3 的现代化内容创作和分享平台前端应用，提供完整的文章管理、用户系统、SEO优化和响应式设计。

## 🚀 主要特性

- 📝 **文章管理系统** - 完整的文章创建、编辑、发布和展示功能
- 👥 **用户系统** - 用户注册、登录、个人资料管理和权限控制
- 🏷️ **标签和分类** - 灵活的内容分类和标签系统
- 💰 **会员系统** - 付费内容、会员订阅和支付集成
- 📊 **数据统计** - 文章浏览、点赞、评论等数据统计
- 🎨 **响应式设计** - 完美适配桌面端和移动端
- 🌍 **国际化支持** - 支持中文、英文、日文多语言
- 🔍 **SEO优化** - 完整的SEO元数据、结构化数据和站点地图
- 📱 **PWA支持** - 渐进式Web应用，支持离线访问
- 🎯 **TypeScript** - 完整的类型定义和类型安全

## 🛠️ 技术栈

- **框架**: Nuxt 3
- **语言**: TypeScript
- **UI组件**: Nuxt UI
- **状态管理**: Pinia
- **样式**: Tailwind CSS
- **图标**: Nuxt Icon
- **HTTP客户端**: OpenAPI TypeScript Client
- **表单验证**: Zod
- **国际化**: Nuxt i18n
- **图片处理**: Nuxt Image

## 📦 安装和配置

### 1. 环境要求

- Node.js 18+ 
- pnpm 8+ (推荐) 或 npm 8+

### 2. 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 3. 环境配置

创建 `.env` 文件并配置以下环境变量：

```env
# API 配置
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NUXT_PUBLIC_API_PREFIX=/api

# 应用配置
NUXT_PUBLIC_APP_NAME=PicArt
NUXT_PUBLIC_APP_DESCRIPTION=一个现代化的内容创作和分享平台
NUXT_PUBLIC_APP_URL=http://localhost:3000

# 文件上传配置
NUXT_PUBLIC_UPLOAD_URL=http://localhost:3001/api/upload

# 支付配置 (可选)
NUXT_PUBLIC_PAYMENT_GATEWAY=stripe
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# 第三方服务配置 (可选)
NUXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
NUXT_PUBLIC_GOOGLE_ADSENSE_ID=your_adsense_id
```

### 4. 应用配置

编辑 `app.config.ts` 文件：

```typescript
export default defineAppConfig({
  title: 'PicArt',
  description: '一个现代化的内容创作和分享平台',
  url: 'http://localhost:3000',
  
  // 主题配置
  theme: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    accent: '#F59E0B'
  },
  
  // 功能开关
  features: {
    comments: true,
    likes: true,
    follows: true,
    payments: true,
    analytics: true
  },
  
  // 分页配置
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100
  },
  
  // 文件上传配置
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    imageQuality: 0.8
  }
})
```

### 5. Nuxt 配置

编辑 `nuxt.config.ts` 文件：

```typescript
export default defineNuxtConfig({
  // 开发工具
  devtools: { enabled: true },
  
  // 模块
  modules: [
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap'
  ],
  
  // UI 配置
  ui: {
    icons: ['mynaui', 'heroicons']
  },
  
  // 国际化配置
  i18n: {
    locales: [
      { code: 'zh', iso: 'zh-CN', name: '中文' },
      { code: 'en', iso: 'en-US', name: 'English' },
      { code: 'ja', iso: 'ja-JP', name: '日本語' }
    ],
    defaultLocale: 'zh',
    strategy: 'prefix_except_default'
  },
  
  // 图片配置
  image: {
    provider: 'ipx',
    quality: 80,
    format: ['webp', 'avif', 'jpeg']
  },
  
  // SEO 配置
  site: {
    url: 'http://localhost:3000'
  },
  
  // 路由配置
  routeRules: {
    '/admin/**': { ssr: false },
    '/user/**': { ssr: false }
  },
  
  // 构建配置
  nitro: {
    compressPublicAssets: true
  }
})
```

## 🏗️ 项目结构

```
picart-frontend/
├── api/                    # API 客户端和类型定义
│   ├── client/            # API 客户端配置
│   ├── core/              # 核心 API 功能
│   ├── client.gen.ts      # 生成的客户端
│   ├── sdk.gen.ts         # 生成的 SDK
│   └── types.gen.ts       # 生成的类型定义
├── assets/                 # 静态资源
│   └── css/               # 全局样式
├── components/             # 可复用组件
│   ├── Advertisement.vue  # 广告组件
│   ├── CommentItem.vue    # 评论组件
│   ├── CommonArticleCard.vue # 文章卡片组件
│   └── ...                # 其他组件
├── composables/            # 组合式函数
│   ├── useAdvertisement.ts # 广告相关
│   └── useI18n.ts         # 国际化相关
├── constants/              # 常量定义
├── i18n/                   # 国际化文件
│   └── locales/           # 语言文件
├── layouts/                # 布局组件
│   ├── default.vue        # 默认布局
│   └── dashboard.vue      # 仪表板布局
├── middleware/             # 中间件
│   └── auth.global.ts     # 全局认证中间件
├── pages/                  # 页面组件
│   ├── admin/             # 管理员页面
│   ├── article/           # 文章页面
│   ├── user/              # 用户页面
│   └── ...                # 其他页面
├── plugins/                # Nuxt 插件
├── public/                 # 公共静态文件
│   └── tinymce/           # 富文本编辑器
├── server/                 # 服务端 API
│   └── api/               # API 路由
├── stores/                 # Pinia 状态管理
│   ├── app.ts             # 应用状态
│   └── user.ts            # 用户状态
├── types/                  # TypeScript 类型定义
├── utils/                  # 工具函数
├── app.config.ts          # 应用配置
├── nuxt.config.ts         # Nuxt 配置
├── openapi.json           # OpenAPI 规范
└── package.json           # 项目依赖
```

## 🚀 开发指南

### 启动开发服务器

```bash
# 开发模式
pnpm dev

# 或指定端口
pnpm dev --port 3000
```

### 构建和部署

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 生成静态站点
pnpm generate
```

### 代码规范

```bash
# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm type-check
```

## 📱 功能模块

### 文章系统
- 文章创建、编辑、发布
- 富文本编辑器 (TinyMCE)
- 图片上传和管理
- 标签和分类管理
- 文章预览和发布

### 用户系统
- 用户注册和登录
- 个人资料管理
- 用户权限控制
- 关注和粉丝系统
- 用户文章管理

### 内容管理
- 标签管理
- 分类管理
- 文章审核
- 内容统计
- 用户管理

### 会员系统
- 付费内容
- 会员订阅
- 支付集成
- 内容限制
- 会员权益

### 互动功能
- 文章点赞
- 评论系统
- 用户关注
- 内容分享
- 数据统计

## 🔧 核心功能

### 1. 认证系统
- JWT Token 管理
- 自动登录状态检查
- 路由权限控制
- 用户信息管理

### 2. 文件上传
- 图片上传和压缩
- 文件类型验证
- 上传进度显示
- 图片预览功能

### 3. 富文本编辑
- TinyMCE 集成
- 图片插入
- 代码高亮
- 表格支持

### 4. 响应式设计
- 移动端适配
- 桌面端优化
- 触摸友好
- 性能优化

### 5. SEO 优化
- 动态元数据
- 结构化数据
- 站点地图
- 面包屑导航

## 🌍 国际化

支持中文、英文、日文三种语言：

```typescript
// 切换语言
const { locale } = useI18n()
locale.value = 'en'

// 使用翻译
const { t } = useI18n()
t('common.loading')
```

## 📊 状态管理

使用 Pinia 进行状态管理：

```typescript
// 用户状态
const userStore = useUserStore()
const { currentUser, isLoggedIn } = storeToRefs(userStore)

// 应用状态
const appStore = useAppStore()
const { theme, language } = storeToRefs(appStore)
```

## 🔌 API 集成

基于 OpenAPI 规范的自动生成客户端：

```typescript
// 文章相关 API
const { data: article } = await articleControllerFindOne({
  composable: 'useFetch',
  path: { id: '123' }
})

// 用户相关 API
const { data: user } = await userControllerFindOne({
  composable: 'useFetch',
  path: { id: '456' }
})
```

## 🎨 主题定制

支持深色模式和主题定制：

```typescript
// 切换主题
const { toggleTheme } = useTheme()
toggleTheme()

// 自定义主题
const theme = {
  primary: '#3B82F6',
  secondary: '#6B7280',
  accent: '#F59E0B'
}
```

## 📈 性能优化

- 图片懒加载和优化
- 组件懒加载
- 代码分割
- 缓存策略
- CDN 支持

## 🔒 安全特性

- XSS 防护
- CSRF 保护
- 输入验证
- 权限控制
- 数据加密

## 🧪 测试

```bash
# 单元测试
pnpm test

# E2E 测试
pnpm test:e2e

# 测试覆盖率
pnpm test:coverage
```

## 📦 部署

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 静态部署

```bash
# 生成静态文件
pnpm generate

# 部署到 CDN
pnpm deploy
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 📞 支持

如果您有任何问题或建议，请通过以下方式联系我们：

- 提交 [Issue](../../issues)
- 创建 [Discussion](../../discussions)
- 发送邮件

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！
