<template>
  <div class="default-layout">
    <header>
      <h1>Welcome to the Default Layout</h1>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <p>&copy; 2023 Your Company</p>
    </footer>
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
