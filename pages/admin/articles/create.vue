<template>
  <div class="flex-1 flex flex-col w-full">
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
          <MultiImageUpload
            v-model="state.images"
            accept="image/*"
            :max-size="5 * 1024 * 1024"
            :max-count="10"
            :help-text="$t('form.image.help')"
          />
        </UFormField>
      </template>

      <!-- Cover Image Upload -->
      <UFormField name="cover" :label="$t('form.cover.name')">
        <ImageUpload
          v-model="state.cover"
          accept="image/*"
          :max-size="2 * 1024 * 1024"
          :help-text="$t('form.cover.help')"
        />
      </UFormField>
      <div class="flex items-center space-x-2">
        <UFormField name="parentCategory" class="flex-1">
          <USelectMenu
            v-model="state.parentCategory"
            :items="parentCategoriesOptions"
            :placeholder="$t('form.parentCategory.placeholder')"
            value-key="id"
            option-attribute="name"
            variant="soft"
            class="w-full"
            size="lg"
            :search-input="{
              placeholder: $t('form.parentCategory.searchPlaceholder')
            }"
            :empty-state="{
              icon: 'i-heroicons-magnifying-glass',
              label: $t('form.parentCategory.noResults'),
              description: $t('form.parentCategory.noResultsDesc')
            }"
          />
        </UFormField>
        <UFormField name="category" v-if="state.parentCategory" class="flex-1">
          <USelectMenu
            v-model="state.categoryId"
            :items="subCategoriesOptions"
            :placeholder="$t('form.category.placeholder')"
            value-key="id"
            option-attribute="name"
            variant="soft"
            class="w-full"
            size="lg"
            :search-input="{
              placeholder: $t('form.category.searchPlaceholder')
            }"
            :empty-state="{
              icon: 'i-heroicons-magnifying-glass',
              label: $t('form.category.noResults'),
              description: $t('form.category.noResultsDesc')
            }"
          />
        </UFormField>
      </div>

      <!-- Sort Field -->
      <UFormField name="sort" :label="$t('form.sort.name')">
        <UInput
          v-model="state.sort"
          type="number"
          :min="0"
          :placeholder="$t('form.sort.placeholder')"
          variant="soft"
          class="w-full"
          size="lg"
        />
      </UFormField>

      <!-- 文章状态 -->
      <UFormField name="status" class="flex-1" :label="$t('form.status.name')">
        <USelect
          v-model="state.status"
          :items="statusOptions"
          :placeholder="$t('form.status.placeholder')"
          value-key="value"
          variant="soft"
          class="w-full"
          size="lg"
        />
      </UFormField>

      <UFormField name="tags" class="flex-1" :label="$t('form.tag.name')">
        <div class="space-y-2">
          <USelectMenu
            v-model="state.tagIds"
            :items="tagsOptions"
            size="lg"
            class="w-full"
            value-key="id"
            option-attribute="name"
            variant="soft"
            multiple
            :search-input="{
              placeholder: $t('form.tag.searchPlaceholder')
            }"
            :createItem="{ when: 'empty' }"
            :placeholder="$t('form.tag.placeholder')"
            :loading="isTagSearching"
            :empty-state="{
              icon: 'i-heroicons-magnifying-glass',
              label: $t('form.tag.noResults'),
              description: $t('form.tag.noResultsDesc')
            }"
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

      <!-- Downloads Section -->
      <UFormField name="downloads" :label="$t('form.downloads.name')">
        <div class="space-y-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('form.downloads.help') }}
          </div>

          <div
            v-for="(download, index) in state.downloads"
            :key="index"
            class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
          >
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ $t('form.downloads.name') }} #{{ index + 1 }}
              </h4>
              <UButton
                @click="removeDownload(index)"
                variant="ghost"
                color="error"
                size="sm"
                icon="mynaui:trash"
                class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                {{ $t('form.downloads.removeDownload') }}
              </UButton>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField :name="`downloads.${index}.type`" :label="$t('form.downloads.type.name')">
                <USelect
                  v-model="download.type"
                  :items="downloadTypeOptions"
                  :placeholder="$t('form.downloads.type.placeholder')"
                  value-key="value"
                  variant="soft"
                  size="lg"
                  class="w-full"
                />
              </UFormField>

              <UFormField :name="`downloads.${index}.url`" :label="$t('form.downloads.url.name')">
                <UInput
                  v-model="download.url"
                  :placeholder="$t('form.downloads.url.placeholder')"
                  variant="soft"
                  size="lg"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField
                :name="`downloads.${index}.password`"
                :label="$t('form.downloads.password.name')"
              >
                <UInput
                  v-model="download.password"
                  :placeholder="$t('form.downloads.password.placeholder')"
                  variant="soft"
                  size="lg"
                  class="w-full"
                />
              </UFormField>

              <UFormField
                :name="`downloads.${index}.extractionCode`"
                :label="$t('form.downloads.extractionCode.name')"
              >
                <UInput
                  v-model="download.extractionCode"
                  :placeholder="$t('form.downloads.extractionCode.placeholder')"
                  variant="soft"
                  size="lg"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <UButton
            @click="addDownload"
            variant="outline"
            size="lg"
            icon="mynaui:plus"
            class="w-full"
          >
            {{ $t('form.downloads.addDownload') }}
          </UButton>
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
                :min="state.requirePayment ? 1 : 0"
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
        >{{ $t('form.submit') }}</UButton
      >
    </UForm>
  </div>
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
  import { getStatusOptions, normalizeStatusForApi } from '~/utils/article-status';
  const router = useRouter();
  const { t } = useI18n();
  const toast = useToast();
  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  const schema = z.object({
    title: z.string().min(4, t('form.title.placeholder')),
    content: z.string().min(10, t('form.content.placeholder')),
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
    viewPrice: z.number().min(0).default(0),
    sort: z.number().min(0).default(0),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
    downloads: z
      .array(
        z.object({
          type: z.enum([
            'baidu',
            'google',
            'lanzou',
            'quark',
            'onedrive',
            'dropbox',
            'direct',
            'other',
            'mega'
          ]),
          url: z.string(),
          password: z.string().optional(),
          extractionCode: z.string().optional()
        })
      )
      .optional()
      .default([])
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
    viewPrice: 0,
    sort: 0,
    status: 'DRAFT',
    downloads: []
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

  const statusOptions = ref<SelectMenuItem[]>(getStatusOptions(t));

  const { locale } = useI18n();
  // TinyMCE 编辑器配置
  const editorConfig = {
    // 基础路径配置 - 指向 public/tinymce 目录
    base_url: '/tinymce',
    suffix: '.min',
    license_key: 'gpl',
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
      const existingTagIds: number[] = [];
      const newTagNames: string[] = [];

      state.tagIds?.forEach(id => {
        const tag = tagsOptions.value.find((t: TagMenuItem) => t.id === id);
        if (tag?.flag) {
          // 临时标签，使用名称
          newTagNames.push(tag.label as string);
        } else {
          // 现有标签，确保ID是数字
          const numericId = typeof id === 'string' ? Number(id) : id;
          existingTagIds.push(numericId);
        }
      });

      await articleControllerCreate({
        composable: '$fetch',
        body: {
          ...data,
          // 规范化状态为 API 支持的状态
          status: normalizeStatusForApi(data.status || 'DRAFT'),
          tagIds: existingTagIds.length > 0 ? existingTagIds : [],
          tagNames: newTagNames.length > 0 ? newTagNames : [],
          content: data.content ?? '',
          images: data.images,
          cover: coverFile.value?._url || data.cover || '',
          downloads: data.downloads || []
        }
      });

      router.push('/admin/articles');
    } catch (error) {
      console.error('Failed to create article:', error);
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

  // 获取标签数据
  const { data: tagsData } = await tagControllerFindAll({
    composable: 'useFetch',
    key: 'tags',
    query: computed(() => ({}))
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
  const selectedTags = ref<TagMenuItem[]>([]); // 已选择的标签
  const tagSearchQuery = ref('');
  const isTagSearching = ref(false); // 标签搜索加载状态

  // 搜索标签函数
  const searchTags = debounce(async (query: string = '') => {
    isTagSearching.value = true;
    try {
      const { data: tagsData } = await tagControllerFindAll({
        composable: '$fetch',
        query: {
          limit: 50,
          ...(query?.trim() && { name: query.trim() })
        }
      });

      // 获取搜索结果中的真实标签
      const searchResultTags = tagsData?.data
        ? tagsData.data.map((item: any) => ({
            id: item.id,
            label: item.name,
            value: item.id,
            ...(item.avatar && { avatar: { src: item.avatar } })
          }))
        : [];

      // 获取现有的临时标签（用户创建的）
      const existingTempTags = tagsOptions.value.filter(t => t.flag === true);

      // 获取已选择的标签
      const selectedTagIds = state.tagIds || [];
      const selectedTagItems = tagsOptions.value.filter(
        t => selectedTagIds.includes(t.id) || selectedTagIds.includes(t.value)
      );

      // 创建去重集合
      const uniqueTags = new Map<string | number, TagMenuItem>();

      // 1. 首先添加已选择的标签
      selectedTagItems.forEach(tag => {
        uniqueTags.set(tag.id, tag);
      });

      // 2. 添加临时标签（用户创建的）
      existingTempTags.forEach(tag => {
        uniqueTags.set(tag.id, tag);
      });

      // 3. 添加搜索结果，避免重复
      searchResultTags.forEach(tag => {
        // 检查是否已存在相同ID或相同名称的标签
        const existsById = uniqueTags.has(tag.id);
        const existsByName = Array.from(uniqueTags.values()).some(
          t => t.label.toLowerCase() === tag.label.toLowerCase()
        );

        if (!existsById && !existsByName) {
          uniqueTags.set(tag.id, tag);
        }
      });

      // 转换为数组
      tagsOptions.value = Array.from(uniqueTags.values());
    } catch (error) {
      console.error('搜索标签失败:', error);
    } finally {
      isTagSearching.value = false;
    }
  }, 500);

  // 初始化标签列表
  const initializeTags = async () => {
    try {
      const { data: tagsData } = await tagControllerFindAll({
        composable: '$fetch',
        query: { limit: 50 }
      });

      const initialTags = tagsData?.data
        ? tagsData.data.map((item: any) => ({
            id: item.id,
            label: item.name,
            value: item.id,
            ...(item.avatar && { avatar: { src: item.avatar } })
          }))
        : [];

      tagsOptions.value = initialTags;
    } catch (error) {
      console.error('初始化标签失败:', error);
    }
  };

  await initializeTags();

  // 监听搜索输入
  watch(tagSearchQuery, debounce(searchTags, 500));

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

  // 监听 requirePayment 变化，当关闭时重置 viewPrice
  watch(
    () => state.requirePayment,
    newValue => {
      if (!newValue) {
        state.viewPrice = 0;
      }
    }
  );

  // 创建新标签的函数
  const onCreate = (item: string) => {
    // 生成唯一的临时ID
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
        // 将已选择的标签添加到 selectedTags 中
        if (!selectedTags.value.find(t => t.id === existingTag.id)) {
          selectedTags.value.push(existingTag);
        }
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
    selectedTags.value.push(tag);

    // 自动选中新创建的标签
    if (!state.tagIds) {
      state.tagIds = [];
    }
    state.tagIds.push(tempId);
  };

  // 监听标签选择变化
  watch(
    () => state.tagIds,
    newTagIds => {
      if (!newTagIds) return;

      // 更新 selectedTags
      selectedTags.value = [];
      newTagIds.forEach((tagId: string | number) => {
        const tag = tagsOptions.value.find(t => t.id === tagId || t.value === tagId);
        if (tag && !selectedTags.value.find(t => t.id === tag.id)) {
          selectedTags.value.push(tag);
        }
      });
    },
    { deep: true }
  );

  // 添加下载链接
  const addDownload = () => {
    if (!state.downloads) {
      state.downloads = [];
    }
    state.downloads.push({
      type: 'direct',
      url: '',
      password: '',
      extractionCode: ''
    });
  };

  // 移除下载链接
  const removeDownload = (index: number) => {
    if (state.downloads) {
      state.downloads.splice(index, 1);
    }
  };

  // 下载类型选项
  const downloadTypeOptions = ref<SelectMenuItem[]>([
    {
      label: t('form.downloads.type.baidu'),
      value: 'baidu'
    },
    {
      label: t('form.downloads.type.google'),
      value: 'google'
    },
    {
      label: t('form.downloads.type.lanzou'),
      value: 'lanzou'
    },
    {
      label: t('form.downloads.type.quark'),
      value: 'quark'
    },
    {
      label: t('form.downloads.type.dropbox'),
      value: 'dropbox'
    },
    {
      label: t('form.downloads.type.direct'),
      value: 'direct'
    },
    {
      label: t('form.downloads.type.other'),
      value: 'other'
    },
    {
      label: t('form.downloads.type.mega'),
      value: 'mega'
    },
    {
      label: t('form.downloads.type.onedrive'),
      value: 'onedrive'
    }
  ]);

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
