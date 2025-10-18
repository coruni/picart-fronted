<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <!-- 关闭按钮 -->
        <button
          @click="handleClose"
          class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer touch-manipulation"
        >
          <Icon name="mynaui:x" class="w-6 h-6" />
        </button>

        <!-- Flex 布局容器 -->
        <div
          class="relative w-full h-full flex flex-col md:flex-row items-center justify-center p-4"
        >
          <!-- 图片展示区域 -->
          <div
            class="relative flex-1 w-full h-full flex items-center justify-center pb-20 md:pb-0 md:pr-4"
          >
            <!-- 左侧导航按钮 -->
            <button
              v-if="images.length > 1"
              @click="handlePrev"
              class="absolute left-0 z-10 w-10 h-10 rounded-full bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer touch-manipulation"
            >
              <Icon name="mynaui:chevron-left" class="w-6 h-6" />
            </button>

            <!-- 图片显示区域 -->
            <div class="relative w-full h-full flex items-center justify-center">
              <!-- 加载动画 -->
              <div
                v-show="loading"
                class="absolute inset-0 flex items-center justify-center"
                :style="{
                  opacity: loading ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }"
              >
                <div class="relative">
                  <div
                    class="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700"
                  ></div>
                  <div
                    class="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin"
                    style="animation-duration: 0.8s"
                  ></div>
                </div>
              </div>

              <!-- 图片容器 -->
              <div
                v-show="!loading"
                class="relative select-none cursor-move"
                :class="{ 'transition-none': isDragging || isMouseDragging }"
                :style="{
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  opacity: isSwitching ? 0 : 1,
                  transition: isDragging || isMouseDragging ? 'none' : 'opacity 0.3s ease'
                }"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
                @touchcancel="handleTouchEnd"
                @mousedown="handleMouseDown"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
                @mouseleave="handleMouseUp"
              >
                <NuxtImg
                  v-if="!showOriginal"
                  :key="currentIndex"
                  :src="currentImage"
                  :alt="`图片 ${currentIndex + 1}`"
                  class="max-w-[90vw] max-h-[90vh] object-contain"
                  format="webp"
                  quality="95"
                  width="1920"
                  fit="contain"
                  loading="eager"
                  @load="handleImageLoad"
                  @error="handleImageError"
                  preload
                />
                <img
                  v-else
                  :key="`original-${currentIndex}`"
                  :src="currentImage"
                  :alt="`图片 ${currentIndex + 1}`"
                  class="max-w-[90vw] max-h-[90vh] object-contain"
                  @load="handleImageLoad"
                  @error="handleImageError"
                />
              </div>
            </div>

            <!-- 右侧导航按钮 -->
            <button
              v-if="images.length > 1"
              @click="handleNext"
              class="absolute right-0 z-10 w-10 h-10 rounded-full bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer touch-manipulation"
            >
              <Icon name="mynaui:chevron-right" class="w-6 h-6" />
            </button>
          </div>

          <!-- 缩略图轮播区域 -->
          <div
            class="absolute md:relative bottom-20 md:bottom-0 left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 p-4 z-10"
          >
            <div
              ref="thumbnailContainer"
              class="flex md:flex-col gap-2 max-w-[90vw] md:max-w-[200px] max-h-[100px] md:max-h-[60vh] overflow-x-auto md:overflow-y-auto overflow-y-hidden px-2 py-2 md:px-0 md:py-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 md:scrollbar-none"
            >
              <button
                v-for="(img, idx) in images"
                :key="idx"
                :ref="
                  el => {
                    if (el) thumbnailRefs[idx] = el as HTMLElement;
                  }
                "
                @click="handleThumbnailClick(idx)"
                class="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-110"
                :class="{
                  'border-primary ring-2 ring-primary': idx === currentIndex,
                  'border-gray-600': idx !== currentIndex
                }"
              >
                <NuxtImg
                  :src="img"
                  :alt="`缩略图 ${idx + 1}`"
                  class="w-full h-full object-cover"
                  format="webp"
                  quality="95"
                  width="1920"
                  fit="cover"
                  loading="lazy"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- 底部工具栏 -->
        <div
          class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 flex items-center gap-3 bg-gray-700/80 backdrop-blur-sm rounded-full shadow-lg"
        >
          <!-- 放大按钮 -->
          <button
            @click="handleZoomIn"
            class="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-white hover:text-black transition-colors duration-200 flex items-center justify-center cursor-pointer touch-manipulation"
            title="放大"
          >
            <Icon name="mynaui:plus" class="w-5 h-5" />
          </button>

          <!-- 缩小按钮 -->
          <button
            @click="handleZoomOut"
            class="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-white hover:text-black transition-colors duration-200 flex items-center justify-center cursor-pointer touch-manipulation"
            title="缩小"
          >
            <Icon name="mynaui:minus" class="w-5 h-5" />
          </button>

          <!-- 图片指示器 -->
          <div class="flex items-center gap-2 px-2">
            <span class="text-white text-xs font-medium">
              {{ currentIndex + 1 }} / {{ images.length }}
            </span>
          </div>

          <!-- 逆时针旋转按钮 -->
          <button
            @click="handleRotateLeft"
            class="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-white hover:text-black transition-colors duration-200 flex items-center justify-center cursor-pointer touch-manipulation"
            title="逆时针旋转"
          >
            <Icon name="mynaui:undo" class="w-5 h-5" />
          </button>

          <!-- 顺时针旋转按钮 -->
          <button
            @click="handleRotateRight"
            class="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-white hover:text-black transition-colors duration-200 flex items-center justify-center cursor-pointer touch-manipulation"
            title="顺时针旋转"
          >
            <Icon name="mynaui:redo" class="w-5 h-5" />
          </button>

          <!-- 重置按钮 -->
          <button
            @click="handleReset"
            class="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-white hover:text-black transition-colors duration-200 flex items-center justify-center cursor-pointer touch-manipulation"
            title="重置"
          >
            <Icon name="mynaui:refresh" class="w-5 h-5" />
          </button>

          <!-- 查看原图按钮 -->
          <button
            @click="handleViewOriginal"
            class="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-white hover:text-black transition-colors duration-200 flex items-center justify-center cursor-pointer touch-manipulation"
            :class="{ 'bg-gray-100 text-black dark:bg-gray-700 dark:text-white': showOriginal }"
            :title="showOriginal ? '查看优化图' : '查看原图'"
          >
            <Icon name="mynaui:image" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  interface Props {
    visible: boolean;
    images: string[];
    index?: number;
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void;
    (e: 'close'): void;
    (e: 'change', index: number): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    index: 0
  });

  const emit = defineEmits<Emits>();

  // 当前图片索引
  const currentIndex = ref(props.index);

  // 是否显示原图
  const showOriginal = ref(false);

  // 当前图片
  const currentImage = computed(() => {
    if (showOriginal.value) {
      // 显示原图，移除 NuxtImg 的优化参数
      return props.images[currentIndex.value];
    }
    return props.images[currentIndex.value];
  });

  // 加载状态
  const loading = ref(true);

  // 切换状态
  const isSwitching = ref(false);

  // 缩放
  const scale = ref(1);

  // 旋转角度
  const rotation = ref(0);

  // 加载超时定时器
  let loadTimeout: NodeJS.Timeout | null = null;

  // 缩略图容器引用
  const thumbnailContainer = ref<HTMLElement | null>(null);
  const thumbnailRefs = ref<Record<number, HTMLElement>>({});

  // 触摸手势相关
  const isDragging = ref(false);
  const startX = ref(0);
  const startY = ref(0);
  const offsetX = ref(0);
  const offsetY = ref(0);
  const lastDistance = ref(0);
  const initialScale = ref(1);

  // 监听 visible 变化
  watch(
    () => props.visible,
    newVal => {
      if (newVal) {
        currentIndex.value = props.index;
        loading.value = true;
        scale.value = 1;
        rotation.value = 0;

        // 设置加载超时（10秒）
        if (loadTimeout) clearTimeout(loadTimeout);
        loadTimeout = setTimeout(() => {
          if (loading.value) {
            loading.value = false;
          }
        }, 10000);
      }
    }
  );

  // 监听 index 变化
  watch(
    () => props.index,
    newVal => {
      currentIndex.value = newVal;
      loading.value = true;
      scale.value = 1;
      rotation.value = 0;

      // 设置加载超时（10秒）
      if (loadTimeout) clearTimeout(loadTimeout);
      loadTimeout = setTimeout(() => {
        if (loading.value) {
          loading.value = false;
        }
      }, 10000);

      // 滚动到当前缩略图
      scrollToCurrentThumbnail();
    }
  );

  // 滚动到当前缩略图
  const scrollToCurrentThumbnail = () => {
    nextTick(() => {
      const thumbnail = thumbnailRefs.value[currentIndex.value];
      if (thumbnail && thumbnailContainer.value) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    });
  };

  // 关闭
  const handleClose = () => {
    emit('update:visible', false);
    emit('close');
  };

  // 上一张
  const handlePrev = () => {
    if (currentIndex.value > 0) {
      isSwitching.value = true;
      setTimeout(() => {
        currentIndex.value--;
        loading.value = true;
        scale.value = 1;
        rotation.value = 0;
        emit('change', currentIndex.value);
      }, 150);
    }
  };

  // 下一张
  const handleNext = () => {
    if (currentIndex.value < props.images.length - 1) {
      isSwitching.value = true;
      setTimeout(() => {
        currentIndex.value++;
        loading.value = true;
        scale.value = 1;
        rotation.value = 0;
        emit('change', currentIndex.value);
      }, 150);
    }
  };

  // 图片加载完成
  const handleImageLoad = () => {
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      loadTimeout = null;
    }
    // 使用 nextTick 确保状态更新
    nextTick(() => {
      loading.value = false;
      isSwitching.value = false;
    });
  };

  // 图片加载错误
  const handleImageError = () => {
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      loadTimeout = null;
    }
    // 使用 nextTick 确保状态更新
    nextTick(() => {
      loading.value = false;
      isSwitching.value = false;
    });
  };

  // 放大
  const handleZoomIn = () => {
    scale.value = Math.min(scale.value + 0.25, 3);
  };

  // 缩小
  const handleZoomOut = () => {
    scale.value = Math.max(scale.value - 0.25, 0.5);
  };

  // 逆时针旋转
  const handleRotateLeft = () => {
    rotation.value -= 90;
  };

  // 顺时针旋转
  const handleRotateRight = () => {
    rotation.value += 90;
  };

  // 重置
  const handleReset = () => {
    scale.value = 1;
    rotation.value = 0;
    offsetX.value = 0;
    offsetY.value = 0;
  };

  // 查看原图
  const handleViewOriginal = () => {
    showOriginal.value = !showOriginal.value;
    loading.value = true;
  };

  // 计算两点之间的距离
  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 触摸开始
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      // 单指拖动
      isDragging.value = true;
      const touch = e.touches[0];
      if (touch) {
        startX.value = touch.clientX - offsetX.value;
        startY.value = touch.clientY - offsetY.value;
      }
    } else if (e.touches.length === 2) {
      // 双指缩放
      isDragging.value = false;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      if (touch1 && touch2) {
        lastDistance.value = getDistance(touch1, touch2);
        initialScale.value = scale.value;
      }
    }
  };

  // 触摸移动
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && isDragging.value) {
      // 单指拖动
      const touch = e.touches[0];
      if (touch) {
        offsetX.value = touch.clientX - startX.value;
        offsetY.value = touch.clientY - startY.value;
      }
    } else if (e.touches.length === 2) {
      // 双指缩放
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      if (touch1 && touch2 && lastDistance.value > 0) {
        const distance = getDistance(touch1, touch2);
        const scaleChange = distance / lastDistance.value;
        scale.value = Math.max(0.5, Math.min(3, initialScale.value * scaleChange));
      }
    }
  };

  // 触摸结束
  const handleTouchEnd = () => {
    isDragging.value = false;
    lastDistance.value = 0;
  };

  // 鼠标拖动相关
  const isMouseDragging = ref(false);
  const mouseStartX = ref(0);
  const mouseStartY = ref(0);

  // 鼠标按下
  const handleMouseDown = (e: MouseEvent) => {
    isMouseDragging.value = true;
    mouseStartX.value = e.clientX - offsetX.value;
    mouseStartY.value = e.clientY - offsetY.value;
    e.preventDefault();
  };

  // 鼠标移动
  const handleMouseMove = (e: MouseEvent) => {
    if (isMouseDragging.value) {
      offsetX.value = e.clientX - mouseStartX.value;
      offsetY.value = e.clientY - mouseStartY.value;
    }
  };

  // 鼠标抬起
  const handleMouseUp = () => {
    isMouseDragging.value = false;
  };

  // 缩略图点击
  const handleThumbnailClick = (index: number) => {
    isSwitching.value = true;
    setTimeout(() => {
      currentIndex.value = index;
      loading.value = true;
      scale.value = 1;
      rotation.value = 0;
      offsetX.value = 0;
      offsetY.value = 0;
      emit('change', index);
    }, 150);
  };

  // 键盘事件
  const handleKeydown = (e: KeyboardEvent) => {
    if (!props.visible) return;

    switch (e.key) {
      case 'Escape':
        handleClose();
        break;
      case 'ArrowLeft':
        handlePrev();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case 'r':
        handleReset();
        break;
    }
  };

  // 鼠标滚轮事件（缩放或滚动缩略图）
  const handleWheel = (e: WheelEvent) => {
    if (!props.visible) return;

    // 检查鼠标是否在缩略图容器上
    const target = e.target as HTMLElement;
    if (thumbnailContainer.value && thumbnailContainer.value.contains(target)) {
      // 在缩略图容器上，允许滚动
      return;
    }

    // 在主图片区域，执行缩放
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // 生命周期
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('wheel', handleWheel, { passive: false });
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('wheel', handleWheel);
  });
</script>

<style scoped>
  .lightbox-fade-enter-active,
  .lightbox-fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .lightbox-fade-enter-from,
  .lightbox-fade-leave-to {
    opacity: 0;
  }

  /* PC端隐藏滚动条 */
  @media (min-width: 768px) {
    .md\:scrollbar-none::-webkit-scrollbar {
      display: none;
    }
    .md\:scrollbar-none {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  }
</style>
