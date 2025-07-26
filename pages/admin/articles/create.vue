<template>
  <div class="flex-1 flex flex-col w-full">
    <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
      <UFormField name="title">
        <UInput
          v-model="state.title"
          size="xl"
          :placeholder="$t('form.title.placeholder')"
          variant="soft"
          class="w-full"
        />
      </UFormField>
      <UFormField name="content">
        <UTextarea
          v-model="state.content"
          size="xl"
          :rows="24"
          :placeholder="$t('form.content.placeholder')"
          variant="soft"
          class="w-full"
        />
      </UFormField>
      <UFormField name="images" :label="$t('form.image.name')">
        <UFileUpload
          v-model="state.images"
          dropzone
          size="sm"
          accept="images/*"
          :placeholder="$t('form.image.placeholder')"
          multiple
          :ui="{files:'md:grid-cols-6'}"
        />
      </UFormField>
      <div class="flex items-center space-x-2">
        <UFormField name="parentCategory" class="flex-1" :label="$t('form.category.name')">
          <UInputMenu
            v-model="state.parentCategory"
            :items="parentCategoriesOptions"
            :placeholder="$t('form.parentCategory.placeholder')"
            value-key="id"
            variant="soft"
            class="w-full"
            size="lg"
            searchable
            :search-placeholder="$t('form.parentCategory.searchPlaceholder')"
          />
        </UFormField>
        <UFormField name="category" v-if="state.parentCategory" class="flex-1">
          <UInputMenu
            v-model="state.category"
            :items="subCategoriesOptions"
            :placeholder="$t('form.category.placeholder')"
            value-key="id"
            variant="soft"
            class="w-full"
            size="lg"
            searchable
            :search-placeholder="$t('form.category.searchPlaceholder')"
          />
        </UFormField>
      </div>
      <UFormField name="tags" class="flex-1" :label="$t('form.tag.name')">
        <USelectMenu
          :items="tagsOptions"
          size="lg"
          class="w-full"
          variant="soft"
          multiple
          :placeholder="$t('form.tag.placeholder')"
        />
      </UFormField>
    </UForm>
  </div>
</template>
<script lang="ts" setup>
  import * as z from 'zod';
  import { categoryControllerFindAll, tagControllerFindAll } from '~~/api';
  import type { InputMenuItem, SelectMenuItem } from '#ui/types';

  definePageMeta({
    layout: 'dashboard'
  });
  const schema = z.object({
    title: z.string().min(12, 'common.validData.title'),
    content: z.string().min(10, 'common.validData.content'),
    parentCategory: z.number().min(1, 'common.validData.parentCategory'),
    category: z.number().min(1, 'common.validData.category'),
    images: z.any()
  });

  type Schema = z.output<typeof schema>;

  const state = reactive<Partial<Schema>>({
    title: '',
    content: '',
    parentCategory: undefined,
    category: undefined,
    images: ''
  });

  const onSubmit = async () => {
    console.log(123);
  };

  // 获取分类数据
  const { data: categories, refresh } = await categoryControllerFindAll({
    composable: 'useAsyncData',
    key: 'categories',
    query: computed(() => ({}))
  });

  const parentCategoriesOptions = computed<InputMenuItem[]>(() => {
    return (
      categories?.value?.data.data.map(item => ({
        id: item.id,
        name: item.name,
        label: item.name,
        value: item.id,
        ...(item.avatar ? { avatar: { src: item.avatar } } : {}),
        ...(item.description ? { description: item.description } : {})
      })) || []
    );
  });

  const subCategoriesOptions = computed<InputMenuItem[]>(() => {
    if (!state.parentCategory) return [];

    // 找到选中的主分类
    const parentCategory = categories?.value?.data.data.find(
      item => item.id === state.parentCategory
    );

    // 返回该主分类的children数据
    return (
      parentCategory?.children?.map(item => ({
        id: item.id,
        name: item.name,
        label: item.name,
        value: item.id,
        ...(item.avatar ? { avatar: { src: item.avatar } } : {}),
        ...(item.description ? { description: item.description } : {})
      })) || []
    );
  });

  const tags = tagControllerFindAll({
    composable: 'useAsyncData',
    query: {}
  });

  const tagsOptions = computed<SelectMenuItem[]>(() => {
    return (
      tags?.data.value?.data.data.map(item => ({
        id: item.id,
        name: item.name,
        label: item.name,
        value: item.id,
        avatar: { src: item.avatar }
      })) || []
    );
  });

  watch(
    () => state.parentCategory,
    () => {
      state.category = undefined;
    }
  );
</script>
