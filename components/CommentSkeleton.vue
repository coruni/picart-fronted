<template>
  <div class="flex space-x-3 md:space-x-4">
    <USkeleton class="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0" />
    <div class="flex-1">
      <div class="flex items-center space-x-2 mb-2">
        <USkeleton class="h-4 w-20" />
        <USkeleton class="h-4 w-16" />
      </div>
      <USkeleton class="h-4 w-full mb-2" />
      <USkeleton class="h-4 w-3/4 mb-2" />
      <USkeleton class="h-4 w-1/2" />
    </div>
  </div>
</template>

<script setup lang="ts">
  // 评论骨架屏组件
</script>
