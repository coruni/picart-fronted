<template>
  <div class="min-h-screen">
    <div class="flex flex-col lg:flex-row gap-4 md:gap-8 relative">
      <!-- 左侧主内容区 -->
      <div class="flex-1">
        <!-- 用户信息区 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div
            class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6"
          >
            <div class="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
              <UAvatar
                :src="userProfile?.data?.avatar"
                :alt="userProfile?.data?.nickname || userProfile?.data?.username"
                class="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full ring-2 ring-white"
                loading="lazy"
                format="webp"
                sizes="96px md:128px"
              />
              <div
                v-if="userProfile?.data?.isMember"
                class="absolute bottom-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-sm"
              >
                <Icon name="mynaui:heart-waves" class="w-3 h-3 text-white" />
              </div>
            </div>
            <div class="flex-1">
              <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {{ userProfile?.data?.nickname || userProfile?.data?.username }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ userProfile?.data?.description || $t('user.noDescription') }}
              </p>
              <div class="flex flex-wrap items-center gap-4 mt-3">
                <div class="text-center">
                  <div class="font-semibold text-gray-900 dark:text-white">
                    {{ userProfile?.data?.articleCount || 0 }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ $t('user.articles') }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="font-semibold text-gray-900 dark:text-white">
                    {{ userProfile?.data?.followerCount || 0 }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ $t('user.followers') }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="font-semibold text-gray-900 dark:text-white">
                    {{ userProfile?.data?.followingCount || 0 }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ $t('user.following') }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="font-semibold text-gray-900 dark:text-white">
                    {{ userProfile?.data?.wallet.toFixed(2) || 0 }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ $t('user.wallet') }}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex space-x-2">
              <UButton
                @click="isEditModalOpen = true"
                class="px-3 py-1.5 cursor-pointer md:px-4 md:py-2 bg-primary text-white text-sm md:text-base rounded-md hover:bg-primary-600 transition-colors whitespace-nowrap"
              >
                {{ $t('user.editProfile') }}
              </UButton>
              <UButton
                @click="handleLogout"
                class="rounded-md px-3 py-1.5 cursor-pointer md:px-4 md:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm md:text-base hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
              >
                {{ $t('user.logout') }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- 快捷导航 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <h2 class="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">
            {{ $t('user.quickNav') }}
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NuxtLinkLocale
              to="/user/orders"
              class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Icon name="mynaui:cart" class="w-8 h-8 text-primary mb-2" />
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                $t('user.orders.title')
              }}</span>
            </NuxtLinkLocale>

            <NuxtLinkLocale
              to="/user/messages"
              class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors relative"
            >
              <Icon name="mynaui:bell" class="w-8 h-8 text-primary mb-2" />
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                $t('message.title')
              }}</span>
              <!-- 未读消息徽章 -->
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
              >
                {{ unreadCount > 99 ? '99+' : unreadCount }}
              </span>
            </NuxtLinkLocale>

            <div
              class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md opacity-50"
            >
              <Icon name="mynaui:heart" class="w-8 h-8 text-gray-400 mb-2" />
              <span class="text-sm font-medium text-gray-500">{{ $t('user.favorites') }}</span>
            </div>

            <div
              class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md opacity-50"
            >
              <Icon name="mynaui:cog" class="w-8 h-8 text-gray-400 mb-2" />
              <span class="text-sm font-medium text-gray-500">{{ $t('user.settings') }}</span>
            </div>

            <div
              @click="isChangePasswordModalOpen = true"
              class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <Icon name="mynaui:lock" class="w-8 h-8 text-primary mb-2" />
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                $t('user.changePassword.title')
              }}</span>
            </div>
          </div>
        </div>

        <!-- 用户文章 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div class="flex items-center justify-between mb-4 md:mb-6">
            <h2 class="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              {{ $t('user.myArticles') }}
            </h2>
            <NuxtLinkLocale
              to="/user/articles/create"
              class="text-primary-500 hover:text-primary-600 text-sm md:text-base"
            >
              {{ $t('user.createArticle') }}
            </NuxtLinkLocale>
          </div>

          <div
            v-if="displayArticles.length > 0"
            class="grid grid-cols-2 md:lg:grid-cols-4 gap-4 md:gap-6"
          >
            <template v-for="article in displayArticles" :key="article.id">
              <CommonArticleCard :data="article" class="!rounded-xl" />
            </template>
          </div>
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            {{ $t('user.noArticles') }}
          </div>
          <!-- 加载更多按钮 -->
          <div
            v-if="hasMore && displayArticles.length > 0"
            class="col-span-2 sm:col-span-2 lg:col-span-3 flex justify-center py-4"
          >
            <UButton
              @click="loadUserArticles"
              :disabled="loading"
              color="primary"
              class="px-6 py-2 cursor-pointer bg-primary text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              <div
                v-if="loading"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
              ></div>
              {{ loading ? $t('common.loading.loading') : $t('common.loadMore') }}
            </UButton>
          </div>

          <!-- 没有更多数据提示 -->
          <div
            v-else-if="!hasMore && displayArticles.length > 0"
            class="col-span-2 sm:col-span-2 lg:col-span-3 text-center py-4 text-gray-500"
          >
            {{ $t('common.loading.noMore') }}
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div
        class="w-full lg:w-80 flex-shrink-0 mt-6 lg:mt-0 lg:sticky lg:top-16 self-start z-10 sticky"
      >
        <!-- 会员等级 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-900 dark:text-white text-sm md:text-base">
              {{ $t('user.membershipLevel') }}
            </h3>
            <UButton
              @click="handleRecharge"
              size="sm"
              color="primary"
              class="cursor-pointer dark:text-white"
            >
              {{ $t('user.recharge.title') }}
            </UButton>
          </div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-700 dark:text-gray-300">{{
              userProfile?.data?.isMember ? $t('user.vipMember') : $t('user.basicMember')
            }}</span>
            <span class="text-sm font-medium text-primary-500 dark:text-white"
              >Lv.{{ userProfile?.data?.level || 0 }}</span
            >
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-primary h-2 rounded-full"
              :style="{ width: `${(userProfile?.data?.experience || 0) % 100}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>{{ userProfile?.data?.experience || 0 }} {{ $t('user.experience') }}</span>
            <span>{{ userProfile?.data?.score || 0 }} {{ $t('user.score') }}</span>
          </div>
        </div>

        <!-- 邀请奖励 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <h3 class="font-bold text-gray-900 dark:text-white mb-3 md:mb-4 text-sm md:text-base">
            {{ $t('user.inviteRewards') }}
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">{{
                $t('user.inviteCode')
              }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                userProfile?.data?.inviteCode || $t('user.noInviteCode')
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">{{
                $t('user.inviteCount')
              }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                userProfile?.data?.inviteCount || 0
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">{{
                $t('user.inviteEarnings')
              }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                userProfile?.data?.inviteEarnings || 0
              }}</span>
            </div>
          </div>
          <UButton
            class="cursor-pointer flex items-center justify-center w-full mt-4 py-2 px-4 bg-primary text-white text-sm rounded-md hover:bg-primary-600 transition-colors"
          >
            {{ $t('user.copyInviteLink') }}
          </UButton>
        </div>
      </div>
    </div>
    <UModal
      :title="$t('user.editProfile')"
      v-model:open="isEditModalOpen"
      :ui="{ close: 'cursor-pointer' }"
    >
      <template #body>
        <UForm
          :state="editForm"
          :validate="validateForm"
          @submit="handleSaveProfile"
          class="space-y-4"
        >
          <!-- 头像上传 -->
          <div class="flex items-center space-x-4">
            <div class="relative">
              <UAvatar
                :src="editForm.avatar || userProfile?.data?.avatar"
                :alt="userProfile?.data?.nickname || userProfile?.data?.username"
                fit="cover"
                class="w-20 h-20 rounded-full ring-2 object-cover ring-white"
                loading="lazy"
                format="webp"
                sizes="80px"
              />
              <div
                class="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer"
                @click="triggerAvatarUpload"
              >
                <Icon v-if="!avatarUploading" name="mynaui:camera" class="text-white text-xs" />
                <Icon v-else name="mynaui:circle-notch" class="text-white text-xs" />
              </div>
            </div>
          </div>

          <!-- 用户名 -->
          <UFormField :label="$t('user.username')" name="username">
            <UInput
              v-model="editForm.username"
              :placeholder="$t('user.enterUsername')"
              class="w-full"
            />
          </UFormField>

          <!-- 昵称 -->
          <UFormField :label="$t('user.nickname')" name="nickname">
            <UInput
              v-model="editForm.nickname"
              :placeholder="$t('user.enterNickname')"
              class="w-full"
            />
          </UFormField>

          <!-- 个人简介 -->
          <UFormField :label="$t('user.description')" name="description">
            <UTextarea
              v-model="editForm.description"
              :placeholder="$t('user.enterDescription')"
              :rows="3"
              class="w-full"
            />
          </UFormField>

          <!-- 按钮组 -->
          <div class="flex space-x-3 pt-4">
            <UButton
              type="submit"
              :loading="isSaving"
              class="flex-1 px-4 py-2 flex items-center cursor-pointer justify-center bg-primary text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {{ isSaving ? $t('common.saving') : $t('common.save') }}
            </UButton>
            <UButton
              type="button"
              @click="isEditModalOpen = false"
              class="flex-1 px-4 py-2 flex items-center cursor-pointer justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {{ $t('common.cancel') }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
    <input
      ref="avatarInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleAvatarChange"
    />

    <!-- 修改密码模态框 -->
    <UModal
      :title="$t('user.changePassword.title')"
      v-model:open="isChangePasswordModalOpen"
      :ui="{ close: 'cursor-pointer' }"
    >
      <template #body>
        <UForm
          :schema="changePasswordSchema"
          :state="changePasswordForm"
          @submit="handleChangePassword"
          class="space-y-4"
        >
          <!-- 当前密码 -->
          <UFormField
            name="currentPassword"
            required
            :label="$t('user.changePassword.currentPassword')"
          >
            <UInput
              v-model="changePasswordForm.currentPassword"
              type="password"
              :placeholder="$t('user.changePassword.currentPasswordPlaceholder')"
              class="w-full"
            />
          </UFormField>

          <!-- 新密码 -->
          <UFormField name="newPassword" required :label="$t('user.changePassword.newPassword')">
            <UInput
              v-model="changePasswordForm.newPassword"
              type="password"
              :placeholder="$t('user.changePassword.newPasswordPlaceholder')"
              class="w-full"
            />
          </UFormField>

          <!-- 确认新密码 -->
          <UFormField
            name="confirmPassword"
            required
            :label="$t('user.changePassword.confirmPassword')"
          >
            <UInput
              v-model="changePasswordForm.confirmPassword"
              type="password"
              :placeholder="$t('user.changePassword.confirmPasswordPlaceholder')"
              class="w-full"
            />
          </UFormField>

          <!-- 按钮组 -->
          <div class="flex space-x-3 pt-4">
            <UButton
              type="submit"
              :loading="changingPassword"
              class="flex-1 px-4 py-2 flex items-center cursor-pointer justify-center bg-primary text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {{
                changingPassword
                  ? $t('user.changePassword.changing')
                  : $t('user.changePassword.changePassword')
              }}
            </UButton>
            <UButton
              type="button"
              @click="isChangePasswordModalOpen = false"
              class="flex-1 px-4 py-2 flex items-center cursor-pointer justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {{ $t('common.cancel') }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- 会员充值弹窗 -->
    <MembershipRechargeModal
      v-model="showPaymentModal"
      :user-profile="userProfile?.data"
      @recharge-success="onPaymentSuccess"
      @recharge-failed="onPaymentFailed"
    />
  </div>
