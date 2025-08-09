<template>
  <div class="flex-1 flex flex-col w-full">
    <h2 class="text-lg font-semibold">{{ t('admin.categories.edit') }}</h2>

    <UForm :schema="schema" :state="form" @submit="onSubmit">
      <UFormField :label="t('common.table.name')" name="name" required>
        <UInput
          v-model="form.name"
          class="w-full"
          size="lg"
          :placeholder="t('admin.categories.namePlaceholder')"
        />
      </UFormField>

      <UFormField :label="t('common.table.description')" name="description">
        <UTextarea
          class="w-full"
          size="lg"
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
          class="w-full"
          size="lg"
          :placeholder="t('admin.categories.selectParent')"
        />
      </UFormField>

      <UFormField :label="t('common.table.sort')" name="sort">
        <UInput v-model="form.sort" type="number" class="w-full" size="lg" />
      </UFormField>

      <UFormField :label="t('common.table.avatar')" name="avatar">
        <UFileUpload
          v-model:modelValue="displayFile"
          :placeholder="t('admin.categories.avatarPlaceholder')"
          accept="image/*"
          @update:modelValue="onImageUpload"
          :loading="uploading"
          :ui="{ base: 'w-24 h-24', root: 'w-24 h-24' }"
        >
        </UFileUpload>
      </UFormField>

      <UFormField :label="t('common.table.cover')" name="cover" class="w-full mt-4">
        <UFileUpload
          v-model:modelValue="coverFile"
          :placeholder="t('admin.categories.coverPlaceholder')"
          accept="image/*"
          @update:modelValue="onCoverUpload"
          :ui="{ base: 'w-32 h-32', root: 'w-32 h-32' }"
        />
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
  </div>
</template>

