<template>
  <div class="flex-1 flex flex-col w-full">
    <UForm v-if="tag" :schema="schema" :state="form" @submit="onSubmit">
      <UFormField :label="t('common.table.name')" name="name" required>
        <UInput v-model="form.name" :placeholder="t('admin.tags.namePlaceholder')" class="w-full" />
      </UFormField>

      <UFormField :label="t('common.table.avatar')" name="avatar">
        <UInput
          v-model="form.avatar"
          :placeholder="t('admin.tags.avatarPlaceholder')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('common.table.background')" name="background">
        <UInput
          v-model="form.background"
          :placeholder="t('admin.tags.backgroundPlaceholder')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('common.table.description')" name="description">
        <UTextarea
          v-model="form.description"
          :placeholder="t('admin.tags.descriptionPlaceholder')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('common.table.sort')" name="sort">
        <UInput v-model="form.sort" type="number" min="0" class="w-full" />
      </UFormField>

      <div class="pt-4">
        <UButton type="submit" :loading="loading" class="w-full text-center cursor-pointer">
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

  const loading = ref(false);
  const tag = ref<Tag | null>(null);

  const id = computed(() => route.params.id as string);

  const schema = z.object({
    name: z.string().min(1, t('validation.required')),
    description: z.string().optional(),
    sort: z.number().min(0).default(0),
    avatar: z.string().optional(),
    background: z.string().optional()
  });

  type Schema = z.infer<typeof schema>;

  const form = ref<Schema>({
    name: '',
    description: '',
    sort: 0,
    avatar: '',
    background: ''
  });

  // 获取标签详情
  const { data: tagData } = await tagControllerFindOne({
    composable: 'useLazyFetch',
    path: { id: id.value }
  });

  // 初始化表单数据
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

  const onSubmit = debounce(async () => {
    loading.value = true;
    try {
      await tagControllerUpdate({
        composable: '$fetch',
        path: { id: id.value },
        body: form.value
      });

      toast.add({
        title: t('common.message.updateSuccess'),
        color: 'success'
      });

      router.push('/admin/tags');
    } catch (error) {
      console.error('Failed to update tag:', error);
    } finally {
      loading.value = false;
    }
  }, 500);

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });
</script>
