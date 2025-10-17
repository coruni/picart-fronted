<template>
  <UModal
    v-model:open="isOpen"
    :prevent-close="!hasConsented"
    :overlay="false"
    :modal="false"
    :ui="{
      content:
        'fixed bottom-4 left-1/2 -translate-x-1/2 translate-y-0 top-auto w-[calc(100vw-2rem)] max-w-3xl rounded-lg sm:rounded-xl shadow-xl'
    }"
  >
    <!-- 空的默认插槽，因为这个弹窗是程序化显示的 -->
    <template #default>
      <div></div>
    </template>

    <!-- Header -->
    <template #header="{ close }">
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
          >
            <UIcon name="i-mynaui-shield-check" class="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('cookie.title') }}
          </h3>
        </div>
        <UButton
          v-if="hasConsented"
          variant="ghost"
          color="neutral"
          icon="i-mynaui-x"
          @click="close"
          size="sm"
        />
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <div class="space-y-6">
        <!-- Description -->
        <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>{{ $t('cookie.description') }}</p>
          <p>{{ $t('cookie.description2') }}</p>
        </div>

        <!-- Main Actions (when settings are hidden) -->
        <div v-if="!showSettings">
          <div class="flex flex-col sm:flex-row gap-3">
            <UButton
              color="primary"
              size="lg"
              class="flex-1 cursor-pointer text-center"
              @click="handleAcceptAll"
              :loading="isSaving"
            >
              <span class="text-center flex-1">
                {{ $t('cookie.acceptAll') }}
              </span>
            </UButton>
            <UButton
              variant="outline"
              color="neutral"
              size="lg"
              class="flex-1 cursor-pointer text-center"
              @click="handleRejectAll"
              :loading="isSaving"
            >
              <span class="text-center flex-1">
                {{ $t('cookie.onlyNecessary') }}
              </span>
            </UButton>
            <UButton
              variant="ghost"
              color="neutral"
              size="lg"
              class="flex-1 cursor-pointer text-center"
              @click="showSettings = true"
            >
              <span class="text-center flex-1">
                {{ $t('cookie.customSettings') }}
              </span>
            </UButton>
          </div>
        </div>

        <!-- Custom Settings View -->
        <div v-if="showSettings" class="space-y-4">
          <!-- Necessary Cookies -->
          <div class="border dark:border-gray-700 rounded-lg p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-mynaui-shield-check"
                    class="w-5 h-5 text-gray-600 dark:text-gray-400"
                  />
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ $t('cookie.necessary.title') }}
                  </h4>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('cookie.necessary.description') }}
                </p>
              </div>
              <USwitch
                v-model="cookieSettings.necessary"
                disabled
                color="neutral"
                size="md"
                :ui="{ base: 'cursor-pointer' }"
              />
            </div>
          </div>

          <!-- Analytics Cookies -->
          <div class="border dark:border-gray-700 rounded-lg p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-mynaui-chart-bar"
                    class="w-5 h-5 text-gray-600 dark:text-gray-400"
                  />
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ $t('cookie.analytics.title') }}
                  </h4>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('cookie.analytics.description') }}
                </p>
              </div>
              <USwitch
                v-model="cookieSettings.analytics"
                color="primary"
                size="md"
                :ui="{ base: 'cursor-pointer' }"
              />
            </div>
          </div>

          <!-- Marketing Cookies -->
          <div class="border dark:border-gray-700 rounded-lg p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-mynaui-megaphone"
                    class="w-5 h-5 text-gray-600 dark:text-gray-400"
                  />
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ $t('cookie.marketing.title') }}
                  </h4>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('cookie.marketing.description') }}
                </p>
              </div>
              <USwitch
                v-model="cookieSettings.marketing"
                color="primary"
                size="md"
                :ui="{ base: 'cursor-pointer' }"
              />
            </div>
          </div>

          <!-- Functional Cookies -->
          <div class="border dark:border-gray-700 rounded-lg p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-mynaui-settings"
                    class="w-5 h-5 text-gray-600 dark:text-gray-400"
                  />
                  <h4 class="font-medium text-gray-900 dark:text-white">
                    {{ $t('cookie.functional.title') }}
                  </h4>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('cookie.functional.description') }}
                </p>
              </div>
              <USwitch
                v-model="cookieSettings.functional"
                color="primary"
                size="md"
                :ui="{ base: 'cursor-pointer' }"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-2">
            <UButton
              color="primary"
              size="lg"
              class="flex-1 cursor-pointer text-center"
              @click="handleSaveSettings"
              :loading="isSaving"
            >
              <span class="text-center flex-1">
                {{ $t('cookie.saveSettings') }}
              </span>
            </UButton>
            <UButton
              variant="outline"
              color="neutral"
              size="lg"
              class="flex-1 cursor-pointer text-center"
              @click="showSettings = false"
            >
              <span class="text-center flex-1">
                {{ $t('cookie.return') }}
              </span>
            </UButton>
          </div>
        </div>

        <!-- Privacy Policy Link -->
        <div class="text-center text-xs text-gray-500 dark:text-gray-400">
          <span>{{ $t('cookie.privacyText') }}</span>
          <UButton
            variant="link"
            color="primary"
            size="xs"
            class="p-0 h-auto ml-1"
            :to="localePath('/privacy')"
          >
            {{ $t('cookie.privacyLink') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  const { t } = useI18n();
  const localePath = useLocalePath();

  // 使用 Cookie 管理 composable
  const { cookieSettings, hasConsented, acceptAll, rejectAll, saveSettings, checkCookieConsent } =
    useCookieConsent();

  // 响应式数据
  const isSaving = ref(false);
  const showSettings = ref(false);
  const forceOpen = ref(false); // 强制打开（用于已同意用户修改设置）

  // 立即检查同意状态
  checkCookieConsent();

  // 自动控制弹窗显示 - 根据同意状态自动显示/隐藏
  // 这样检测工具可以立即看到 banner（无延迟）
  const isOpen = computed({
    get: () => !hasConsented.value || forceOpen.value,
    set: (value: boolean) => {
      if (hasConsented.value) {
        // 已同意用户可以关闭
        forceOpen.value = value;
      } else if (!value) {
        // 未同意用户不能关闭
        return;
      }
    }
  });

  // 处理接受所有
  const handleAcceptAll = async () => {
    isSaving.value = true;
    try {
      await acceptAll();
      // 弹窗会自动关闭（因为 hasConsented 变为 true）
    } finally {
      isSaving.value = false;
    }
  };

  // 处理拒绝所有
  const handleRejectAll = async () => {
    isSaving.value = true;
    try {
      await rejectAll();
      // 弹窗会自动关闭（因为 hasConsented 变为 true）
    } finally {
      isSaving.value = false;
    }
  };

  // 处理保存设置
  const handleSaveSettings = async () => {
    isSaving.value = true;
    try {
      await saveSettings();
      showSettings.value = false;
      forceOpen.value = false;
      // 弹窗会自动关闭（因为 hasConsented 变为 true）
    } finally {
      isSaving.value = false;
    }
  };

  // 暴露方法供外部调用（用于隐私页面的"管理 Cookie"按钮）
  const show = () => {
    forceOpen.value = true;
    showSettings.value = true;
  };

  defineExpose({
    show,
    hasConsented: readonly(hasConsented)
  });
</script>
