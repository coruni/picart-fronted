<template>
  <div
    class="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
  >
    <div class="max-w-md w-full mx-4">
      <div class="text-center">
        <!-- 错误图标 -->
        <div class="mb-8">
          <div
            class="inline-flex items-center justify-center w-32 h-32 rounded-full bg-red-100 dark:bg-red-900/20"
          >
            <svg
              class="w-16 h-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        <!-- 错误标题 -->
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {{ error?.statusCode || 404 }}
        </h1>

        <!-- 错误描述 -->
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
          {{ $t(getErrorMessage()) }}
        </p>

        <!-- 操作按钮 -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton
            @click="handleGoHome"
            class="inline-flex cursor-pointer items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {{ $t('error.backHome') }}
          </UButton>

          <UButton
            @click="handleGoBack"
            class="inline-flex cursor-pointer items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {{ $t('error.goBack') }}
          </UButton>
        </div>

        <!-- 错误详情（开发环境显示） -->
        <div
          v-if="error?.message && isDev"
          class="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left"
        >
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {{ $t('error.details') }}:
          </h3>
          <pre class="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{{
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

  const isDev = computed(() => process.dev);

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
    if (process.client) {
      window.history.length > 1 ? window.history.back() : navigateTo('/');
    }
  };
</script>
