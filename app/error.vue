<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="max-w-sm w-full mx-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8 text-center">
        <!-- 错误图标 -->
        <div class="mb-6">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4"
          >
            <Icon name="mynaui:danger-triangle" class="w-8 h-8 text-red-500" />
          </div>
        </div>

        <!-- 错误标题 -->
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {{ error?.statusCode || 404 }}
        </h1>

        <!-- 错误描述 -->
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">
          {{ $t(getErrorMessage()) }}
        </p>

        <!-- 操作按钮 -->
        <div class="space-y-3">
          <UButton
            color="primary"
            size="lg"
            class="w-full"
            icon="mynaui:home"
            @click="handleGoHome"
          >
            {{ $t('error.backHome') }}
          </UButton>

          <UButton
            variant="outline"
            size="lg"
            class="w-full"
            icon="mynaui:arrow-left"
            @click="handleGoBack"
          >
            {{ $t('error.goBack') }}
          </UButton>
        </div>

        <!-- 错误详情（开发环境显示） -->
        <div
          v-if="error?.message && isDev"
          class="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-left"
        >
          <h3 class="text-xs font-medium text-gray-900 dark:text-white mb-2">
            {{ $t('error.details') }}:
          </h3>
          <pre class="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words">{{
            error.message
          }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    error: {
      type: Object,
      default: () => ({})
    }
  });

  const isDev = computed(() => import.meta.dev);

  const getErrorMessage = () => {
    const statusCode = props.error?.statusCode;

    switch (statusCode) {
      case 404:
        return 'error.pageNotFound';
      case 500:
        return 'error.serverError';
      case 403:
        return 'error.forbidden';
      default:
        return 'error.generic';
    }
  };

  const handleGoHome = () => {
    clearError({ redirect: '/' });
  };

  const handleGoBack = () => {
    if (import.meta.client) {
      window.history.length > 1 ? window.history.back() : navigateTo('/');
    }
  };
</script>
