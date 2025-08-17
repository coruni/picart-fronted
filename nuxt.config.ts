// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-08-08',
  devtools: { enabled: true },
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
    '@nuxtjs/seo'
  ],

  // SEO 配置
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.picart.cc',
    name: process.env.NUXT_PUBLIC_APP_NAME || 'PicArt',
    description: process.env.NUXT_PUBLIC_DESCRIPTION || '图片分享社区',
    defaultLocale: process.env.NUXT_PUBLIC_DEFAULT_LOCALE || 'zh',
    exclude: ['/admin/**', '/user/**'],
    cacheMaxAgeSeconds: 60 * 60 * 24 * 30,
    autoLastmod: true
  },

  // Robots 配置
  robots: {
    rules: {
      UserAgent: '*',
      Allow: '/',
      Disallow: ['/admin/', '/api/', '/user/']
    }
  },

  sitemap: {
    exclude: ['/admin/**', '/user/**'],
    sitemapsPathPrefix: '/',
    cacheMaxAgeSeconds: 60 * 60 * 24 * 30,
    sitemaps: {
      articles: {
        include: ['/article/**'],
        includeAppSources: true,
        sources: ['/api/__sitemap__/articles']
      },
      authors: {
        include: ['/author/**'],
        includeAppSources: true,
        sources: ['/api/__sitemap__/authors']
      },
      categories: {
        include: ['/category/**'],
        includeAppSources: true,
        sources: ['/api/__sitemap__/categories']
      }
    }
  },
  // 统计
  $production: {
    scripts: {
      registry: {
        clarity: {
          id: 'sw54hoqei8'
        }
      }
    }
  },

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
    quality: 80,
    format: ['webp', 'jpg', 'png', 'avif']
  },
  features: {
    inlineStyles: false
  },

  // i18n 国际化配置
  i18n: {
    bundle: {
      optimizeTranslationDirective: false
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
    // 检测浏览器语言
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      fallbackLocale: 'zh',
      alwaysRedirect: true,
      redirectOn: 'all'
    },
    // 编译优化
    compilation: {
      strictMessage: false,
      escapeHtml: false
    }
  },

  // 配置CSS
  css: ['~/assets/css/main.css'],
  // 配置环境变量
  runtimeConfig: {
    // 私有配置（仅在服务端可用）
    apiSecret: process.env.API_SECRET,

    // 公共配置（客户端和服务端都可用）
    public: {
      apiBaseUrl: '',
      appName: 'PicArt',
      appVersion: '1.0.1'
    }
  },

  // 配置TypeScript
  typescript: {
    strict: true,
    typeCheck: false
  },

  // 配置Nitro
  nitro: {
    // 可以在这里配置服务端相关设置
    routeRules: {
      '/admin/**': { prerender: false },
      '/user/articles/**': { prerender: false }
    },
    // 确保cookie在SSR阶段正确传递
    experimental: {
      wasm: true
    }
  },

  // 配置Vite
  vite: {
    // 可以在这里配置Vite相关设置
    experimental: {},

    define: {
      __DEV__: process.env.NODE_ENV === 'development'
    },
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true
    },
    css: {
      devSourcemap: true
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
            name: 'PicArt',
            description: '图片分享社区',
            url: process.env.NUXT_PUBLIC_SITE_URL || 'https://picart.cc',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://picart.cc'}/search?q={search_term_string}`
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

  // 服务端渲染
  ssr: true,

  webpack: {
    extractCSS: true,
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxSize: 244 * 1024, // 244KB
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.(css|vue)$/,
            chunks: 'all',
            enforce: true,
            priority: 20
          },
          vendors: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          common: {
            name: 'chunk-common',
            minChunks: 2,
            priority: 5,
            chunks: 'initial',
            reuseExistingChunk: true
          }
        }
      }
    }
  }
});