<script setup lang="ts">
  import { z } from 'zod';
  import { useI18n } from 'vue-i18n';
  import {
    categoryControllerFindAll,
    categoryControllerFindOne,
    categoryControllerUpdate,
    uploadControllerUploadFile
  } from '~~/api';
  import type { Category } from '~~/types/category';
  import type { SelectMenuItem } from '@nuxt/ui';
  import { onMounted, onUnmounted, watch } from 'vue';

  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const route = useRoute();

  const loading = ref(false);
  const coverFile = ref<ExtendedFile | null>(null);
  const displayFile = ref<ExtendedFile | null>(null);

  // 扩展File接口，添加自定义属性
  interface ExtendedFile extends File {
    _url?: string;
    _uploaded?: boolean;
    _uploading?: boolean;
    _id?: string;
  }

  // 上传状态
  const uploading = ref(false);
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
    avatar: z.string().optional(),
    cover: z.string().optional()
  });

  type Schema = z.infer<typeof schema>;

  const form = ref<Schema>({
    name: '',
    description: '',
    parentId: null,
    sort: 0,
    avatar: '',
    cover: ''
  });
  // 将URL转换为File对象
  const createVirtualFile = async (url: string, index: number = 0): Promise<ExtendedFile> => {
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

  // 获取分类详情
  const fetchCategory = async () => {
    const { data: categoryData } = await categoryControllerFindOne({
      composable: 'useFetch',
      path: { id: id.value }
    });

    if (categoryData.value?.data) {
      const data = categoryData.value.data;
      form.value = {
        name: data.name || '',
        description: data.description || '',
        parentId: data.parentId || null,
        sort: data.sort || 0,
        avatar: data.avatar || '',
        cover: data.cover || ''
      };
      displayFile.value = data.avatar ? await createVirtualFile(data.avatar) : null;
      coverFile.value = data.cover ? await createVirtualFile(data.cover) : null;
    }
  };
  fetchCategory();

  // 获取父分类列表
  const { data: parentCategoriesData } = await categoryControllerFindAll({
    composable: 'useLazyFetch',
    query: {
      page: 1,
      limit: 100
    }
  });

  // 图片上传处理
  const onImageUpload = async (files: unknown) => {
    // 只处理单个文件
    if (!files || (Array.isArray(files) && files.length === 0)) return;

    let newFile: ExtendedFile | null = null;

    // 获取第一个文件
    if (Array.isArray(files) && files[0] instanceof File) {
      newFile = files[0] as ExtendedFile;
      // 确保是新文件且未上传
      if (newFile._uploaded || newFile._uploading) {
        return;
      }
    } else if (files instanceof File) {
      newFile = files as ExtendedFile;
      if (newFile._uploaded || newFile._uploading) {
        return;
      }
    }

    if (!newFile) return;

    // 标记为正在上传
    newFile._uploading = true;
    displayFile.value = newFile;
    uploading.value = true;

    try {
      // 上传单个文件
      const formData = new FormData();
      formData.append('files', newFile);

      const res = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {},
        bodySerializer: () => formData
      });

      // 更新文件状态
      if (res.data && res.data[0]) {
        newFile._url = res.data[0].url!;
        newFile._uploaded = true;
        newFile._uploading = false;
        newFile._id = `uploaded_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

        // 同步更新 form.avatar
        form.value.avatar = newFile._url;

        displayFile.value = newFile;

        toast.add({
          title: t('common.message.uploadSuccess'),
          color: 'primary'
        });
      } else {
        // 上传失败
        newFile._uploading = false;
        displayFile.value = null;

        toast.add({
          title: t('common.message.uploadFailed'),
          color: 'error'
        });
      }
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      displayFile.value = null;

      toast.add({
        title: error?.message || t('common.message.uploadFailed'),
        color: 'error'
      });
    } finally {
      uploading.value = false;
    }
  };

  // 监听 displayFile 变化，同步更新 form.avatar
  watch(
    () => displayFile.value?._url,
    newUrl => {
      if (newUrl && displayFile.value?._uploaded) {
        form.value.avatar = newUrl;
      }
    }
  );

  // 监听 coverFile 变化，同步更新 form.cover
  watch(
    () => coverFile.value?._url,
    newUrl => {
      if (newUrl && coverFile.value?._uploaded) {
        form.value.cover = newUrl;
      }
    }
  );

  // 封面上传处理
  const onCoverUpload = async (files: unknown) => {
    // 只处理单个文件
    if (!files || (Array.isArray(files) && files.length === 0)) return;

    let newFile: ExtendedFile | null = null;

    // 获取第一个文件
    if (Array.isArray(files) && files[0] instanceof File) {
      newFile = files[0] as ExtendedFile;
      // 确保是新文件且未上传
      if (newFile._uploaded || newFile._uploading) {
        return;
      }
    } else if (files instanceof File) {
      newFile = files as ExtendedFile;
      if (newFile._uploaded || newFile._uploading) {
        return;
      }
    }

    if (!newFile) return;

    // 标记为正在上传
    newFile._uploading = true;
    coverFile.value = newFile;

    try {
      // 上传单个文件
      const formData = new FormData();
      formData.append('files', newFile);

      const res = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {},
        bodySerializer: () => formData
      });

      // 更新文件状态
      if (res.data && res.data[0]) {
        newFile._url = res.data[0].url!;
        newFile._uploaded = true;
        newFile._uploading = false;
        newFile._id = `uploaded_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

        // 同步更新 form.cover
        form.value.cover = newFile._url;

        coverFile.value = newFile;

        toast.add({
          title: t('common.message.uploadSuccess'),
          color: 'primary'
        });
      } else {
        // 上传失败
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
        title: error?.message || t('common.message.uploadFailed'),
        color: 'error'
      });
    } finally {
    }
  };

  // 组件卸载时清理URL对象

  const onSubmit = async () => {
    loading.value = true;

    // 确保使用最新的图片URL
    const formData = {
      ...form.value,
      avatar: displayFile.value?._url || form.value.avatar || '',
      cover: form.value.cover || ''
    };

    try {
      const body = await schema.parseAsync(formData);

      await categoryControllerUpdate({
        composable: '$fetch',
        path: { id: id.value },
        body: {
          ...body,
          parentId: body.parentId !== null ? body.parentId : undefined
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
    layout: 'dashboard',
    requiresAuth: true
  });
</script>
