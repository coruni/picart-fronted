<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
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
    <div class="mb-6 space-y-4">
      <!-- 订单状态筛选 -->
      <div class="w-full">
        <UTabs
          v-model="activeStatus"
          :items="orderStatuses"
          :content="false"
          class="w-full"
          :ui="{
            trigger: 'cursor-pointer'
          }"
        />
      </div>

      <!-- 订单类型筛选 -->
      <div class="w-full">
        <UTabs
          v-model="activeType"
          :items="orderTypes"
          :content="false"
          class="w-full"
          :ui="{
            trigger: 'cursor-pointer'
          }"
        />
      </div>

      <!-- 搜索框 -->
      <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div class="w-full lg:w-80">
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
      <!-- 订单卡片 -->
      <div v-if="orders.length > 0" class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          <!-- 订单头部 -->
          <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div class="flex items-center space-x-3 mb-2 md:mb-0">
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ $t('user.orders.orderNumber') }}:
              </span>
              <span class="text-sm font-mono text-gray-900 dark:text-white">
                {{ order.orderNo || order.id?.toString() || '' }}
              </span>
            </div>
            <div class="flex items-center space-x-3">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  getStatusColor(order.status || '')
                ]"
              >
                {{ getStatusText(order.status || '') }}
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(order.createdAt || '') }}
              </span>
            </div>
          </div>

          <!-- 订单内容 -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div
              class="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-6"
            >
              <!-- 商品信息 -->
              <div class="flex-1">
                <div class="flex items-start space-x-3">
                  <div v-if="order.articleId">
                    <NuxtImg
                      src="/placeholder.svg"
                      alt="Article"
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
                  ¥{{ formatPrice(order.amount) }}
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                <UButton
                  @click="viewOrderDetail(order)"
                  size="sm"
                  variant="outline"
                  class="cursor-pointer text-center"
                >
                  {{ $t('user.orders.viewDetail') }}
                </UButton>

                <UButton
                  v-if="order.status === 'PENDING'"
                  @click="showCancelConfirm(order)"
                  size="sm"
                  color="error"
                  class="cursor-pointer text-center"
                >
                  {{ $t('user.orders.cancel') }}
                </UButton>

                <UButton
                  v-if="order.status === 'PENDING'"
                  @click="payOrder(order)"
                  size="sm"
                  color="primary"
                  class="cursor-pointer text-center"
                >
                  {{ $t('user.orders.pay') }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
        >
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="!loading && orders.length === 0"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center"
      >
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

      <!-- 没有更多数据 -->
      <div v-else-if="!hasMore && orders.length > 0" class="text-center py-4 text-gray-500">
        {{ $t('common.loading.noMore') }}
      </div>
    </div>

    <UModal
      v-model:open="isDetailModalOpen"
      :title="$t('user.orders.orderDetail')"
      :ui="{
        close: 'cursor-pointer'
      }"
    >
      <template #body>
        <div v-if="selectedOrder" class="space-y-4">
          <!-- 订单基本信息 -->
          <div class="border-b border-gray-200 dark:border-gray-700 pb-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-500 dark:text-gray-400"
                  >{{ $t('user.orders.orderNumber') }}:</span
                >
                <span class="ml-2 font-mono">{{
                  selectedOrder.orderNo || selectedOrder.id?.toString() || ''
                }}</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400"
                  >{{ $t('user.orders.status') }}:</span
                >
                <span
                  :class="[
                    'ml-2 px-2 py-1 rounded text-xs',
                    getStatusColor(selectedOrder.status || '')
                  ]"
                >
                  {{ getStatusText(selectedOrder.status || '') }}
                </span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400"
                  >{{ $t('user.orders.createTime') }}:</span
                >
                <span class="ml-2">{{ formatDate(selectedOrder.createdAt || '') }}</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400"
                  >{{ $t('user.orders.amount') }}:</span
                >
                <span class="ml-2 font-bold">¥{{ formatPrice(selectedOrder.amount) }}</span>
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
                  src="/placeholder.svg"
                  alt="Article"
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
        </div>
      </template>
    </UModal>

    <!-- 取消订单确认对话框 -->
    <UModal
      v-model:open="isCancelModalOpen"
      :title="$t('user.orders.confirmCancel')"
      :ui="{
        close: 'cursor-pointer'
      }"
    >
      <template #body>
        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t('user.orders.confirmCancelMessage') }}
          </p>
          <div v-if="orderToCancel" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div class="flex items-center space-x-3">
              <div v-if="orderToCancel.articleId">
                <NuxtImg
                  src="/placeholder.svg"
                  alt="Article"
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
                  ¥{{ formatPrice(orderToCancel.amount) }}
                </p>
              </div>
            </div>
          </div>
          <div class="flex space-x-3 pt-4">
            <UButton
              @click="confirmCancelOrder"
              :loading="cancelling"
              color="error"
              class="flex-1 cursor-pointer text-center"
            >
              {{
                cancelling ? $t('user.orders.cancelling') : $t('user.orders.confirmCancelButton')
              }}
            </UButton>
            <UButton
              @click="isCancelModalOpen = false"
              variant="outline"
              class="flex-1 cursor-pointer text-center"
            >
              {{ $t('common.cancel') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- 支付弹窗 -->
    <PaymentModal
      v-model="showPaymentModal"
      :order-info="paymentOrderInfo"
      :user-wallet="userWallet"
      @payment-success="handlePaymentSuccess"
      @payment-failed="handlePaymentFailed"
    />
  </div>
</template>

<script lang="ts" setup>
  import { orderControllerCancelOrder, orderControllerGetUserOrders } from '~/api';
  import type { OrderControllerGetUserOrdersResponse } from '~/api';
  import { debounce } from 'lodash-es';
  import type { TabsItem } from '@nuxt/ui';
  import { useUserStore } from '~/stores/user';

  // 定义订单类型
  type Order = OrderControllerGetUserOrdersResponse['data']['data'][0];

  const { t } = useI18n();
  const toast = useToast();

  // 订单状态选项 - 修复：使用 value 属性而不是 id
  const orderStatuses = computed<TabsItem[]>(() => [
    { label: t('user.orders.status.all'), value: 'ALL', icon: 'mynaui:grid' },
    {
      label: t('user.orders.status.pending'),
      value: 'PENDING',
      icon: 'mynaui:alarm'
    },
    { label: t('user.orders.status.paid'), value: 'PAID', icon: 'mynaui:check-circle' },
    {
      label: t('user.orders.status.cancelled'),
      value: 'CANCELLED',
      icon: 'mynaui:x-circle'
    },
    {
      label: t('user.orders.status.refunded'),
      value: 'REFUNDED',
      icon: 'mynaui:arrow-return-left'
    }
  ]);

  // 订单类型选项 - 修复：使用 value 属性而不是 id
  const orderTypes = computed<TabsItem[]>(() => [
    { label: t('user.orders.all'), value: 'ALL', icon: 'mynaui:grid' },
    { label: t('user.orders.product'), value: 'PRODUCT', icon: 'mynaui:box' },
    {
      label: t('user.orders.membership'),
      value: 'MEMBERSHIP',
      icon: 'mynaui:crown'
    },
    { label: t('user.orders.service'), value: 'SERVICE', icon: 'mynaui:settings' },
    { label: t('user.orders.article'), value: 'ARTICLE', icon: 'mynaui:document-text' }
  ]);

  // 响应式数据 - 修复：使用字符串值而不是索引
  const loading = ref(false);
  const orders = ref<Order[]>([]);
  const hasMore = ref(true);
  const pagination = ref({
    page: 1,
    limit: 10
  });
  const activeStatus = ref('ALL');
  const activeType = ref('ALL');
  const searchKeyword = ref('');
  const isDetailModalOpen = ref(false);
  const selectedOrder = ref<Order | null>(null);
  const isCancelModalOpen = ref(false);
  const orderToCancel = ref<Order | null>(null);
  const cancelling = ref(false);

  // 支付相关
  const showPaymentModal = ref(false);
  const paymentOrderInfo = ref<
    | {
        orderId: number;
        orderNo: string;
        amount: number;
        remark?: string;
      }
    | undefined
  >(undefined);
  const userWallet = ref(0);

  // 获取状态颜色样式
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';

    const colors = {
      PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
      PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      REFUNDED: 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-400'
    };
    return (
      colors[status as keyof typeof colors] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    );
  };

  // 获取状态文本
  const getStatusText = (status?: string) => {
    if (!status) return '';

    const statusMap = {
      PENDING: t('user.orders.status.pending'),
      PAID: t('user.orders.status.paid'),
      CANCELLED: t('user.orders.status.cancelled'),
      REFUNDED: t('user.orders.status.refunded')
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  // 获取订单标题
  const getOrderTitle = (order: Order) => {
    if (order.articleId && order.title) {
      return order.title;
    }

    // 根据订单类型返回对应的标题
    const typeMap = {
      PRODUCT: t('user.orders.product'),
      MEMBERSHIP: t('user.orders.membership'),
      SERVICE: t('user.orders.service'),
      ARTICLE: t('user.orders.article')
    };

    return typeMap[order.type as keyof typeof typeMap] || t('user.orders.unknownProduct');
  };

  // 获取订单描述
  const getOrderDescription = (order: Order) => {
    if (order.articleId) {
      return t('user.orders.articleAccess');
    }

    // 根据订单类型返回对应的描述
    const descriptionMap = {
      PRODUCT: t('user.orders.productAccess'),
      MEMBERSHIP: t('user.orders.membershipAccess'),
      SERVICE: t('user.orders.serviceAccess'),
      ARTICLE: t('user.orders.articleAccess')
    };

    return descriptionMap[order.type as keyof typeof descriptionMap] || '';
  };

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 格式化价格
  const formatPrice = (price: any) => {
    if (price === null || price === undefined) return '0.00';
    const num = parseFloat(price);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  };

  // 重置数据
  const resetData = () => {
    pagination.value.page = 1;
    orders.value = [];
    hasMore.value = true;
    loading.value = false;
  };

  // 加载订单列表
  const loadOrders = async () => {
    if (loading.value || !hasMore.value) {
      return;
    }

    loading.value = true;

    // 如果是第一页，立即清空列表以提供即时反馈
    if (pagination.value.page === 1) {
      orders.value = [];
    }

    try {
      const queryParams: any = {
        page: pagination.value.page.toString(),
        limit: pagination.value.limit.toString()
      };

      // 添加状态筛选参数
      if (activeStatus.value && activeStatus.value !== 'ALL') {
        queryParams.status = activeStatus.value;
      }

      // 添加类型筛选参数
      if (activeType.value && activeType.value !== 'ALL') {
        queryParams.type = activeType.value;
      }

      // 添加搜索关键词参数
      if (searchKeyword.value.trim()) {
        queryParams.search = searchKeyword.value.trim();
      }

      const response = await orderControllerGetUserOrders({
        composable: '$fetch',
        query: queryParams
      });

      // 正确处理数据结构
      let newOrders: any[] = [];

      if (response?.data?.data && Array.isArray(response.data.data)) {
        newOrders = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        newOrders = response.data;
      } else if (Array.isArray(response)) {
        newOrders = response;
      }

      if (pagination.value.page === 1) {
        orders.value = newOrders;
      } else {
        orders.value = [...orders.value, ...newOrders];
      }

      // 检查是否还有更多数据
      hasMore.value = newOrders.length === pagination.value.limit;

      // 更新页码
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
    resetData();
    loadOrders();
  }, 500);

  // 监听状态变化
  watch(activeStatus, () => {
    resetData();
    loadOrders();
  });

  // 监听类型变化
  watch(activeType, () => {
    resetData();
    loadOrders();
  });

  // 查看订单详情
  const viewOrderDetail = (order: Order) => {
    selectedOrder.value = order;
    isDetailModalOpen.value = true;
  };

  // 显示取消订单确认对话框
  const showCancelConfirm = (order: Order) => {
    orderToCancel.value = order;
    isCancelModalOpen.value = true;
  };

  // 确认取消订单
  const confirmCancelOrder = async () => {
    if (!orderToCancel.value?.id) return;

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
      resetData();
      loadOrders();
    } catch (error: any) {
      console.error('取消订单失败:', error);
    } finally {
      cancelling.value = false;
    }
  };

  // 支付订单
  const payOrder = async (order: Order) => {
    // 设置支付订单信息
    paymentOrderInfo.value = {
      orderId: order.id!,
      orderNo: order.orderNo || order.id?.toString() || '',
      amount: parseFloat(order.amount || '0'),
      remark: getOrderTitle(order)
    };

    // 获取用户钱包余额
    try {
      const userStore = useUserStore();
      userWallet.value = userStore.userInfo?.wallet || 0;
    } catch (error) {
      console.error('获取用户钱包信息失败:', error);
      userWallet.value = 0;
    }

    // 打开支付弹窗
    showPaymentModal.value = true;
  };

  // 支付成功处理
  const handlePaymentSuccess = (orderId: number) => {
    toast.add({
      title: t('user.orders.paymentSuccess'),
      color: 'success'
    });
    // 重新加载订单列表
    resetData();
    loadOrders();
  };

  // 支付失败处理
  const handlePaymentFailed = (error: string) => {
    toast.add({
      title: t('user.orders.paymentFailed'),
      description: error,
      color: 'error'
    });
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
