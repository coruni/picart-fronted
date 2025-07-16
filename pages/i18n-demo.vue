<template>
  <div class="i18n-demo-page">
    <!-- 语言切换器 -->
    <div class="language-switcher">
      <h2>{{ $t('language.select') }}</h2>
      <div class="language-options">
        <button
          v-for="locale in locales"
          :key="locale.code"
          :class="{ active: currentLocale === locale.code }"
          @click="switchLanguage(locale.code)"
          class="language-btn"
        >
          {{ locale.name }}
        </button>
      </div>
      <p class="current-lang">{{ $t('language.current') }}: {{ currentLocaleName }}</p>
    </div>

    <!-- 基础翻译演示 -->
    <div class="translation-demo">
      <h2>{{ $t('common.loading') }}</h2>
      <div class="demo-grid">
        <div class="demo-card">
          <h3>{{ $t('common.success') }}</h3>
          <p>{{ $t('app.description') }}</p>
        </div>
        <div class="demo-card">
          <h3>{{ $t('common.error') }}</h3>
          <p>{{ $t('error.network.description') }}</p>
        </div>
        <div class="demo-card">
          <h3>{{ $t('nav.features') }}</h3>
          <p>{{ $t('app.keywords') }}</p>
        </div>
      </div>
    </div>

    <!-- 格式化功能演示 -->
    <div class="format-demo">
      <h2>格式化功能演示</h2>
      <div class="format-grid">
        <div class="format-card">
          <h3>日期格式化</h3>
          <p>当前时间: {{ formatDate(new Date()) }}</p>
          <p>短格式: {{ formatDate(new Date(), { dateStyle: 'short' }) }}</p>
          <p>长格式: {{ formatDate(new Date(), { dateStyle: 'full' }) }}</p>
        </div>
        <div class="format-card">
          <h3>数字格式化</h3>
          <p>整数: {{ formatNumber(12345) }}</p>
          <p>小数: {{ formatNumber(12345.67) }}</p>
          <p>百分比: {{ formatNumber(0.1234, { style: 'percent' }) }}</p>
        </div>
        <div class="format-card">
          <h3>货币格式化</h3>
          <p>默认货币: {{ formatCurrency(99.99) }}</p>
          <p>美元: {{ formatCurrency(99.99, 'USD') }}</p>
          <p>日元: {{ formatCurrency(99.99, 'JPY') }}</p>
        </div>
      </div>
    </div>

    <!-- 相对时间演示 -->
    <div class="time-demo">
      <h2>相对时间演示</h2>
      <div class="time-examples">
        <p>{{ formatRelativeTime(new Date()) }}</p>
        <p>{{ formatRelativeTime(new Date(Date.now() - 60000)) }}</p>
        <p>{{ formatRelativeTime(new Date(Date.now() - 3600000)) }}</p>
        <p>{{ formatRelativeTime(new Date(Date.now() - 86400000)) }}</p>
        <p>{{ formatRelativeTime(new Date(Date.now() - 2592000000)) }}</p>
      </div>
    </div>

    <!-- 表单验证演示 -->
    <div class="validation-demo">
      <h2>表单验证演示</h2>
      <form @submit.prevent="handleSubmit" class="demo-form">
        <div class="form-group">
          <label for="email">邮箱:</label>
          <input 
            id="email" 
            v-model="formData.email" 
            type="email" 
            :placeholder="$t('form.validation.email')"
          />
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>
        <div class="form-group">
          <label for="phone">手机:</label>
          <input 
            id="phone" 
            v-model="formData.phone" 
            type="tel" 
            :placeholder="$t('form.validation.phone')"
          />
          <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
        </div>
        <div class="form-group">
          <label for="message">消息:</label>
          <textarea 
            id="message" 
            v-model="formData.message" 
            :placeholder="validationRules.minLength(10)"
          ></textarea>
          <span v-if="errors.message" class="error">{{ errors.message }}</span>
        </div>
        <button type="submit" class="submit-btn">{{ $t('common.submit') }}</button>
      </form>
    </div>

    <!-- 主题切换演示 -->
    <div class="theme-demo">
      <h2>主题切换</h2>
      <div class="theme-options">
        <button @click="setTheme('light')" :class="{ active: theme === 'light' }">
          {{ $t('theme.light') }}
        </button>
        <button @click="setTheme('dark')" :class="{ active: theme === 'dark' }">
          {{ $t('theme.dark') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 使用i18n组合式函数
const { 
  locale: currentLocale, 
  locales, 
  t: $t,
  formatDate, 
  formatNumber, 
  formatCurrency, 
  formatRelativeTime 
} = useI18n()

// 使用语言切换器
const { switchLanguage } = useLanguageSwitcher()

// 使用表单验证
const { validationRules } = useFormValidationI18n()

// 使用应用状态
const appStore = useAppStore()
const { theme } = storeToRefs(appStore)
const { setTheme } = appStore

// 当前语言名称
const currentLocaleName = computed(() => {
  const current = locales.value.find(l => l.code === currentLocale.value)
  return current?.name || currentLocale.value
})

// 表单数据
const formData = reactive({
  email: '',
  phone: '',
  message: ''
})

// 表单错误
const errors = reactive({
  email: '',
  phone: '',
  message: ''
})

// 表单提交
const handleSubmit = () => {
  // 重置错误
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  // 验证邮箱
  if (!formData.email) {
    errors.email = validationRules.required()
  } else if (!isValidEmail(formData.email)) {
    errors.email = validationRules.email()
  }

  // 验证手机
  if (!formData.phone) {
    errors.phone = validationRules.required()
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = validationRules.phone()
  }

  // 验证消息
  if (!formData.message) {
    errors.message = validationRules.required()
  } else if (formData.message.length < 10) {
    errors.message = validationRules.minLength(10)
  }

  // 如果没有错误，提交表单
  if (!Object.values(errors).some(error => error)) {
    alert($t('common.success'))
  }
}

// 邮箱验证
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 手机验证
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 设置页面标题
useHead({
  title: 'i18n 功能演示 - PicArt',
  meta: [
    { name: 'description', content: '展示PicArt平台的国际化功能' }
  ]
})
</script>

<style scoped>
.i18n-demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.language-switcher {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

.language-options {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.language-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.language-btn:hover {
  background: #007bff;
  color: white;
}

.language-btn.active {
  background: #007bff;
  color: white;
}

.current-lang {
  margin-top: 1rem;
  font-weight: bold;
  color: #333;
}

.translation-demo,
.format-demo,
.time-demo,
.validation-demo,
.theme-demo {
  margin-bottom: 3rem;
}

.demo-grid,
.format-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.demo-card,
.format-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.demo-card h3,
.format-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.time-examples {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.time-examples p {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
}

.demo-form {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.submit-btn {
  background: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background: #0056b3;
}

.theme-options {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.theme-options button {
  padding: 0.5rem 1rem;
  border: 2px solid #6c757d;
  background: white;
  color: #6c757d;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.theme-options button:hover {
  background: #6c757d;
  color: white;
}

.theme-options button.active {
  background: #6c757d;
  color: white;
}

@media (max-width: 768px) {
  .i18n-demo-page {
    padding: 1rem;
  }
  
  .demo-grid,
  .format-grid {
    grid-template-columns: 1fr;
  }
  
  .language-options {
    flex-direction: column;
    align-items: center;
  }
}
</style> 