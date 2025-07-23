<template>
  <div class="bg-white rounded-md shadow-md overflow-hidden">
    <div class="aspect-[3/4] overflow-hidden cursor-pointer">
      <img :src="data.image" :alt="data.title" class="w-full h-full object-cover" />
    </div>
    <div class="p-4">
      <h3 class="text-lg font-medium text-gray-800 mb-2">{{ data.title }}</h3>
      <p class="text-gray-600 text-sm mb-4">{{ data.description }}</p>
      <div class="flex items-center justify-between flex-wrap">
        <div class="flex items-center space-x-4">
          <button
            class="text-gray-500 flex items-center gap-1 hover:text-indigo-500 !rounded-button whitespace-nowrap"
          >
            <Icon name="mynaui:heart-solid" />
            <span>{{ data.likes }}</span>
          </button>
          <button
            class="text-gray-500 flex items-center gap-1 hover:text-indigo-500 !rounded-button whitespace-nowrap"
          >
            <Icon name="mynaui:bookmark-solid" />
            <span>{{ data.collections }}</span>
          </button>
        </div>
        <div class="flex items-center">
          <img :src="data.author.avatar" alt="作者头像" class="w-6 h-6 rounded-full" />
          <span class="ml-2 text-sm text-gray-600">{{ data.author.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Article } from '~~/types/article';

  const props = defineProps({
    data: {
      type: Object as PropType<Article>,
      default: () => ({})
    }
  });
</script>

<style></style>
