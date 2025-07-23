<template>
  <div class="language-switcher">
    <div class="dropdown" :class="{ open: isOpen }">
      <button 
        class="dropdown-toggle"
        @click="toggleDropdown"
        :aria-expanded="isOpen"
        aria-haspopup="true"
      >
        <span class="current-lang">{{ currentLocaleName }}</span>
        <Icon name="chevron-down" class="chevron" :class="{ rotated: isOpen }" />
      </button>
      
      <div v-if="isOpen" class="dropdown-menu">
        <button
          v-for="locale in availableLocales"
          :key="locale.code"
          class="dropdown-item"
          :class="{ active: locale.code === currentLocale }"
          @click="handleLanguageChange(locale.code)"
        >
          <span class="lang-flag" v-if="locale.flag">{{ locale.flag }}</span>
          <span class="lang-name">{{ locale.name }}</span>
          <Icon v-if="locale.code === currentLocale" name="check" class="check-icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LocaleOption, LocaleCode } from '../types/i18n'

// Props
interface Props {
  size?: 'small' | 'medium' | 'large'
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  showFlag?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  placement: 'bottom-start',
  showFlag: true
})

// 使用i18n功能
const { locale: currentLocale, locales } = useI18n()
const { switchLanguage } = useLanguageSwitcher()

// 响应式状态
const isOpen = ref(false)

// 可用语言列表
const availableLocales = computed(() => {
  return locales.value.map(locale => ({
    code: locale.code as LocaleCode,
    name: locale.name || locale.code,
    flag: getLanguageFlag(locale.code)
  }))
})

// 当前语言名称
const currentLocaleName = computed(() => {
  const current = availableLocales.value.find(l => l.code === currentLocale.value)
  return current?.name || currentLocale.value
})

// 获取语言旗帜
const getLanguageFlag = (code: string): string => {
  const flagMap: Record<string, string> = {
    'zh-CN': '🇨🇳',
    'en': '🇺🇸',
    'ja': '🇯🇵'
  }
  return flagMap[code] || '🌐'
}

// 切换下拉菜单
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

// 处理语言切换
const handleLanguageChange = async (newLocale: string) => {
  if (newLocale === currentLocale.value) {
    isOpen.value = false
    return
  }
  
  try {
    await switchLanguage(newLocale)
    isOpen.value = false
  } catch (error) {
    console.error('Failed to switch language:', error)
  }
}

// 点击外部关闭下拉菜单
const closeDropdown = (event: Event) => {
  if (!event.target || !(event.target as Element).closest('.language-switcher')) {
    isOpen.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.language-switcher {
  position: relative;
  display: inline-block;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  min-width: 120px;
  justify-content: space-between;
}

.dropdown-toggle:hover {
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
}

.dropdown.open .dropdown-toggle {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.current-lang {
  font-weight: 500;
  color: #333;
}

.chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
  color: #666;
}

.chevron.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.active {
  background-color: #e3f2fd;
  color: #1976d2;
}

.lang-flag {
  font-size: 1.2em;
  line-height: 1;
}

.lang-name {
  flex: 1;
  font-weight: 500;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #1976d2;
}

/* 尺寸变体 */
.language-switcher.small .dropdown-toggle {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  min-width: 100px;
}

.language-switcher.small .dropdown-item {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
}

.language-switcher.large .dropdown-toggle {
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  min-width: 140px;
}

.language-switcher.large .dropdown-item {
  padding: 1rem 1.25rem;
  font-size: 1rem;
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .dropdown-toggle {
    background: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .dropdown-toggle:hover {
    border-color: #4299e1;
  }
  
  .dropdown-menu {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .dropdown-item {
    color: #e2e8f0;
  }
  
  .dropdown-item:hover {
    background-color: #4a5568;
  }
  
  .dropdown-item.active {
    background-color: #2b6cb0;
    color: #90cdf4;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dropdown-toggle {
    min-width: 100px;
    padding: 0.5rem 0.75rem;
  }
  
  .dropdown-item {
    padding: 0.75rem 1rem;
  }
}
</style> 