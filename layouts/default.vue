<template>
  <DefaultHeader :categories="categories?.data.data || []" />
  <div class="flex-1 w-full pt-16 h-full">
    <NuxtPage
      :keepalive="{
        include: ['dashboard', 'index', 'search'],
        exclude: ['login'],
        max: 10
      }"
    />
  </div>
</template>

<style></style>
<script lang="ts" setup>
  import { categoryControllerFindAll } from '~~/api';
  const route = useRoute();
  const { data: categories } = categoryControllerFindAll({
    composable: 'useFetch',
    key: 'categories',
    query: {
      page: 1,
      limit: 100
    }
  });
</script>
