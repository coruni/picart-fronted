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
          v-model:modelValue="displayFiles"
          :placeholder="$t('form.image.placeholder')"
          accept="image/*"
          @update:modelValue="onImageUpload"
          :loading="uploading"
          multiple
          :ui="{ files: 'md:grid-cols-6' }"
        >
        </UFileUpload>
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
      >
        {{ $t('form.submit') }}
      </UButton>
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
    articleControllerUpdate,
    uploadControllerUploadFile
  } from '~~/api';
  import { useRoute } from 'vue-router';

  import type { SelectMenuItem } from '#ui/types';

  const toast = useToast();
  const { t } = useI18n();
  const route = useRoute();
  const articleId = route.params.id as string;

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  // 扩展File接口，添加自定义属性
  interface ExtendedFile extends File {
    _url?: string;
    _uploaded?: boolean;
    _uploading?: boolean;
    _id?: string;
  }

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

  // 文件列表，用于FileUpload组件展示
  const displayFiles = ref<ExtendedFile[]>([]);
  const uploading = ref(false);
  const loading = ref(false);

  // 将URL转换为File对象
  const createVirtualFile = async (url: string, index: number): Promise<ExtendedFile> => {
    try {
      // 从URL获取图片数据
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      // 将响应转换为Blob
      const blob = await response.blob();

      // 从URL获取文件名
      const fileName = url.split('/').pop() || `image-${index + 1}.${blob.type.split('/')[1]}`;

      // 从Blob创建File对象
      const file = new File([blob], fileName, { type: blob.type }) as ExtendedFile;
      file._url = url;
      file._uploaded = true;
      file._id = `existing_${index}_${Date.now()}`;

      return file;
    } catch (error) {
      console.error('Error converting URL to File:', error);
      // 创建一个默认的虚拟文件作为备选
      const fileName = url.split('/').pop() || `image-${index + 1}.jpg`;
      const file = new File([''], fileName, { type: 'image/jpeg' }) as ExtendedFile;
      file._url = url;
      file._uploaded = true;
      file._id = `existing_${index}_${Date.now()}`;
      return file;
    }
  };

  // 若 articleId 存在，请求文章详情数据
  if (articleId) {
    try {
      const { data: articleData } = await articleControllerFindOne({
        composable: 'useFetch',
        key: 'articleDetail',
        path: { id: articleId }
      });

      if (articleData.value?.data) {
        const data = articleData.value.data;

        Object.assign(state, {
          title: data.title ?? '',
          content: data.content ?? '',
          parentCategory: data.category?.parent?.id,
          categoryId: data.category?.id,
          images: data.images ?? '',
          type: data.type ?? 'mixed',
          tagIds: data.tags?.map(tag => tag.id) ?? [],
          requireLogin: data.requireLogin ?? false,
          requireFollow: data.requireFollow ?? false,
          requirePayment: data.requirePayment ?? false,
          viewPrice: data.viewPrice ?? 0
        });

        // 初始化已有图片
        if (state.images) {
          // 创建虚拟File对象
          const virtualFiles = await Promise.all(
            state.images.map((url: string, index: number) => createVirtualFile(url.trim(), index))
          );

          displayFiles.value = virtualFiles;
        }
      }
    } catch (error) {
      console.error('Failed to load article:', error);
    }
  }

  // 获取文件预览URL
  const getFilePreview = (file: ExtendedFile): string => {
    if (file._url) {
      return file._url;
    }

    if (file.size > 0) {
      return URL.createObjectURL(file);
    }

    return '';
  };

  // 图片上传处理
  const onImageUpload = async (files: unknown) => {
    if (!files || files.length === 0) return;

    // 找出新添加的文件（没有_uploaded标记的）
    const newFiles = files.filter((file: unknown): file is ExtendedFile => {
      if (file instanceof File) {
        const extendedFile = file as ExtendedFile;
        return !extendedFile._uploaded && !extendedFile._uploading;
      }
      return false;
    });

    if (newFiles.length === 0) return;

    // 标记新文件为正在上传
    newFiles.forEach((file: ExtendedFile) => {
      file._uploading = true;
    });

    uploading.value = true;

    try {
      // 一次上传多个文件
      const formData = new FormData();
      newFiles.forEach((file: ExtendedFile) => {
        formData.append('files', file);
      });

      const res = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {},
        bodySerializer: () => formData
      });

      // 更新所有文件状态
      newFiles.forEach((file: ExtendedFile, index: number) => {
        if (res.data && res.data[index]) {
          file._url = res.data[index].url!;
          file._uploaded = true;
          file._uploading = false;
          file._id = `uploaded_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        } else {
          // 上传失败的文件标记
          file._uploading = false;
        }
      });

      // 更新state.images
      updateStateImages();

      toast.add({
        title: t('common.message.uploadSuccess'),
        color: 'success'
      });
    } catch (error: any) {
      console.error('Failed to upload image:', error);

      // 移除上传失败的文件
      newFiles.forEach((failedFile: ExtendedFile) => {
        const index = displayFiles.value.findIndex(f => f === failedFile);
        if (index > -1) {
          displayFiles.value.splice(index, 1);
        }
      });

      toast.add({
        title: error?.message || t('common.message.uploadFailed'),
        color: 'error'
      });
    } finally {
      uploading.value = false;
    }
  };

  // 删除图片
  const removeImage = (index: number) => {
    if (index >= 0 && index < displayFiles.value.length) {
      const file = displayFiles.value[index];

      // 如果是本地预览URL，需要释放内存
      if (file.size > 0 && !file._url) {
        const url = getFilePreview(file);
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      }

      displayFiles.value.splice(index, 1);
      updateStateImages();

      toast.add({
        title: t('form.image.removeSuccess') || '图片删除成功',
        color: 'success'
      });
    }
  };

  // 图片重新排序
  const onImageReorder = () => {
    updateStateImages();
  };

  // 更新state.images
  const updateStateImages = () => {
    const urls = displayFiles.value
      .filter(file => file._url) // 只包含已上传或已存在的图片
      .map(file => file._url!);
    state.images = urls.join(',');
  };

  // 监听displayFiles变化
  watch(
    () => displayFiles.value,
    () => {
      updateStateImages();
    },
    { deep: true }
  );

  // 提交表单
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
          newTagNames.push(tag.label as string);
        } else {
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
      console.error('Failed to update article:', error);
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

  const parentCategoriesOptions = computed<SelectMenuItem[]>(() => {
    return (
      categories?.value?.data.data
        ?.filter(item => !item.parentId || item.parentId === item.id)
        ?.map(
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

    const parentCategory = categories?.value?.data.data?.find(
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

  interface TagMenuItem {
    id: string | number;
    label: string;
    value: string | number;
    avatar?: { src: string };
    flag?: boolean;
  }

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
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    const existingTag = tagsOptions.value.find(t => t.label === item);
    if (existingTag) {
      if (!state.tagIds) {
        state.tagIds = [];
      }
      if (!state.tagIds.includes(existingTag.id)) {
        state.tagIds.push(existingTag.id);
      }
      return;
    }

    const tag: TagMenuItem = {
      id: tempId,
      label: item,
      value: tempId,
      flag: true
    };

    tagsOptions.value.push(tag);

    if (!state.tagIds) {
      state.tagIds = [];
    }
    state.tagIds.push(tempId);
  };

  // 组件卸载时清理URL对象
  onUnmounted(() => {
    displayFiles.value.forEach(file => {
      if (file.size > 0 && !file._url) {
        const url = getFilePreview(file);
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      }
    });
  });
</script>

<style scoped>
  .cursor-move {
    cursor: move;
  }

  .cursor-move:active {
    cursor: grabbing;
  }
</style>