</template>

<script lang="ts" setup>
  import {
    userControllerGetProfile,
    articleControllerFindArticleByAuthor,
    userControllerUpdate
  } from '~/api';
  import type { ConfigControllerGetPublicResponse } from '~/api';
  type SiteConfig = ConfigControllerGetPublicResponse['data'];
  import { watch } from 'vue';
  import type { FormError } from '@nuxt/ui';
  import { uploadControllerUploadFile } from '~/api';
  import { z } from 'zod';
  import { useUserStore } from '~/stores/user';
  import { confirmLogout } from '~/utils/logout';
  const toast = useToast();

  const { t } = useI18n();
  const userStore = useUserStore();
  const userInfo = computed(() => userStore.currentUser);
  const localPath = useLocalePath();

  // 消息相关数据
  const { unreadCount } = useMessage();

  const pagination = ref({
    page: 1,
    limit: 8
  });
  const loading = ref(false);
  const hasMore = ref(true);
  const allArticles = ref<any[]>([]);
  // 编辑模态框状态
  const isEditModalOpen = ref(false);
  const isSaving = ref(false);
  const avatarUploading = ref(false);
  const avatarInput = ref<HTMLInputElement>();

  // 充值状态
  const showPaymentModal = ref(false);

  // 修改密码模态框状态
  const isChangePasswordModalOpen = ref(false);
  const changingPassword = ref(false);

  // 编辑表单数据
  const editForm = ref({
    username: '',
    nickname: '',
    description: '',
    avatar: ''
  });

  // 修改密码表单数据
  const changePasswordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 修改密码表单验证模式
  const changePasswordSchema = z
    .object({
      currentPassword: z.string().min(1, t('validation.required')),
      newPassword: z
        .string()
        .min(6, t('validation.passwordMin'))
        .max(50, t('validation.passwordMax')),
      confirmPassword: z.string().min(1, t('validation.required'))
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword']
    });

  // 用户资料直接从 store 获取（已在 SSR 阶段通过插件加载）
  const userProfile = computed(() => ({
    data: userInfo.value
  }));

  // 刷新用户资料的方法
  const userRefresh = async () => {
    try {
      const response = await userControllerGetProfile({
        composable: '$fetch'
      });
      if (response.data) {
        userStore.setUserInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  // 在SSR阶段确保用户信息已加载
  if (import.meta.server && userStore.isLoggedIn && !userStore.currentUser) {
    await userStore.getUserInfo();
  }

  // 重置数据
  const resetData = () => {
    pagination.value.page = 1;
    allArticles.value = [];
    hasMore.value = true;
  };

  // 加载用户文章
  const loadUserArticles = async () => {
    // 添加额外的检查，确保不会重复触发
    if (loading.value || !hasMore.value) return;

    // 确保用户信息已加载
    const userId = userProfile.value?.data?.id || userInfo.value?.id;
    if (!userId) {
      return;
    }

    loading.value = true;
    try {
      const response = await articleControllerFindArticleByAuthor({
        composable: 'useAsyncData',
        key: `user-articles-${userId}-${pagination.value.page}`,
        path: {
          id: userId.toString()
        },
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit
        }
      });

      const newData = response.data.value?.data?.data || [];

      if (pagination.value.page === 1) {
        allArticles.value = newData;
      } else {
        allArticles.value = [...allArticles.value, ...newData];
      }

      // 检查是否还有更多数据
      hasMore.value = newData.length === pagination.value.limit;

      // 更新页码
      if (hasMore.value) {
        pagination.value.page++;
      }
    } catch (error) {
    } finally {
      loading.value = false;
    }
  };

  // 等待用户信息加载完成后再加载文章
  const loadArticlesWhenReady = async () => {
    // 如果用户信息已加载，直接加载文章
    if (userProfile.value?.data?.id || userInfo.value?.id) {
      await loadUserArticles();
    } else {
      // 如果用户信息还未加载，等待一下再尝试
      await new Promise(resolve => setTimeout(resolve, 100));
      if (userProfile.value?.data?.id || userInfo.value?.id) {
        await loadUserArticles();
      } else {
        // 如果仍然没有用户信息，可能是SSR问题，在客户端重新尝试
        if (import.meta.client) {
          // 延迟更长时间等待store状态恢复
          setTimeout(async () => {
            if (userProfile.value?.data?.id || userInfo.value?.id) {
              await loadUserArticles();
            }
          }, 500);
        }
      }
    }
  };

  // 监听用户信息变化，重新加载文章
  watch(
    () => userProfile.value?.data?.id || userInfo.value?.id,
    async (newUserId, oldUserId) => {
      if (newUserId && newUserId !== oldUserId) {
        resetData();
        await loadUserArticles();
      }
    },
    { immediate: false }
  );

  // 监听用户认证状态变化
  watch(
    () => userStore.isAuthenticated,
    async isAuthenticated => {
      if (isAuthenticated && displayArticles.value.length === 0) {
        await loadArticlesWhenReady();
      }
    },
    { immediate: false }
  );

  // 初始加载文章
  await loadArticlesWhenReady();
  // 计算显示的文章
  const displayArticles = computed(() => {
    return allArticles.value;
  });

  onMounted(() => {
    // 在客户端挂载后，如果文章为空且用户信息已加载，重新尝试加载文章
    if (displayArticles.value.length === 0 && (userProfile.value?.data?.id || userInfo.value?.id)) {
      loadArticlesWhenReady();
    } else if (displayArticles.value.length === 0) {
      // 如果文章为空且用户信息也未加载，可能是SSR问题，延迟重试
      setTimeout(async () => {
        if (displayArticles.value.length === 0) {
          await loadArticlesWhenReady();
        }
      }, 1000);
    }
  });

  // 页面元数据
  useHead({
    title: () => t('user.title'),
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow'
      }
    ]
  });

  // 定义页面元数据，标识需要登录
  definePageMeta({
    requiresAuth: true
  });

  // 处理登出
  const handleLogout = async () => {
    await confirmLogout();
  };

  // 表单验证函数
  const validateForm = (state: any): FormError[] => {
    const errors = [];
    if (!state.username) errors.push({ name: 'username', message: '用户名不能为空' });
    if (!state.nickname) errors.push({ name: 'nickname', message: '昵称不能为空' });
    return errors;
  };

  // 监听模态框打开，初始化表单数据
  watch(isEditModalOpen, newValue => {
    if (newValue && userInfo.value) {
      editForm.value = {
        username: userInfo.value?.username || '',
        nickname: userInfo.value?.nickname || '',
        description: (userInfo.value?.description as string) || '',
        avatar: userInfo.value?.avatar || ''
      };
    }
  });

  // 触发头像上传
  const triggerAvatarUpload = () => {
    avatarInput.value?.click();
  };

  // 处理头像变更
  const handleAvatarChange = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      toast.add({
        title: '请选择头像文件',
        color: 'error'
      });
      return;
    }

    avatarUploading.value = true;

    try {
      // 使用formDataBodySerializer正确处理文件上传
      const formData = new FormData();
      formData.append('files', file);
      // 传递对象给formDataBodySerializer，它会自动转换为FormData
      const res = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {
          files: file
        },
        bodySerializer: () => {
          const formData = new FormData();
          // 直接使用原始的file，而不是body.files中的对象
          formData.append('files', file);
          return formData;
        }
      });

      editForm.value.avatar = res.data?.[0]?.url || '';

      // 显示上传成功提示
      toast.add({
        title: t('common.message.uploadSuccess'),
        color: 'success'
      });
    } catch (error: any) {
      // 处理上传错误
      console.error('Failed to upload avatar:', error);
    } finally {
      avatarUploading.value = false;
    }
  };

  // 保存个人资料
  const handleSaveProfile = async () => {
    isSaving.value = true;
    try {
      // 调用保存个人资料的API
      await userControllerUpdate({
        composable: '$fetch',
        path: {
          id: userInfo.value?.id?.toString()!
        },
        body: editForm.value
      });

      // 更新本地用户信息
      if (userInfo.value) {
        userStore.setUserInfo({
          ...userInfo.value,
          ...editForm.value
        });
      }

      // 关闭模态框
      isEditModalOpen.value = false;

      // 刷新用户资料
      userRefresh();
    } catch (error) {
    } finally {
      isSaving.value = false;
    }
  };
  const siteConfig = inject<SiteConfig>('siteConfig');

  // 格式化日期
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 处理充值
  const handleRecharge = () => {
    showPaymentModal.value = true;
  };

  // 支付成功回调
  const onPaymentSuccess = (orderId: number) => {
    showPaymentModal.value = false;

    // 刷新用户资料
    userRefresh();
  };

  // 支付失败回调
  const onPaymentFailed = (error: string) => {
    showPaymentModal.value = false;

    toast.add({
      title: error,
      color: 'error'
    });
  };

  // 处理修改密码
  const handleChangePassword = async () => {
    try {
      changingPassword.value = true;

      // 这里需要调用修改密码API
      // 由于API中没有修改密码接口，这里先模拟
      // TODO: 实现实际的修改密码API调用

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 关闭模态框并重置表单
      isChangePasswordModalOpen.value = false;
      changePasswordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    } catch (error: any) {
      console.error('修改密码失败:', error);
    } finally {
      changingPassword.value = false;
    }
  };
</script>
