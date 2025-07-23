<template>
  <DefaultHeader :categories="fetchCategory.data.data" />
  <div class="flex-1 w-full pt-16">
    <NuxtPage />
  </div>
</template>
<script lang="ts" setup>
  import { categoryControllerFindAll } from '~~/api';

  const fetchCategory = await categoryControllerFindAll({
    composable: '$fetch',
    query: {
      page: 1,
      limit: 10
    }
  });
</script>
