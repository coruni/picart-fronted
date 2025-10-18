<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="absolute inset-0 z-40 flex items-start justify-center pt-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
      :class="{ 'pointer-events-none': !blocking }"
    >
      <div class="flex flex-col items-center gap-4">
        <!-- 旋转加载器 -->
        <div
          class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"
        ></div>

        <!-- 加载文字 -->
        <p v-if="message" class="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {{ message }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
  defineProps({
    show: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    },
    blocking: {
      type: Boolean,
      default: false // 是否阻止用户交互
    }
  });
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
