// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-08-08',
  devtools: { enabled: process.env.NODE_ENV === 'development' },
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
    payloadExtraction: false,
    renderJsonPayloads: true
  },

  // 构建优化
  build: {
    transpile: ['vue-i18n']
  },

  // SEO 配置
  site: {
    url: 'https://www.kawax.org',
    name: 'PicArt',
    description: '图片分享社区',
    defaultLocale: 'zh',
    exclude: ['/admin/**', '/user/**'],
    autoLastmod: true
  },
  icon: {
    serverBundle: {
      collections: ['mynaui']
    }
  },

  // Robots 配置
  robots: {
    disallow: ['/admin/*', '/user/*'],
    allow: ['/', '/article', '/author', '/category', '/search'],
    sitemap: [
      'https://www.kawax.org/sitemap_index.xml',
      'https://www.kawax.org/sitemap_articles.xml',
      'https://www.kawax.org/sitemap_categories.xml'
    ],
    crawlDelay: 1
  },

  sitemap: {
    exclude: ['/admin/**', '/user/**'],
    sitemapsPathPrefix: '/',
    gzip: true,
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
    format: ['webp', 'jpg', 'png', 'avif']
    // provider: 'weserv',
    // domains: ['minicdn.cosfan.cc'],
    // weserv: {
    //   baseURL: 'https://minicdn.cosfan.cc',
    //   weservURL: 'https://images.cosfan.cc',
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
    // 策略
    strategy: 'prefix_except_default',
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
    },
    // 路由配置
    routesNameSeparator: '___',
    // 调试模式
    debug: false
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
    },
    // 缓存优化
    compressPublicAssets: true,
    minify: true,
    // 跨平台兼容性配置
    preset: process.env.NITRO_PRESET || 'node_cluster',
    logLevel: process.env.NODE_ENV === 'development' ? 'warn' : 'error'
    // prerender: {
    //   crawlLinks: true,
    //   routes: ['/']
    // }
  },

  // 配置Vite
  vite: {
    // 可以在这里配置Vite相关设置
    experimental: {},
    optimizeDeps: {
      include: process.env.NODE_ENV === 'development' ? ['@vue/devtools-api'] : []
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
      // 显示打包时间
      minify: 'esbuild',
      // 显示详细的打包信息
      sourcemap: false,
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
          // 手动代码分割 - 只分割安全的第三方库
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
            name: 'PicArt',
            description: '图片分享社区',
            url: 'https://www.kawax.org',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `https://www.kawax.org/search?q={search_term_string}`
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
        maxSize: 500 * 1024, // 增加到 500KB
        minSize: 20 * 1024, // 最小块大小 20KB
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.(css|vue)$/,
            chunks: 'all',
            enforce: true,
            priority: 30
          },
          // Vue 核心库
          vue: {
            name: 'chunk-vue',
            test: /[\\/]node_modules[\\/](vue|vue-router|@vue)[\\/]/,
            priority: 25,
            chunks: 'all'
          },
          // UI 组件库 (排除 @nuxt 相关模块)
          ui: {
            name: 'chunk-ui',
            test: /[\\/]node_modules[\\/](@headlessui|@heroicons)[\\/]/,
            priority: 20,
            chunks: 'all'
          },
          // 编辑器相关
          editor: {
            name: 'chunk-editor',
            test: /[\\/]node_modules[\\/](@tinymce|tinymce)[\\/]/,
            priority: 20,
            chunks: 'all'
          },
          // 工具库
          utils: {
            name: 'chunk-utils',
            test: /[\\/]node_modules[\\/](lodash|zod|@tanstack)[\\/]/,
            priority: 15,
            chunks: 'all'
          },
          // 其他第三方库
          vendors: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          // 公共代码
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
