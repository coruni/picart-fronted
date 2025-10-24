<script setup lang="ts">
  const { t } = useI18n();
  const colorMode = useColorMode();

  const toggleColorMode = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  };

  // 确保主题状态在客户端正确获取
  const isDarkMode = computed(() => {
    return colorMode.value === 'dark';
  });
</script>

<template>
  <UButton
    @click="toggleColorMode"
    variant="ghost"
    color="neutral"
    class="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-300 ease-in-out"
    :title="t('common.toggleTheme')"
  >
    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
      {{ t('common.toggleTheme') || '主题' }}
    </span>
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
