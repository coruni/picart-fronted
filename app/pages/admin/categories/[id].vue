<template>
  <div class="flex-1 flex flex-col w-full max-w-4xl mx-auto">
    <Title>{{ $t('admin.categories.edit') }}</Title>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('admin.categories.edit') }}
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          {{ t('admin.categories.editDescription') }}
        </p>
      </div>
      <UButton
        variant="outline"
        icon="mynaui:arrow-left"
        @click="$router.push('/admin/categories')"
      >
        {{ t('common.button.back') }}
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="mynaui:loading" class="w-8 h-8 animate-spin text-primary" />
      <span class="ml-2 text-gray-600">{{ t('common.loading') }}</span>
    </div>

    <!-- Form -->
    <UForm v-else :schema="schema" :state="form" class="space-y-6" @submit="onSubmit">
      <!-- Basic Information Section -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ t('admin.categories.basicInfo') }}</h3>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField :label="t('common.table.name')" name="name" required>
            <UInput
              v-model="form.name"
              class="w-full"
              size="lg"
              :placeholder="t('admin.categories.namePlaceholder')"
              :loading="loading"
            />
          </UFormField>

          <UFormField :label="t('common.table.sort')" name="sort">
            <UInput
              v-model="form.sort"
              type="number"
              min="0"
              class="w-full"
              size="lg"
              :placeholder="t('admin.categories.sortPlaceholder')"
            />
          </UFormField>
        </div>

        <UFormField :label="t('common.table.description')" name="description">
          <UTextarea
            v-model="form.description"
            class="w-full"
            size="lg"
            :placeholder="t('admin.categories.descriptionPlaceholder')"
            :rows="3"
          />
        </UFormField>

        <UFormField :label="t('common.table.link')" name="link">
          <UInput
            v-model="form.link"
            class="w-full"
            size="lg"
            :placeholder="t('admin.categories.linkPlaceholder')"
          />
        </UFormField>

        <UFormField :label="t('common.table.parent')" name="parentId">
          <USelectMenu
            v-model="form.parentId"
            :items="parentCategoryOptions"
            value-key="value"
            clearable
            class="w-full"
            size="lg"
            :placeholder="t('admin.categories.selectParent')"
            :loading="parentCategoriesLoading"
          />
        </UFormField>
      </UCard>

      <!-- Media Section -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ t('admin.categories.media') }}</h3>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField :label="t('common.table.avatar')" name="avatar">
            <ImageUpload
              v-model="form.avatar"
              :existing-image-url="existingAvatarUrl"
              accept="image/*"
              :max-size="1 * 1024 * 1024"
              :help-text="t('admin.categories.avatarHelp')"
              aspect-ratio="1/1"
            />
          </UFormField>

          <UFormField :label="t('common.table.cover')" name="cover">
            <ImageUpload
              v-model="form.cover"
              :existing-image-url="existingCoverUrl"
              accept="image/*"
              :max-size="2 * 1024 * 1024"
              :help-text="t('admin.categories.coverHelp')"
              aspect-ratio="16/9"
            />
          </UFormField>
        </div>
      </UCard>

      <!-- Preview Section -->
      <!-- <UCard v-if="form.avatar || form.cover">
        <template #header>
          <h3 class="text-lg font-semibold">{{ t('admin.categories.preview') }}</h3>
        </template>

        <div class="flex items-center space-x-4">
          <div v-if="form.avatar" class="text-center">
            <img
              :src="form.avatar"
              :alt="form.name"
              class="w-16 h-16 rounded-full object-cover mx-auto"
            />
            <p class="text-xs text-gray-500 mt-1">{{ t('common.table.avatar') }}</p>
          </div>
          <div v-if="form.cover" class="text-center">
            <img
              :src="form.cover"
              :alt="form.name"
              class="w-24 h-16 rounded object-cover mx-auto"
            />
            <p class="text-xs text-gray-500 mt-1">{{ t('common.table.cover') }}</p>
          </div>
        </div>
      </UCard> -->

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <UButton
          variant="outline"
          :disabled="submitting"
          @click="$router.push('/admin/categories')"
        >
          {{ t('common.button.cancel') }}
        </UButton>
        <UButton type="submit" :loading="submitting" :disabled="!form.name.trim()">
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
    categoryControllerFindAll,
    categoryControllerFindOne,
    categoryControllerUpdate,
    uploadControllerUploadFile
  } from '~/api';
  import type { Category } from '~/types/category';
  import type { SelectMenuItem } from '@nuxt/ui';
  import { onMounted, onUnmounted, watch } from 'vue';

  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const route = useRoute();

  // Loading states
  const loading = ref(true);
  const submitting = ref(false);
  const uploading = ref(false);
  const coverUploading = ref(false);
  const parentCategoriesLoading = ref(false);

  // File refs
  const coverFile = ref<ExtendedFile | null>(null);
  const displayFile = ref<ExtendedFile | null>(null);

  // 用于新组件的现有图片数据
  const existingAvatarUrl = ref<string>('');
  const existingCoverUrl = ref<string>('');

  // Extended File interface
  interface ExtendedFile extends File {
    _url?: string;
    _uploaded?: boolean;
    _uploading?: boolean;
    _id?: string;
  }

  // Parent category options
  const parentCategoryOptions = computed<SelectMenuItem[]>(() => {
    const allCategories = parentCategoriesData.value?.data.data || [];
    const flattened: SelectMenuItem[] = [];

    const flattenCategories = (cats: Category[], prefix = '', level = 0) => {
      cats.forEach(cat => {
        if (cat.id !== Number(id.value)) {
          const indent = '　'.repeat(level); // Full-width space for indentation
          flattened.push({
            value: cat.id,
            label: `${indent}${cat.name}`,
            disabled: level >= 2 // Prevent deep nesting
          });

          if (cat.children && cat.children.length > 0 && level < 2) {
            flattenCategories(cat.children, prefix, level + 1);
          }
        }
      });
    };

    flattenCategories(allCategories as Category[]);
    return flattened;
  });

  const id = computed(() => route.params.id as string);

  // Enhanced schema with better validation
  const schema = z.object({
    name: z
      .string()
      .min(1, t('validation.required'))
      .max(50, t('validation.maxLength', { max: 50 }))
      .trim(),
    description: z
      .string()
      .max(200, t('validation.maxLength', { max: 200 }))
      .optional()
      .nullable(),
    link: z.string().optional(),
    parentId: z
      .number()
      .optional()
      .nullable()
      .refine(val => val !== Number(id.value), {
        message: t('admin.categories.cannotBeOwnParent')
      }),
    sort: z
      .number()
      .min(0, t('validation.min', { min: 0 }))
      .max(9999, t('validation.max', { max: 9999 }))
      .default(0),
    avatar: z.string().optional(),
    cover: z.string().optional()
  });

  type Schema = z.infer<typeof schema>;

  const form = ref<Schema>({
    name: '',
    description: '',
    link: '',
    parentId: null,
    sort: 0,
    avatar: '',
    cover: ''
  });

  // Fetch category details
  const fetchCategory = async () => {
    try {
      loading.value = true;
      const { data: categoryData } = await categoryControllerFindOne({
        composable: 'useFetch',
        path: { id: id.value }
      });

      if (categoryData.value?.data) {
        const data = categoryData.value.data;
        form.value = {
          name: data.name || '',
          description: data.description || '',
          link: data.link || '',
          parentId: data.parentId || null,
          sort: data.sort || 0,
          avatar: data.avatar || '',
          cover: data.cover || ''
        };

        // Load existing images
        if (data.avatar) {
          existingAvatarUrl.value = data.avatar;
        }
        if (data.cover) {
          existingCoverUrl.value = data.cover;
        }
      }
    } catch (error) {
      console.error('Failed to fetch category:', error);
      toast.add({
        title: t('common.message.loadError'),
        color: 'error'
      });
    } finally {
      loading.value = false;
    }
  };

  // Fetch parent categories
  const fetchParentCategories = async () => {
    try {
      parentCategoriesLoading.value = true;
      await categoryControllerFindAll({
        composable: 'useLazyFetch',
        query: {
          page: 1,
          limit: 100
        }
      });
    } catch (error) {
      console.error('Failed to fetch parent categories:', error);
    } finally {
      parentCategoriesLoading.value = false;
    }
  };

  // Image upload handler
  const onImageUpload = async (files: unknown) => {
    if (!files || (Array.isArray(files) && files.length === 0)) return;

    let newFile: ExtendedFile | null = null;

    if (Array.isArray(files) && files[0] instanceof File) {
      newFile = files[0] as ExtendedFile;
      if (newFile._uploaded || newFile._uploading) return;
    } else if (files instanceof File) {
      newFile = files as ExtendedFile;
      if (newFile._uploaded || newFile._uploading) return;
    }

    if (!newFile) return;

    newFile._uploading = true;
    displayFile.value = newFile;
    uploading.value = true;

    try {
      const formData = new FormData();
      formData.append('files', newFile);

      const res = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {},
        bodySerializer: () => formData
      });

      if (res.data && res.data[0]) {
        newFile._url = res.data[0].url!;
        newFile._uploaded = true;
        newFile._uploading = false;
        newFile._id = `uploaded_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

        form.value.avatar = newFile._url;
        displayFile.value = newFile;

        // 显示上传成功提示
        toast.add({
          title: t('common.message.uploadSuccess'),
          color: 'success'
        });
      } else {
        newFile._uploading = false;
        displayFile.value = null;
        toast.add({
          title: t('common.message.uploadFailed'),
          color: 'error'
        });
      }
    } catch (error: any) {
      displayFile.value = null;
      toast.add({
        title: t('common.message.uploadFailed'),
        description: error.message,
        color: 'error'
      });
    } finally {
      uploading.value = false;
    }
  };

  // Cover upload handler
  const onCoverUpload = async (files: unknown) => {
    if (!files || (Array.isArray(files) && files.length === 0)) return;

    let newFile: ExtendedFile | null = null;

    if (Array.isArray(files) && files[0] instanceof File) {
      newFile = files[0] as ExtendedFile;
      if (newFile._uploaded || newFile._uploading) return;
    } else if (files instanceof File) {
      newFile = files as ExtendedFile;
      if (newFile._uploaded || newFile._uploading) return;
    }

    if (!newFile) return;

    newFile._uploading = true;
    coverFile.value = newFile;
    coverUploading.value = true;

    try {
      const formData = new FormData();
      formData.append('files', newFile);

      const res = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {},
        bodySerializer: () => formData
      });

      if (res.data && res.data[0]) {
        newFile._url = res.data[0].url!;
        newFile._uploaded = true;
        newFile._uploading = false;
        newFile._id = `uploaded_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

        form.value.cover = newFile._url;
        coverFile.value = newFile;

        // 显示上传成功提示
        toast.add({
          title: t('common.message.uploadSuccess'),
          color: 'success'
        });
      } else {
        newFile._uploading = false;
        coverFile.value = null;
        toast.add({
          title: t('common.message.uploadFailed'),
          color: 'error'
        });
      }
    } catch (error: any) {
      coverFile.value = null;
      toast.add({
        title: t('common.message.uploadFailed'),
        description: error.message,
        color: 'error'
      });
    } finally {
      coverUploading.value = false;
    }
  };

  // Watch for file changes
  watch(
    () => displayFile.value?._url,
    newUrl => {
      if (newUrl && displayFile.value?._uploaded) {
        form.value.avatar = newUrl;
      }
    }
  );

  watch(
    () => coverFile.value?._url,
    newUrl => {
      if (newUrl && coverFile.value?._uploaded) {
        form.value.cover = newUrl;
      }
    }
  );

  // Form submission
  const onSubmit = async () => {
    submitting.value = true;

    try {
      const formData = {
        ...form.value,
        avatar: displayFile.value?._url || form.value.avatar || '',
        cover: coverFile.value?._url || form.value.cover || ''
      };

      const body = await schema.parseAsync(formData);

      await categoryControllerUpdate({
        composable: '$fetch',
        path: { id: id.value },
        body: {
          name: body.name,
          description: body.description || undefined,
          sort: body.sort,
          parentId: body.parentId ?? undefined,
          avatar: body.avatar,
          cover: body.cover,
          link: body.link
        }
      });

      router.push('/admin/categories');
    } catch (error: any) {
      toast.add({
        title: t('common.message.updateFailed'),
        description: error.message,
        color: 'error'
      });
    } finally {
      submitting.value = false;
    }
  };

  // Initialize data
  const { data: parentCategoriesData } = await categoryControllerFindAll({
    composable: 'useLazyFetch',
    query: {
      page: 1,
      limit: 100
    }
  });

  // Load category data
  await fetchCategory();
  await fetchParentCategories();

  // Cleanup URLs on unmount
  onUnmounted(() => {
    if (displayFile.value?._url && displayFile.value._url.startsWith('blob:')) {
      URL.revokeObjectURL(displayFile.value._url);
    }
    if (coverFile.value?._url && coverFile.value._url.startsWith('blob:')) {
      URL.revokeObjectURL(coverFile.value._url);
    }
  });

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });
</script>
