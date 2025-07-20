<template>
  <div class="flex-1 items-center justify-center">
    <span>网站正在重构升级中，下载压缩包请前往https://drive.cosfan.cc</span>
  </div>
</template>

<script lang="ts" setup>
import { articleControllerFindAll } from "~~/api";

const res = await articleControllerFindAll({
  query: {
    page: 1,
    limit: 10
  },
  composable: "$fetch"
});
console.log(res.data.data);

</script>
