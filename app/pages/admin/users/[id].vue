<template>
  <div class="p-4 sm:p-6">
    <Title>{{ $t('admin.users.edit') }}</Title>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ $t('admin.users.editUser') }}</h1>
      <div class="flex items-center space-x-2">
        <UButton variant="outline" icon="mynaui:arrow-left" @click="navigateTo('/admin/users')">
          {{ $t('common.button.back') }}
        </UButton>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="user.pending.value" class="flex items-center justify-center py-20">
      <div class="flex items-center justify-center flex-col gap-8">
        <div
          class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
        />
        <p class="text-gray-600 dark:text-gray-400">{{ $t('common.loading.loading') }}</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="user.error.value" class="flex items-center justify-center py-20">
      <div class="text-center">
        <Icon name="mynaui:warning" class="text-red-500 text-4xl mb-4" />
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ $t('common.error.title') }}</p>
        <UButton
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
          @click="user.refresh?.()"
        >
          {{ $t('common.retry') }}
        </UButton>
      </div>
    </div>

    <!-- 编辑表单 -->
    <div v-else-if="user.data.value?.data" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：基本信息编辑 -->
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.users.basicInfo') }}</h3>
          </template>

          <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField :label="$t('admin.users.username')" name="username">
                <UInput v-model="state.username" class="w-full" />
              </UFormField>

              <UFormField :label="$t('admin.users.nickname')" name="nickname">
                <UInput v-model="state.nickname" class="w-full" />
              </UFormField>

              <UFormField :label="$t('admin.users.email')" name="email">
                <UInput v-model="state.email" type="email" class="w-full" />
              </UFormField>

              <UFormField :label="$t('admin.users.phone')" name="phone">
                <UInput v-model="state.phone" class="w-full" />
              </UFormField>

              <UFormField :label="$t('admin.users.status')" name="status">
                <USelect v-model="state.status" :items="statusOptions" class="w-full" />
              </UFormField>

              <UFormField :label="$t('admin.users.gender')" name="gender">
                <USelect v-model="state.gender" :items="genderOptions" class="w-full" />
              </UFormField>
            </div>

            <UFormField :label="$t('admin.users.description')" name="description">
              <UTextarea v-model="state.description" class="w-full" :rows="3" />
            </UFormField>

            <UFormField :label="$t('admin.users.address')" name="address">
              <UTextarea v-model="state.address" class="w-full" :rows="2" />
            </UFormField>

            <UFormField :label="$t('admin.users.birthDate')" name="birthDate">
              <UInput v-model="state.birthDate" type="date" class="w-full" />
            </UFormField>
          </UForm>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.users.membershipInfo') }}</h3>
          </template>

          <UForm
            :schema="membershipSchema"
            :state="membershipState"
            class="space-y-4"
            @submit="onSubmit"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField :label="$t('admin.users.membershipLevel')" name="membershipLevel">
                <UInput
                  v-model="membershipState.membershipLevel"
                  type="number"
                  min="0"
                  max="5"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="$t('admin.users.membershipStatus')" name="membershipStatus">
                <USelect
                  v-model="membershipState.membershipStatus"
                  :items="membershipStatusOptions"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="$t('admin.users.membershipStartDate')" name="membershipStartDate">
                <UInput
                  v-model="membershipState.membershipStartDate"
                  type="datetime-local"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="$t('admin.users.membershipEndDate')" name="membershipEndDate">
                <UInput
                  v-model="membershipState.membershipEndDate"
                  type="datetime-local"
                  class="w-full"
                />
              </UFormField>
            </div>
          </UForm>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.users.banInfo') }}</h3>
          </template>

          <UForm :schema="banSchema" :state="banState" class="space-y-4" @submit="onSubmit">
            <UFormField :label="$t('admin.users.banReason')" name="banReason">
              <UTextarea v-model="banState.banReason" class="w-full" :rows="3" />
            </UFormField>

            <UFormField :label="$t('admin.users.bannedAt')" name="banned">
              <UInput v-model="banState.banned" type="datetime-local" class="w-full" />
            </UFormField>
          </UForm>
        </UCard>

        <!-- 保存按钮 -->
        <div class="flex justify-end">
          <UButton color="primary" icon="mynaui:save" :loading="saving" size="lg" @click="saveUser">
            {{ $t('common.button.save') }}
          </UButton>
        </div>
      </div>

      <!-- 右侧：头像和统计信息 -->
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.users.avatar') }}</h3>
          </template>
          <div class="flex justify-center">
            <UAvatar
              :src="user.data.value.data.avatar"
              :alt="user.data.value.data.username"
              class="w-32 h-32"
              size="xl"
            />
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.users.statistics') }}</h3>
          </template>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t('admin.users.followerCount') }}
              </span>
              <span class="font-semibold">{{ user.data.value.data.followerCount || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t('admin.users.followingCount') }}
              </span>
              <span class="font-semibold">{{ user.data.value.data.followingCount || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t('admin.users.articleCount') }}
              </span>
              <span class="font-semibold">{{ user.data.value.data.articleCount || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t('admin.users.score') }}
              </span>
              <span class="font-semibold">{{ user.data.value.data.score || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t('admin.users.wallet') }}
              </span>
              <span class="font-semibold">{{ user.data.value.data.wallet || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t('admin.users.level') }}
              </span>
              <span class="font-semibold">{{ user.data.value.data.level || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t('admin.users.experience') }}
              </span>
              <span class="font-semibold">{{ user.data.value.data.experience || 0 }}</span>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.users.timestamps') }}</h3>
          </template>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ $t('admin.users.createdAt') }}
              </label>
              <p class="mt-1 text-gray-900 dark:text-gray-100">
                {{ formatDate(user.data.value.data.createdAt) }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ $t('admin.users.updatedAt') }}
              </label>
              <p class="mt-1 text-gray-900 dark:text-gray-100">
                {{ formatDate(user.data.value.data.updatedAt) }}
              </p>
            </div>
            <div v-if="user.data.value.data.lastLoginAt">
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ $t('admin.users.lastLoginAt') }}
              </label>
              <p class="mt-1 text-gray-900 dark:text-gray-100">
                {{ formatDate(user.data.value.data.lastLoginAt) }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { userControllerFindOne, userControllerUpdate } from '~/api';
  import * as z from 'zod';

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();
  const toast = useToast();

  // 获取用户数据
  const user = await userControllerFindOne({
    composable: 'useAsyncData',
    key: `user_${route.params.id}`,
    path: {
      id: String(route.params.id)
    }
  });

  // 表单验证模式
  const schema = z.object({
    username: z.string().min(1, '用户名不能为空'),
    nickname: z.string().optional(),
    email: z.email('邮箱格式不正确').optional().or(z.literal('')),
    phone: z.string().optional(),
    status: z.string().min(1, '状态不能为空'),
    gender: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    birthDate: z.string().optional()
  });

  const membershipSchema = z.object({
    membershipLevel: z.number().min(0, '会员等级不能小于1').max(5, '会员等级不能大于5'),
    membershipStatus: z.string().optional(),
    membershipStartDate: z.string().optional(),
    membershipEndDate: z.string().optional()
  });

  const banSchema = z.object({
    banReason: z.string().optional(),
    banned: z.string().optional()
  });

  // 表单状态
  const state = ref({
    username: '',
    nickname: '',
    email: '',
    phone: '',
    status: '',
    gender: '',
    description: '',
    address: '',
    birthDate: ''
  });

  const membershipState = ref({
    membershipLevel: 0,
    membershipStatus: '',
    membershipStartDate: '',
    membershipEndDate: ''
  });

  const banState = ref({
    banReason: '',
    banned: ''
  });

  // 选项数据
  const statusOptions = [
    { label: 'ACTIVE', value: 'ACTIVE' },
    { label: 'INACTIVE', value: 'INACTIVE' },
    { label: 'BANNED', value: 'BANNED' }
  ];

  const genderOptions = [
    { label: 'MALE', value: 'MALE' },
    { label: 'FEMALE', value: 'FEMALE' },
    { label: 'OTHER', value: 'OTHER' }
  ];

  const membershipStatusOptions = [
    { label: 'ACTIVE', value: 'ACTIVE' },
    { label: 'INACTIVE', value: 'INACTIVE' }
  ];

  // 格式化日期为input格式
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  // 保存状态
  const saving = ref(false);

  // 初始化表单数据
  watch(
    () => user.data.value?.data,
    userData => {
      if (userData) {
        // 基本信息
        state.value = {
          username: userData.username || '',
          nickname: userData.nickname || '',
          email: userData.email || '',
          phone: (userData.phone as string) || '',
          status: userData.status || '',
          gender: userData.gender || '',
          description: (userData.description as string) || '',
          address: (userData.address as string) || '',
          birthDate: userData.birthDate ? formatDateForInput(userData.birthDate as string) : ''
        };

        // 会员信息
        membershipState.value = {
          membershipLevel: userData.membershipLevel || 0,
          membershipStatus: userData.membershipStatus || '',
          membershipStartDate: userData.membershipStartDate
            ? formatDateForInput(userData.membershipStartDate as string)
            : '',
          membershipEndDate: userData.membershipEndDate
            ? formatDateForInput(userData.membershipEndDate as string)
            : ''
        };

        // 封禁信息
        banState.value = {
          banReason: (userData.banReason as string) || '',
          banned: userData.banned ? formatDateForInput(userData.banned as string) : ''
        };
      }
    },
    { immediate: true }
  );

  // 表单提交处理
  const onSubmit = (event: any) => {
    console.log('Form submitted:', event.data);
  };

  // 保存用户
  const saveUser = async () => {
    try {
      saving.value = true;

      // 合并所有表单数据
      const updateData = {
        ...state.value,
        ...membershipState.value,
        ...banState.value
      };

      await userControllerUpdate({
        composable: '$fetch',
        path: { id: String(route.params.id) },
        body: updateData
      });

      router.push('/admin/users');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.add({
        title: t('common.message.updateFailed'),
        color: 'error'
      });
    } finally {
      saving.value = false;
    }
  };

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };
</script>
