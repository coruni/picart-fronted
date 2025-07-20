<template>
  <div
    class="h-14 box-border p-4 bg-white dark:bg-gray-900 flex items-center justify-between gap-4"
  >
    <!-- Logo -->
    <div class="px-4 max-w-16 flex items-center justify-center">
      <NuxtImg src="" alt="logo" class="object-fit h-full w-full" />
    </div>
    <!-- 菜单 -->
    <div class="flex items-center gap-4 flex-1 justify-center">
      <template v-for="category in categories" :key="category.id">
        <div class="relative group">
          <NuxtLink
            v-if="!category.children"
            :to="`/category/${category.id}`"
            class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            {{ category.name }}
          </NuxtLink>
          <div v-else class="inline-block relative">
            <span
              class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
            >
              {{ category.name }}
            </span>
            <!-- 把下拉菜单放到主菜单标签内 -->
            <div
              v-if="category.children"
              class="absolute left-0 top-full z-10 w-40 origin-top-left rounded-md bg-white dark:bg-gray-900 shadow-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
            >
              <div class="py-1">
                <NuxtLink
                  v-for="child in category.children"
                  :key="child.id"
                  :to="`/category/${child.id}`"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  {{ child.name }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <!-- 用户 -->
    <div class="flex items-center gap-4"></div>
  </div>
</template>
<script lang="ts" setup>
import type { Category } from "~~/types/category";

defineProps({
  categories: {
    type: Array as PropType<Category[]>,
    default: () => [],
  },
});
</script>
