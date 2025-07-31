<template>
  <ClientOnly>
    <template #fallback>
      <div class="h-80 md:h-[500px] bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-t from-gray-300/30 to-transparent">
          <div class="absolute bottom-10 left-10 space-y-4 w-2/3">
            <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </template>

    <div class="relative">
      <swiper-container
        ref="swiperContainerRef"
        class="h-80 md:h-[500px] transition-all duration-300"
        :autoplay="{ delay: 3000 }"
        :slides-per-view="1"
        :loop="true"
        :pagination="{
          clickable: true,
          el: '.custom-pagination'
        }"
      >
        <swiper-slide v-for="slide in slides" :key="slide.id">
          <div class="relative h-full">
            <NuxtImg :src="slide.image" :alt="slide.title" class="w-full h-full object-cover" loading="lazy" format="webp" sizes="100vw" @error="handleImageError($event, 'general')" />
            <!-- 添加半透明遮罩层 -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

            <div class="absolute bottom-0 left-0 right-0 p-10">
              <div class="transform transition-all duration-700 hover:translate-y-[-4px]">
                <h2
                  class="text-4xl font-bold mb-4 text-white drop-shadow-lg bg-gradient-to-r from-pink-300 to-indigo-300 bg-clip-text"
                >
                  {{ slide.title }}
                </h2>
                <p class="text-lg text-white/90 drop-shadow-md leading-relaxed max-w-2xl">
                  {{ slide.description }}
                </p>

                <!-- 装饰性下划线 -->
                <div
                  class="mt-4 w-20 h-1 bg-gradient-to-r from-pink-400 to-indigo-400 rounded-full shadow-lg"
                ></div>
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper-container>

      <!-- 自定义分页器 -->
      <div
        class="custom-pagination w-full flex justify-center items-center space-x-2 mt-4 absolute bottom-3 z-10"
      ></div>
    </div>
  </ClientOnly>
</template>

<script setup>
  import { onMounted } from 'vue';

  // 图片错误处理
  const { handleImageError } = useImageError();

  // 示例数据
  const slides = ref([
    {
      id: 1,
      title: '梦幻樱花季',
      description: '在粉色花瓣飞舞的春日里，感受最纯真的美好时光',
      image: 'https://tc.alcy.cc/i/2025/07/11/686ffb18e16e5.webp'
    },
    {
      id: 2,
      title: '星空下的约定',
      description: '在漫天繁星的见证下，许下永恒的诺言',
      image: 'https://tc.alcy.cc/i/2025/07/11/686fe512e5fcd.webp'
    },
    {
      id: 3,
      title: '海边的夏日祭',
      description: '穿着浴衣，提着灯笼，在海风中感受夏日的浪漫',
      image: 'https://tc.alcy.cc/i/2025/07/11/686ffa65bddb3.webp'
    }
  ]);

  onMounted(() => {
    // 添加自定义分页器样式
    const style = document.createElement('style');
    style.textContent = `
  .custom-pagination .swiper-pagination-bullet {
    width: 10px;
    height: 10px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    opacity: 1;
    margin: 0 6px;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .custom-pagination .swiper-pagination-bullet-active {
    background: oklch(71.4% 0.203 305.504);
    transform: scale(1.3);
  }
  
  .custom-pagination .swiper-pagination-bullet:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: scale(1.2);
  }
  
  .custom-pagination .swiper-pagination-bullet-active:hover {
    transform: scale(1.4);
  }
`;
    document.head.appendChild(style);
  });
</script>
