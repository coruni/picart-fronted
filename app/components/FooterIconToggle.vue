<script setup lang="ts">
  import { useCustomI18n } from '~/composables/useI18n';

  const { t } = useI18n();
  const colorMode = useColorMode();
  const { locale, locales, setLocale } = useCustomI18n();

  // 切换颜色模式
  const toggleColorMode = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  };

  // 当前是否为暗色模式
  const isDarkMode = computed(() => {
    return colorMode.value === 'dark';
  });

  // 获取语言旗帜
  const getLanguageFlag = (code: string) => {
    switch (code) {
      case 'en':
        return '🇺🇸';
      case 'zh':
        return '🇨🇳';
      case 'ja':
        return '🇯🇵';
      default:
        return '🏳️';
    }
  };

  // 当前语言旗帜
  const currentLanguageFlag = computed(() => {
    return getLanguageFlag(locale.value);
  });

  // 可用语言列表
  const availableLocales = computed(() => {
    return locales.value.map(locale => ({
      code: locale.code,
      name: locale.name || locale.code,
      flag: getLanguageFlag(locale.code)
    }));
  });

  // 切换语言
  const switchLanguage = async (newLocale: string) => {
    if (newLocale === locale.value) return;
    try {
      await setLocale(newLocale);
    } catch (error) {
      console.error('Failed to switch language:', error);
    }
  };
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <!-- 主题切换按钮 -->
    <UTooltip :text="t('common.toggleTheme')" :shortcuts="['T']" :popper="{ placement: 'top' }">
      <UButton
        @click="toggleColorMode"
        variant="ghost"
        color="neutral"
        class="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        :title="t('common.toggleTheme')"
        square
      >
        <div class="relative w-5 h-5 flex items-center justify-center">
          <transition name="icon-transition" mode="out-in">
            <Icon
              :key="isDarkMode ? 'sun' : 'moon'"
              :name="isDarkMode ? 'mynaui:sun' : 'mynaui:moon'"
              class="w-5 h-5 text-gray-600 dark:text-gray-300 transition-all duration-300 ease-in-out"
            />
          </transition>
        </div>
      </UButton>
    </UTooltip>

    <!-- 语言切换按钮 -->
    <UDropdownMenu
      :items="[
        availableLocales.map(localeItem => ({
          label: `${localeItem.flag} ${localeItem.name}`,
          type: 'checkbox' as const,
          checked: localeItem.code === locale,

          onSelect(e: Event) {
            e.preventDefault();
            switchLanguage(localeItem.code);
          }
        }))
      ]"
      :content="{ align: 'center' }"
    >
      <UTooltip :text="t('header.nav.language')" :popper="{ placement: 'top' }">
        <UButton
          variant="ghost"
          color="neutral"
          class="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          :title="t('header.nav.language')"
          square
        >
          <span class="text-lg">{{ currentLanguageFlag }}</span>
        </UButton>
      </UTooltip>
    </UDropdownMenu>
  </div>
</template>

<style scoped>
  .icon-transition-enter-active,
  .icon-transition-leave-active {
    transition: all 0.3s ease-in-out;
  }

  .icon-transition-enter-from {
    opacity: 0;
    transform: rotate(90deg) scale(0.8);
  }

  .icon-transition-leave-to {
    opacity: 0;
    transform: rotate(-90deg) scale(0.8);
  }
</style>
