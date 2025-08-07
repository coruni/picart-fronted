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

      <UFormField :label="t('common.table.avatar')" name="avatar" class="w-full">
        <UInput
          v-model="form.avatar"
          :placeholder="t('admin.categories.avatarPlaceholder')"
          class="w-full"
          size="lg"
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
  import { categoryControllerCreate, categoryControllerFindAll } from '~~/api';
  import type { SelectMenuItem } from '@nuxt/ui';

  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const loading = ref(false);

  const schema = z.object({
    name: z.string().min(1, t('form.name.placeholder')),
    description: z.string().optional(),
    parentId: z.number().optional().nullable(),
    sort: z.number().min(0).default(0),
    avatar: z.string().optional()
  });

  type Schema = z.infer<typeof schema>;

  const form = ref<Schema>({
    name: '',
    description: '',
    parentId: null,
    sort: 0,
    avatar: ''
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

  const onSubmit = async () => {
    loading.value = true;
    try {
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

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });
</script>
