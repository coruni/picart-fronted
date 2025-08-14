# PicArt Frontend

一个专注于SEO渲染和模板渲染的Nuxt.js前端应用，提供完整的SEO优化工具和模板渲染解决方案。

## 🚀 特性

- 🎯 **SEO优化工具** - 完整的SEO优化工具集，包括元数据管理、结构化数据等
- 🎨 **模板渲染工具** - 响应式图片、内容格式化、分页、社交分享等
- 🔧 **TypeScript支持** - 完整的类型定义，提供良好的IDE支持
- 📦 **模块化设计** - 按功能模块组织，易于维护和扩展
- 🚀 **服务端渲染** - 基于Nuxt 3的SSR，提供优秀的SEO性能
- 📱 **响应式图片** - 智能图片处理，支持多种格式和尺寸
- 🔍 **结构化数据** - 支持文章、产品、面包屑等结构化数据

## 部署说明
- .env文件
- 配置环境变量
- app.config.ts
- 配置应用参数
- nuxt.config.ts


## 📁 项目结构

```
picart-frontend/
├── stores/                # Pinia状态管理
│   ├── app.ts            # 应用状态（主题、语言等）
│   └── seo.ts            # SEO状态管理
├── composables/           # 组合式函数
│   ├── useSEO.ts         # SEO优化工具
│   ├── useTemplate.ts    # 模板渲染工具
│   └── useStorage.ts     # 存储管理
├── plugins/               # Nuxt插件
│   ├── http.client.ts    # HTTP客户端插件
│   ├── storage.client.ts # 存储插件
│   └── utils.ts          # 工具函数插件
├── pages/                 # 页面组件
│   └── index.vue         # 首页示例
├── types/                 # TypeScript类型定义
│   └── index.ts          # 基础类型
├── constants/             # 常量定义
│   └── index.ts          # 系统常量
├── examples/              # 使用示例
│   └── seo-template-usage.md # SEO和模板使用指南
└── README.md              # 项目说明
```

## 🛠️ 核心工具

### HTTP客户端
- 自动请求/响应拦截
- Token自动管理
- 错误统一处理
- 文件上传支持
- TypeScript类型支持

### 本地存储
- 过期时间支持
- 自动序列化/反序列化
- 前缀管理
- 存储容量检测

### 数据验证
- 常用验证规则
- 自定义验证器
- 表单验证组合器
- 链式验证支持

### 通用工具
- 防抖/节流函数
- 深拷贝/深合并
- 数组/对象操作
- 字符串处理
- 颜色转换

### 日期处理
- 日期格式化
- 相对时间显示
- 日期范围计算
- 时区转换

### 格式化工具
- 货币格式化
- 手机号格式化
- 数据脱敏
- 代码格式化

## 🎯 组合式函数

### useHttp
HTTP请求管理，支持加载状态、错误处理、分页等功能。

### useStorage
响应式本地存储，自动同步数据变化。

### useAuth
用户认证管理，支持登录、注册、权限检查等。

## 🔧 安装和使用

### 安装依赖
```bash
# 使用 pnpm
pnpm install

# 使用 npm
npm install

# 使用 yarn
yarn install
```

### 开发服务器
```bash
# 启动开发服务器
npm run dev

# 或者
pnpm dev
```

### 构建生产版本
```bash
# 构建应用
npm run build

# 预览构建结果
npm run preview
```

## 📖 使用文档

详细的使用文档请参考 [examples/usage.md](./examples/usage.md)

### 快速开始

```typescript
// 导入工具函数
import { http } from '~/utils/http'
import { setLocal, getLocal } from '~/utils/storage'
import { formatDate } from '~/utils/date'

// HTTP请求
const users = await http.get('/api/users')

// 本地存储
setLocal('theme', 'dark')
const theme = getLocal('theme')

// 日期格式化
const formatted = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
```

### 在组件中使用

```vue
<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="item in data" :key="item.id">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHttp } from '~/composables/useHttp'

const { loading, error, data, get } = useHttp()

// 获取数据
await get('/api/items')
</script>
```

## 🌟 主要特性

### 1. 完整的类型支持
所有工具函数都有完整的TypeScript类型定义，提供良好的IDE智能提示和类型检查。

### 2. 模块化设计
按功能模块组织代码，每个模块都可以独立使用，便于维护和扩展。

### 3. 响应式存储
使用Vue 3的响应式系统，存储数据变化时自动更新UI。

### 4. 统一错误处理
HTTP请求和其他操作都有统一的错误处理机制。

### 5. 插件系统
通过Nuxt插件系统，可以在任何地方访问工具函数。

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 📞 联系方式

如果您有任何问题或建议，请通过以下方式联系我们：

- 提交 Issue
- 发送邮件
- 创建 Discussion

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！
