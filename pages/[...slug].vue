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
  const tabs = [
    { id: 'all', name: 'home.tab.all' },
    { id: 'popular', name: 'home.tab.popular' },
    { id: 'latest', name: 'home.tab.latest' },
    { id: 'following', name: 'home.tab.following' }
  ];
  const currentTab = ref('all');
  const items = [
    {
      id: 1,
      image: 'https://tc.alcy.cc/i/2025/07/11/686fe58cef820.webp',
      title: '春日限定 - 花见少女',
      description: '樱花纷飞的季节，邂逅最美的春日限定',
      likes: 1234,
      collections: 890,
      author: {
        name: '星月摄影',
        avatar: 'https://tc.alcy.cc/i/2025/07/11/686fe58cef820.webp'
      }
    },
    {
      id: 2,
      image: 'https://tc.alcy.cc/i/2025/07/11/686fe58ed7ac4.webp',
      title: '魔法战姬 - 月光之剑',
      description: '守护世界和平的魔法战士降临',
      likes: 2156,
      collections: 1023,
      author: {
        name: '幻想工作室',
        avatar: 'https://ai-public.mastergo.com/ai/img_res/132a6b144e160555ea163d72a6fa36b8.jpg'
      }
    },
    {
      id: 3,
      image: 'https://tc.alcy.cc/i/2025/07/11/686fe58435572.webp',
      title: '和风物语 - 秋日庭院',
      description: '传统与现代的完美融合',
      likes: 1876,
      collections: 765,
      author: {
        name: '清风摄影',
        avatar: 'https://ai-public.mastergo.com/ai/img_res/b0d3c51e24a9031f98e6ed59f509825b.jpg'
      }
    },
    {
      id: 4,
      image: 'https://tc.alcy.cc/i/2025/07/11/686fe591dbe9d.webp',
      title: '赛博朋克 - 未来都市',
      description: '霓虹闪烁的未来世界',
      likes: 3421,
      collections: 1543,
      author: {
        name: '极光映像',
        avatar: 'https://ai-public.mastergo.com/ai/img_res/d9834592f949a5fc629107c5b239d04d.jpg'
      }
    }
  ];
  const displayItems = computed(() => {
    // 根据当前选中的tab返回对应的数据
    return items;
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
