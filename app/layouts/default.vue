<template>
  <div class="h-full">
    <CookieConsent />
    <DefaultHeader :categories="categories?.data.data || []" />
    <div class="flex-1 w-full pt-16 h-full flex flex-col">
      <div class="container m-auto px-4 md:px-0 w-full pt-4">
        <slot />
      </div>
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
