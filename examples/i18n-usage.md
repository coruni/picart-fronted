# i18n 国际化使用指南

## 概述

PicArt 项目集成了完整的 i18n 国际化解决方案，支持多语言内容展示、智能语言检测、格式化工具等功能。

## 支持的语言

- 🇨🇳 简体中文 (zh-CN) - 默认语言
- 🇺🇸 英文 (en)
- 🇯🇵 日文 (ja)

## 基础用法

### 1. 在组件中使用翻译

```vue
<template>
  <div>
    <!-- 基础翻译 -->
    <h1>{{ $t('app.title') }}</h1>
    <p>{{ $t('app.description') }}</p>
    
    <!-- 带参数的翻译 -->
    <p>{{ $t('form.validation.minLength', { min: 5 }) }}</p>
    
    <!-- 使用组合式函数 -->
    <button>{{ t('common.submit') }}</button>
  </div>
</template>

<script setup>
const { t } = useI18n()
</script>
```

### 2. 使用语言切换器组件

```vue
<template>
  <div>
    <!-- 基础用法 -->
    <LanguageSwitcher />
    
    <!-- 自定义尺寸 -->
    <LanguageSwitcher size="large" />
    
    <!-- 不显示旗帜 -->
    <LanguageSwitcher :show-flag="false" />
  </div>
</template>
```

### 3. 程序化语言切换

```vue
<script setup>
const { switchLanguage } = useLanguageSwitcher()

// 切换到英文
const switchToEnglish = () => {
  switchLanguage('en')
}

// 切换到日文
const switchToJapanese = () => {
  switchLanguage('ja')
}
</script>
```

## 格式化功能

### 1. 日期格式化

```vue
<template>
  <div>
    <!-- 默认格式 -->
    <p>{{ formatDate(new Date()) }}</p>
    
    <!-- 自定义格式 -->
    <p>{{ formatDate(new Date(), { dateStyle: 'full' }) }}</p>
    <p>{{ formatDate(new Date(), { year: 'numeric', month: 'short' }) }}</p>
  </div>
</template>

<script setup>
const { formatDate } = useI18n()
</script>
```

### 2. 数字格式化

```vue
<template>
  <div>
    <!-- 基础数字格式化 -->
    <p>{{ formatNumber(12345.67) }}</p>
    
    <!-- 百分比格式 -->
    <p>{{ formatNumber(0.1234, { style: 'percent' }) }}</p>
    
    <!-- 科学计数法 -->
    <p>{{ formatNumber(12345, { notation: 'scientific' }) }}</p>
  </div>
</template>

<script setup>
const { formatNumber } = useI18n()
</script>
```

### 3. 货币格式化

```vue
<template>
  <div>
    <!-- 默认货币（根据语言自动选择） -->
    <p>{{ formatCurrency(99.99) }}</p>
    
    <!-- 指定货币 -->
    <p>{{ formatCurrency(99.99, 'USD') }}</p>
    <p>{{ formatCurrency(99.99, 'EUR') }}</p>
  </div>
</template>

<script setup>
const { formatCurrency } = useI18n()
</script>
```

### 4. 相对时间格式化

```vue
<template>
  <div>
    <p>{{ formatRelativeTime(new Date()) }}</p>
    <p>{{ formatRelativeTime(new Date(Date.now() - 3600000)) }}</p>
    <p>{{ formatRelativeTime(new Date(Date.now() - 86400000)) }}</p>
  </div>
</template>

<script setup>
const { formatRelativeTime } = useI18n()
</script>
```

## 表单验证

### 1. 使用验证规则

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <input v-model="email" type="email" />
      <span v-if="errors.email">{{ errors.email }}</span>
    </div>
    
    <div>
      <input v-model="password" type="password" />
      <span v-if="errors.password">{{ errors.password }}</span>
    </div>
    
    <button type="submit">{{ $t('common.submit') }}</button>
  </form>
</template>

<script setup>
const { validationRules } = useFormValidationI18n()

const email = ref('')
const password = ref('')
const errors = reactive({
  email: '',
  password: ''
})

const handleSubmit = () => {
  // 重置错误
  errors.email = ''
  errors.password = ''
  
  // 验证邮箱
  if (!email.value) {
    errors.email = validationRules.required()
  } else if (!isValidEmail(email.value)) {
    errors.email = validationRules.email()
  }
  
  // 验证密码
  if (!password.value) {
    errors.password = validationRules.required()
  } else if (password.value.length < 8) {
    errors.password = validationRules.minLength(8)
  }
}
</script>
```

## 路由国际化

### 1. 生成本地化路径

```vue
<template>
  <div>
    <!-- 当前语言路径 -->
    <NuxtLink :to="localePath('/about')">{{ $t('nav.about') }}</NuxtLink>
    
    <!-- 指定语言路径 -->
    <NuxtLink :to="localePath('/about', 'en')">About (English)</NuxtLink>
  </div>
