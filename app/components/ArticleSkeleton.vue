<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
    <USkeleton class="aspect-[3/4] w-full" />
    <div class="p-3 md:p-4">
      <USkeleton class="h-4 w-full mb-2" />
      <USkeleton class="h-3 w-3/4 mb-3" />
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <USkeleton class="w-6 h-6 rounded-full" />
          <USkeleton class="h-3 w-16" />
        </div>
        <USkeleton class="h-3 w-12" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 文章骨架屏组件
</script>
