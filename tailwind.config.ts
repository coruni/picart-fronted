import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: 'white',
          dark: 'gray-900'
        }
      }
    }
  },
  plugins: [],
  // 添加 sourcemap 配置
  future: {
    hoverOnlyWhenSupported: true
  }
} satisfies Config;
