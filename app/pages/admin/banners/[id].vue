<template>
  <div class="">
    <Title>{{ $t('admin.banners.edit') }}</Title>
    <h1 class="text-2xl font-bold mb-6">{{ t('banners.edit') }}</h1>

    <UForm :state="state" :schema="schema" @submit="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 标题 -->
        <UFormField :label="t('banners.title')" name="title" class="md:col-span-2">
          <UInput
            v-model="state.title"
            class="w-full"
            :placeholder="t('banners.titlePlaceholder')"
          />
        </UFormField>

        <!-- 描述 -->
        <UFormField :label="t('banners.description')" name="description" class="md:col-span-2">
          <UTextarea
            v-model="state.description"
            class="w-full"
            :placeholder="t('banners.descriptionPlaceholder')"
          />
        </UFormField>

        <!-- 图片上传 -->
        <UFormField :label="t('banners.image')" name="imageUrl" class="md:col-span-2">
          <ImageUpload
            v-model="state.imageUrl"
            :existing-image-url="existingImageUrl"
            accept="image/*"
            :max-size="5 * 1024 * 1024"
            :help-text="t('banners.imageHelp')"
            image-type="banner"
            aspect-ratio="16/9"
          />
        </UFormField>

        <!-- 链接 -->
        <UFormField :label="t('banners.link')" name="linkUrl" class="md:col-span-2">
          <UInput
            v-model="state.linkUrl"
            class="w-full"
            :placeholder="t('banners.linkPlaceholder')"
          />
        </UFormField>

        <!-- 排序 -->
        <UFormField :label="t('banners.sortOrder')" name="sortOrder">
          <UInput v-model.number="state.sortOrder" class="w-full" :min="0" type="number" />
        </UFormField>

        <!-- 状态 -->
        <UFormField :label="t('banners.status')" name="status">
          <USelect
            v-model="state.status"
            class="w-full"
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
        <UButton variant="outline" class="cursor-pointer" @click="router.back()">
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
  import { bannersControllerDetail, bannersControllerUpdate } from '~/api';

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  // 用于新组件的现有图片数据
  const existingImageUrl = ref<string>('');

  // 获取轮播图详情
  const { data: bannerData } = await bannersControllerDetail({
    composable: 'useFetch',
    key: `banner-${route.params.id}`,
    path: {
      id: String(route.params.id)
    }
  });

  // 表单状态
  const state = reactive({
    title: bannerData.value?.data?.title || '',
    description: bannerData.value?.data?.description || '',
    imageUrl: bannerData.value?.data?.imageUrl || '',
    linkUrl: bannerData.value?.data?.linkUrl || '',
    sortOrder: bannerData.value?.data?.sortOrder || 0,
    status: (bannerData.value?.data?.status as 'active' | 'inactive') || 'active'
  });

  // 初始化现有图片
  if (state.imageUrl) {
    existingImageUrl.value = state.imageUrl;
  }

  // 表单验证规则
  const schema = z.object({
    title: z.string().min(1, t('banners.titleRequired')),
    description: z.string().optional(),
    imageUrl: z.string().min(1, t('banners.imageRequired')),
    linkUrl: z.string().optional(),
    sortOrder: z.number().min(0, t('banners.sortOrderMin')),
    status: z.enum(['active', 'inactive'])
  });

  // 加载状态
  const loading = ref(false);

  // 提交表单
  const onSubmit = async () => {
    loading.value = true;

    try {
      const body = await schema.parseAsync(state);

      await bannersControllerUpdate({
        composable: '$fetch',
        path: {
          id: String(route.params.id)
        },
        body
      });

      // 返回列表页
      router.push('/admin/banners');
    } catch (error) {
      // 更新轮播图失败时静默处理
    } finally {
      loading.value = false;
    }
  };
</script>
