<template>
  <div class="rounded-lg overflow-hidden">
    <div class="relative">
      <!-- 图片骨架 -->
      <USkeleton :class="skeletonClass" />

      <!-- 底部信息区域骨架 - 叠加在图片上 -->
      <div
        class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent"
      >
        <!-- 标题骨架 -->
        <div class="mb-2 space-y-2">
          <USkeleton class="h-3.5 w-full bg-white/30" />
          <USkeleton class="h-3.5 w-3/4 bg-white/30" />
        </div>

        <!-- 底部信息骨架 -->
        <div class="flex items-center justify-between">
          <!-- 左侧统计信息 -->
          <div class="flex items-center gap-3">
            <USkeleton class="h-3 w-8 bg-white/30" />
            <USkeleton class="h-3 w-8 bg-white/30" />
          </div>

          <!-- 右侧浏览数 -->
          <USkeleton class="h-3 w-10 bg-white/30" />
        </div>
      </div>

      <!-- 左上角图片数量标签骨架 -->
      <div class="absolute top-2 left-2">
        <USkeleton class="h-6 w-10 rounded-full bg-white/30" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // 随机生成不同高度的骨架屏，模拟瀑布流效果
  const getRandomHeight = () => {
    const heights = [
      'aspect-[3/4]',
      'aspect-[4/5]',
      'aspect-[2/3]',
      'aspect-[3/5]',
      'aspect-[1/1]'
    ];
    return heights[Math.floor(Math.random() * heights.length)];
  };

  const skeletonClass = computed(() => `${getRandomHeight()} w-full`);
</script>
