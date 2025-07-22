<template>
  <DefaultHeader :categories="fetchCategory.data.data" />
  <div class="flex-1 w-full pt-16">
    <NuxtPage />
  </div>
</template>
<script lang="ts" setup>
  import { categoryControllerFindAll, configControllerFindByGroup } from '~~/api'

  const fetchCategory = await categoryControllerFindAll({
    composable: '$fetch',
    query: {
      page: 1,
      limit: 10
    }
  })

  // 请求网站配置
  const fetchConfig = await configControllerFindByGroup({
    composable: '$fetch',
    path: {
      group: 'site'
    }
  })

  console.log(fetchConfig)
</script>
