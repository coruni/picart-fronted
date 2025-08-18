<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-4 md:py-8">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {{ $t('user.orders.title') }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">
          {{ $t('user.orders.description') }}
        </p>
      </div>

      <!-- 筛选栏 -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-6">
        <div class="flex flex-col gap-4">
          <!-- 订单状态筛选 -->
          <UTabs
            v-model="activeStatus"
            :items="orderStatuses"
            :default-value="0"
            class="w-full"
            :ui="{
              trigger: 'cursor-pointer'
            }"
            @change="handleStatusChange"
          />

          <!-- 搜索框 -->
          <div class="flex-1 max-w-md">
            <UInput
              v-model="searchKeyword"
              :placeholder="$t('user.orders.searchPlaceholder')"
              class="w-full"
              @input="handleSearch"
            />
          </div>
        </div>
      </div>

      <!-- 订单列表 -->
      <div class="space-y-4">
        <!-- 加载状态 -->
        <div v-if="loading && orders.length === 0" class="space-y-4">
          <div
            v-for="i in 3"
            :key="i"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse"
          >
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>

        <!-- 订单卡片 -->
        <div v-else-if="orders.length > 0" class="space-y-4">
          <div
            v-for="order in orders"
            :key="order.id"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow"
          >
            <!-- 订单头部 -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div class="flex items-center space-x-3 mb-2 md:mb-0">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {{ $t('user.orders.orderNumber') }}:
                </span>
                <span class="text-sm font-mono text-gray-900 dark:text-white">
                  {{ order.orderNo || order.id }}
                </span>
              </div>
              <div class="flex items-center space-x-3">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    getStatusColor(order.status)
                  ]"
                >
                  {{ getStatusText(order.status) }}
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(order.createdAt) }}
                </span>
              </div>
            </div>

            <!-- 订单内容 -->
            <div class="border-t dark:border-gray-700 pt-4">
              <div
                class="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-6"
              >
                <!-- 商品信息 -->
                <div class="flex-1">
                  <div class="flex items-start space-x-3">
                    <div v-if="order.articleId">
                      <NuxtImg
                        :src="order.article?.cover || '/placeholder.svg'"
                        :alt="order.article?.title"
                        class="w-16 h-16 object-cover rounded-md"
                        loading="lazy"
                        format="webp"
                        sizes="64px"
                      />
                    </div>
                    <div class="flex-1">
                      <h3 class="font-medium text-gray-900 dark:text-white line-clamp-2">
                        {{ getOrderTitle(order) }}
                      </h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {{ getOrderDescription(order) }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- 价格信息 -->
                <div class="text-right">
                  <div class="text-lg font-bold text-gray-900 dark:text-white">
                    ¥{{ (order.amount || 0).toFixed(2) }}
                  </div>
                  <div
                    v-if="order.originalAmount && order.originalAmount !== order.amount"
                    class="text-sm text-gray-500 line-through"
                  >
                    ¥{{ order.originalAmount.toFixed(2) }}
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                  <UButton
                    @click="viewOrderDetail(order)"
                    size="sm"
                    variant="outline"
                    class="cursor-pointer"
                  >
                    {{ $t('user.orders.viewDetail') }}
                  </UButton>

                  <UButton
                    v-if="order.status === 'PENDING'"
                    @click="showCancelConfirm(order)"
                    size="sm"
                    color="error"
                    class="cursor-pointer"
                  >
                    {{ $t('user.orders.cancel') }}
                  </UButton>

                  <UButton
                    v-if="order.status === 'PENDING'"
                    @click="payOrder(order)"
                    size="sm"
                    color="primary"
                    class="cursor-pointer"
                  >
                    {{ $t('user.orders.pay') }}
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <div class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <Icon name="mynaui:cart-x" class="w-full h-full" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ $t('user.orders.empty.title') }}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            {{ $t('user.orders.empty.description') }}
          </p>
          <NuxtLinkLocale
            to="/"
            class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            {{ $t('user.orders.empty.browseArticles') }}
          </NuxtLinkLocale>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore && orders.length > 0" class="text-center py-6">
          <UButton
            @click="() => loadOrders()"
            :disabled="loading"
            color="primary"
            class="px-6 py-2 cursor-pointer"
          >
            <div
              v-if="loading"
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
            ></div>
            {{ loading ? $t('common.loading.loading') : $t('common.loadMore') }}
          </UButton>
        </div>

        <!-- 没有更多数据 -->
        <div v-else-if="!hasMore && orders.length > 0" class="text-center py-4 text-gray-500">
          {{ $t('common.loading.noMore') }}
        </div>
      </div>
    </div>

    <!-- 订单详情模态框 -->
    <UModal v-model:open="isDetailModalOpen" :title="$t('user.orders.orderDetail')">
      <template #body>
        <div v-if="selectedOrder" class="space-y-4">
          <!-- 订单基本信息 -->
          <div class="border-b dark:border-gray-700 pb-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500 dark:text-gray-400"
                  >{{ $t('user.orders.orderNumber') }}:</span
                >
                <span class="ml-2 font-mono">{{ selectedOrder.orderNo || selectedOrder.id }}</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400"
                  >{{ $t('user.orders.status') }}:</span
                >
                <span
                  :class="['ml-2 px-2 py-1 rounded text-xs', getStatusColor(selectedOrder.status)]"
                >
                  {{ getStatusText(selectedOrder.status) }}
                </span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400"
                  >{{ $t('user.orders.createTime') }}:</span
                >
                <span class="ml-2">{{ formatDate(selectedOrder.createdAt) }}</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400"
                  >{{ $t('user.orders.amount') }}:</span
                >
                <span class="ml-2 font-bold">¥{{ (selectedOrder.amount || 0).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- 商品详情 -->
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-3">
              {{ $t('user.orders.productInfo') }}
            </h4>
            <div class="flex items-start space-x-3">
              <div v-if="selectedOrder.articleId">
                <NuxtImg
                  :src="selectedOrder.article?.cover || '/placeholder.svg'"
                  :alt="selectedOrder.article?.title"
                  class="w-20 h-20 object-cover rounded-md"
                  loading="lazy"
                  format="webp"
                  sizes="80px"
                />
              </div>
              <div class="flex-1">
                <h5 class="font-medium text-gray-900 dark:text-white">
                  {{ getOrderTitle(selectedOrder) }}
                </h5>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ getOrderDescription(selectedOrder) }}
                </p>
              </div>
            </div>
          </div>

          <!-- 支付信息 -->
          <div v-if="selectedOrder.paymentId" class="border-t dark:border-gray-700 pt-4">
            <h4 class="font-medium text-gray-900 dark:text-white mb-3">
              {{ $t('user.orders.paymentInfo') }}
            </h4>
            <div class="text-sm space-y-2">
              <div>
                <span class="text-gray-500 dark:text-gray-400"
                  >{{ $t('user.orders.paymentId') }}:</span
                >
                <span class="ml-2 font-mono">{{ selectedOrder.paymentId }}</span>
              </div>
              <div v-if="selectedOrder.paidAt">
                <span class="text-gray-500 dark:text-gray-400"
                  >{{ $t('user.orders.payTime') }}:</span
                >
                <span class="ml-2">{{ formatDate(selectedOrder.paidAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- 取消订单确认对话框 -->
    <UModal v-model:open="isCancelModalOpen" :title="$t('user.orders.confirmCancel')">
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t('user.orders.confirmCancelMessage') }}
          </p>
          <div v-if="orderToCancel" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div class="flex items-center space-x-3">
              <div v-if="orderToCancel.articleId">
                <NuxtImg
                  :src="orderToCancel.article?.cover || '/placeholder.svg'"
                  :alt="orderToCancel.article?.title"
                  class="w-12 h-12 object-cover rounded"
                  loading="lazy"
                  format="webp"
                  sizes="48px"
                />
              </div>
              <div class="flex-1">
                <h5 class="font-medium text-gray-900 dark:text-white">
                  {{ getOrderTitle(orderToCancel) }}
                </h5>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  ¥{{ (orderToCancel.amount || 0).toFixed(2) }}
                </p>
              </div>
            </div>
          </div>
          <div class="flex space-x-3 pt-4">
            <UButton
              @click="confirmCancelOrder"
              :loading="cancelling"
              color="error"
              class="flex-1 cursor-pointer"
            >
              {{
                cancelling ? $t('user.orders.cancelling') : $t('user.orders.confirmCancelButton')
              }}
            </UButton>
            <UButton
              @click="isCancelModalOpen = false"
              variant="outline"
              class="flex-1 cursor-pointer"
            >
              {{ $t('common.cancel') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
  import { orderControllerCancelOrder, orderControllerGetUserOrders } from '~~/api';
  import { debounce } from 'lodash-es';
  import type { TabsItem } from '@nuxt/ui';

  const { t } = useI18n();
  const toast = useToast();

  // 订单状态选项
  const orderStatuses = computed<TabsItem[]>(() => [
    { id: 'ALL', label: t('user.orders.status.all'), value: '', icon: 'mynaui:brand-trello' },
    {
      id: 'PENDING',
      label: t('user.orders.status.pending'),
      value: 'PENDING',
      icon: 'mynaui:clock'
    },
    { id: 'PAID', label: t('user.orders.status.paid'), value: 'PAID', icon: 'mynaui:check' },
    {
      id: 'CANCELLED',
      label: t('user.orders.status.cancelled'),
      value: 'CANCELLED',
      icon: 'mynaui:close'
    },
    {
      id: 'REFUNDED',
      label: t('user.orders.status.refunded'),
      value: 'REFUNDED',
      icon: 'mynaui:refund'
    }
  ]);

  // 响应式数据
  const loading = ref(false);
  const orders = ref<any[]>([]);
  const hasMore = ref(true);
  const pagination = ref({
    page: 1,
    limit: 10
  });
  const activeStatus = ref('0');
  const searchKeyword = ref('');
  const isDetailModalOpen = ref(false);
  const selectedOrder = ref<any>(null);
  const isCancelModalOpen = ref(false);
  const orderToCancel = ref<any>(null);
  const cancelling = ref(false);

  // 获取状态颜色样式
  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      REFUNDED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    };
    return (
      colors[status as keyof typeof colors] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    );
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap = {
      PENDING: t('user.orders.status.pending'),
      PAID: t('user.orders.status.paid'),
      CANCELLED: t('user.orders.status.cancelled'),
      REFUNDED: t('user.orders.status.refunded')
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  // 获取订单标题
  const getOrderTitle = (order: any) => {
    if (order.articleId && order.article) {
      return order.article.title;
    }
    if (order.type === 'MEMBERSHIP') {
      return t('user.orders.membership');
    }
    return t('user.orders.unknownProduct');
  };

  // 获取订单描述
  const getOrderDescription = (order: any) => {
    if (order.articleId && order.article) {
      return t('user.orders.articleAccess');
    }
    if (order.type === 'MEMBERSHIP') {
      return t('user.orders.membershipAccess');
    }
    return '';
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 加载订单列表
  const loadOrders = async (reset = false) => {
    if (loading.value || (!hasMore.value && !reset)) return;

    loading.value = true;
    try {
      if (reset) {
        pagination.value.page = 1;
        orders.value = [];
        hasMore.value = true;
      }

      const queryParams: any = {
        page: pagination.value.page.toString(),
        limit: pagination.value.limit.toString()
      };

      // 添加状态筛选参数
      const selectedStatus = orderStatuses.value[Number(activeStatus.value)]?.value;
      if (selectedStatus && selectedStatus !== 'ALL') {
        queryParams.status = selectedStatus;
      }

      // 添加搜索关键词参数
      if (searchKeyword.value.trim()) {
        queryParams.search = searchKeyword.value.trim();
      }

      const response = await orderControllerGetUserOrders({
        composable: 'useFetch',
        key: `user-orders-${pagination.value.page}-${activeStatus.value}-${searchKeyword.value}`,
        query: queryParams
      });

      const newOrders = (response.data.value as any)?.data || [];

      if (reset) {
        orders.value = newOrders;
      } else {
        orders.value = [...orders.value, ...newOrders];
      }

      hasMore.value = newOrders.length === pagination.value.limit;

      if (hasMore.value) {
        pagination.value.page++;
      }
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 搜索处理（防抖）
  const handleSearch = debounce(() => {
    loadOrders(true);
  }, 500);

  // 状态变化处理函数
  const handleStatusChange = () => {
    loadOrders(true);
  };

  // 监听状态变化
  watch(activeStatus, () => {
    loadOrders(true);
  });

  // 查看订单详情
  const viewOrderDetail = (order: any) => {
    selectedOrder.value = order;
    isDetailModalOpen.value = true;
  };

  // 显示取消订单确认对话框
  const showCancelConfirm = (order: any) => {
    orderToCancel.value = order;
    isCancelModalOpen.value = true;
  };

  // 确认取消订单
  const confirmCancelOrder = async () => {
    if (!orderToCancel.value) return;

    cancelling.value = true;
    try {
      await orderControllerCancelOrder({
        composable: '$fetch',
        path: {
          id: orderToCancel.value.id.toString()
        }
      });

      // 关闭对话框
      isCancelModalOpen.value = false;
      orderToCancel.value = null;

      // 重新加载订单列表
      loadOrders(true);
    } catch (error: any) {
      console.error('取消订单失败:', error);
    } finally {
      cancelling.value = false;
    }
  };

  // 支付订单
  const payOrder = async (order: any) => {
    try {
      // TODO: 调用支付API
      toast.add({
        title: t('user.orders.paymentRedirect'),
        color: 'info'
      });
    } catch (error) {}
  };

  // 初始化加载
  onMounted(() => {
    loadOrders();
  });

  // 页面元数据
  useHead({
    title: () => t('user.orders.title'),
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow'
      }
    ]
  });

  // 定义页面元数据
  definePageMeta({
    requiresAuth: true
  });
</script>
