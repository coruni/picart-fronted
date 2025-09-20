<template>
  <div class="flex-1 flex flex-col w-full max-w-4xl mx-auto">
    <Title>{{ $t('admin.tags.edit') }}</Title>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('admin.tags.edit') }}
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          {{ t('admin.tags.editDescription') }}
        </p>
      </div>
      <UButton variant="outline" icon="mynaui:arrow-left" @click="$router.push('/admin/tags')">
        {{ t('common.button.back') }}
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="mynaui:loading" class="w-8 h-8 animate-spin text-primary" />
      <span class="ml-2 text-gray-600">{{ t('common.loading') }}</span>
    </div>

    <!-- Form -->
    <UForm v-else-if="tag" :schema="schema" :state="form" @submit="onSubmit" class="space-y-6">
      <!-- Basic Information Section -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ t('admin.tags.basicInfo') }}</h3>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField :label="t('common.table.name')" name="name" required>
            <UInput
              v-model="form.name"
              class="w-full"
              size="lg"
              :placeholder="t('admin.tags.namePlaceholder')"
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
              :placeholder="t('admin.tags.sortPlaceholder')"
            />
          </UFormField>
        </div>

        <UFormField :label="t('common.table.description')" name="description">
          <UTextarea
            class="w-full"
            size="lg"
            v-model="form.description"
            :placeholder="t('admin.tags.descriptionPlaceholder')"
            :rows="3"
          />
        </UFormField>
      </UCard>

      <!-- Media Section -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ t('admin.tags.media') }}</h3>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField :label="t('common.table.avatar')" name="avatar">
            <ImageUpload
              v-model="form.avatar"
              :existing-image-url="existingAvatarUrl"
              accept="image/*"
              :max-size="1 * 1024 * 1024"
              :help-text="t('admin.tags.avatarHelp')"
              aspect-ratio="1/1"
            />
          </UFormField>

          <UFormField :label="t('common.table.background')" name="background">
            <ImageUpload
              v-model="form.background"
              :existing-image-url="existingBackgroundUrl"
              accept="image/*"
              :max-size="2 * 1024 * 1024"
              :help-text="t('admin.tags.backgroundHelp')"
              aspect-ratio="16/9"
            />
          </UFormField>
        </div>
      </UCard>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <UButton variant="outline" @click="$router.push('/admin/tags')" :disabled="submitting">
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
  import { ref, watch, onUnmounted } from 'vue';
  import { debounce } from 'lodash-es';
  import { tagControllerFindOne, tagControllerUpdate, uploadControllerUploadFile } from '~/api';
  import type { Tag } from '~/types/tag';

  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const route = useRoute();

  // Loading states
  const loading = ref(true);
  const submitting = ref(false);
  const avatarUploading = ref(false);
  const backgroundUploading = ref(false);
  const tag = ref<Tag | null>(null);

  // File refs
  const avatarFile = ref<ExtendedFile | null>(null);
  const backgroundFile = ref<ExtendedFile | null>(null);

  // 用于新组件的现有图片数据
  const existingAvatarUrl = ref<string>('');
  const existingBackgroundUrl = ref<string>('');

  // Extended File interface
  interface ExtendedFile extends File {
    _url?: string;
    _uploaded?: boolean;
    _uploading?: boolean;
    _id?: string;
  }

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
    sort: z
      .number()
      .min(0, t('validation.min', { min: 0 }))
      .max(9999, t('validation.max', { max: 9999 }))
      .default(0),
    avatar: z.string().default(''),
    background: z.string().default(''),
    cover: z.string().default('')
  });

  type Schema = z.infer<typeof schema>;

  const form = ref<Schema>({
    name: '',
    description: '',
    sort: 0,
    avatar: '',
    background: '',
    cover: ''
  });

  // Avatar upload handler
  const onAvatarUpload = async (files: unknown) => {
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
    avatarFile.value = newFile;
    avatarUploading.value = true;

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
        avatarFile.value = newFile;

        // 显示上传成功提示
        toast.add({
          title: t('common.message.uploadSuccess'),
          color: 'success'
        });
      } else {
        newFile._uploading = false;
        avatarFile.value = null;
        toast.add({
          title: t('common.message.uploadFailed'),
          color: 'error'
        });
      }
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      avatarFile.value = null;
    } finally {
      avatarUploading.value = false;
    }
  };

  // Background upload handler
  const onBackgroundUpload = async (files: unknown) => {
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
    backgroundFile.value = newFile;
    backgroundUploading.value = true;

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

        form.value.background = newFile._url;
        backgroundFile.value = newFile;

        // 显示上传成功提示
        toast.add({
          title: t('common.message.uploadSuccess'),
          color: 'success'
        });
      } else {
        newFile._uploading = false;
        backgroundFile.value = null;
        toast.add({
          title: t('common.message.uploadFailed'),
          color: 'error'
        });
      }
    } catch (error: any) {
      console.error('Failed to upload background:', error);
      backgroundFile.value = null;
    } finally {
      backgroundUploading.value = false;
    }
  };

  // Watch for file changes
  watch(
    () => avatarFile.value?._url,
    newUrl => {
      if (newUrl && avatarFile.value?._uploaded) {
        form.value.avatar = newUrl;
      }
    }
  );

  watch(
    () => backgroundFile.value?._url,
    newUrl => {
      if (newUrl && backgroundFile.value?._uploaded) {
        form.value.background = newUrl;
      }
    }
  );

  // Fetch tag details
  const fetchTag = async () => {
    try {
      loading.value = true;
      const { data: tagData } = await tagControllerFindOne({
        composable: 'useFetch',
        path: { id: id.value }
      });

      if (tagData.value?.data) {
        const data = tagData.value.data;
        form.value = {
          name: data.name || '',
          description: data.description || '',
          sort: data.sort || 0,
          avatar: data.avatar || '',
          background: data.background || '',
          cover: data.cover || ''
        };
        tag.value = data;

        // 初始化已有图片
        if (data.avatar) {
          existingAvatarUrl.value = data.avatar;
        }

        if (data.background) {
          existingBackgroundUrl.value = data.background;
        }
      }
    } catch (error) {
      console.error('Failed to fetch tag:', error);
      toast.add({
        title: t('common.message.loadError'),
        color: 'error'
      });
    } finally {
      loading.value = false;
    }
  };

  // Form submission
  const onSubmit = async () => {
    submitting.value = true;
    try {
      const formData = {
        ...form.value,
        avatar: avatarFile.value?._url || form.value.avatar || '',
        background: backgroundFile.value?._url || form.value.background || '',
        description: form.value.description || undefined
      };

      const body = await schema.parseAsync(formData);

      await tagControllerUpdate({
        composable: '$fetch',
        path: { id: id.value },
        body: {
          name: body.name,
          description: body.description || undefined,
          avatar: body.avatar,
          background: body.background,
          cover: body.cover,
          sort: body.sort
        }
      });

      router.push('/admin/tags');
    } catch (error: any) {
      console.error('Failed to update tag:', error);
    } finally {
      submitting.value = false;
    }
  };

  // Cleanup URLs on unmount
  onUnmounted(() => {
    if (avatarFile.value?._url && avatarFile.value._url.startsWith('blob:')) {
      URL.revokeObjectURL(avatarFile.value._url);
    }
    if (backgroundFile.value?._url && backgroundFile.value._url.startsWith('blob:')) {
      URL.revokeObjectURL(backgroundFile.value._url);
    }
  });

  // Initialize data
  await fetchTag();

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });
</script>
