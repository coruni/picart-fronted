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
          :rows="16"
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
          :ui="{ files: 'md:grid-cols-6' }"
        />
      </UFormField>
      <div class="flex items-center space-x-2">
        <UFormField name="parentCategory" class="flex-1">
          <USelectMenu
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
          <USelectMenu
            v-model="state.categoryId"
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
          v-model="state.tagIds"
          :items="tagsOptions"
          size="lg"
          class="w-full"
          value-key="id"
          variant="soft"
          multiple
          create-item
          :placeholder="$t('form.tag.placeholder')"
          @create="onCreate"
        />
      </UFormField>
      <UAccordion :items="[{ label: $t('form.advancedOptions'), slot: 'advanced' }]">
        <template #advanced>
          <div class="space-y-4 mt-4">
            <UFormField
              name="requireLogin"
              :label="$t('form.requireLogin')"
              class="flex items-center justify-between"
            >
              <USwitch v-model="state.requireLogin" />
            </UFormField>

            <UFormField
              name="requireFollow"
              :label="$t('form.requireFollow')"
              class="flex items-center justify-between"
            >
              <USwitch v-model="state.requireFollow" />
            </UFormField>

            <UFormField
              name="requirePayment"
              :label="$t('form.requirePayment')"
              class="flex items-center justify-between"
            >
              <USwitch v-model="state.requirePayment" />
            </UFormField>

            <UFormField
              name="viewPrice"
              :label="$t('form.viewPrice.name')"
              v-if="state.requirePayment"
              class="flex items-center justify-between"
            >
              <UInput
                v-model="state.viewPrice"
                type="number"
                variant="soft"
                :min="1"
                :placeholder="$t('form.viewPrice.placeholder')"
              />
            </UFormField>
          </div>
        </template>
      </UAccordion>

      <UButton
        type="submit"
        icon="i-mynaui-save"
        class="w-full cursor-pointer justify-center"
        size="lg"
        :loading="loading"
        >{{ $t('form.submit') }}</UButton
      >
    </UForm>
  </div>
</template>

