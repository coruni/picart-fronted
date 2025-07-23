// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  // 添加自定义规则
  features: {
    typescript: true,
    vue: true,
    tailwindcss: true
  },
  rules: {
    'vue/no-multiple-template-root': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'vue/multi-word-component-names': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
});
