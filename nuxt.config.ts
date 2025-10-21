// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-08-08',
  devtools: {
    enabled: process.env.NUXT_DEVTOOLS_ENABLED !== 'false'
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n',
    'nuxt-swiper',
    '@nuxt/ui',
    '@nuxtjs/seo',
    '@nuxtjs/color-mode'
  ],

  // 性能优化
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    defaults: {
      nuxtLink: {
        // 禁用自动预取，只在用户真正需要时加载
        prefetchOn: {
          interaction: false // 不预取
        }
      }
    }
  },
  features: {
    inlineStyles: true
  },
  // Nuxt UI 配置
  ui: {
    fonts: false
  },

  // 构建优化
  build: {
    transpile: ['vue-i18n']
  },

  // SEO 配置
  // 使用 NUXT_SITE_* 环境变量（Nuxt SEO 模块会自动读取）
  site: {
    url: process.env.NUXT_SITE_URL || 'https://www.example.com',
    name: process.env.NUXT_SITE_NAME || 'PicArt',
    description: process.env.NUXT_SITE_DESCRIPTION || '图片分享社区',
    defaultLocale: process.env.NUXT_SITE_DEFAULT_LOCALE || 'zh',
    exclude: ['/admin/**', '/user/**'],
    autoLastmod: true
  },
  icon: {
    serverBundle: {
      collections: ['mynaui']
    },
    // 只使用 mynaui 图标集合
    collections: ['mynaui']
  },

  // Robots 配置
  robots: {
    disallow: ['/admin/*', '/user/*'],
    allow: [
      '/',
      '/article',
      '/author',
      '/category',
      '/tags',
      '/tag',
      '/search',
      '/user/login',
      '/user/register',
      '/user/forgot-password'
    ],
    sitemap: [
      `${process.env.NUXT_SITE_URL || 'https://www.example.com'}/sitemap_index.xml`,
      `${process.env.NUXT_SITE_URL || 'https://www.example.com'}/sitemap_articles.xml`,
      `${process.env.NUXT_SITE_URL || 'https://www.example.com'}/sitemap_categories.xml`
    ]
  },

  sitemap: {
    exclude: ['/admin/**', '/user/**'],
    sitemapsPathPrefix: '/',
    sitemaps: {
      articles: {
        include: ['/article/**'],
        includeAppSources: true,
        sources: ['/api/__sitemap__/articles']
      },
      categories: {
        include: ['/category/**'],
        includeAppSources: true,
        sources: ['/api/__sitemap__/categories']
      }
    }
  },

  // Nuxt Scripts 配置
  // Clarity 将在用户同意分析 Cookie 后通过 useCookieConsent 动态加载
  // 所以这里不需要在 registry 中配置

  image: {
    // 响应式断点配置
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      '2xl': 1536
    },
    // 支持的图片格式（按优先级）
    // 注意：不包含 webp，避免对已经是 webp 格式的图片进行二次优化
    format: ['avif', 'webp'],
    // 图片质量
    quality: 80,
    // 默认图片提供者（使用内置的 ipx）
    provider: 'ipx',
    // 允许的外部域名（如果需要优化外部图片）
    // domains: ['minicdn.cosfan.cc'],
    // 图片加载优化配置
    providerOptions: {
      ipx: {
        // 图片加载超时（毫秒）
        timeout: 10000,
        // 最大并发请求数 - 减少首屏并发
        maxConcurrentRequests: 3,
        // 请求重试次数
        retry: 2,
        // 请求重试延迟（毫秒）
        retryDelay: 500
      }
    },
    // 图片加载策略（默认lazy，但首屏图片会覆盖为eager）
    loading: 'lazy',
    // 启用图片预加载
    preload: true,
    // 图片预设
    presets: {
      // 缩略图预设
      thumbnail: {
        modifiers: {
          format: 'webp',
          width: 200,
          height: 200,
          fit: 'cover',
          quality: 80
        }
      },
      // 卡片图片预设
      card: {
        modifiers: {
          format: 'webp',
          width: 400,
          height: 533,
          fit: 'cover',
          quality: 85
        }
      },
      // 首屏卡片图片预设（高质量）
      firstScreenCard: {
        modifiers: {
          format: 'webp',
          width: 400,
          height: 533,
          fit: 'cover',
          quality: 90
        }
      },
      // 文章封面预设
      articleCover: {
        modifiers: {
          format: 'webp',
          width: 800,
          quality: 85
        }
      },
      // 文章内容图片预设
      articleContent: {
        modifiers: {
          format: 'webp',
          width: 1200,
          quality: 90
        }
      },
      // Banner图片预设
      banner: {
        modifiers: {
          format: 'webp',
          width: 1920,
          height: 480,
          fit: 'cover',
          quality: 90
        }
      }
    }
  },
  // 暗黑模式配置
  colorMode: {
    preference: 'system',
    fallback: 'light',
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storage: 'localStorage',
    storageKey: 'nuxt-color-mode'
  },

  // i18n 国际化配置
  i18n: {
    // 启用优化以提升性能
    bundle: {
      optimizeTranslationDirective: true
    },
    locales: [
      {
        language: 'zh-CN',
        code: 'zh',
        name: '简体中文',
        file: 'zh.json'
      },
      {
        language: 'en-US',
        code: 'en',
        name: 'English',
        file: 'en.json'
      },
      {
        language: 'ja-JP',
        code: 'ja',
        name: '日本語',
        file: 'ja.json'
      }
    ],
    // 默认语言
    defaultLocale: 'zh',
    // 语言文件目录
    langDir: 'locales/',
    // 策略 - 不使用路径前缀
    strategy: 'no_prefix',
    // 检测浏览器语言
    detectBrowserLanguage: {
      useCookie: false, // 禁用 Cookie，改用 localStorage 以符合 GDPR
      fallbackLocale: 'zh',
      alwaysRedirect: false, // 不自动重定向
      redirectOn: 'no prefix' // 只在没有语言前缀时检测
    },
    // 编译优化
    compilation: {
      strictMessage: false,
      escapeHtml: false
    },
    // 路由配置
    routesNameSeparator: '___',
    // 调试模式
    debug: false,
    // 性能优化：懒加载语言文件
    lazy: true,
    // 性能优化：跳过本地化路径生成
    skipSettingLocaleOnNavigate: false
  },

  // 配置CSS
  css: ['~/assets/css/main.css'],
  // 配置环境变量
  runtimeConfig: {
    // 私有配置（仅在服务端可用）
    // 使用 NUXT_ 前缀
    apiSecret: process.env.NUXT_API_SECRET || '',

    // 公共配置（客户端和服务端都可用）
    // 使用 NUXT_PUBLIC_ 前缀
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '',
      appName: 'PicArt',
      appVersion: '1.0.1',
      // TinyMCE 许可证配置
      tinymceLicenseKey: 'gpl'
    }
  },

  // 配置TypeScript
  typescript: {
    strict: true,
    typeCheck: false
  },

  // 配置Nitro
  nitro: {
    // 确保cookie在SSR阶段正确传递
    experimental: {
      wasm: true
    },
    // 缓存优化
    compressPublicAssets: false,
    minify: true,
    // 跨平台兼容性配置
    rollupConfig: {
      treeshake: true
    },
    logLevel: process.env.NODE_ENV === 'development' ? 'warn' : 'error',
    // 性能优化
    timing: false,
    // 减少内存占用
    storage: {
      // 内存缓存（默认）
      cache: {
        driver: 'memory'
      }
    },
    // 静态资源缓存配置
    publicAssets: [
      {
        baseURL: '/',
        maxAge: 60 * 60 * 24 * 365 // 1年
      }
    ]
  },

  // 路由规则配置 - 混合渲染和缓存策略
  routeRules: {
    // ========== 首页优化 ==========
    // 首页 - 使用 ISR 缓存，避免预渲染内存溢出
    '/': {
      isr: 30, // 缩短到30秒，保证内容新鲜度
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=30, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    },
    // ========== 文章页优化 ==========
    // 文章页 - 使用 ISR 缓存，提升加载速度
    '/article/**': {
      isr: 300, // 5分钟更新
      headers: {
        'Cache-Control': 'public, max-age=300, must-revalidate'
      }
    },
    // ========== 分类页优化 ==========
    // 分类页 - 使用 ISR 缓存
    '/category/**': {
      isr: 600, // 10分钟更新
      headers: {
        'Cache-Control': 'public, max-age=600, must-revalidate'
      }
    },
    // ========== 作者页优化 ==========
    // 作者页 - 使用 ISR 缓存
    '/author/**': {
      isr: 600, // 10分钟更新
      headers: {
        'Cache-Control': 'public, max-age=600, must-revalidate'
      }
    },
    // ========== 全局响应头 ==========
    // 所有路由添加安全响应头和压缩支持
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
      }
    },
    // ========== 静态资源缓存 ==========
    // Nuxt Image 优化后的图片 - 长期缓存（1年）
    '/_ipx/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable, s-maxage=31536000',
        'X-Content-Type-Options': 'nosniff'
      }
    },
    // 原始图片资源 - 长期缓存（1年）
    '/images/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    // TinyMCE 编辑器资源 - 长期缓存
    '/tinymce/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    // Favicon - 长期缓存
    '/favicon.ico': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    // Nuxt 构建资源 - 长期缓存
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    },
    // ========== 用户页面 ==========
    // 用户登录/注册页面 - 客户端渲染 + 短期缓存
    '/user/login': {
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate'
      }
    },
    '/user/register': {
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate'
      }
    },
    '/user/forgot-password': {
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate'
      }
    },

    // 用户个人页面 - SSR + 完全不缓存（需要认证）
    '/user/index': {
      // 禁用所有缓存
      prerender: false,
      headers: {
        'Cache-Control': 'private, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    },
    '/user/articles/**': {
      prerender: false,
      headers: {
        'Cache-Control': 'private, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    },
    '/user/messages': {
      prerender: false,
      headers: {
        'Cache-Control': 'private, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    },
    '/user/orders': {
      prerender: false,
      headers: {
        'Cache-Control': 'private, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    },

    // ========== 管理后台 ==========
    // 管理后台 - 客户端渲染 + 完全不缓存
    '/admin/**': {
      prerender: false,
      headers: {
        'Cache-Control': 'private, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    },

    // ========== 其他页面 ==========
    // 维护页面 - 预渲染 + 短期缓存
    '/maintenance': {
      prerender: true,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60'
      }
    }
  },
  future: {
    compatibilityVersion: 4
  },

  // 配置Vite
  vite: {
    optimizeDeps: {
      // 生产环境不预构建，减少首屏加载
      include: process.env.NODE_ENV === 'development' ? ['@vue/devtools-api'] : [],
      // 预构建优化
      exclude: []
    },
    define: {
      __DEV__: process.env.NODE_ENV === 'development'
    },
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true
    },
    css: {
      devSourcemap: true,
      // CSS 压缩和优化
      preprocessorOptions: {
        scss: {
          charset: false
        }
      }
    },
    build: {
      // 提高块大小警告限制
      chunkSizeWarningLimit: 1000,
      // 显示打包进度
      reportCompressedSize: true,
      // 使用 esbuild 压缩（更快）
      minify: 'esbuild',
      // 生产环境不生成 sourcemap
      sourcemap: false,
      // 启用 CSS 代码分割
      cssCodeSplit: true,
      // CSS 压缩
      cssMinify: 'esbuild',
      rollupOptions: {
        treeshake: true,
        onwarn(warning, warn) {
          // 屏蔽特定的弃用警告
          if (
            warning.code === 'DEP0155' ||
            warning.message.includes('trailing slash pattern mapping') ||
            warning.message.includes('exports field module resolution')
          ) {
            return;
          }
          // 屏蔽其他常见的警告
          if (warning.code === 'CIRCULAR_DEPENDENCY' || warning.code === 'UNUSED_EXTERNAL_IMPORT') {
            return;
          }
          // 显示其他警告
          warn(warning);
        },
        output: {
          // 手动代码分割 - 更细粒度分割，按需加载
          manualChunks: id => {
            // 工具库
            if (id.includes('node_modules/lodash-es') || id.includes('node_modules/zod')) {
              return 'utils-vendor';
            }
            // 编辑器相关
            if (id.includes('node_modules/@tinymce') || id.includes('node_modules/tinymce')) {
              return 'editor-vendor';
            }
            // 表格组件
            if (id.includes('node_modules/@tanstack/vue-table')) {
              return 'table-vendor';
            }
            // 瀑布流组件
            if (id.includes('node_modules/vue-waterfall-plugin-next')) {
              return 'waterfall-vendor';
            }
          }
        }
      }
    }
  },

  // 基础应用配置
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#ffffff' }
      ],
      link: [
        { rel: 'dns-prefetch', href: 'https://api.cosfan.cc' },
        { rel: 'preconnect', href: 'https://api.cosfan.cc', crossorigin: '' }
      ]
    },
    pageTransition: true
  },

  // 服务端渲染
  ssr: true
});