</template>

<script setup>
const { localePath } = useI18n()
</script>
```

### 2. 语言切换链接

```vue
<template>
  <div>
    <NuxtLink :to="switchLocalePath('en')">English</NuxtLink>
    <NuxtLink :to="switchLocalePath('ja')">日本語</NuxtLink>
  </div>
</template>

<script setup>
const { switchLocalePath } = useI18n()
</script>
```

## 状态管理集成

### 1. 使用应用状态

```vue
<script setup>
const appStore = useAppStore()

// 获取当前语言
const currentLanguage = computed(() => appStore.language)

// 切换语言
const changeLanguage = (locale) => {
  appStore.setLanguage(locale)
}

// 设置格式化选项
const setDateFormat = (format) => {
  appStore.setI18nFormat('date', format)
}
</script>
```

## 添加新语言

### 1. 创建语言文件

在 `locales/` 目录下创建新的语言文件，例如 `fr.json`：

```json
{
  "common": {
    "loading": "Chargement...",
    "error": "Erreur",
    "success": "Succès"
  },
  "nav": {
    "home": "Accueil",
    "about": "À propos"
  }
}
```

### 2. 更新配置

在 `nuxt.config.ts` 中添加新语言：

```typescript
export default defineNuxtConfig({
  i18n: {
    locales: [
      { code: 'zh-CN', name: '简体中文', file: 'zh-CN.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ja', name: '日本語', file: 'ja.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' } // 新增法语
    ]
  }
})
```

### 3. 更新类型定义

在 `types/i18n.d.ts` 中添加新的语言代码：

```typescript
export type LocaleCode = 'zh-CN' | 'en' | 'ja' | 'fr'
```

## 最佳实践

### 1. 翻译键命名规范

```
// 好的命名
app.title
nav.home
form.validation.required
error.404.title

// 不好的命名
title
homeLink
err1
validationError
```

### 2. 使用命名空间

```json
{
  "user": {
    "profile": {
      "title": "用户资料",
      "edit": "编辑资料"
    },
    "settings": {
      "title": "用户设置",
      "save": "保存设置"
    }
  }
}
```

### 3. 参数化翻译

```json
{
  "welcome": "欢迎 {name}！",
  "itemCount": "共 {count} 项",
  "dateRange": "从 {start} 到 {end}"
}
```

### 4. 复数形式处理

```json
{
  "items": {
    "zero": "没有项目",
    "one": "1 个项目",
    "other": "{count} 个项目"
  }
}
```

## 常见问题

### 1. 语言切换后页面没有更新

确保使用了响应式的翻译函数：

```vue
<!-- 正确 -->
<template>
  <h1>{{ $t('app.title') }}</h1>
</template>

<!-- 错误 -->
<template>
  <h1>{{ title }}</h1>
</template>

<script setup>
const { t } = useI18n()
const title = t('app.title') // 不会响应语言变化
</script>
```

### 2. 服务端渲染时语言检测不准确

确保在客户端挂载后再进行语言检测：

```vue
<script setup>
const { locale } = useI18n()

onMounted(() => {
  // 客户端特定的语言检测逻辑
  if (import.meta.client) {
    // 检测用户偏好语言
  }
})
</script>
```

### 3. 格式化函数在服务端报错

使用条件渲染或客户端专用组件：

```vue
<template>
  <div>
    <ClientOnly>
      <span>{{ formatDate(date) }}</span>
      <template #fallback>
        <span>{{ date.toLocaleDateString() }}</span>
      </template>
    </ClientOnly>
  </div>
</template>
```

## 性能优化

### 1. 懒加载语言包

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  i18n: {
    lazy: true,
    langDir: 'locales/',
    defaultLocale: 'zh-CN'
  }
})
```

### 2. 拆分语言包

```
locales/
├── zh-CN/
│   ├── common.json
│   ├── nav.json
│   └── form.json
├── en/
│   ├── common.json
│   ├── nav.json
│   └── form.json
└── ja/
    ├── common.json
    ├── nav.json
    └── form.json
```

### 3. 缓存翻译结果

```vue
<script setup>
const { t } = useI18n()

// 缓存常用翻译
const commonTexts = computed(() => ({
  loading: t('common.loading'),
  error: t('common.error'),
  success: t('common.success')
}))
</script>
```

## 总结

PicArt 的 i18n 系统提供了完整的国际化解决方案，支持多语言内容、智能格式化、SEO优化等功能。通过合理使用这些功能，可以为用户提供优秀的多语言体验。 