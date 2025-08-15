<template>
  <div class="flex-1 flex flex-col w-full max-w-4xl mx-auto">
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
            <div class="space-y-2">
              <UInput
                v-model="form.avatar"
                class="w-full"
                size="lg"
                :placeholder="t('admin.tags.avatarPlaceholder')"
              />
              <p class="text-xs text-gray-500">
                {{ t('admin.tags.avatarHelp') }}
              </p>
            </div>
          </UFormField>

          <UFormField :label="t('common.table.background')" name="background">
            <div class="space-y-2">
              <UInput
                v-model="form.background"
                class="w-full"
                size="lg"
                :placeholder="t('admin.tags.backgroundPlaceholder')"
              />
              <p class="text-xs text-gray-500">
                {{ t('admin.tags.backgroundHelp') }}
              </p>
            </div>
          </UFormField>
        </div>
      </UCard>

      <!-- Preview Section -->
      <UCard v-if="form.avatar || form.background">
        <template #header>
          <h3 class="text-lg font-semibold">{{ t('admin.tags.preview') }}</h3>
        </template>

        <div class="flex items-center space-x-4">
          <div v-if="form.avatar" class="text-center">
            <div
              class="w-16 h-16 rounded-full mx-auto bg-cover bg-center"
              :style="{ backgroundImage: `url(${form.avatar})` }"
            />
            <p class="text-xs text-gray-500 mt-1">{{ t('common.table.avatar') }}</p>
          </div>
          <div v-if="form.background" class="text-center">
            <div
              class="w-24 h-16 rounded mx-auto bg-cover bg-center"
              :style="{ backgroundImage: `url(${form.background})` }"
            />
            <p class="text-xs text-gray-500 mt-1">{{ t('common.table.background') }}</p>
          </div>
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
  import { ref } from 'vue';
  import { debounce } from 'lodash-es';
  import { tagControllerFindOne, tagControllerUpdate } from '~~/api';
  import type { Tag } from '~~/types/tag';

  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const route = useRoute();

  // Loading states
  const loading = ref(true);
  const submitting = ref(false);
  const tag = ref<Tag | null>(null);

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
    avatar: z.string().url(t('validation.url')).optional().nullable(),
    background: z.string().url(t('validation.url')).optional().nullable()
  });

  type Schema = z.infer<typeof schema>;

  const form = ref<Schema>({
    name: '',
    description: '',
    sort: 0,
    avatar: '',
    background: ''
  });

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
          background: data.background || ''
        };
        tag.value = data;
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
      const body = await schema.parseAsync(form.value);

      await tagControllerUpdate({
        composable: '$fetch',
        path: { id: id.value },
        body
      });

      toast.add({
        title: t('common.message.updateSuccess'),
        color: 'success'
      });

      router.push('/admin/tags');
    } catch (error: any) {
      console.error('Failed to update tag:', error);
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
  await fetchTag();

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });
</script>
