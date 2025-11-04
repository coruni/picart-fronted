<template>
  <div class="space-y-8">
    <Title>{{ $t('admin.dashboard.title') }}</Title>

    <!-- 欢迎信息 -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h1 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        {{ $t('admin.dashboard.welcome') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('admin.dashboard.welcomeMessage') }}</p>
    </div>

    <!-- 统计数据 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- 文章总数 -->
      <div class="text-center">
        <div class="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          {{ stats.articles.total }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {{ $t('admin.dashboard.stats.articles') }}
        </div>
        <div class="text-sm text-green-600 dark:text-green-400 flex items-center justify-center">
          <UIcon name="i-mynaui-trending-up" class="w-4 h-4 mr-1" />
          +{{ stats.articles.growth }}%
        </div>
      </div>

      <!-- 用户总数 -->
      <div class="text-center">
        <div class="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
          {{ stats.users.total }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {{ $t('admin.dashboard.stats.users') }}
        </div>
        <div class="text-sm text-green-600 dark:text-green-400 flex items-center justify-center">
          <UIcon name="i-mynaui-trending-up" class="w-4 h-4 mr-1" />
          +{{ stats.users.growth }}%
        </div>
      </div>

      <!-- 评论总数 -->
      <div class="text-center">
        <div class="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
          {{ stats.comments.total }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {{ $t('admin.dashboard.stats.comments') }}
        </div>
        <div class="text-sm text-green-600 dark:text-green-400 flex items-center justify-center">
          <UIcon name="i-mynaui-trending-up" class="w-4 h-4 mr-1" />
          +{{ stats.comments.growth }}%
        </div>
      </div>

      <!-- 订单总数 -->
      <div class="text-center">
        <div class="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
          {{ stats.orders.total }}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {{ $t('admin.dashboard.stats.orders') }}
        </div>
        <div class="text-sm text-green-600 dark:text-green-400 flex items-center justify-center">
          <UIcon name="i-mynaui-trending-up" class="w-4 h-4 mr-1" />
          +{{ stats.orders.growth }}%
        </div>
      </div>
    </div>

    <!-- 统计图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 访问量趋势图 -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold">{{ $t('admin.dashboard.charts.visits') }}</h3>
          <USelect v-model="selectedPeriod" :options="periodOptions" class="w-32" />
        </div>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div class="h-64 flex items-center justify-center">
            <div class="w-full">
              <!-- 简单的柱状图 -->
              <div class="flex items-end justify-between h-48 space-x-2">
                <div
                  v-for="(bar, index) in visitData"
                  :key="index"
                  class="flex flex-col items-center flex-1"
                >
                  <div
                    class="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    :style="{
                      height: `${(bar.value / Math.max(...visitData.map(d => d.value))) * 100}%`
                    }"
                  />
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    {{ bar.label }}
                  </div>
                </div>
              </div>
              <div class="text-center mt-4">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ totalVisits.toLocaleString() }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('admin.dashboard.charts.totalVisits') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户增长图 -->
      <div class="space-y-4">
        <h3 class="text-xl font-semibold">{{ $t('admin.dashboard.charts.userGrowth') }}</h3>
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div class="h-64 flex items-center justify-center">
            <div class="w-full">
              <!-- 简单的折线图 -->
              <div class="relative h-48">
                <svg class="w-full h-full" viewBox="0 0 400 200">
                  <polyline
                    :points="lineChartPoints"
                    fill="none"
                    stroke="#10b981"
                    stroke-width="3"
                    class="drop-shadow-sm"
                  />
                  <circle
                    v-for="(point, index) in lineChartPoints.split(' ')"
                    :key="index"
                    :cx="point.split(',')[0]"
                    :cy="point.split(',')[1]"
                    r="4"
                    fill="#10b981"
                    class="hover:r-6 transition-all"
                  />
                </svg>
              </div>
              <div class="text-center mt-4">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                  +{{ userGrowthRate }}%
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('admin.dashboard.charts.growthRate') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容类型分布 -->
    <div class="space-y-4">
      <h3 class="text-xl font-semibold">{{ $t('admin.dashboard.charts.contentDistribution') }}</h3>
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="w-24 h-24 mx-auto mb-4 relative">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3b82f6"
                  stroke-width="8"
                  stroke-dasharray="251.2"
                  :stroke-dashoffset="251.2 - 251.2 * 0.6"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-blue-600 dark:text-blue-400">60%</span>
              </div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t('admin.dashboard.charts.articles') }}
            </div>
          </div>

          <div class="text-center">
            <div class="w-24 h-24 mx-auto mb-4 relative">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  stroke-width="8"
                  stroke-dasharray="251.2"
                  :stroke-dashoffset="251.2 - 251.2 * 0.3"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-green-600 dark:text-green-400">30%</span>
              </div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t('admin.dashboard.charts.images') }}
            </div>
          </div>

          <div class="text-center">
            <div class="w-24 h-24 mx-auto mb-4 relative">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f59e0b"
                  stroke-width="8"
                  stroke-dasharray="251.2"
                  :stroke-dashoffset="251.2 - 251.2 * 0.1"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-orange-600 dark:text-orange-400">10%</span>
              </div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t('admin.dashboard.charts.videos') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  definePageMeta({
    layout: 'dashboard'
  });

  const { t } = useI18n();

  // 统计数据
  const stats = ref({
    articles: {
      total: 1248,
      growth: 12.5
    },
    users: {
      total: 3421,
      growth: 8.3
    },
    comments: {
      total: 567,
      growth: 15.2
    },
    orders: {
      total: 89,
      growth: 23.1
    }
  });

  // 时间周期选择
  const selectedPeriod = ref('week');
  const periodOptions = [
    { label: t('admin.dashboard.periods.week'), value: 'week' },
    { label: t('admin.dashboard.periods.month'), value: 'month' },
    { label: t('admin.dashboard.periods.year'), value: 'year' }
  ];

  // 访问量数据
  const visitData = ref([
    { label: '周一', value: 1200 },
    { label: '周二', value: 1900 },
    { label: '周三', value: 3000 },
    { label: '周四', value: 2800 },
    { label: '周五', value: 1890 },
    { label: '周六', value: 2390 },
    { label: '周日', value: 3490 }
  ]);

  // 计算总访问量
  const totalVisits = computed(() => {
    return visitData.value.reduce((sum, item) => sum + item.value, 0);
  });

  // 折线图数据点
  const lineChartPoints = computed(() => {
    const points = [
      { x: 50, y: 150 },
      { x: 100, y: 120 },
      { x: 150, y: 100 },
      { x: 200, y: 80 },
      { x: 250, y: 60 },
      { x: 300, y: 40 },
      { x: 350, y: 20 }
    ];
    return points.map(p => `${p.x},${p.y}`).join(' ');
  });

  // 用户增长率
  const userGrowthRate = ref(15.8);
</script>
