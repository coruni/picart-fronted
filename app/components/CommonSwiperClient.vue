<template>
  <ClientOnly>
    <template #fallback>
      <div class="h-60 md:h-[400px] bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
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
        class="h-60 md:h-[400px] transition-all duration-300 bg-gray-100 dark:bg-gray-900"
        :autoplay="{ delay: 3000 }"
        :slides-per-view="1"
        :loop="safeBannersData.length > 1 ? true : false"
        :pagination="{
          clickable: true,
          el: '.custom-pagination'
        }"
      >
        <swiper-slide v-for="slide in safeBannersData" :key="slide.id">
          <NuxtLinkLocale :to="slide.linkUrl" class="relative h-full cursor-pointer">
            <NuxtImg
              :src="slide.imageUrl"
              :alt="slide.title"
              class="w-full h-full object-cover"
              loading="lazy"
              format="webp"
              sizes="100vw"
            />
            <!-- 添加半透明遮罩层 -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

            <div class="absolute bottom-0 left-0 right-0 p-10">
              <div class="transform transition-all duration-700 hover:translate-y-[-4px]">
                <h2
                  class="text-4xl font-bold mb-4 text-white drop-shadow-lg bg-gradient-to-r from-pink-300 to-primary-300 bg-clip-text"
                >
                  {{ slide.title }}
                </h2>
                <p class="text-lg text-white/90 drop-shadow-md leading-relaxed max-w-2xl">
                  {{ slide.description }}
                </p>

                <!-- 装饰性下划线 -->
                <div
                  class="mt-4 w-20 h-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full shadow-lg"
                ></div>
              </div>
            </div>
          </NuxtLinkLocale>
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
  import { bannersControllerFindActive } from '~/api';
  import { computed } from 'vue';
  const router = useRouter();
  const { locale } = useI18n();

  // 获取活动的banner数据
  const {
    data: bannersData,
    pending,
    error
  } = await bannersControllerFindActive({
    composable: 'useFetch',
    server: false,
    key: 'active-banners'
  });

  // 确保bannersData有默认值
  const safeBannersData = computed(() => bannersData.value?.data || []);
  // 处理banner点击事件
  const handleBannerClick = linkUrl => {
    if (linkUrl) {
      // 如果是外部链接，使用window.open打开
      if (linkUrl.startsWith('http')) {
        window.open(linkUrl, '_blank');
      } else {
        // 否则使用Nuxt的navigateTo进行内部跳转
        router.push(`/${locale.value}${linkUrl}`);
      }
    }
  };

  onMounted(() => {
    // 添加自定义分页器样式
    const style = document.createElement('style');
    style.textContent = `
  .custom-pagination .swiper-pagination-bullet {
    width: 12px;
    height: 6px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 3px;
    opacity: 1;
    margin: 0 6px;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .custom-pagination .swiper-pagination-bullet-active {
    background: rgb(99 102 241);
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
