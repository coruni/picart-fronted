<template>
  <DefaultHeader :categories="categories?.data.data" />
  <div class="flex-1 w-full pt-16 h-full">
    <NuxtPage />
  </div>
</template>

<style>
  .page-enter-active,
  .page-leave-active {
    transition: all 0.4s ease-out;
  }
  .page-enter-from {
    opacity: 0;
    transform: translateY(30px);
  }
  .page-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }
</style>
<script lang="ts" setup>
  import { categoryControllerFindAll } from '~~/api';

  const { data: categories } = categoryControllerFindAll({
    composable: 'useFetch',
    key: 'categories',
    query: {
      page: 1,
      limit: 100
    }
  });
</script>
