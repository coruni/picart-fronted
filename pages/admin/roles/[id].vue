<template>
  <div class="flex-1 flex flex-col w-full max-w-4xl mx-auto">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('admin.roles.edit') }}
        </h2>
      </div>
      <UButton variant="outline" icon="mynaui:arrow-left" @click="$router.push('/admin/roles')">
        {{ t('common.button.back') }}
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="role.pending.value" class="flex items-center justify-center py-12">
      <UIcon name="mynaui:loading" class="w-8 h-8 animate-spin text-primary" />
      <span class="ml-2 text-gray-600">{{ t('common.loading') }}</span>
    </div>

    <!-- Form -->
    <UForm v-else :schema="schema" :state="form" @submit="onSubmit" class="space-y-6">
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

      <UFormField :label="t('common.table.description')" name="description">
        <UTextarea
          class="w-full"
          size="lg"
          v-model="form.description"
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
          :loading="pending"
        />
      </UFormField>

      <UFormField :label="t('common.table.status')" name="isActive">
        <USwitch v-model="form.isActive" />
      </UFormField>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <UButton variant="outline" @click="$router.push('/admin/roles')" :disabled="submitting">
          {{ t('common.button.cancel') }}
        </UButton>
        <UButton type="submit" :loading="submitting" :disabled="!form.name.trim()">
          {{ t('common.button.update') }}
        </UButton>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
  import { z } from 'zod';
  import { useI18n } from 'vue-i18n';
  import { roleControllerFindOne, roleControllerUpdate, permissionControllerFindAll } from '~~/api';

  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const localePath = useLocalePath();
  const route = useRoute();

  // Loading states
  const submitting = ref(false);

  const roleId = computed(() => route.params.id as string);

  // Enhanced schema with better validation
  const schema = z.object({
    name: z
      .string()
      .min(1, t('validation.required'))
      .max(50, t('validation.maxLength', { max: 50 }))
      .trim(),
    description: z
      .string()
      .max(200, t('validation.maxLength', { max: 200 }))
      .optional()
      .nullable(),
    permissionIds: z.array(z.number()).default([]),
    isActive: z.boolean().default(true),
    displayName: z.string().optional().nullable()
  });

  type Schema = z.infer<typeof schema>;

  const form = ref<Schema>({
    name: '',
    description: '',
    permissionIds: [],
    isActive: true,
    displayName: ''
  });

  // 获取角色详情
  const role = await roleControllerFindOne({
    composable: 'useAsyncData',
    key: `role-${roleId.value}`,
    path: { id: roleId.value }
  });

  // 获取权限列表
  const { data: permissions, pending } = await permissionControllerFindAll({
    composable: 'useAsyncData',
    key: 'permissions'
  });

  // 权限选项
  const permissionOptions = computed(() => {
    return (
      permissions.value?.data.data?.map((permission: any) => ({
        label: permission.name,
        value: permission.id,
        description: permission.description
      })) || []
    );
  });

  // 监听角色数据变化，初始化表单
  watch(
    role.data,
    newRole => {
      if (newRole && typeof newRole === 'object') {
        form.value = {
          name: newRole.data.name || '',
          description: newRole.data.description || '',
          permissionIds: newRole.data.permissions?.map((p: any) => p.id) || [],
          isActive: newRole.data.isActive !== false,
          displayName: newRole.data.displayName as string
        };
      }
    },
    { immediate: true }
  );

  // Form submission
  const onSubmit = async () => {
    submitting.value = true;

    try {
      const body = await schema.parseAsync(form.value);

      await roleControllerUpdate({
        composable: '$fetch',
        path: { id: roleId.value },
        body: {
          name: body.name,
          description: body.description || undefined,
          permissionIds: body.permissionIds,
          isActive: body.isActive,
          displayName: body.displayName || undefined
        }
      });

      router.push(localePath('/admin/roles'));
    } catch (error: any) {
      console.error('Failed to update role:', error);
      toast.add({
        title: t('common.message.updateFailed'),
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
