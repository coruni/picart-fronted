<template>
  <div class="flex-1 flex flex-col w-full">
    <h1 class="text-2xl font-bold mb-6">{{ t('categories.create') }}</h1>
    <UForm :schema="schema" :state="form" @submit="onSubmit" class="w-full">
      <UFormField :label="t('common.table.name')" name="name" required class="w-full">
        <UInput
          v-model="form.name"
          :placeholder="t('admin.categories.namePlaceholder')"
          class="w-full"
          size="lg"
        />
      </UFormField>

      <UFormField :label="t('common.table.description')" name="description" class="w-full">
        <UTextarea
          v-model="form.description"
          :placeholder="t('admin.categories.descriptionPlaceholder')"
          class="w-full"
          size="lg"
        />
      </UFormField>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField :label="t('common.table.parent')" name="parentId" class="w-full">
          <USelectMenu
            v-model="form.parentId"
            :items="parentCategoryOptions"
            value-key="value"
            clearable
            :placeholder="t('admin.categories.selectParent')"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField :label="t('common.table.sort')" name="sort" class="w-full">
          <UInput v-model="form.sort" :min="0" type="number" class="w-full" size="lg" />
        </UFormField>
      </div>

      <UFormField :label="t('common.table.avatar')" name="avatar" class="w-full mt-4">
        <UFileUpload
          v-model="file"
          size="xl"
          :ui="{ base: 'w-24 h-24', root: 'w-24 h-24' }"
          :placeholder="t('admin.categories.avatarPlaceholder')"
          accept="image/*"
          @update:modelValue="onImageUpload"
        >
        </UFileUpload>
      </UFormField>

      <UFormField :label="t('common.table.cover')" name="cover" class="w-full mt-4">
        <UFileUpload
          v-model="coverFile"
          :placeholder="t('admin.categories.coverPlaceholder')"
          accept="image/*"
          @update:modelValue="onCoverUpload"
        />
      </UFormField>

      <div class="flex justify-end space-x-2 pt-4">
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
  import {
    categoryControllerCreate,
    categoryControllerFindAll,
    uploadControllerUploadFile
  } from '~~/api';
  import type { SelectMenuItem } from '@nuxt/ui';
  import { nextTick } from 'vue';

  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const loading = ref(false);
  const uploading = ref(false);
  const file = ref<File | null>(null);
  const coverUploading = ref(false);
  const coverFile = ref<File | null>(null);

  const schema = z.object({
    name: z.string().min(1, t('form.name.placeholder')),
    description: z.string().optional(),
    parentId: z.number().optional().nullable(),
    sort: z.number().min(0).default(0),
    avatar: z.string().optional(),
    cover: z.string().optional()
  });

  type Schema = z.infer<typeof schema>;

  const form = ref<Schema>({
    name: '',
    description: '',
    parentId: null,
    sort: 0,
    avatar: '',
    cover: ''
  });

  const { data: parentCategoriesData } = await categoryControllerFindAll({
    composable: 'useLazyFetch'
  });

  const parentCategoryOptions = computed<SelectMenuItem[]>(() => {
    return (
      parentCategoriesData.value?.data.data
        .filter(item => !item.parentId || item.parentId === item.id)
        .map(
          ({ id, name, avatar, description }) =>
            ({
              value: id,
              label: name,
              ...(avatar ? { avatar: { src: avatar } } : {}),
              ...(description ? { description } : {})
            }) as SelectMenuItem
        ) || []
    );
  });

  const onImageUpload = async (...args: any) => {
    if (!args[0]) {
      toast.add({
        title: t('admin.categories.imageRequired'),
        color: 'error'
      });
      return;
    }

    try {
      // 使用formDataBodySerializer正确处理文件上传
      const selectedFile = args[0] as File;
      // 传递对象给formDataBodySerializer，它会自动转换为FormData
      const res = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {
          files: selectedFile
        },
        bodySerializer: () => {
          const formData = new FormData();
          // 直接使用原始的selectedFile
          formData.append('files', selectedFile);
          return formData;
        }
      });

      form.value.avatar = res.data[0].url!;

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
      // 重置文件选择
      file.value = null;
    } finally {
    }
  };

  const onCoverUpload = async (...args: unknown[]) => {
    // 检查是否有文件被选中
    if (!args[0]) {
      toast.add({
        title: t('admin.categories.coverRequired'),
        color: 'error'
      });
      return;
    }

    try {
      // 使用formDataBodySerializer正确处理文件上传
      const selectedFile = args[0] as File;
      // 传递对象给formDataBodySerializer，它会自动转换为FormData
      const res = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {
          files: selectedFile
        },
        bodySerializer: () => {
          const formData = new FormData();
          // 直接使用原始的selectedFile
          formData.append('files', selectedFile);
          return formData;
        }
      });

      form.value.cover = res.data[0].url!;
      console.log(form.value.cover);
      toast.add({
        title: t('common.message.uploadSuccess'),
        color: 'success'
      });
    } catch (error: any) {
      // 处理上传错误
      console.error('Failed to upload cover:', error);
      toast.add({
        title: error?.message || t('common.message.uploadFailed'),
        color: 'error'
      });
      // 重置文件选择
      coverFile.value = null;
    } finally {
    }
  };

  const onSubmit = async () => {
    loading.value = true;
    try {
      // 获取file的数据
      await categoryControllerCreate({
        composable: '$fetch',
        body: {
          ...form.value,
          parentId: form.value.parentId !== null ? form.value.parentId : undefined,
          status: 'ENABLED'
        }
      });

      toast.add({
        title: t('common.message.createSuccess'),
        color: 'success'
      });

      router.push('/admin/categories');
    } catch (error) {
      toast.add({
        title: t('common.message.createFailed'),
        color: 'error'
      });
      console.error('Failed to create category:', error);
    } finally {
      loading.value = false;
    }
  };
  const createObjectUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };
  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });
</script>
