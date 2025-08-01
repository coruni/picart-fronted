<template>
  <CommonSwiperClient />
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Tab切换 -->
    <div class="flex justify-center mb-8 md:justify-end">
      <div class="bg-gray-100 p-1 rounded-2xl flex space-x-1 dark:bg-gray-800">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'cursor-pointer px-4 rounded-2xl py-2 text-sm font-medium !rounded-button whitespace-nowrap transition-all duration-200',
            currentTab === tab.id
              ? 'bg-white shadow-sm text-primary font-semibold dark:bg-gray-900'
              : 'text-gray-600 hover:text-primary dark:text-white/80'
          ]"
          @click="currentTab = tab.id"
        >
          {{ $t(tab.name) }}
        </button>
      </div>
    </div>
    <!-- 瀑布流展示 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      <div
        v-for="item in displayItems"
        :key="item.id"
        class="transform transition-transform hover:scale-105 duration-300"
      >
        <CommonArticleCard :data="item" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { articleControllerFindAll } from '~~/api';

  const tabs = [
    { id: 'all', name: 'home.tab.all' },
    { id: 'popular', name: 'home.tab.popular' },
    { id: 'latest', name: 'home.tab.latest' },
    { id: 'following', name: 'home.tab.following' }
  ];
  const currentTab = ref('all');
  const pagination = ref({
    page: 1,
    limit: 12
  });
  const { data: articles } = articleControllerFindAll({
    composable: 'useFetch',
    query: computed(() => ({
      page: pagination.value.page,
      limit: pagination.value.limit
    }))
  });
  const displayItems = computed(() => {
    // 根据当前选中的tab返回对应的数据
    return articles.value?.data.data || [];
  });

  const notify = () => {
    useNuxtApp().$toast.warn(
      '页面还在开发中，下载资源请<a href="https://drive.cosfan.cc" style="color: #4299e1;" target="_blank">👉点击下载👈</a>',
      {
        dangerouslyHTMLString: true,
        autoClose: 10000,
        position: 'top-center',
        hideProgressBar: true
      }
    );
  };

  onMounted(() => {
    notify();
  });
</script>

<style></style>