<script lang="ts" setup>
  import * as z from 'zod';
  import { debounce } from 'lodash-es';

  import {
    categoryControllerFindAll,
    tagControllerFindAll,
    articleControllerFindOne,
    articleControllerUpdate
  } from '~~/api';
  import { useRoute } from 'vue-router'; // 导入 useRoute

  // 导入正确的类型
  import type { SelectMenuItem } from '#ui/types';
  const toast = useToast();
  const { t } = useI18n();
  const route = useRoute(); // 获取当前路由
  const articleId = route.params.id as string; // 获取文章 id

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  const schema = z.object({
    title: z.string().min(8, t('form.title.placeholder')),
    content: z.string().min(10, t('form.content.placeholder')),
    parentCategory: z.number().min(1, t('form.parentCategory.placeholder')),
    categoryId: z.number().min(1, t('form.category.placeholder')),
    images: z.any().optional(),
    type: z.enum(['mixed', 'image']).optional().default('mixed'),

    tagIds: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default([]),
    requireLogin: z.boolean().default(false),
    requireFollow: z.boolean().default(false),
    requirePayment: z.boolean().default(false),
    viewPrice: z.number().min(0).default(0)
  });

  type Schema = z.output<typeof schema>;

  const state = reactive<Partial<Schema>>({
    title: '',
    content: '',
    parentCategory: undefined,
    categoryId: undefined,
    images: '',
    type: 'mixed',
    tagIds: []
  });

  // 若 articleId 存在，请求文章详情数据
  if (articleId) {
    try {
      const { data: articleData } = await articleControllerFindOne({
        composable: 'useFetch',
        key: 'articleDetail',
        path: { id: articleId }
      });

      if (articleData.value) {
        // 使用可选链操作符确保安全访问
        Object.assign(state, {
          title: articleData.value?.data?.title ?? '',
          content: articleData.value?.data?.content ?? '',
          parentCategory: articleData.value?.data?.category?.parent?.id,
          categoryId: articleData.value?.data?.category.id,
          images: articleData.value?.data?.images ?? '',
          type: articleData.value?.data?.type ?? 'mixed',
          tagIds: articleData.value?.data?.tags.map(tag => tag.id) ?? [],
          requireLogin: articleData.value?.data?.requireLogin ?? false,
          requireFollow: articleData.value?.data?.requireFollow ?? false,
          requirePayment: articleData.value?.data?.requirePayment ?? false,
          viewPrice: articleData.value?.data?.viewPrice ?? 0
        });
      }
    } catch (error) {}
  }

  const loading = ref(false);

  const onSubmit = debounce(async () => {
    try {
      loading.value = true;
      const { parentCategory, ...data } = await schema.parseAsync(state);

      // 分离现有标签 ID 和新标签名称
      const existingTagIds: number[] = [];
      const newTagNames: string[] = [];

      state.tagIds?.forEach(id => {
        const tag = tagsOptions.value.find((t: TagMenuItem) => t.id === id);
        if (tag?.flag) {
          // 临时标签，使用名称
          newTagNames.push(tag.label as string);
        } else {
          // 现有标签，使用 ID
          const numericId = typeof id === 'string' ? parseInt(id) : id;
          if (!isNaN(numericId)) {
            existingTagIds.push(numericId);
          }
        }
      });

      // 编辑文章
      await articleControllerUpdate({
        composable: '$fetch',
        path: { id: articleId },
        body: {
          ...data,
          tagIds: existingTagIds.length > 0 ? existingTagIds.map(id => id.toString()) : undefined,
          tagNames: newTagNames.length > 0 ? newTagNames : undefined
        }
      });
      toast.add({
        title: t('common.message.updateSuccess'),
        color: 'success'
      });
    } catch (error) {
      toast.add({
        title: t('common.message.updateFailed'),
        color: 'error'
      });
    } finally {
      loading.value = false;
    }
  }, 500);

  // 获取分类数据
  const { data: categories } = await categoryControllerFindAll({
    composable: 'useFetch',
    key: 'categories',
    query: computed(() => ({}))
  });

  // 定义正确的 SelectMenuItem 类型的分类选项 - 只显示顶级分类且不包含children数据
  const parentCategoriesOptions = computed<SelectMenuItem[]>(() => {
    return (
      categories?.value?.data.data
        .filter(item => !item.parentId || item.parentId === item.id) // 显示顶级分类（无父分类或父分类是自己）
        .map(
          ({ id, name, avatar, description }) =>
            ({
              id,
              label: name,
              value: id,
              ...(avatar ? { avatar: { src: avatar } } : {}),
              ...(description ? { description } : {})
            }) as SelectMenuItem
        ) || []
    );
  });

  const subCategoriesOptions = computed<SelectMenuItem[]>(() => {
    if (!state.parentCategory) return [];

    const parentCategory = categories?.value?.data.data.find(
      item => item.id === state.parentCategory
    );

    return (
      parentCategory?.children?.map(
        item =>
          ({
            id: item.id,
            label: item.name,
            value: item.id,
            ...(item.avatar ? { avatar: { src: item.avatar } } : {}),
            ...(item.description ? { description: item.description } : {})
          }) as SelectMenuItem
      ) || []
    );
  });

  // 获取标签数据
  const { data: tagsData } = await tagControllerFindAll({
    composable: 'useFetch',
    key: 'tags',
    query: {}
  });

  // 简化 TagMenuItem 类型定义
  interface TagMenuItem {
    id: string | number;
    label: string;
    value: string | number;
    avatar?: { src: string };
    flag?: boolean;
  }

  // 替换原有的复杂类型定义
  const tagsOptions = ref<TagMenuItem[]>([]);

  // 初始化标签选项
  watch(
    () => tagsData?.value?.data.data,
    newTags => {
      if (newTags) {
        tagsOptions.value = newTags.map(
          item =>
            ({
              id: item.id,
              label: item.name,
              value: item.id,
              ...(item.avatar ? { avatar: { src: item.avatar } } : {})
            }) as TagMenuItem
        );
      }
    },
    { immediate: true }
  );

  // 监听父分类变化，重置子分类
  watch(
    () => state.parentCategory,
    () => {
      state.categoryId = undefined;
    }
  );

  // 创建新标签的函数
  const onCreate = (item: string) => {
    // 生成唯一的临时 ID
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    // 检查是否已存在相同名称的标签
    const existingTag = tagsOptions.value.find(t => t.label === item);
    if (existingTag) {
      // 如果已存在，直接选中
      if (!state.tagIds) {
        state.tagIds = [];
      }
      if (!state.tagIds.includes(existingTag.id)) {
        state.tagIds.push(existingTag.id);
      }
      return;
    }

    // 构建临时标签，确保符合 SelectMenuItem 接口
    const tag: TagMenuItem = {
      id: tempId,
      label: item,
      value: tempId,
      flag: true // 标记为临时标签
    };

    // 添加到选项列表
    tagsOptions.value.push(tag);

    // 自动选中新创建的标签
    if (!state.tagIds) {
      state.tagIds = [];
    }
    state.tagIds.push(tempId);
  };
</script>
