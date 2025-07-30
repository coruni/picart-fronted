<template>
  <div class="flex-1 flex flex-col w-full">
    <UForm :schema="schema" :state="form" @submit="onSubmit">
      <UFormField :label="t('common.table.name')" name="name" required>
        <UInput v-model="form.name" :placeholder="t('common.table.name')" class="w-full" />
      </UFormField>

      <UFormField :label="t('common.table.avatar')" name="avatar">
        <UInput v-model="form.avatar" :placeholder="t('common.table.avatar')" class="w-full" />
      </UFormField>

      <UFormField :label="t('common.table.background')" name="background">
        <UInput
          v-model="form.background"
          :placeholder="t('common.table.background')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('common.table.description')" name="description">
        <UTextarea
          v-model="form.description"
          :placeholder="t('common.table.description')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('common.table.sort')" name="sort">
        <UInput v-model="form.sort" type="number" min="0" class="w-full" />
      </UFormField>

      <div class="pt-4">
        <UButton type="submit" :loading="loading" class="w-full text-center cursor-pointer">
          {{ t('common.button.create') }}
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
  import { tagControllerCreate } from '~~/api';

  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();

  const loading = ref(false);

  const schema = z.object({
    name: z.string().min(1, t('validation.required')),
    description: z.string().optional(),
    sort: z.number().min(0).default(0),
    avatar: z.string().optional(),
    cover: z.string().optional(),
    background: z.string().optional()
  });

  type Schema = z.infer<typeof schema>;

  const form = ref<Schema>({
    name: '',
    description: '',
    sort: 0,
    avatar: '',
    cover: '',
    background: ''
  });

  const onSubmit = debounce(async () => {
    loading.value = true;
    try {
      await tagControllerCreate({
        composable: '$fetch',
        body: form.value
      });

      toast.add({
        title: t('common.message.createSuccess'),
        color: 'success'
      });

      router.push('/admin/tags');
    } catch (error) {
      toast.add({
        title: t('common.message.createFailed'),
        color: 'error'
      });
    } finally {
      loading.value = false;
    }
  }, 500);

  definePageMeta({
    layout: 'dashboard'
  });
</script>
