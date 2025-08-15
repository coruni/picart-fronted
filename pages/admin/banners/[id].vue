<template>
  <div class="">
    <h1 class="text-2xl font-bold mb-6">{{ t('banners.edit') }}</h1>

    <UForm :state="state" :schema="schema" @submit="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 标题 -->
        <UFormField :label="t('banners.title')" name="title" class="md:col-span-2">
          <UInput
            class="w-full"
            v-model="state.title"
            :placeholder="t('banners.titlePlaceholder')"
          />
        </UFormField>

        <!-- 图片上传 -->
        <UFormField :label="t('banners.image')" name="imageUrl" class="md:col-span-2">
          <UFileUpload
            v-model:modelValue="displayFile"
            :placeholder="t('banners.imagePlaceholder')"
            accept="image/*"
            @update:modelValue="onImageUpload"
            :loading="uploading"
            :ui="{ files: 'flex justify-center' }"
          >
          </UFileUpload>
        </UFormField>

        <!-- 链接 -->
        <UFormField :label="t('banners.link')" name="linkUrl" class="md:col-span-2">
          <UInput
            class="w-full"
            v-model="state.linkUrl"
            :placeholder="t('banners.linkPlaceholder')"
          />
        </UFormField>

        <!-- 排序 -->
        <UFormField :label="t('banners.sortOrder')" name="sortOrder">
          <UInput class="w-full" :min="0" v-model.number="state.sortOrder" type="number" />
        </UFormField>

        <!-- 状态 -->
        <UFormField :label="t('banners.status')" name="status">
          <USelect
            class="w-full"
            v-model="state.status"
            :items="[
              { label: t('common.status.active'), value: 'active' },
              { label: t('common.status.inactive'), value: 'inactive' }
            ]"
            option-attribute="label"
            value-attribute="value"
          />
        </UFormField>
      </div>

      <!-- 提交按钮 -->
      <div class="flex justify-end space-x-4 mt-8">
        <UButton variant="outline" @click="router.back()" class="cursor-pointer">
          {{ t('common.button.cancel') }}
        </UButton>
        <UButton type="submit" :loading="loading" class="cursor-pointer">
          {{ t('common.button.update') }}
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
  import { z } from 'zod';
  import { useI18n } from 'vue-i18n';
  import {
    bannersControllerDetail,
    bannersControllerUpdate,
    uploadControllerUploadFile
  } from '~~/api';

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  // 获取轮播图详情
  const { data: bannerData } = await bannersControllerDetail({
    composable: 'useFetch',
    key: `banner-${route.params.id}`,
    path: {
      id: String(route.params.id)
    }
  });

  // 扩展File接口，添加自定义属性
  interface ExtendedFile extends File {
    _url?: string;
    _uploaded?: boolean;
    _uploading?: boolean;
    _id?: string;
  }

  // 单个文件，用于FileUpload组件展示
  const displayFile = ref<ExtendedFile | null>(null);

  // 上传状态
  const uploading = ref(false);

  // 表单状态
  const state = reactive({
    title: bannerData.value?.data?.title || '',
    imageUrl: bannerData.value?.data?.imageUrl || '',
    linkUrl: bannerData.value?.data?.linkUrl || '',
    sortOrder: bannerData.value?.data?.sortOrder || 0,
    status: (bannerData.value?.data?.status as 'active' | 'inactive') || 'active'
  });

  // 将URL转换为File对象
  const createVirtualFile = async (url: string): Promise<ExtendedFile> => {
    try {
      // 创建一个默认的虚拟文件（不实际下载图片内容，减少加载时间）
      const fileName = url.split('/').pop() || 'image.jpg';
      const file = new File([''], fileName, { type: 'image/jpeg' }) as ExtendedFile;
      file._url = url;
      file._uploaded = true;
      file._id = `existing_${Date.now()}`;
      return file;
    } catch (error) {
      console.error('Error creating virtual file:', error);
      const fileName = url.split('/').pop() || 'image.jpg';
      const file = new File([''], fileName, { type: 'image/jpeg' }) as ExtendedFile;
      file._url = url;
      file._uploaded = true;
      file._id = `existing_${Date.now()}`;
      return file;
    }
  };

  // 初始化已有图片
  if (state.imageUrl) {
    createVirtualFile(state.imageUrl).then(file => {
      displayFile.value = file;
    });
  }

  // 获取文件预览URL
  const getFilePreview = (file: ExtendedFile): string => {
    if (file._url) {
      return file._url;
    }

    if (file.size > 0) {
      return URL.createObjectURL(file);
    }

    return '';
  };

  // 删除图片
  const removeImage = () => {
    if (displayFile.value) {
      // 如果是本地预览URL，需要释放内存
      const file = displayFile.value;
      if (file.size > 0 && !file._url) {
        const url = getFilePreview(file);
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      }
    }

    displayFile.value = null;
    state.imageUrl = '';

    toast.add({
      title: t('form.image.removeSuccess') || '图片删除成功',
      color: 'success'
    });
  };

  // 表单验证规则
  const schema = z.object({
    title: z.string().min(1, t('banners.titleRequired')),
    imageUrl: z.string().min(1, t('banners.imageRequired')),
    linkUrl: z.string().optional(),
    sortOrder: z.number().min(0, t('banners.sortOrderMin')),
    status: z.enum(['active', 'inactive'])
  });

  // 加载状态
  const loading = ref(false);

  // 图片上传处理
  const onImageUpload = async (files: unknown) => {
    // 只处理单个文件
    if (!files || (Array.isArray(files) && files.length === 0)) return;

    let newFile: ExtendedFile | null = null;

    // 获取第一个文件
    if (Array.isArray(files) && files[0] instanceof File) {
      newFile = files[0] as ExtendedFile;
      // 确保是新文件且未上传
      if (newFile._uploaded || newFile._uploading) {
        return;
      }
    } else if (files instanceof File) {
      newFile = files as ExtendedFile;
      if (newFile._uploaded || newFile._uploading) {
        return;
      }
    }

    if (!newFile) return;

    // 标记为正在上传
    newFile._uploading = true;
    displayFile.value = newFile;
    uploading.value = true;

    try {
      // 上传单个文件
      const formData = new FormData();
      formData.append('files', newFile);

      const res = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {},
        bodySerializer: () => formData
      });

      // 更新文件状态
      if (res.data && res.data[0]) {
        newFile._url = res.data[0].url!;
        newFile._uploaded = true;
        newFile._uploading = false;
        newFile._id = `uploaded_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

        // 🔥 关键修复：同步更新 state.imageUrl
        state.imageUrl = newFile._url;

        displayFile.value = newFile;

        toast.add({
          title: t('common.message.uploadSuccess'),
          color: 'primary'
        });
      } else {
        // 上传失败
        newFile._uploading = false;
        displayFile.value = null;

        toast.add({
          title: t('common.message.uploadFailed'),
          color: 'error'
        });
      }
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      displayFile.value = null;

      toast.add({
        title: error?.message || t('common.message.uploadFailed'),
        color: 'error'
      });
    } finally {
      uploading.value = false;
    }
  };

  // 监听 displayFile 变化，同步更新 state.imageUrl
  watch(
    () => displayFile.value?._url,
    newUrl => {
      if (newUrl && displayFile.value?._uploaded) {
        state.imageUrl = newUrl;
      }
    }
  );

  // 组件卸载时清理URL对象
  onUnmounted(() => {
    if (displayFile.value) {
      const file = displayFile.value;
      if (file.size > 0 && !file._url) {
        const url = getFilePreview(file);
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      }
    }
  });

  // 提交表单
  const onSubmit = async () => {
    loading.value = true;

    // 🔥 关键修复：确保使用最新的图片URL
    const formData = {
      ...state,
      imageUrl: displayFile.value?._url || state.imageUrl || ''
    };

    try {
      const body = await schema.parseAsync(formData);

      await bannersControllerUpdate({
        composable: '$fetch',
        path: {
          id: String(route.params.id)
        },
        body
      });

      toast.add({
        title: t('common.message.updateSuccess'),
        color: 'primary'
      });

      // 返回列表页
      router.push('/admin/banners');
    } catch (error) {
      console.error('Failed to update banner:', error);
    } finally {
      loading.value = false;
    }
  };
</script>
