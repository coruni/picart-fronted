<template>
  <div class="flex-1 flex flex-col w-full max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('admin.tags.create') }}
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          {{ t('admin.tags.createDescription') }}
        </p>
      </div>
      <UButton variant="outline" icon="mynaui:arrow-left" @click="$router.push('/admin/tags')">
        {{ t('common.button.back') }}
      </UButton>
    </div>

    <!-- Form -->
    <UForm :schema="schema" :state="form" @submit="onSubmit" class="space-y-6">
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
            <div class="space-y-2">
              <UFileUpload
                v-model:modelValue="avatarFile"
                :placeholder="t('admin.tags.avatarPlaceholder')"
                accept="image/*"
                @update:modelValue="onAvatarUpload"
                :loading="avatarUploading"
                :ui="{
                  base: 'w-24 h-24',
                  root: 'w-24 h-24',
                  file: 'w-24 h-24 h-24'
                }"
              />
              <p class="text-xs text-gray-500">
                {{ t('admin.tags.avatarHelp') }}
              </p>
            </div>
          </UFormField>

          <UFormField :label="t('common.table.background')" name="background">
            <div class="space-y-2">
              <UFileUpload
                v-model:modelValue="backgroundFile"
                :placeholder="t('admin.tags.backgroundPlaceholder')"
                accept="image/*"
                @update:modelValue="onBackgroundUpload"
                :loading="backgroundUploading"
                :ui="{
                  base: 'w-32 h-32',
                  root: 'w-32 h-32',
                  file: 'w-32 h-32 h-32'
                }"
              />
              <p class="text-xs text-gray-500">
                {{ t('admin.tags.backgroundHelp') }}
              </p>
            </div>
          </UFormField>
        </div>
      </UCard>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <UButton variant="outline" @click="$router.push('/admin/tags')" :disabled="submitting">
          {{ t('common.button.cancel') }}
        </UButton>
        <UButton type="submit" :loading="submitting" :disabled="!form.name.trim()">
          {{ t('common.button.create') }}
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
  import { z } from 'zod';
  import { useI18n } from 'vue-i18n';
  import { ref, watch, onUnmounted } from 'vue';
  import { tagControllerCreate, uploadControllerUploadFile } from '~~/api';

  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();

  // Loading states
  const submitting = ref(false);
  const avatarUploading = ref(false);
  const backgroundUploading = ref(false);

  // File refs
  const avatarFile = ref<ExtendedFile | null>(null);
  const backgroundFile = ref<ExtendedFile | null>(null);

  // Extended File interface
  interface ExtendedFile extends File {
    _url?: string;
    _uploaded?: boolean;
    _uploading?: boolean;
    _id?: string;
  }

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
      toast.add({
        title: t('common.message.uploadFailed'),
        description: error.message,
        color: 'error'
      });
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
      toast.add({
        title: t('common.message.uploadFailed'),
        description: error.message,
        color: 'error'
      });
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

      await tagControllerCreate({
        composable: '$fetch',
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
      console.error('Failed to create tag:', error);
      toast.add({
        title: t('common.message.createFailed'),
        description: error.message,
        color: 'error'
      });
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

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });
</script>
