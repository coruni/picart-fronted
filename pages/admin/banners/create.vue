<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">{{ t('banners.create') }}</h1>

    <UForm :state="state" :schema="schema" @submit="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 标题 -->
        <UFormField :label="t('banners.title')" name="title" class="md:col-span-2">
          <UInput v-model="state.title" :placeholder="t('banners.titlePlaceholder')" />
        </UFormField>

        <!-- 图片上传 -->
        <UFormField :label="t('banners.image')" name="imageUrl" class="md:col-span-2">
          <UFileUpload
            v-model="state.imageUrl"
            :placeholder="t('banners.imagePlaceholder')"
            accept="image/*"
            @change="onImageUpload"
          />
        </UFormField>

        <!-- 链接 -->
        <UFormField :label="t('banners.link')" name="url" class="md:col-span-2">
          <UInput v-model="state.url" :placeholder="t('banners.linkPlaceholder')" />
        </UFormField>

        <!-- 排序 -->
        <UFormField :label="t('banners.sortOrder')" name="sortOrder">
          <UInput v-model.number="state.sortOrder" type="number" />
        </UFormField>

        <!-- 状态 -->
        <UFormField :label="t('banners.status')" name="isActive">
          <UToggle v-model="state.isActive" />
        </UFormField>
      </div>

      <!-- 提交按钮 -->
      <div class="flex justify-end space-x-4 mt-8">
        <UButton variant="outline" @click="router.back()" class="cursor-pointer">
          {{ t('common.button.cancel') }}
        </UButton>
        <UButton type="submit" :loading="loading" class="cursor-pointer">
          {{ t('common.button.create') }}
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
  import { z } from 'zod';
  import { bannersControllerCreate, uploadControllerUploadFile } from '~~/api';

  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  // 表单状态
  const state = reactive({
    title: '',
    imageUrl: '',
    url: '',
    sortOrder: 0,
    isActive: true
  });

  // 表单验证规则
  const schema = z.object({
    title: z.string().min(1, t('banners.titleRequired')),
    imageUrl: z.string().min(1, t('banners.imageRequired')),
    url: z.string().url(t('banners.urlInvalid')),
    sortOrder: z.number(),
    isActive: z.boolean()
  });

  // 加载状态
  const loading = ref(false);

  // 图片上传处理
  const onImageUpload = async (files: File[]) => {
    // 检查是否有文件被选中
    if (!files || files.length === 0) {
      toast.add({
        title: t('banners.imageRequired'),
        color: 'error'
      });
      return;
    }

    try {
      // 将文件转换为base64字符串数组
      const fileStrings = await Promise.all(
        files.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      // 执行文件上传
      const res = await uploadControllerUploadFile({
        composable: '$fetch',
        body: fileStrings
      });
    } catch (error: any) {
      // 处理上传错误
      console.error('Failed to upload image:', error);
      toast.add({
        title: error?.message || t('common.message.uploadFailed'),
        color: 'error'
      });
      // 重置文件选择
      state.imageUrl = '';
    }
  };

  // 提交表单
  const onSubmit = async () => {
    loading.value = true;
    const body = await schema.parseAsync(state);
    try {
      await bannersControllerCreate({
        composable: '$fetch',
        body: body
      });

      toast.add({
        title: t('common.message.createSuccess'),
        color: 'success'
      });

      // 返回列表页
      router.push('/admin/banners');
    } catch (error) {
      toast.add({
        title: t('common.message.createFailed'),
        color: 'error'
      });
      console.error('Failed to create banner:', error);
    } finally {
      loading.value = false;
    }
  };
</script>
