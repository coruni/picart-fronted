<template>
  <div class="flex-1 flex flex-col w-full max-w-4xl mx-auto">
    <Title>{{ $t('admin.roles.create') }}</Title>
    <!-- 页面头部 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('admin.roles.create') }}
        </h2>
      </div>
      <UButton variant="outline" icon="mynaui:arrow-left" @click="$router.push('/admin/roles')">
        {{ t('common.button.back') }}
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="permissions.pending.value" class="flex items-center justify-center py-12">
      <UIcon name="mynaui:loading" class="w-8 h-8 animate-spin text-primary" />
      <span class="ml-2 text-gray-600">{{ t('common.loading') }}</span>
    </div>

    <!-- Form -->
    <UForm v-else :schema="schema" :state="form" class="space-y-6" @submit="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField :label="t('common.table.name')" name="name" required>
          <UInput
            v-model="form.name"
            class="w-full"
            size="lg"
            :placeholder="t('admin.roles.namePlaceholder')"
          />
        </UFormField>

        <UFormField :label="t('common.table.displayName')" name="displayName">
          <UInput
            v-model="form.displayName"
            class="w-full"
            size="lg"
            :placeholder="t('admin.roles.displayNamePlaceholder')"
          />
        </UFormField>
      </div>

      <UFormField :label="t('common.table.description')" name="description" required>
        <UTextarea
          v-model="form.description"
          class="w-full"
          size="lg"
          :placeholder="t('admin.roles.descriptionPlaceholder')"
          :rows="3"
        />
      </UFormField>

      <UFormField :label="t('common.table.permissions')" name="permissionIds">
        <USelect
          v-model="form.permissionIds"
          :items="permissionOptions"
          multiple
          class="w-full"
          size="lg"
          :placeholder="t('admin.roles.selectPermissions')"
          :loading="permissions.pending.value"
        />
      </UFormField>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <UButton variant="outline" :disabled="submitting" @click="$router.push('/admin/roles')">
          {{ t('common.button.cancel') }}
        </UButton>
        <UButton type="submit" :loading="submitting" :disabled="!form.name.trim()">
          {{ t('common.button.create') }}
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
  import { z } from 'zod';
  import { useI18n } from 'vue-i18n';
  import { roleControllerCreate, permissionControllerFindAll } from '~/api';

  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const localePath = useLocalePath();
  // Loading states
  const submitting = ref(false);

  // Enhanced schema with better validation
  const schema = z.object({
    name: z
      .string()
      .min(1, t('validation.required'))
      .max(50, t('validation.maxLength', { max: 50 }))
      .trim(),
    description: z
      .string()
      .min(1, t('validation.required'))
      .max(200, t('validation.maxLength', { max: 200 }))
      .trim(),
    permissionIds: z.array(z.number()).default([]),
    displayName: z.string().optional().nullable()
  });

  type Schema = z.infer<typeof schema>;

  const form = ref<Schema>({
    name: '',
    description: '',
    permissionIds: [],
    displayName: ''
  });

  // 获取权限列表
  const permissions = await permissionControllerFindAll({
    composable: 'useAsyncData',
    key: 'permissions'
  });

  // 权限选项
  const permissionOptions = computed(() => {
    return (
      permissions.data.value?.data.data?.map((permission: any) => ({
        label: permission.name,
        value: permission.id,
        description: permission.description
      })) || []
    );
  });

  // Form submission
  const onSubmit = async () => {
    submitting.value = true;

    try {
      const body = await schema.parseAsync(form.value);

      await roleControllerCreate({
        composable: '$fetch',
        body: {
          name: body.name,
          description: body.description,
          permissionIds: body.permissionIds?.map(id => id.toString()) || [],
          displayName: body.displayName || undefined
        } as any
      });

      router.push(localePath('/admin/roles'));
    } catch (error: any) {
      console.error('Failed to create role:', error);
      toast.add({
        title: t('common.message.createFailed'),
        description: error.message,
        color: 'error'
      });
    } finally {
      submitting.value = false;
    }
  };

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });
</script>
