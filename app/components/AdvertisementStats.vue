<template>
  <ClientOnly>
    <template #fallback>
      <!-- SSR时的占位符 -->
      <div class="advertisement-stats">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div class="flex items-center">
              <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div class="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div class="ml-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
                <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div class="flex items-center">
              <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div class="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div class="ml-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
                <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div class="flex items-center">
              <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div class="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div class="ml-3">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
                <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
                </div>
    </div>
  </div>
  </ClientOnly>
</template>
    
    <div class="advertisement-stats">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- 展示次数 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Icon name="mynaui:eye" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ t('admin.settings.adStats.impressions') }}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ formatNumber(stats.impressions) }}
            </p>
          </div>
        </div>
      </div>

      <!-- 点击次数 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Icon name="mynaui:cursor-click" class="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ t('admin.settings.adStats.clicks') }}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ formatNumber(stats.clicks) }}
            </p>
          </div>
        </div>
      </div>

      <!-- 点击率 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Icon name="mynaui:chart-line" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ t('admin.settings.adStats.ctr') }}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ formatPercentage(stats.ctr) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 时间范围选择 -->
    <div class="mt-6">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100">
          {{ t('admin.settings.adStats.title') }}
        </h4>
        <USelect v-model="selectedPeriod" :items="periodOptions" size="sm" class="w-32" />
      </div>

      <!-- 图表区域 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {{ t('admin.settings.adStats.chartPlaceholder') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    type: 'homepage' | 'article-top' | 'article-bottom' | 'global';
  }

  const props = defineProps<Props>();
  const { t } = useI18n();

  // 模拟统计数据
  const stats = ref({
    impressions: 125430,
    clicks: 3421,
    ctr: 2.73
  });

  // 时间范围选项
  const periodOptions = [
    { label: t('admin.settings.adStats.last7Days'), value: '7d' },
    { label: t('admin.settings.adStats.last30Days'), value: '30d' },
    { label: t('admin.settings.adStats.last90Days'), value: '90d' }
  ];

  const selectedPeriod = ref('7d');

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // 格式化百分比
  const formatPercentage = (percentage: number) => {
    return percentage.toFixed(2) + '%';
  };
</script>
