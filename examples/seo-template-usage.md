# SEO和模板渲染工具使用指南

## 概述

这个工具库专门为Nuxt.js项目设计，专注于SEO优化和模板渲染功能。

## SEO工具 (useSEO)

### 基本用法

```vue
<script setup>
const { setSEO, setBreadcrumb, setStructuredData } = useSEO()

// 设置页面SEO信息
setSEO({
  title: '页面标题',
  description: '页面描述',
  keywords: '关键词1,关键词2',
  image: '/images/page-image.jpg',
  url: 'https://yoursite.com/page'
})
</script>
```

### 结构化数据

```javascript
// 文章页面
setArticleData({
  title: '文章标题',
  description: '文章描述',
  author: '作者名',
  publishDate: '2024-01-01',
  image: '/images/article.jpg',
  url: 'https://yoursite.com/article'
})

// 产品页面
setProductData({
  name: '产品名称',
  description: '产品描述',
  image: '/images/product.jpg',
  price: 99.99,
  currency: 'CNY',
  brand: '品牌名'
})
```

### 面包屑导航

```javascript
setBreadcrumb([
  { name: '首页', url: '/' },
  { name: '分类', url: '/category' },
  { name: '当前页面' }
])
```

## 模板渲染工具 (useTemplate)

### 响应式图片

```vue
<template>
  <img 
    :src="getResponsiveImage('/images/hero.jpg', { width: 800, height: 400 })"
    :srcset="getImageSrcSet('/images/hero.jpg')"
    sizes="(max-width: 768px) 100vw, 800px"
    alt="图片描述"
    loading="lazy"
  />
</template>

<script setup>
const { getResponsiveImage, getImageSrcSet } = useTemplate()
</script>
```

### 内容格式化

```javascript
const { formatContent } = useTemplate()

// 截断文本
const shortText = formatContent(longText, { maxLength: 100 })

// 移除HTML标签
const plainText = formatContent(htmlContent, { stripHtml: true })

// 保留换行符
const formattedText = formatContent(text, { preserveLineBreaks: true })
```

### 日期格式化

```javascript
const { formatDisplayDate } = useTemplate()

// 相对时间
const relativeTime = formatDisplayDate(date, 'relative') // "2小时前"

// 完整格式
const fullDate = formatDisplayDate(date, 'full') // "2024年1月1日 星期一"

// 简短格式
const shortDate = formatDisplayDate(date, 'short') // "2024/1/1"
```

### 分页功能

```javascript
const { generatePagination } = useTemplate()

const pagination = generatePagination(currentPage, totalPages, 5)
// 返回：
// {
//   pages: [{ number: 1, isCurrent: false, path: '' }, ...],
//   hasPrev: true,
//   hasNext: true,
//   prevPath: '?page=1',
//   nextPath: '?page=3'
// }
```

### 社交分享

```javascript
const { getSocialShareLinks } = useTemplate()

const shareLinks = getSocialShareLinks({
  url: 'https://yoursite.com/article',
  title: '文章标题',
  description: '文章描述'
})

// 返回各平台分享链接
console.log(shareLinks.weibo) // 微博分享链接
console.log(shareLinks.wechat) // 微信二维码链接
```

## 插件系统

### 工具函数插件

```javascript
// 在组件中使用
const { $utils } = useNuxtApp()

// 格式化日期
const formattedDate = $utils.formatDate(new Date(), 'YYYY-MM-DD')

// 格式化货币
const price = $utils.formatCurrency(99.99) // ¥99.99

// 截断文本
const shortText = $utils.truncateText(longText, 50)
```

### 存储插件

```javascript
// 在组件中使用
const { $storage } = useNuxtApp()

// 存储数据
$storage.set('user', { name: '用户名', id: 123 })

// 读取数据
const user = $storage.get('user')

// 删除数据
$storage.remove('user')
```

### HTTP客户端插件

```javascript
// 在组件中使用
const { $http } = useNuxtApp()

// GET请求
const data = await $http.get('/api/users', { page: 1, limit: 10 })

// POST请求
const result = await $http.post('/api/users', { name: '新用户' })
```

## 完整页面示例

```vue
<template>
  <div class="article-page">
    <!-- 面包屑导航 -->
    <nav class="breadcrumb">
      <NuxtLink v-for="(crumb, index) in breadcrumbs" 
                :key="index" 
                :to="crumb.path">
        {{ crumb.name }}
      </NuxtLink>
    </nav>

    <!-- 文章内容 -->
    <article>
      <h1>{{ article.title }}</h1>
      <div class="article-meta">
        <time>{{ formatDisplayDate(article.publishDate, 'full') }}</time>
        <span>作者：{{ article.author }}</span>
      </div>
      
      <img 
        :src="getResponsiveImage(article.image, { width: 800 })"
        :srcset="getImageSrcSet(article.image)"
        sizes="(max-width: 768px) 100vw, 800px"
        :alt="article.title"
      />
      
      <div class="content" v-html="processExternalLinks(article.content)"></div>
    </article>

    <!-- 社交分享 -->
    <div class="social-share">
      <a v-for="(url, platform) in socialLinks" 
         :key="platform"
         :href="url" 
         target="_blank">
        分享到{{ platform }}
      </a>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const article = await $fetch(`/api/articles/${route.params.id}`)

// SEO设置
const { setSEO, setBreadcrumb, setArticleData } = useSEO()
const { 
  formatDisplayDate, 
  getResponsiveImage, 
  getImageSrcSet, 
  generateBreadcrumbs, 
  getSocialShareLinks,
  processExternalLinks 
} = useTemplate()

// 设置SEO
setSEO({
  title: article.title,
  description: article.description,
  image: article.image,
  url: `https://yoursite.com${route.path}`
})

// 设置文章结构化数据
setArticleData({
  title: article.title,
  description: article.description,
  author: article.author,
  publishDate: article.publishDate,
  image: article.image,
  url: `https://yoursite.com${route.path}`
})

// 生成面包屑
const breadcrumbs = generateBreadcrumbs(route)
setBreadcrumb(breadcrumbs.map(crumb => ({
  name: crumb.name,
  url: crumb.path
})))

// 生成社交分享链接
const socialLinks = getSocialShareLinks({
  url: `https://yoursite.com${route.path}`,
  title: article.title,
  description: article.description,
  image: article.image
})
</script>
```

## 最佳实践

1. **SEO优化**
   - 每个页面都应该设置独特的title和description
   - 使用结构化数据提高搜索引擎理解
   - 设置合适的面包屑导航

2. **图片优化**
   - 使用响应式图片减少加载时间
   - 设置合适的alt属性
   - 使用lazy loading延迟加载

3. **内容处理**
   - 对用户输入的内容进行安全处理
   - 外部链接添加安全属性
   - 合理截断长文本

4. **性能优化**
   - 使用服务端渲染提高首屏加载速度
   - 合理使用缓存策略
   - 优化图片格式和大小

这个工具库专门为SEO渲染和模板渲染场景设计，提供了完整的解决方案。 