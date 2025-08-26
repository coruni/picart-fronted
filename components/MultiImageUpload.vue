<template>
  <div class="space-y-4">
    <!-- 图片列表 -->
    <div v-if="imageList.length > 0" class="space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ t('image.uploadedImages') }} ({{ imageList.length }})
        </h4>
        <UButton
          v-if="imageList.length > 0"
          variant="ghost"
          color="error"
          size="xs"
          icon="mynaui:trash"
          class="cursor-pointer"
          @click="removeAllImages"
        >
          {{ t('common.button.removeAll') }}
        </UButton>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="(image, index) in imageList" :key="index" class="relative group">
          <img
            :src="image"
            :alt="`${t('image.image')} ${index + 1}`"
            class="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
          />

          <!-- 悬停操作 -->
          <div
            class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg flex items-center justify-center"
          >
            <div
              class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2"
            >
              <UButton
                variant="solid"
                color="error"
                size="xs"
                icon="mynaui:trash"
                @click="removeImage(index)"
              >
                {{ t('common.button.remove') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传区域 -->
    <div
      class="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-200"
      :class="{ 'border-primary-500 dark:border-primary-400': isDragOver }"
      @drop.prevent="handleFileDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- 加载遮罩 -->
      <div
        v-if="isUploading"
        class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
      >
        <div class="text-center">
          <div
            class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"
          ></div>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            {{
              totalUploadCount > 1
                ? t('image.uploadingMultiple', { count: uploadingCount, total: totalUploadCount })
                : t('image.uploading')
            }}
          </p>
          <div class="w-24 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div
              class="h-full bg-primary rounded-full transition-all duration-300"
              :style="{
                width: totalUploadCount > 0 ? `${(uploadingCount / totalUploadCount) * 100}%` : '0%'
              }"
            ></div>
          </div>
        </div>
      </div>

      <div class="text-center">
        <UIcon
          name="mynaui:image"
          class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ t('image.uploadMultipleTitle') }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {{ t('image.uploadMultipleDescription') }}
        </p>
        <UButton variant="outline" size="sm" icon="mynaui:upload" :disabled="isUploading">
          {{ t('common.button.selectImages') }}
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
  import naturalCompare from 'natural-compare';

  interface Props {
    modelValue?: string[] | string;
    accept?: string;
    maxSize?: number; // MB
    maxCount?: number;
    helpText?: string;
  }

  interface Emits {
    (e: 'update:modelValue', value: string[]): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    accept: 'image/*',
    maxSize: 5, // 5MB
    maxCount: 100
  });

  const emit = defineEmits<Emits>();

  const { t } = useI18n();
  const toast = useToast();

  // 响应式状态
  const fileInput = ref<HTMLInputElement>();
  const error = ref('');
  const isDragOver = ref(false);
  const imageList = ref<string[]>([]);
  const isUploading = ref(false);
  const uploadingCount = ref(0);
  const totalUploadCount = ref(0);

  // 初始化图片列表
  const initializeImageList = () => {
    if (props.modelValue) {
      if (Array.isArray(props.modelValue)) {
        imageList.value = props.modelValue;
      } else {
        // 如果是字符串，按逗号分割
        imageList.value = props.modelValue
          .split(',')
          .filter(Boolean)
          .map(url => url.trim());
      }
    } else {
      imageList.value = [];
    }
  };

  // 触发文件选择
  const triggerFileInput = () => {
    if (imageList.value.length >= props.maxCount) {
      toast.add({
        title: t('image.maxCountReached', { maxCount: props.maxCount }),
        color: 'warning'
      });
      return;
    }
    fileInput.value?.click();
  };

  // 处理文件选择
  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  // 处理文件拖拽
  const handleFileDrop = (event: DragEvent) => {
    isDragOver.value = false;
    const files = event.dataTransfer?.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  };

  // 处理多个文件
  const handleFiles = async (files: File[]) => {
    error.value = '';

    // 检查数量限制
    if (imageList.value.length + files.length > props.maxCount) {
      toast.add({
        title: t('image.maxCountReached', { maxCount: props.maxCount }),
        color: 'warning'
      });
      return;
    }

    // 验证所有文件
    for (const file of files) {
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
    }

    // 使用自然排序对文件进行排序
    const sortedFiles = files.sort((a, b) => naturalCompare(a.name, b.name));

    // 设置上传状态
    isUploading.value = true;
    totalUploadCount.value = sortedFiles.length;
    uploadingCount.value = 0;

    try {
      // 批量上传排序后的文件
      const formData = new FormData();
      sortedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {},
        bodySerializer: () => formData
      });

      if (response.data && response.data.length > 0) {
        // 添加所有上传成功的图片URL
        const newImageUrls = response.data
          .map(item => item.url)
          .filter((url): url is string => Boolean(url));
        imageList.value.push(...newImageUrls);
        updateModelValue();

        // 更新进度
        uploadingCount.value = sortedFiles.length;

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
      totalUploadCount.value = 0;
      uploadingCount.value = 0;
    }
  };

  // 移除图片
  const removeImage = (index: number) => {
    imageList.value.splice(index, 1);
    updateModelValue();
  };

  // 移除所有图片
  const removeAllImages = () => {
    imageList.value = [];
    isUploading.value = false;
    totalUploadCount.value = 0;
    uploadingCount.value = 0;
    updateModelValue();
  };

  // 更新模型值
  const updateModelValue = () => {
    emit('update:modelValue', imageList.value);
  };

  // 监听外部变化
  watch(
    () => props.modelValue,
    () => {
      initializeImageList();
    },
    { immediate: true }
  );
</script>

<style scoped>
  /* 悬停效果 */
  .group:hover {
    transform: scale(1.02);
    transition: transform 0.2s ease;
  }
</style>
