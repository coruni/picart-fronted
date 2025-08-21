<template>
  <div class="flex items-center justify-center py-8">
    <div class="flex items-center justify-center flex-col gap-4">
      <div class="flex items-center gap-4">
        <USkeleton class="h-8 w-8 rounded-full" />
        <div class="grid gap-2">
          <USkeleton class="h-4 w-[200px]" />
          <USkeleton class="h-4 w-[150px]" />
        </div>
      </div>
      <USkeleton class="h-4 w-[100px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
  // 通用加载骨架屏组件
</script>
