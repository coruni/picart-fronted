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
    'nuxt-easy-lightbox',
    '@nuxtjs/seo',
    '@nuxtjs/color-mode'
  ],

  // 性能优化
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    defaults: {
      nuxtLink: {
        // 在交互时预取（点击、悬停等），减少初始加载时间
        prefetchOn: {
          interaction: true
        }
      }
    }
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
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      '2xl': 1536
    },
    format: ['webp', 'jpg', 'png', 'avif']
    // provider: 'weserv',
    // domains: ['minicdn.cosfan.cc'],
    // weserv: {
    //   baseURL: 'https://www.example.com',
    //   weservURL: 'https://www.example.com',
    //   modifiers: {
    //     quality: 80,
    //     fit: 'cover',
    //     format: 'webp'
    //   }
    // }
  },
  features: {
    inlineStyles: false
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
    // 策略
    strategy: 'prefix_except_default',
    // 检测浏览器语言
    detectBrowserLanguage: {
      useCookie: false, // 禁用 Cookie，改用 localStorage 以符合 GDPR
      fallbackLocale: 'zh',
      alwaysRedirect: true,
      redirectOn: 'all'
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
    apiSecret: '',

    // 公共配置（客户端和服务端都可用）
    // 使用 NUXT_PUBLIC_ 前缀
    public: {
      apiBaseUrl: '',
      appName: 'PicArt',
      appVersion: '1.0.1',
      // TinyMCE 许可证配置
      tinymceLicenseKey: 'gpl',
      // Nuxt Scripts 配置
      scripts: {
        clarity: {
          id: ''
        }
      }
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
    compressPublicAssets: true,
    minify: true,
    // 跨平台兼容性配置
    preset: process.env.NITRO_PRESET || 'node_cluster',
    logLevel: process.env.NODE_ENV === 'development' ? 'warn' : 'error',
    // 静态资源缓存配置
    publicAssets: [
      {
        baseURL: '/',
        maxAge: 60 * 60 * 24 * 365 // 1年
      }
    ],
    // 服务端缓存配置
    storage: {
      redis: {
        driver: 'redis'
        // Redis 连接配置（可选，如果使用 Redis）
        // host: process.env.REDIS_HOST || 'localhost',
        // port: parseInt(process.env.REDIS_PORT || '6379'),
        // password: process.env.REDIS_PASSWORD
      },
      // 内存缓存（默认）
      cache: {
        driver: 'memory'
      }
    }
  },

  // 路由规则配置 - 混合渲染和缓存策略
  routeRules: {
    // ========== 全局响应头 ==========
    // 所有路由添加安全响应头
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
    // 图片资源 - 长期缓存（1年）
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
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate'
      }
    },
    '/user/register': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate'
      }
    },
    '/user/forgot-password': {
      ssr: false,
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate'
      }
    },

    // 用户个人页面 - SSR + 完全不缓存（需要认证）
    '/user/index': {
      ssr: true,
      // 禁用所有缓存
      prerender: false,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    },
    '/user/articles/**': {
      ssr: true,
      prerender: false,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    },
    '/user/messages': {
      ssr: true,
      prerender: false,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    },
    '/user/orders': {
      ssr: true,
      prerender: false,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    },

    // ========== 管理后台 ==========
    // 管理后台 - 客户端渲染 + 完全不缓存
    '/admin/**': {
      ssr: false,
      prerender: false,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
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
      devSourcemap: true
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
      rollupOptions: {
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
          // 手动代码分割 - 优化包大小
          manualChunks: {
            // 工具库
            'utils-vendor': ['lodash-es', 'zod'],
            // 编辑器相关
            'editor-vendor': ['@tinymce/tinymce-vue'],
            // 表格组件
            'table-vendor': ['@tanstack/vue-table']
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
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: process.env.NUXT_SITE_NAME || 'PicArt',
            description: process.env.NUXT_SITE_DESCRIPTION || '图片分享社区',
            url: process.env.NUXT_SITE_URL || 'https://www.example.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${process.env.NUXT_SITE_URL || 'https://www.example.com'}/search?q={search_term_string}`
              },
              'query-input': 'required name=search_term_string'
            }
          })
        }
      ]
    },
    // 页面过渡动画配置
    pageTransition: {
      name: 'fade',
      mode: 'out-in'
    }
  },

  // Vue Router 配置
  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  },

  // 服务端渲染
  ssr: true
});
