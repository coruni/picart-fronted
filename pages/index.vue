<template>
  <div class="home-page">
    <!-- 页面头部 -->
    <header class="hero-section">
      <div class="container">
        <h1 class="hero-title">{{ pageData.title }}</h1>
        <p class="hero-description">{{ pageData.description }}</p>
        
        <!-- 响应式图片示例 -->
        <div class="hero-image">
          <img 
            :src="getResponsiveImage('/images/hero.jpg', { width: 800, height: 400 })"
            :srcset="getImageSrcSet('/images/hero.jpg')"
            sizes="(max-width: 768px) 100vw, 800px"
            alt="PicArt 专业图片处理平台"
            loading="lazy"
          />
        </div>
      </div>
    </header>

    <!-- 功能特性 -->
    <section class="features-section">
      <div class="container">
        <h2>核心功能</h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.id" class="feature-card">
            <div class="feature-icon">
              <img 
                :src="getResponsiveImage(feature.icon, { width: 64, height: 64 })"
                :alt="feature.title"
                loading="lazy"
              />
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ formatContent(feature.description, { maxLength: 100 }) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 面包屑导航 -->
    <nav class="breadcrumb-nav">
      <div class="container">
        <ol class="breadcrumb">
          <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
            <NuxtLink v-if="crumb.path && index < breadcrumbs.length - 1" :to="crumb.path">
              {{ crumb.name }}
            </NuxtLink>
            <span v-else>{{ crumb.name }}</span>
          </li>
        </ol>
      </div>
    </nav>

    <!-- 社交分享 -->
    <div class="social-share">
      <h3>分享到</h3>
      <div class="share-buttons">
        <a 
          v-for="(url, platform) in socialLinks" 
          :key="platform"
          :href="url"
          :title="`分享到${platform}`"
          target="_blank"
          rel="noopener noreferrer"
          class="share-button"
        >
          {{ platform }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面数据
const pageData = {
  title: 'PicArt - 专业图片处理平台',
  description: '提供专业的图片编辑、滤镜、压缩等功能，让您的图片处理更简单高效',
  keywords: '图片处理,图片编辑,在线PS,图片压缩,图片滤镜',
  image: '/images/hero.jpg'
}

// 功能特性数据
const features = [
  {
    id: 1,
    title: '图片编辑',
    description: '提供专业的图片编辑功能，包括裁剪、旋转、调色等基础操作',
    icon: '/icons/edit.svg'
  },
  {
    id: 2,
    title: '滤镜效果',
    description: '丰富的滤镜效果库，让您的图片更加生动有趣',
    icon: '/icons/filter.svg'
  },
  {
    id: 3,
    title: '图片压缩',
    description: '智能图片压缩技术，在保持质量的同时大幅减少文件大小',
    icon: '/icons/compress.svg'
  }
]

// 使用SEO组合式函数
const { setSEO, setBreadcrumb, setStructuredData } = useSEO()

// 使用模板渲染函数
const { 
  formatContent, 
  getResponsiveImage, 
  getImageSrcSet, 
  generateBreadcrumbs, 
  getSocialShareLinks 
} = useTemplate()

// 当前路由
const route = useRoute()

// 生成面包屑导航
const breadcrumbs = generateBreadcrumbs(route)

// 生成社交分享链接
const socialLinks = getSocialShareLinks({
        url: `${import.meta.env.NUXT_PUBLIC_SITE_URL || 'https://picart.com'}${route.path}`,
  title: pageData.title,
  description: pageData.description,
  image: pageData.image
})

// 设置页面SEO
setSEO({
  title: pageData.title,
  description: pageData.description,
  keywords: pageData.keywords,
  image: pageData.image,
        url: `${import.meta.env.NUXT_PUBLIC_SITE_URL || 'https://picart.com'}${route.path}`
})

// 设置面包屑导航
setBreadcrumb(breadcrumbs.map(crumb => ({
  name: crumb.name,
  url: crumb.path
})))

// 设置结构化数据
setStructuredData({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PicArt',
  description: pageData.description,
        url: import.meta.env.NUXT_PUBLIC_SITE_URL || 'https://picart.com',
  potentialAction: {
    '@type': 'SearchAction',
          target: `${import.meta.env.NUXT_PUBLIC_SITE_URL || 'https://picart.com'}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-image {
  max-width: 800px;
  margin: 0 auto;
}

.hero-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.features-section {
  padding: 4rem 0;
  background: #f8f9fa;
}

.features-section h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.feature-icon {
  margin-bottom: 1rem;
}

.feature-icon img {
  width: 64px;
  height: 64px;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.breadcrumb-nav {
  padding: 1rem 0;
  background: #e9ecef;
}

.breadcrumb {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-item:not(:last-child)::after {
  content: '/';
  margin: 0 0.5rem;
  color: #6c757d;
}

.breadcrumb-item a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

.social-share {
  padding: 2rem 0;
  text-align: center;
}

.social-share h3 {
  margin-bottom: 1rem;
  color: #333;
}

.share-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.share-button {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.share-button:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style> 