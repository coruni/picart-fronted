<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">{{ t('banners.create') }}</h1>

    <UForm :state="state" :schema="schema" @submit="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 标题 -->
        <UFormGroup :label="t('banners.title')" name="title" class="md:col-span-2">
          <UInput v-model="state.title" :placeholder="t('banners.titlePlaceholder')" />
        </UFormGroup>

        <!-- 图片上传 -->
        <UFormGroup :label="t('banners.image')" name="imageUrl" class="md:col-span-2">
          <UFileUpload
            v-model="state.imageUrl"
            :placeholder="t('banners.imagePlaceholder')"
            accept="image/*"
            multiple
            @change="onImageUpload"
          />
        </UFormGroup>

        <!-- 链接 -->
        <UFormGroup :label="t('banners.link')" name="url" class="md:col-span-2">
          <UInput v-model="state.url" :placeholder="t('banners.linkPlaceholder')" />
        </UFormGroup>

        <!-- 排序 -->
        <UFormGroup :label="t('banners.sortOrder')" name="sortOrder">
          <UInput v-model.number="state.sortOrder" type="number" />
        </UFormGroup>

        <!-- 状态 -->
        <UFormGroup :label="t('banners.status')" name="isActive">
          <UToggle v-model="state.isActive" />
        </UFormGroup>
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
  import { useI18n } from 'vue-i18n';
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
    imageUrl: [],
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
    // 这里应该实现实际的图片上传逻辑
    // uploadControllerUploadFile
    const res = await uploadControllerUploadFile({
      composable: '$fetch',
      body: files
    });
    // 暂时使用本地URL作为示例
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = e => {
        state.imageUrl = [e.target?.result as string];
      };
      reader.readAsDataURL(file);
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
