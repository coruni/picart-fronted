<template>
  <div class="">
    <h1 class="text-2xl font-bold mb-6">{{ t('banners.edit') }}</h1>

    <UForm :state="state" :schema="schema" @submit="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 标题 -->
        <UFormField :label="t('banners.title')" name="title" class="md:col-span-2">
          <UInput v-model="state.title" :placeholder="t('banners.titlePlaceholder')" />
        </UFormField>

        <!-- 图片上传 -->
        <UFormField :label="t('banners.image')" name="imageUrl" class="md:col-span-2">
          <UFileUpload
            v-model="file"
            :placeholder="t('banners.imagePlaceholder')"
            accept="image/*"
            @update:modelValue="onImageUpload"
            :loading="uploading"
          />
        </UFormField>

        <!-- 链接 -->
        <UFormField :label="t('banners.link')" name="linkUrl" class="md:col-span-2">
          <UInput v-model="state.linkUrl" :placeholder="t('banners.linkPlaceholder')" />
        </UFormField>

        <!-- 排序 -->
        <UFormField :label="t('banners.sortOrder')" name="sortOrder">
          <UInput v-model.number="state.sortOrder" type="number" />
        </UFormField>

        <!-- 状态 -->
        <UFormField :label="t('banners.status')" name="status">
          <USelect
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
  import { nextTick } from 'vue';
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

  // 文件
  const file = ref<File | null>(null);

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

  // 表单验证规则
  const schema = z.object({
    title: z.string().min(1, t('banners.titleRequired')),
    imageUrl: z.string().min(1, t('banners.imageRequired')),
    linkUrl: z
      .string()
      .optional()
      .refine(val => !val || val === '' || /^https?:\/\/.+/.test(val), t('banners.urlInvalid'))
      .transform(val => (val === '' ? undefined : val)),
    sortOrder: z.number().min(0, t('banners.sortOrderMin')),
    status: z.enum(['active', 'inactive'])
  });

  // 加载状态
  const loading = ref(false);

  // 图片上传处理
  const onImageUpload = async (...args: unknown[]) => {
    // 检查是否有文件被选中
    if (!args[0]) {
      toast.add({
        title: t('banners.imageRequired'),
        color: 'error'
      });
      return;
    }

    uploading.value = true;

    try {
      // 使用formDataBodySerializer正确处理文件上传
      const selectedFile = args[0] as File;
      const res = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {
          files: selectedFile
        },
        bodySerializer: () => {
          const formData = new FormData();
          // 直接使用原始的selectedFile，而不是body.files中的对象
          formData.append('files', selectedFile);
          return formData;
        }
      });

      state.imageUrl = res.data[0].url!;

      // 手动触发表单重新验证以清除图片必填错误
      await nextTick();

      toast.add({
        title: t('common.message.uploadSuccess'),
        color: 'success'
      });
    } catch (error: any) {
      // 处理上传错误
      console.error('Failed to upload image:', error);
      toast.add({
        title: error?.message || t('common.message.uploadFailed'),
        color: 'error'
      });
      // 重置文件选择（保留原有表单数据）
      file.value = null;
    } finally {
      uploading.value = false;
    }
  };

  // 提交表单
  const onSubmit = async () => {
    loading.value = true;
    const body = await schema.parseAsync(state);
    try {
      await bannersControllerUpdate({
        composable: '$fetch',
        path: {
          id: String(route.params.id)
        },
        body: body
      });

      toast.add({
        title: t('common.message.updateSuccess'),
        color: 'success'
      });

      // 返回列表页
      router.push('/admin/banners');
    } catch (error) {
      toast.add({
        title: t('common.message.updateFailed'),
        color: 'error'
      });
      console.error('Failed to update banner:', error);
    } finally {
      loading.value = false;
    }
  };
</script>
