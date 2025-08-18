<template>
  <div class="flex-1 flex flex-col w-full max-w-4xl mx-auto">
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
    <UForm v-else :schema="schema" :state="form" @submit="onSubmit" class="space-y-6">
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
            class="w-full"
            size="lg"
            v-model="form.description"
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
            <div class="space-y-2">
              <UFileUpload
                v-model:modelValue="displayFile"
                :placeholder="t('admin.categories.avatarPlaceholder')"
                accept="image/*"
                @update:modelValue="onImageUpload"
                :loading="uploading"
                :ui="{
                  base: 'w-24 h-24',
                  root: 'w-24 h-24',
                  file: 'w-24 h-24 h-24'
                }"
              />
              <p class="text-xs text-gray-500">
                {{ t('admin.categories.avatarHelp') }}
              </p>
            </div>
          </UFormField>

          <UFormField :label="t('common.table.cover')" name="cover">
            <div class="space-y-2">
              <UFileUpload
                v-model:modelValue="coverFile"
                :placeholder="t('admin.categories.coverPlaceholder')"
                accept="image/*"
                @update:modelValue="onCoverUpload"
                :loading="coverUploading"
                :ui="{
                  base: 'w-32 h-32',
                  root: 'w-32 h-32',
                  file: 'w-32 h-32 h-32'
                }"
              />
              <p class="text-xs text-gray-500">
                {{ t('admin.categories.coverHelp') }}
              </p>
            </div>
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
          @click="$router.push('/admin/categories')"
          :disabled="submitting"
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
  } from '~~/api';
  import type { Category } from '~~/types/category';
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

    flattenCategories(allCategories);
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
    link: z
      .string()

      .optional()
      .nullable(),
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

  // Create virtual file from URL
  const createVirtualFile = async (url: string, index: number = 0): Promise<ExtendedFile> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const fileName = url.split('/').pop() || `image-${index + 1}.${blob.type.split('/')[1]}`;
      const file = new File([blob], fileName, { type: blob.type }) as ExtendedFile;

      file._url = url;
      file._uploaded = true;
      file._id = `existing_${index}_${Date.now()}`;

      return file;
    } catch (error) {
      console.error('Error converting URL to File:', error);
      const fileName = url.split('/').pop() || `image-${index + 1}.jpg`;
      const file = new File([''], fileName, { type: 'image/jpeg' }) as ExtendedFile;
      file._url = url;
      file._uploaded = true;
      file._id = `existing_${index}_${Date.now()}`;
      return file;
    }
  };

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
          displayFile.value = await createVirtualFile(data.avatar);
        }
        if (data.cover) {
          coverFile.value = await createVirtualFile(data.cover);
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
      console.error('Failed to upload image:', error);
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
      console.error('Failed to upload cover:', error);
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
          parentId: body.parentId !== null ? body.parentId : undefined,
          avatar: body.avatar || undefined,
          cover: body.cover || undefined,
          link: body.link || undefined
        } as any
      });

      router.push('/admin/categories');
    } catch (error: any) {
      console.error('Failed to update category:', error);
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
