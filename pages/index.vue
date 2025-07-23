<template>
  <SwiperClient />
  <span>网站正在重构升级中，本页面为开发版本。下载压缩包请前往https://drive,cosfan.cc</span>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Tab切换 -->
    <div class="flex justify-end mb-8">
      <div class="bg-gray-100 p-1 rounded-lg flex space-x-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'cursor-pointer px-4 py-2 text-sm font-medium !rounded-button whitespace-nowrap transition-all duration-200',
            currentTab === tab.id
              ? 'bg-white text-indigo-500 shadow-sm'
              : 'text-gray-600 hover:text-indigo-500'
          ]"
          @click="currentTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>
    <!-- 瀑布流展示 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div
        v-for="item in displayItems"
        :key="item.id"
        class="transform transition-transform hover:scale-105 duration-300"
      >
        <ArticleCard :data="item" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const tabs = [
    { id: 'all', name: '全部作品' },
    { id: 'popular', name: '人气推荐' },
    { id: 'latest', name: '最新发布' },
    { id: 'following', name: '关注作品' }
  ];
  const currentTab = ref('all');
  const items = [
    {
      id: 1,
      image: 'https://ai-public.mastergo.com/ai/img_res/ecc5f6da72e9a8bf68b5278aba39205c.jpg',
      title: '春日限定 - 花见少女',
      description: '樱花纷飞的季节，邂逅最美的春日限定',
      likes: 1234,
      collections: 890,
      author: {
        name: '星月摄影',
        avatar: 'https://ai-public.mastergo.com/ai/img_res/c596a82588b34e9418befbe1351eefd2.jpg'
      }
    },
    {
      id: 2,
      image: 'https://ai-public.mastergo.com/ai/img_res/161f4012cbddb967f30e9d14a6943a5b.jpg',
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
      image: 'https://ai-public.mastergo.com/ai/img_res/11035edb60984251dce2420af01323f1.jpg',
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
      image: 'https://ai-public.mastergo.com/ai/img_res/d6bbc6bed1e3b5ccbfd39e4fe819173a.jpg',
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
</script>

<style></style>
