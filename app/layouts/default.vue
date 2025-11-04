<template>
  <div>
    <DefaultHeader :categories="categories?.data.data || []" />
    <div class="flex-1 w-full pt-16 h-full container mx-auto">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { categoryControllerFindAll } from '~/api';
  const { data: categories } = categoryControllerFindAll({
    composable: 'useFetch',
    key: 'categories',
    query: {
      page: 1,
      limit: 100
    }
  });
</script>
