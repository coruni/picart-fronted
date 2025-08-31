<template>
  <div class="space-y-4">
    <!-- 隐藏的文件输入 -->
    <input ref="fileInput" type="file" :accept="accept" class="hidden" @change="handleFileSelect" />

    <!-- 图片预览区域 -->
    <div v-if="modelValue && modelValue.trim()" class="space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('image.preview') }}
        </h4>
        <UButton variant="ghost" color="error" size="xs" icon="mynaui:trash" @click="removeImage">
          {{ t('common.button.remove') }}
        </UButton>
      </div>

      <!-- 使用VueEasyLightbox进行图片预览 -->
      <VueEasyLightbox
        :visible="lightboxVisible"
        :imgs="[modelValue]"
        :index="0"
        @hide="lightboxVisible = false"
      >
        <!-- 自定义左右导航按钮 -->
        <template #prev-btn="{ prev }">
          <UButton
            @click="prev"
            variant="link"
            class="backdrop-blur-sm hover:bg-white/80 bg-gray-700/80 cursor-pointer absolute h-8 w-8 rounded-full top-1/2 -translate-y-1/2 left-4 text-white flex items-center justify-center"
          >
            <Icon name="mynaui:chevron-left" />
          </UButton>
        </template>

        <template #next-btn="{ next }">
          <UButton
            @click="next"
            variant="link"
            class="backdrop-blur-sm hover:bg-white/80 bg-gray-700/80 cursor-pointer absolute h-8 w-8 rounded-full top-1/2 -translate-y-1/2 right-4 text-white flex items-center justify-center"
          >
            <Icon name="mynaui:chevron-right" />
          </UButton>
        </template>

        <!-- 自定义工具栏按钮 -->
        <template #toolbar="{ toolbarMethods }">
          <div
            class="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 flex items-center gap-2 bg-gray-700/80 backdrop-blur-sm rounded-full shadow-lg"
          >
            <!-- 放大按钮 -->
            <UButton
              variant="link"
              @click="toolbarMethods.zoomIn"
              class="hover:text-black p-2 w-8 h-8 text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
              title="放大"
            >
              <Icon name="mynaui:plus" class="w-5 h-5" />
            </UButton>

            <!-- 缩小按钮 -->
            <UButton
              variant="link"
              @click="toolbarMethods.zoomOut"
              class="hover:text-black p-2 w-8 h-8 text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
              title="缩小"
            >
              <Icon name="mynaui:minus" class="w-5 h-5" />
            </UButton>

            <!-- 逆时针旋转按钮 -->
            <UButton
              variant="link"
              @click="toolbarMethods.rotateLeft"
              class="hover:text-black p-2 w-8 h-8 text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
              title="逆时针旋转"
            >
              <Icon name="mynaui:undo" class="w-5 h-5" />
            </UButton>

            <!-- 顺时针旋转按钮 -->
            <UButton
              variant="link"
              @click="toolbarMethods.rotateRight"
              class="hover:text-black p-2 w-8 h-8 text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
              title="顺时针旋转"
            >
              <Icon name="mynaui:redo" class="w-5 h-5" />
            </UButton>
          </div>
        </template>

        <!-- 自定义关闭按钮 -->
        <template #close-btn>
          <UButton
            variant="link"
            @click="lightboxVisible = false"
            class="font-bold backdrop-blur-sm hover:bg-white/80 bg-gray-700/80 cursor-pointer absolute h-8 w-8 rounded-full right-4 top-4 text-white flex items-center justify-center"
          >
            <Icon name="mynaui:x" size="24" />
          </UButton>
        </template>

        <!-- 自定义加载 -->
        <template #loading>
          <div class="flex items-center justify-center py-20">
            <div class="flex items-center justify-center flex-col gap-8">
              <div
                class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
          </div>
        </template>
      </VueEasyLightbox>

      <!-- 图片预览卡片 -->
      <div
        class="relative group cursor-pointer max-w-sm sm:max-w-md lg:max-w-lg mx-auto"
        @click="openLightbox"
      >
        <div
          class="aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
        >
          <NuxtImg
            :src="modelValue"
            :alt="t('image.preview')"
            class="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            loading="lazy"
            format="webp"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 384px, (max-width: 1024px) 448px, 512px"
          />
        </div>

        <!-- 悬停操作 -->
        <div
          class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg flex items-center justify-center"
        >
          <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <UButton
              variant="solid"
              color="neutral"
              size="sm"
              icon="mynaui:edit"
              @click.stop="triggerFileInput"
            >
              {{ t('common.button.change') }}
            </UButton>
          </div>
        </div>

        <!-- 编辑图标提示 -->
        <div
          class="absolute top-2 right-2 flex items-center justify-center bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm"
        >
          <Icon name="mynaui:edit" class="w-3 h-3 mr-1" />
          {{ t('common.button.change') }}
        </div>
      </div>
    </div>

    <!-- 上传区域 -->
    <div
      v-if="!modelValue || !modelValue.trim()"
      class="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-200"
      :class="{ 'border-primary-500 dark:border-primary-400': isDragOver }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @click="triggerFileInput"
    >
      <!-- 加载遮罩 -->
      <div
        v-if="isUploading"
        class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
      >
        <div class="text-center">
          <div
            class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"
          ></div>
          <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('image.uploading') }}</p>
          <div class="w-24 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div class="h-full bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div class="text-center">
        <UIcon
          name="mynaui:image"
          class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ t('image.uploadTitle') }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {{ t('image.uploadDescription') }}
        </p>
        <UButton variant="outline" size="sm" icon="mynaui:upload" :disabled="isUploading">
          {{ t('common.button.selectImage') }}
        </UButton>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="text-red-500 text-sm flex items-center">
      <UIcon name="mynaui:warning" class="w-4 h-4 mr-1" />
      {{ error }}
    </div>

    <!-- 帮助文本 -->
    <div v-if="helpText" class="text-xs text-gray-500 dark:text-gray-400">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { uploadControllerUploadFile } from '~~/api';

  interface Props {
    modelValue?: string;
    accept?: string;
    maxSize?: number; // MB
    helpText?: string;
  }

  interface Emits {
    (e: 'update:modelValue', value: string): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    accept: 'image/*',
    maxSize: 5 // 5MB
  });

  const emit = defineEmits<Emits>();

  const { t } = useI18n();
  const toast = useToast();

  // 响应式状态
  const fileInput = ref<HTMLInputElement>();
  const error = ref('');
  const isDragOver = ref(false);
  const isUploading = ref(false);

  // Lightbox相关状态
  const lightboxVisible = ref(false);

  // 打开lightbox
  const openLightbox = () => {
    if (props.modelValue && props.modelValue.trim()) {
      lightboxVisible.value = true;
    }
  };

  // 触发文件选择
  const triggerFileInput = () => {
    // 重置文件输入，确保能重复选择同一文件
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    fileInput.value?.click();
  };

  // 处理文件选择
  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // 处理拖拽
  const handleDrop = (event: DragEvent) => {
    isDragOver.value = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // 处理文件
  const handleFile = async (file: File) => {
    error.value = '';

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      error.value = t('image.invalidType');
      return;
    }

    // 验证文件大小
    if (file.size > props.maxSize * 1024 * 1024) {
      error.value = t('image.tooLarge', { maxSize: props.maxSize });
      return;
    }

    try {
      isUploading.value = true;
      const formData = new FormData();
      formData.append('files', file);

      const response = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {},
        bodySerializer: () => formData
      });

      if (response.data && response.data[0]?.url) {
        const imageUrl = response.data[0].url;
        emit('update:modelValue', imageUrl);

        toast.add({
          title: t('common.message.uploadSuccess'),
          color: 'primary',
          icon: 'mynaui:check'
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      error.value = t('image.uploadError');

      toast.add({
        title: t('common.message.uploadError'),
        color: 'error'
      });
    } finally {
      isUploading.value = false;
    }
  };

  // 移除图片
  const removeImage = () => {
    // 清理文件输入
    if (fileInput.value) {
      fileInput.value.value = '';
    }

    // 重置状态
    error.value = '';
    isUploading.value = false;

    // 发送事件
    emit('update:modelValue', '');
  };
</script>

<style scoped>
  /* 悬停效果 */
  .group:hover {
    transform: scale(1.02);
    transition: transform 0.2s ease;
  }

  /* Lightbox样式 */
  :deep(.vel-modal) {
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  :deep(.vel-img) {
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  }
</style>
