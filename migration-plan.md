# PicArt 项目迁移到 Next.js 计划

## 📋 迁移概览

### 当前技术栈 (Nuxt.js)
- **框架**: Nuxt 4 + Vue 3
- **UI库**: @nuxt/ui (基于 Tailwind CSS)
- **状态管理**: Pinia
- **国际化**: @nuxtjs/i18n
- **图片优化**: @nuxt/image
- **SEO**: @nuxtjs/seo
- **图标**: @nuxt/icon

### 目标技术栈 (Next.js)
- **框架**: Next.js 14 + React 18
- **UI库**: shadcn/ui + Tailwind CSS
- **状态管理**: Zustand 或 Redux Toolkit
- **国际化**: next-intl
- **图片优化**: next/image
- **SEO**: next-seo
- **图标**: Lucide React

## 🗂️ 文件结构对比

### Nuxt.js 结构
```
app/
├── components/          # Vue 组件
├── pages/              # 页面路由
├── layouts/            # 布局组件
├── composables/        # Vue 组合式函数
├── stores/             # Pinia 状态管理
├── utils/              # 工具函数
├── types/              # TypeScript 类型
└── assets/             # 静态资源
```

### Next.js 结构
```
src/
├── app/                # App Router (Next.js 13+)
│   ├── (auth)/         # 路由组
│   ├── admin/          # 管理后台
│   ├── article/        # 文章页面
│   └── globals.css     # 全局样式
├── components/         # React 组件
│   ├── ui/             # UI 组件
│   └── common/         # 通用组件
├── lib/                # 工具库
├── hooks/              # React Hooks
├── store/              # 状态管理
├── types/              # TypeScript 类型
└── public/             # 静态资源
```

## 🔄 核心功能迁移

### 1. 路由系统
```typescript
// Nuxt.js (文件系统路由)
pages/
├── index.vue
├── article/[id].vue
└── admin/articles/index.vue

// Next.js (App Router)
app/
├── page.tsx
├── article/[id]/page.tsx
└── admin/articles/page.tsx
```

### 2. 组件迁移
```typescript
// Vue 组件 → React 组件
// Vue: <template> + <script setup>
// React: JSX + Hooks
```

### 3. 状态管理
```typescript
// Pinia → Zustand
// Vue: useUserStore()
// React: useUserStore()
```

### 4. 国际化
```typescript
// @nuxtjs/i18n → next-intl
// Vue: $t('key')
// React: useTranslations('key')
```

## 📦 依赖包迁移对照表

| 功能 | Nuxt.js | Next.js |
|------|---------|---------|
| 框架 | nuxt | next |
| UI库 | @nuxt/ui | shadcn/ui |
| 状态管理 | pinia | zustand |
| 国际化 | @nuxtjs/i18n | next-intl |
| 图片优化 | @nuxt/image | next/image |
| 图标 | @nuxt/icon | lucide-react |
| 表单 | @nuxt/ui | react-hook-form |
| 表格 | @tanstack/vue-table | @tanstack/react-table |

## 🚧 迁移工作量评估

### 高工作量 (需要重写)
- [ ] 所有 Vue 组件 → React 组件
- [ ] 路由系统重构
- [ ] 状态管理迁移
- [ ] 国际化配置
- [ ] API 集成适配

### 中等工作量 (需要适配)
- [ ] 样式系统 (Tailwind CSS 保持不变)
- [ ] 类型定义 (大部分可复用)
- [ ] 工具函数 (大部分可复用)
- [ ] 图片优化配置

### 低工作量 (可直接复用)
- [ ] 静态资源
- [ ] 配置文件
- [ ] 环境变量
- [ ] Docker 配置

## ⏱️ 预估时间

- **小型项目**: 2-4 周
- **中型项目**: 1-2 个月  
- **大型项目**: 2-3 个月
- **您的项目**: 2-3 个月 (复杂度和功能丰富)

## 💡 建议

### 推荐方案: 渐进式迁移
1. **第一阶段**: 创建 Next.js 项目，迁移首页和基础组件
2. **第二阶段**: 迁移文章页面和用户系统
3. **第三阶段**: 迁移管理后台
4. **第四阶段**: 优化和测试

### 风险控制
- 保持现有项目运行
- 使用子域名或路径前缀区分
- 逐步切换流量
- 保留回滚方案

## 🎯 下一步行动

1. 确认迁移方案
2. 创建 Next.js 项目结构
3. 开始核心组件迁移
4. 建立 CI/CD 流程
5. 逐步切换功能模块
