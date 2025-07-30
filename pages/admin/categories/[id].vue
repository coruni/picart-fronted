<template>
  <div class="max-w-2xl mx-auto">
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">{{ t('admin.categories.edit') }}</h2>
      </template>

      <UForm v-if="category" :schema="schema" :state="form" @submit="onSubmit">
        <UFormField :label="t('common.table.name')" name="name" required>
          <UInput v-model="form.name" :placeholder="t('admin.categories.namePlaceholder')" />
        </UFormField>

        <UFormField :label="t('common.table.description')" name="description">
          <UTextarea
            v-model="form.description"
            :placeholder="t('admin.categories.descriptionPlaceholder')"
          />
        </UFormField>

        <UFormField :label="t('common.table.parent')" name="parentId">
          <USelectMenu
            v-model="form.parentId"
            :items="parentCategoryOptions"
            value-key="value"
            clearable
            :placeholder="t('admin.categories.selectParent')"
          />
        </UFormField>

        <UFormField :label="t('common.table.sort')" name="sort">
          <UInput v-model="form.sort" type="number" min="0" />
        </UFormField>

        <UFormField :label="t('common.table.avatar')" name="avatar">
          <UInput v-model="form.avatar" :placeholder="t('admin.categories.avatarPlaceholder')" />
        </UFormField>

        <div class="flex justify-end space-x-2 pt-4">
          <UButton variant="outline" @click="$router.push('/admin/categories')">
            {{ t('common.button.cancel') }}
          </UButton>
          <UButton type="submit" :loading="loading">
            {{ t('common.button.update') }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
  import { z } from 'zod';
  import { useI18n } from 'vue-i18n';
  import {
    categoryControllerFindAll,
    categoryControllerFindOne,
    categoryControllerUpdate
  } from '~~/api';
  import type { Category } from '~~/types/category';
  import type { SelectMenuItem } from '@nuxt/ui';

  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const route = useRoute();

  const loading = ref(false);
  const category = ref<Category | null>(null);
  const parentCategoryOptions = computed<SelectMenuItem[]>(() => {
    const allCategories = parentCategoriesData.value?.data.data || [];
    const flattened: SelectMenuItem[] = [];

    const flattenCategories = (cats: Category[], prefix = '') => {
      cats.forEach(cat => {
        if (cat.id !== Number(id.value)) {
          flattened.push({
            value: cat.id,
            label: `${prefix}${cat.name}`
          });

          if (cat.children && cat.children.length > 0) {
            flattenCategories(cat.children, `${prefix}${cat.name} > `);
          }
        }
      });
    };

    flattenCategories(allCategories);
    return flattened;
  });

  const id = computed(() => route.params.id as string);

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

  // 获取分类详情
  const { data: categoryData } = await categoryControllerFindOne({
    composable: 'useLazyFetch',
    path: { id: id.value }
  });

  // 获取父分类列表
  const { data: parentCategoriesData } = await categoryControllerFindAll({
    composable: 'useLazyFetch',
    query: {
      page: 1,
      limit: 100
    }
  });

  // 初始化表单数据
  if (categoryData.value?.data) {
    const data = categoryData.value.data;
    form.value = {
      name: data.name || '',
      description: data.description || '',
      parentId: data.parentId || null,
      sort: data.sort || 0,
      avatar: data.avatar || ''
    };
    category.value = data;
  }

  const onSubmit = async () => {
    loading.value = true;
    try {
      await categoryControllerUpdate({
        composable: '$fetch',
        path: { id: id.value },
        body: {
          ...form.value,
          parentId: form.value.parentId !== null ? form.value.parentId : undefined
        }
      });

      toast.add({
        title: t('common.message.updateSuccess'),
        color: 'success'
      });

      router.push('/admin/categories');
    } catch (error) {
      toast.add({
        title: t('common.message.updateFailed'),
        color: 'error'
      });
      console.error('Failed to update category:', error);
    } finally {
      loading.value = false;
    }
  };

  definePageMeta({
    layout: 'dashboard'
  });
</script>
