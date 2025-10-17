<template>
  <div class="pt-6">
    <UContainer>
      <div class="max-w-4xl mx-auto">
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <UIcon name="mynaui:shield-check" class="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {{ $t('privacy.title') }}
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ $t('privacy.lastUpdated') }}: {{ formatDate(new Date()) }}
                </p>
              </div>
            </div>
          </template>

          <div class="space-y-8">
            <!-- Introduction -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {{ $t('privacy.introduction.title') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ $t('privacy.introduction.content') }}
              </p>
            </section>

            <!-- Data Collection -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {{ $t('privacy.dataCollection.title') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                {{ $t('privacy.dataCollection.content') }}
              </p>
              <ul class="space-y-2">
                <li
                  v-for="(item, index) in dataCollectionItems"
                  :key="index"
                  class="flex items-start gap-3"
                >
                  <UIcon
                    name="mynaui:check-circle"
                    class="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                  />
                  <span class="text-gray-600 dark:text-gray-300">{{ $t(item) }}</span>
                </li>
              </ul>
            </section>

            <!-- Cookie Usage -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {{ $t('privacy.cookieUsage.title') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                {{ $t('privacy.cookieUsage.content') }}
              </p>

              <div class="grid gap-4 sm:grid-cols-2">
                <div
                  v-for="cookieType in cookieTypes"
                  :key="cookieType.key"
                  class="border dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 dark:hover:border-primary/50 transition-colors"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <UIcon :name="cookieType.icon" :class="cookieType.colorClass" class="w-5 h-5" />
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                      {{ $t(`privacy.cookieUsage.${cookieType.key}.title`) }}
                    </h3>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    {{ $t(`privacy.cookieUsage.${cookieType.key}.description`) }}
                  </p>
                </div>
              </div>

              <div class="mt-4">
                <UButton color="primary" variant="outline" @click="openCookieSettings">
                  <UIcon name="mynaui:cog" class="w-4 h-4 mr-2" />
                  {{ $t('privacy.manageCookies') }}
                </UButton>
              </div>
            </section>

            <!-- Data Usage -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {{ $t('privacy.dataUsage.title') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                {{ $t('privacy.dataUsage.content') }}
              </p>
              <ul class="space-y-2">
                <li
                  v-for="(item, index) in dataUsageItems"
                  :key="index"
                  class="flex items-start gap-3"
                >
                  <UIcon
                    name="mynaui:arrow-right-circle"
                    class="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                  />
                  <span class="text-gray-600 dark:text-gray-300">{{ $t(item) }}</span>
                </li>
              </ul>
            </section>

            <!-- Data Sharing -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {{ $t('privacy.dataSharing.title') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ $t('privacy.dataSharing.content') }}
              </p>
            </section>

            <!-- Data Security -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {{ $t('privacy.dataSecurity.title') }}
              </h2>
              <div
                class="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4"
              >
                <div class="flex items-start gap-3">
                  <UIcon
                    name="mynaui:shield-check"
                    class="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                  />
                  <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {{ $t('privacy.dataSecurity.content') }}
                  </p>
                </div>
              </div>
            </section>

            <!-- User Rights -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {{ $t('privacy.userRights.title') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                {{ $t('privacy.userRights.content') }}
              </p>
              <ul class="space-y-2">
                <li
                  v-for="(item, index) in userRightsItems"
                  :key="index"
                  class="flex items-start gap-3"
                >
                  <UIcon name="mynaui:hand" class="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span class="text-gray-600 dark:text-gray-300">{{ $t(item) }}</span>
                </li>
              </ul>
            </section>

            <!-- Contact -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {{ $t('privacy.contact.title') }}
              </h2>
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                {{ $t('privacy.contact.content') }}
              </p>
              <div
                class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
              >
                <div class="flex items-center gap-2">
                  <UIcon name="mynaui:envelope" class="w-5 h-5 text-gray-500" />
                  <p class="text-gray-900 dark:text-white">
                    <strong>{{ $t('privacy.contact.email') }}:</strong>
                    <a href="mailto:admin@cosfan.cc" class="text-primary hover:underline ml-2">
                      admin@cosfan.cc
                    </a>
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="mynaui:location" class="w-5 h-5 text-gray-500" />
                  <p class="text-gray-900 dark:text-white">
                    <strong>{{ $t('privacy.contact.address') }}:</strong>
                    <span class="ml-2">{{ $t('privacy.contact.addressValue') }}</span>
                  </p>
                </div>
              </div>
            </section>

            <!-- Changes -->
            <section>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {{ $t('privacy.changes.title') }}
              </h2>
              <div
                class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4"
              >
                <div class="flex items-start gap-3">
                  <UIcon
                    name="mynaui:alert"
                    class="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
                  />
                  <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {{ $t('privacy.changes.content') }}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <template #footer>
            <div class="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
              <UButton variant="outline" color="neutral" @click="goBack">
                <UIcon name="mynaui:arrow-left" class="w-4 h-4 mr-2" />
                {{ $t('common.button.back') }}
              </UButton>

              <UButton color="primary" @click="openCookieSettings">
                <UIcon name="mynaui:cog" class="w-4 h-4 mr-2" />
                {{ $t('privacy.manageCookies') }}
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </UContainer>

    <!-- Cookie Consent Component -->
    <CookieConsent ref="cookieConsentRef" />
  </div>
</template>

<script setup lang="ts">
  const { t } = useI18n();
  const router = useRouter();
  const cookieConsentRef = ref();

  // 设置页面元数据
  useHead({
    title: t('privacy.title'),
    meta: [
      { name: 'description', content: t('privacy.metaDescription') },
      { name: 'keywords', content: t('privacy.metaKeywords') }
    ]
  });

  // 数据列表
  const dataCollectionItems = [
    'privacy.dataCollection.personalInfo',
    'privacy.dataCollection.usageData',
    'privacy.dataCollection.cookies',
    'privacy.dataCollection.deviceInfo'
  ];

  const dataUsageItems = [
    'privacy.dataUsage.provideService',
    'privacy.dataUsage.improveService',
    'privacy.dataUsage.communicate',
    'privacy.dataUsage.legalCompliance'
  ];

  const userRightsItems = [
    'privacy.userRights.access',
    'privacy.userRights.rectification',
    'privacy.userRights.erasure',
    'privacy.userRights.portability',
    'privacy.userRights.objection'
  ];

  const cookieTypes = [
    {
      key: 'necessary',
      icon: 'mynaui:shield-check',
      colorClass: 'text-green-500'
    },
    {
      key: 'functional',
      icon: 'mynaui:cog',
      colorClass: 'text-blue-500'
    },
    {
      key: 'analytics',
      icon: 'mynaui:chart-bar',
      colorClass: 'text-purple-500'
    },
    {
      key: 'marketing',
      icon: 'mynaui:bell',
      colorClass: 'text-orange-500'
    }
  ];

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 返回上一页
  const goBack = () => {
    router.back();
  };

  // 打开 Cookie 设置
  const openCookieSettings = () => {
    if (cookieConsentRef.value) {
      cookieConsentRef.value.show();
    }
  };
</script>
