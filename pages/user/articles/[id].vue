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

          <UFormField name="content" v-show="state.type === 'mixed'">
            <div class="w-full">
              <ClientOnly>
                <Editor
                  tinymce-script-src="/tinymce/tinymce.min.js"
                  v-model="state.content"
                  :init="editorConfig"
                  :placeholder="$t('form.content.placeholder')"
                  class="min-h-[400px]"
                />
                <template #fallback>
                  <div class="min-h-[400px] border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div class="text-gray-500 text-center">编辑器加载中...</div>
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
                :existing-images="existingImages"
                accept="image/*"
                :max-size="5 * 1024 * 1024"
                :help-text="$t('form.image.help')"
                aspect-ratio="16/9"
              />
            </UFormField>
          </template>

          <!-- Cover Image Upload -->
          <UFormField name="cover" :label="$t('form.cover.name')">
            <div class="space-y-2">
              <ImageUpload
                v-model="state.cover"
                :existing-image-url="existingCoverUrl"
                accept="image/*"
                :max-size="2 * 1024 * 1024"
                :help-text="$t('form.cover.help')"
                aspect-ratio="16/9"
              />
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
            <UFormField name="category" v-show="state.parentCategory" class="flex-1">
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
                  v-show="state.requirePayment"
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

          <!-- Downloads Section -->
          <UFormField
            name="downloads"
            :label="$t('form.downloads.name')"
            :help="$t('form.downloads.help')"
          >
            <div class="space-y-4">
              <div
                v-for="(download, index) in state.downloads"
                :key="index"
                class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
              >
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ $t('form.downloads.name') }} #{{ index + 1 }}
                  </h4>
                  <UButton
                    type="button"
                    color="error"
                    variant="soft"
                    size="sm"
                    icon="mynaui:trash"
                    class="cursor-pointer"
                    @click="removeDownload(index)"
                  >
                    {{ $t('form.downloads.removeDownload') }}
                  </UButton>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <UFormField
                    :name="`downloads.${index}.type`"
                    :label="$t('form.downloads.type.name')"
                  >
                    <USelect
                      v-model="download.type"
                      :items="downloadTypeOptions"
                      :placeholder="$t('form.downloads.type.placeholder')"
                      value-key="value"
                      variant="soft"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    :name="`downloads.${index}.url`"
                    :label="$t('form.downloads.url.name')"
                  >
                    <UInput
                      v-model="download.url"
                      :placeholder="$t('form.downloads.url.placeholder')"
                      variant="soft"
                      class="w-full"
                    />
                  </UFormField>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <UFormField
                    :name="`downloads.${index}.password`"
                    :label="$t('form.downloads.password.name')"
                  >
                    <UInput
                      v-model="download.password"
                      :placeholder="$t('form.downloads.password.placeholder')"
                      variant="soft"
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
                      class="w-full"
                    />
                  </UFormField>
                </div>
              </div>

              <UButton
                type="button"
                variant="soft"
                icon="mynaui:plus"
                @click="addDownload"
                class="w-full"
              >
                {{ $t('form.downloads.addDownload') }}
              </UButton>
            </div>
          </UFormField>

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
    categoryControllerFindAll,
    tagControllerFindAll,
    articleControllerFindOne,
    articleControllerUpdate,
    uploadControllerUploadFile
  } from '~~/api';

  import type { FormSubmitEvent, SelectMenuItem } from '@nuxt/ui';
  import Editor from '@tinymce/tinymce-vue';
  import { debounce } from 'lodash-es';

  const router = useRouter();
  const localePath = useLocalePath();
  const toast = useToast();
  const { t } = useI18n();
  const route = useRoute();
  const articleId = route.params.id as string;

  definePageMeta({
    layout: 'default',
    requiresAuth: true
  });

  const schema = z
    .object({
      title: z.string().min(4, t('form.title.placeholder')),
      content: z.string().optional(),
      parentCategory: z.number().optional(),
      categoryId: z.number().min(1, t('form.category.placeholder')),
      images: z.union([z.string(), z.array(z.string())]).optional(),
      cover: z.string().optional(),
      type: z.enum(['mixed', 'image']).optional().default('mixed'),
      tagIds: z
        .array(z.union([z.string(), z.number()]))
        .optional()
        .default([]),
      requireLogin: z.boolean().default(false),
      requireFollow: z.boolean().default(false),
      requireMembership: z.boolean().default(false),
      requirePayment: z.boolean().default(false),
      viewPrice: z.number().min(0).optional().default(0),
      downloads: z
        .array(
          z.object({
            type: z.enum([
              'baidu',
              'google',
              'aliyun',
              'lanzou',
              'quark',
              'dropbox',
              'direct',
              'other',
              'mega',
              'onedrive'
            ]),
            url: z.string(),
            password: z.string().optional(),
            extractionCode: z.string().optional()
          })
        )
        .optional()
        .default([])
    })
    .refine(
      data => {
        // 如果 requirePayment 为 true，则 viewPrice 必须大于 0
        if (data.requirePayment && (!data.viewPrice || data.viewPrice <= 0)) {
          return false;
        }
        return true;
      },
      {
        message: t('form.viewPrice.required'),
        path: ['viewPrice']
      }
    );

  type Schema = z.output<typeof schema>;

  const state = reactive<Partial<Schema>>({
    title: '',
    content: '',
    parentCategory: undefined,
    categoryId: undefined,
    images: [] as string[],
    cover: '',
    type: 'mixed',
    tagIds: [],
    requireLogin: false,
    requireFollow: false,
    requireMembership: false,
    requirePayment: false,
    viewPrice: 0,
    downloads: []
  });

  const loading = ref(false);

  // 用于新组件的现有图片数据
  const existingImages = ref<Array<{ id: string; url: string }>>([]);
  const existingCoverUrl = ref<string>('');

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
          cover: data.cover ?? '',
          type: data.type ?? 'mixed',
          tagIds: data.tags?.map(tag => Number(tag.id)) ?? [],
          requireLogin: data.requireLogin ?? false,
          requireFollow: data.requireFollow ?? false,
          requireMembership: data.requireMembership ?? false,
          requirePayment: data.requirePayment ?? false,
          viewPrice: Number(data.viewPrice) ?? 0,
          downloads:
            data.downloads?.map(d => ({
              type: d.type,
              url: d.url,
              ...(d.password && { password: d.password }),
              ...(d.extractionCode && { extractionCode: d.extractionCode })
            })) ?? []
        });

        // 初始化已有图片
        if (data.images) {
          const imageUrls = Array.isArray(data.images)
            ? data.images
            : String(data.images).split(',').filter(Boolean);
          existingImages.value = imageUrls.map((url: string, index: number) => ({
            id: `existing_${index}_${Date.now()}`,
            url: url.trim()
          }));
        }

        // 初始化封面图片
        if (data.cover) {
          existingCoverUrl.value = data.cover;
        }
      }
    } catch (error) {
      console.error('Failed to load article:', error);
    }
  }

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

      // 编辑文章
      await articleControllerUpdate({
        composable: '$fetch',
        path: { id: articleId },
        body: {
          ...data,
          tagIds: existingTagIds.length > 0 ? existingTagIds : undefined,
          tagNames: newTagNames.length > 0 ? newTagNames : undefined,
          images: Array.isArray(data.images) ? data.images.join(',') : data.images || '',
          cover: data.cover || '',
          downloads:
            data.downloads?.map(d => ({
              type: d.type,
              url: d.url,
              ...(d.password && { password: d.password }),
              ...(d.extractionCode && { extractionCode: d.extractionCode })
            })) || []
        }
      });

      router.push(localePath('/user'));
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

  interface TagMenuItem {
    id: string | number;
    label: string;
    value: string | number;
    avatar?: { src: string };
    flag?: boolean;
  }

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
    state.tagIds.push(tempId);
  };

  // Downloads Section
  const downloadTypeOptions = ref<SelectMenuItem[]>([
    { label: t('form.downloads.type.baidu'), value: 'baidu' },
    { label: t('form.downloads.type.google'), value: 'google' },
    { label: t('form.downloads.type.aliyun'), value: 'aliyun' },
    { label: t('form.downloads.type.lanzou'), value: 'lanzou' },
    { label: t('form.downloads.type.quark'), value: 'quark' },
    { label: t('form.downloads.type.dropbox'), value: 'dropbox' },
    { label: t('form.downloads.type.direct'), value: 'direct' },
    { label: t('form.downloads.type.other'), value: 'other' },
    { label: t('form.downloads.type.mega'), value: 'mega' },
    { label: t('form.downloads.type.onedrive'), value: 'onedrive' }
  ]);

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

  const removeDownload = (index: number) => {
    if (state.downloads) {
      state.downloads.splice(index, 1);
    }
  };
</script>

<style scoped>
  .cursor-move {
    cursor: move;
  }

  .cursor-move:active {
    cursor: grabbing;
  }
</style>
