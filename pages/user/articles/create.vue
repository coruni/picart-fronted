<template>
  <ClientOnly>
    <div class="flex-1 flex flex-col w-full">
      <div class="w-full flex-1 max-w-4xl mx-auto p-4">
        <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
          <div class="flex items-start space-x-4">
            <UFormField name="title" class="flex-1">
              <UInput
                v-model="state.title"
                size="xl"
                :placeholder="$t('form.title.placeholder')"
                variant="soft"
                class="w-full"
              />
            </UFormField>
            <UFormField name="type">
              <USelect
                v-model="state.type"
                :items="typeOptions"
                :placeholder="$t('form.type.placeholder')"
                value-key="value"
                variant="soft"
                size="xl"
                class="w-full h-full"
              />
            </UFormField>
          </div>

          <UFormField name="content" v-if="state.type === 'mixed'">
            <div class="w-full">
              <ClientOnly>
                <Editor
                  v-model="state.content"
                  tinymce-script-src="/tinymce/tinymce.min.js"
                  :init="editorConfig"
                  :placeholder="$t('form.content.placeholder')"
                  class="min-h-[400px]"
                />
                <template #fallback>
                  <div class="min-h-[400px] rounded-lg p-4 bg-gray-100 dark:bg-gray-900">
                    <div class="text-gray-500 dark:text-white text-center">
                      {{ $t('common.loading.loading') }}
                    </div>
                  </div>
                </template>
              </ClientOnly>
            </div>
          </UFormField>
          <template v-if="state.type === 'image'">
            <UFormField name="content">
              <UTextarea
                v-model="state.content"
                :placeholder="$t('form.content.placeholder')"
                variant="soft"
                class="w-full"
                size="xl"
              />
            </UFormField>
            <UFormField name="images" :label="$t('form.image.name')">
              <UFileUpload
                v-model:modelValue="displayFiles"
                draggable
                dropzone
                :placeholder="$t('form.image.placeholder')"
                accept="image/*"
                @update:modelValue="onImageUpload"
                :loading="uploading"
                multiple
                :ui="{ files: 'md:grid-cols-6', icon: 'cursor-pointer' }"
              >
              </UFileUpload>
            </UFormField>
          </template>

          <!-- Cover Image Upload -->
          <UFormField name="cover" :label="$t('form.cover.name')">
            <div class="space-y-2">
              <UFileUpload
                v-model:modelValue="coverFile"
                :placeholder="$t('form.cover.placeholder')"
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
                {{ $t('form.cover.help') }}
              </p>
            </div>
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
            <div class="space-y-2">
              <USelectMenu
                v-model="state.tagIds"
                :items="tagsOptions"
                size="lg"
                class="w-full"
                value-key="id"
                variant="soft"
                multiple
                create-item
                searchable
                :search-placeholder="$t('form.tag.searchPlaceholder')"
                :placeholder="$t('form.tag.placeholder')"
                @create="onCreate"
                @update:searchTerm="
                  (query: string) => {
                    tagSearchQuery = query;
                    searchTags(query);
                  }
                "
              />
            </div>
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
                  name="requireMembership"
                  :label="$t('form.requireMembership')"
                  class="flex items-center justify-between"
                >
                  <USwitch v-model="state.requireMembership" />
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
            icon="mynaui:save"
            class="w-full cursor-pointer justify-center"
            size="lg"
            :loading="loading"
          >
            {{ $t('form.submit') }}
          </UButton>
        </UForm>
      </div>
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
  import * as z from 'zod';
  import {
    articleControllerCreate,
    categoryControllerFindAll,
    tagControllerFindAll,
    uploadControllerUploadFile
  } from '~~/api';
  import type { SelectMenuItem } from '#ui/types';
  import { debounce } from 'lodash-es';
  import Editor from '@tinymce/tinymce-vue';

  const router = useRouter();
  const localePath = useLocalePath();
  const { t } = useI18n();
  const toast = useToast();

  definePageMeta({
    layout: 'default',
    requiresAuth: true
  });

  const schema = z.object({
    title: z.string().min(4, t('form.title.placeholder')),
    content: z.string().optional(),
    parentCategory: z.number().min(1, t('form.parentCategory.placeholder')),
    categoryId: z.number().min(1, t('form.category.placeholder')),
    images: z.any().optional(),
    cover: z.string().optional(),
    type: z.enum(['mixed', 'image']).optional().default('mixed'),
    tagIds: z
      .array(z.union([z.string(), z.number()]))
      .optional()
      .default([]),
    requireLogin: z.boolean().default(false),
    requireFollow: z.boolean().default(false),
    requirePayment: z.boolean().default(false),
    requireMembership: z.boolean().default(false),
    viewPrice: z.number().min(0).default(0)
  });

  type Schema = z.output<typeof schema>;

  const state = reactive<Partial<Schema>>({
    title: '',
    content: '',
    parentCategory: undefined,
    categoryId: undefined,
    images: '',
    cover: '',
    type: 'mixed',
    tagIds: [],
    requireLogin: false,
    requireFollow: false,
    requirePayment: false,
    requireMembership: false,
    viewPrice: 0
  });

  const loading = ref(false);

  // 扩展File接口，添加自定义属性
  interface ExtendedFile extends File {
    _url?: string;
    _uploaded?: boolean;
    _uploading?: boolean;
    _id?: string;
  }

  // 文件列表，用于FileUpload组件展示
  const displayFiles = ref<ExtendedFile[]>([]);
  const coverFile = ref<ExtendedFile | null>(null);
  const uploading = ref(false);
  const coverUploading = ref(false);

  const typeOptions = ref<SelectMenuItem[]>([
    {
      label: t('form.type.mixed'),
      value: 'mixed'
    },
    {
      label: t('form.type.image'),
      value: 'image'
    }
  ]);
  const { locale } = useI18n();
  // TinyMCE 编辑器配置
  const editorConfig = {
    // 基础路径配置 - 指向 public/tinymce 目录
    base_url: '/tinymce',
    suffix: '.min',

    // 插件配置
    plugins: [
      'advlist',
      'autolink',
      'lists',
      'link',
      'image',
      'charmap',
      'preview',
      'anchor',
      'searchreplace',
      'visualblocks',
      'code',
      'fullscreen',
      'insertdatetime',
      'media',
      'table',
      'help',
      'wordcount'
    ],

    // 工具栏配置
    toolbar:
      'undo redo | formatselect | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat | help',

    // 内容样式
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',

    // 基础配置
    height: 400,
    menubar: false,
    branding: false,
    promotion: false,

    // 中文界面
    language: locale.value,

    // 图片上传配置（使用服务器上传）
    images_upload_handler: async (blobInfo: any, progress: any) => {
      try {
        const formData = new FormData();
        formData.append('files', blobInfo.blob(), blobInfo.filename());

        const res = await uploadControllerUploadFile({
          composable: '$fetch',
          body: {},
          bodySerializer: () => formData
        });

        if (res.data && res.data[0]) {
          return res.data[0].url;
        } else {
          throw new Error('上传失败');
        }
      } catch (error) {
        console.error('图片上传失败:', error);

        throw error;
      }
    },

    // 启用在线功能
    automatic_uploads: true,
    file_picker_types: 'image',

    // 编辑器设置
    paste_data_images: true, // 允许粘贴图片
    paste_as_text: false,

    // 响应式配置
    width: '100%',
    min_height: 300,
    max_height: 600,

    // 移除不需要的功能
    elementpath: false,
    resize: true,
    statusbar: false,

    // 禁用在线验证
    verify_html: false,
    cleanup: false,

    // 设置编辑器为可编辑
    readonly: false
  };

  // 图片上传处理
  const onImageUpload = async (files: any) => {
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

        state.cover = newFile._url;
        coverFile.value = newFile;

        toast.add({
          title: t('common.message.uploadSuccess'),
          color: 'primary'
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

  // 监听cover文件变化
  watch(
    () => coverFile.value?._url,
    newUrl => {
      if (newUrl && coverFile.value?._uploaded) {
        state.cover = newUrl;
      }
    }
  );

  const onSubmit = debounce(async () => {
    try {
      loading.value = true;
      const { parentCategory, ...data } = await schema.parseAsync(state);

      // 分离现有标签ID和新标签名称
      const existingTagIds: string[] = [];
      const newTagNames: string[] = [];

      state.tagIds?.forEach(id => {
        const tag = tagsOptions.value.find((t: TagMenuItem) => t.id === id);
        if (tag?.flag) {
          // 临时标签，使用名称
          newTagNames.push(tag.label as string);
        } else {
          // 现有标签，使用ID
          const stringId = typeof id === 'number' ? id.toString() : id;
          existingTagIds.push(stringId);
        }
      });

      await articleControllerCreate({
        composable: '$fetch',
        body: {
          ...data,
          tagIds: existingTagIds.length > 0 ? existingTagIds : [],
          tagNames: newTagNames.length > 0 ? newTagNames : [],
          content: data.content ?? '',
          images: data.images,
          cover: coverFile.value?._url || data.cover || ''
        }
      });

      toast.add({
        title: t('common.message.createSuccess'),
        color: 'primary'
      });

      router.push(localePath('/user'));
    } catch (error) {
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

  // 定义正确的 SelectMenuItem 类型的分类选项
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

  // 简化 TagMenuItem 类型定义
  interface TagMenuItem {
    id: string | number;
    label: string;
    value: string | number;
    avatar?: { src: string };
    flag?: boolean;
  }

  // 标签选项
  const tagsOptions = ref<TagMenuItem[]>([]);
  const tagSearchQuery = ref('');

  // 搜索标签函数
  const searchTags = debounce(async (query: string = '') => {
    try {
      const { data: tagsData } = await tagControllerFindAll({
        composable: '$fetch',
        query: {
          limit: 50,
          ...(query?.trim() && { name: query.trim() })
        }
      });

      // 获取现有的临时标签
      const existingTempTags = tagsOptions.value.filter(t => t.flag === true);

      // 获取现有的真实标签
      const existingRealTags = tagsData?.data
        ? tagsData.data.map((item: any) => ({
            id: item.id,
            label: item.name,
            value: item.id,
            ...(item.avatar && { avatar: { src: item.avatar } })
          }))
        : [];

      // 合并：临时标签 + 搜索结果中的真实标签（去重）
      const allTags = [...existingTempTags];

      // 添加搜索结果，避免重复
      existingRealTags.forEach((newTag: TagMenuItem) => {
        const exists = allTags.some(t => t.id === newTag.id || t.label === newTag.label);
        if (!exists) {
          allTags.push(newTag);
        }
      });

      tagsOptions.value = allTags;
    } catch (error) {
      console.error('搜索标签失败:', error);
    }
  }, 500);
  await searchTags();

  // 监听搜索输入
  watch(tagSearchQuery, debounce(searchTags, 500));

  // 监听父分类变化
  watch(
    () => state.parentCategory,
    () => (state.categoryId = undefined)
  );

  // 创建新标签的函数
  const onCreate = (item: string) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const existingTag = tagsOptions.value.find(t => t.label === item);

    if (existingTag) {
      if (!state.tagIds) state.tagIds = [];
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
    if (!state.tagIds) state.tagIds = [];
    state.tagIds.push(tempId); // 这里保持原样，因为onSubmit会正确处理
  };

  // 组件卸载时清理URL对象
  onUnmounted(() => {
    displayFiles.value.forEach(file => {
      if (file.size > 0 && !file._url) {
        const url = URL.createObjectURL(file);
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      }
    });

    if (coverFile.value?._url && coverFile.value._url.startsWith('blob:')) {
      URL.revokeObjectURL(coverFile.value._url);
    }
  });
</script>
