<template>
  <ClientOnly>
    <swiper-container
      ref="swiperContainerRef"
      class="h-80 md:h-[500px] transition-all duration-300"
      :autoplay="{ delay: 3000 }"
      :slides-per-view="1"
      :loop="true"
      :pagination="{ clickable: true }"
    >
      <swiper-slide v-for="slide in slides" :key="slide.id">
        <div class="relative h-full">
          <img :src="slide.image" :alt="slide.title" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <div class="absolute bottom-10 left-10 text-white">
              <h2 class="text-3xl font-bold mb-2">{{ slide.title }}</h2>
              <p class="text-lg opacity-90">{{ slide.description }}</p>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper-container>
  </ClientOnly>
</template>

<script lang="ts" setup>
  const swiperContainerRef = ref();
  const slides = [
    {
      id: 1,
      image: 'https://ai-public.mastergo.com/ai/img_res/284bef3c586679b561fe02f6d7b77045.jpg',
      title: '春日物语 - 樱花祭典',
      description: '精选人气 Cosplay 作品展示'
    },
    {
      id: 2,
      image: 'https://ai-public.mastergo.com/ai/img_res/09ad7b5f0d4bf2423aa8d79fc07367e3.jpg',
      title: '奇幻世界 - 战士集结',
      description: '探索无尽的奇幻世界'
    },
    {
      id: 3,
      image: 'https://ai-public.mastergo.com/ai/img_res/2957909ba8e2f8cd6b960cd8c84312ff.jpg',
      title: '都市夜语 - 霓虹之约',
      description: '感受魔幻都市的浪漫'
    }
  ];
</script>
<style scoped>
  .swiper {
    --swiper-theme-color: #6366f1;
    --swiper-pagination-bullet-inactive-color: #fff;
    --swiper-pagination-bullet-inactive-opacity: 0.5;
  }
</style>
