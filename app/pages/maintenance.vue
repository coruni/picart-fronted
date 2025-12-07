<template>
  <div class="flex items-center justify-center px-4 min-h-screen">
    <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
      <!-- 维护图标 -->
      <div class="mb-6">
        <Icon name="mynaui:leaf" class="w-16 h-16" />
      </div>

      <!-- 描述信息 -->
      <div class="text-gray-600 dark:text-gray-300 mb-6 space-y-3">
        <!-- 维护消息 -->
        <div
          v-if="siteConfig && siteConfig?.maintenance_message && siteConfig?.maintenance_message"
          v-html="siteConfig?.maintenance_message"
        />
      </div>

      <!-- 刷新按钮 -->
      <div class="flex justify-center space-x-4">
        <UButton
          class="cursor-pointer"
          variant="outline"
          size="lg"
          :loading="refreshing"
          @click="refreshPage"
        >
          {{ t('maintenance.refresh') }}
        </UButton>

        <!-- 如果是管理员，显示返回管理面板按钮 -->
        <UButton
          v-if="isAdmin"
          class="cursor-pointer"
          variant="solid"
          size="lg"
          color="primary"
          @click="goToAdmin"
        >
          {{ t('maintenance.goToAdmin') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ConfigControllerGetPublicResponse } from '~/api';
  import { useAppStore } from '~/stores/app';
  import { useUserStore } from '~/stores/user';
  definePageMeta({
    layout: 'maintenance'
  });

  const siteConfig = inject<ConfigControllerGetPublicResponse['data']>('siteConfig');

  const { t } = useI18n();
  const router = useRouter();

  // 使用store
  const appStore = useAppStore();
  const userStore = useUserStore();

  // 响应式状态
  const refreshing = ref(false);

  // 计算属性
  const isAdmin = computed(() => {
    // 检查用户是否登录且有管理员权限
    if (!userStore.isLoggedIn) {
      return false;
    }

    // 如果用户信息已加载，直接检查权限
    if (userStore.userInfo) {
      return (
        userStore.userInfo?.roles?.some(
          role =>
            role.name === 'admin' || role.name === 'super-admin' || role.name === 'administrator'
        ) || false
      );
    }

    // 如果用户信息还未加载，返回false（不在模板中显示管理员按钮）
    // 用户信息加载完成后，如果用户是管理员，按钮会自动显示
    return false;
  });

  // 刷新页面
  const refreshPage = async () => {
    refreshing.value = true;
    try {
      // 直接重新加载页面，让中间件重新检查维护模式状态
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      // 刷新失败时静默处理
    } finally {
      refreshing.value = false;
    }
  };

  // 跳转到管理面板
  const goToAdmin = () => {
    router.push('/admin');
  };

  // 页面加载时执行
  onMounted(() => {
    // 定期检查维护模式状态（每30秒检查一次）
    const interval = setInterval(() => {
      // 如果维护模式已关闭，自动跳转到首页
      if (!siteConfig?.maintenance_mode) {
        navigateTo('/');
      }
    }, 30000);

    // 将定时器ID存储到组件实例上，以便在onUnmounted中清除
    (getCurrentInstance() as any).interval = interval;
  });

  // 组件卸载时清除定时器
  onUnmounted(() => {
    const instance = getCurrentInstance();
    if (instance && (instance as any).interval) {
      clearInterval((instance as any).interval);
    }
  });

  // SEO设置
  useHead({
    title: t('maintenance.pageTitle'),
    meta: [
      { name: 'description', content: t('maintenance.pageDescription') },
      { name: 'robots', content: 'noindex, nofollow' }
    ]
  });
</script>

<style scoped>
  /* 自定义样式可以在这里添加 */
</style>
