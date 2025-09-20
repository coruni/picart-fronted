<template>
  <UModal v-model:open="isOpen" :title="$t('payment.title')" size="lg">
    <template #body>
      <div class="space-y-4">
        <!-- 订单信息 -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('payment.orderInfo') }}
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              #{{ orderInfo?.orderNo || '' }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ orderInfo?.remark || $t('payment.defaultRemark') }}
            </span>
            <span class="text-lg font-bold text-primary"> ¥{{ orderInfo?.amount || 0 }} </span>
          </div>
        </div>

        <!-- 支付方式选择 -->
        <div class="space-y-3">
          <div class="text-sm font-medium text-gray-900 dark:text-white">
            {{ $t('payment.selectPaymentMethod') }}
          </div>

          <!-- 余额支付 -->
          <div
            v-if="true"
            @click="selectPaymentMethod('BALANCE')"
            :class="[
              'p-4 border rounded-md cursor-pointer transition-all',
              selectedPaymentMethod === 'BALANCE'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Icon name="mynaui:wallet" class="w-6 h-6 text-primary" />
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ $t('payment.balance') }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('payment.balanceDesc') }}: ¥{{ userWallet || 0 }}
                  </div>
                </div>
              </div>
              <Icon
                v-if="selectedPaymentMethod === 'BALANCE'"
                name="mynaui:check-circle"
                class="w-5 h-5 text-primary"
              />
            </div>
          </div>

          <!-- 支付宝支付 -->
          <div
            v-if="siteConfig?.payment_alipay_enabled"
            @click="selectPaymentMethod('ALIPAY')"
            :class="[
              'p-4 border rounded-md cursor-pointer transition-all',
              selectedPaymentMethod === 'ALIPAY'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Icon name="mynaui:brand-alipay" class="w-6 h-6 text-blue-500" />
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ $t('payment.alipay') }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('payment.alipayDesc') }}
                  </div>
                </div>
              </div>
              <Icon
                v-if="selectedPaymentMethod === 'ALIPAY'"
                name="mynaui:check-circle"
                class="w-5 h-5 text-primary"
              />
            </div>
          </div>

          <!-- 微信支付 -->
          <div
            v-if="siteConfig?.payment_wechat_enabled"
            @click="selectPaymentMethod('WECHAT')"
            :class="[
              'p-4 border rounded-md cursor-pointer transition-all',
              selectedPaymentMethod === 'WECHAT'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
            ]"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <Icon name="mynaui:brand-wechat" class="w-6 h-6 text-green-500" />
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ $t('payment.wechat') }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('payment.wechatDesc') }}
                  </div>
                </div>
              </div>
              <Icon
                v-if="selectedPaymentMethod === 'WECHAT'"
                name="mynaui:check-circle"
                class="w-5 h-5 text-primary"
              />
            </div>
          </div>

          <!-- 易支付 -->
          <div v-if="siteConfig?.payment_epay_enabled" class="space-y-2">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('payment.epay') }}
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="epayType in epayTypes"
                :key="epayType.value"
                @click="selectEpayType(epayType.value)"
                :class="[
                  'p-3 border rounded-md cursor-pointer text-center transition-all',
                  selectedEpayType === epayType.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                ]"
              >
                <Icon :name="epayType.icon" class="w-6 h-6 text-primary mx-auto mb-1" />
                <div class="text-xs text-gray-900 dark:text-white">{{ epayType.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 支付确认信息 -->
        <div v-if="selectedPaymentMethod" class="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ getPaymentMethodName(selectedPaymentMethod) }}
              <span v-if="selectedPaymentMethod === 'EPAY' && selectedEpayType">
                ({{ getEpayTypeName(selectedEpayType) }})
              </span>
            </span>
            <span class="text-lg font-bold text-primary">¥{{ orderInfo?.amount || 0 }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex space-x-3">
        <UButton
          @click="handlePayment"
          :disabled="!selectedPaymentMethod || processing"
          :loading="processing"
          color="primary"
          class="flex-1"
        >
          {{ processing ? $t('payment.processing') : $t('payment.confirmPayment') }}
        </UButton>
        <UButton @click="closeModal" variant="outline">
          {{ $t('common.cancel') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { paymentControllerCreatePayment } from '~/api';
  import type { ConfigControllerGetPublicResponse } from '~/api';

  type SiteConfig = ConfigControllerGetPublicResponse['data'];

  interface OrderInfo {
    orderId: number;
    orderNo: string;
    amount: number;
    remark?: string;
  }

  interface Props {
    modelValue: boolean;
    orderInfo?: OrderInfo;
    userWallet?: number;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'payment-success': [orderId: number];
    'payment-failed': [error: string];
  }>();

  const { t } = useI18n();
  const toast = useToast();
  const siteConfig = inject<SiteConfig>('siteConfig');

  // 响应式数据
  const isOpen = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  });

  const selectedPaymentMethod = ref<'ALIPAY' | 'WECHAT' | 'BALANCE' | 'EPAY' | null>(null);
  const selectedEpayType = ref<'alipay' | 'wxpay' | null>(null);
  const processing = ref(false);

  // 易支付类型选项
  const epayTypes = computed(() => [
    {
      value: 'alipay' as const,
      label: t('payment.epayAlipay'),
      icon: 'mynaui:brand-alipay'
    },
    {
      value: 'wxpay' as const,
      label: t('payment.epayWechat'),
      icon: 'mynaui:brand-wechat'
    }
  ]);

  // 选择支付方式
  const selectPaymentMethod = (method: 'ALIPAY' | 'WECHAT' | 'BALANCE' | 'EPAY') => {
    selectedPaymentMethod.value = method;

    // 如果选择易支付，默认选择支付宝
    if (method === 'EPAY' && !selectedEpayType.value) {
      selectedEpayType.value = 'alipay';
    }

    // 如果选择其他支付方式，清除易支付类型选择
    if (method !== 'EPAY') {
      selectedEpayType.value = null;
    }
  };

  // 选择易支付类型
  const selectEpayType = (type: 'alipay' | 'wxpay') => {
    selectedEpayType.value = type;
    selectedPaymentMethod.value = 'EPAY';
  };

  // 获取支付方式名称
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'ALIPAY':
        return t('payment.alipay');
      case 'WECHAT':
        return t('payment.wechat');
      case 'BALANCE':
        return t('payment.balance');
      case 'EPAY':
        return t('payment.epay');
      default:
        return '';
    }
  };

  // 获取易支付类型名称
  const getEpayTypeName = (type: string) => {
    switch (type) {
      case 'alipay':
        return t('payment.epayAlipay');
      case 'wxpay':
        return t('payment.epayWechat');
      default:
        return '';
    }
  };

  // 关闭弹窗
  const closeModal = () => {
    isOpen.value = false;
    selectedPaymentMethod.value = null;
    selectedEpayType.value = null;
  };

  // 处理支付
  const handlePayment = async () => {
    if (!props.orderInfo || !selectedPaymentMethod.value) {
      toast.add({
        title: t('payment.selectPaymentMethod'),
        color: 'error'
      });
      return;
    }

    // 检查余额支付
    if (selectedPaymentMethod.value === 'BALANCE') {
      if ((props.userWallet || 0) < (props.orderInfo.amount || 0)) {
        toast.add({
          title: t('payment.insufficientBalance'),
          color: 'error'
        });
        return;
      }
    }

    // 检查易支付类型选择
    if (selectedPaymentMethod.value === 'EPAY' && !selectedEpayType.value) {
      toast.add({
        title: t('payment.selectEpayType'),
        color: 'error'
      });
      return;
    }

    processing.value = true;

    try {
      // 构建支付请求参数
      const paymentData: any = {
        orderId: props.orderInfo.orderId,
        paymentMethod: selectedPaymentMethod.value
      };

      // 如果是易支付，添加type参数
      if (selectedPaymentMethod.value === 'EPAY' && selectedEpayType.value) {
        paymentData.type = selectedEpayType.value;
      }

      // 调用支付API
      const response = await paymentControllerCreatePayment({
        composable: '$fetch',
        body: paymentData
      });

      // 处理支付响应
      if (response && response.data.data) {
        const paymentResult = response.data.data;

        // 根据支付方式处理不同的响应
        if (selectedPaymentMethod.value === 'BALANCE') {
          // 余额支付直接成功
          toast.add({
            title: t('payment.balancePaymentSuccess'),
            color: 'primary'
          });
          emit('payment-success', props.orderInfo.orderId);
          closeModal();
        } else {
          // 第三方支付，跳转到支付页面
          if (paymentResult.paymentUrl) {
            window.open(paymentResult.paymentUrl, '_blank');
            toast.add({
              title: t('payment.redirectToPayment'),
              color: 'info'
            });
          }
        }
      }
    } catch (error: any) {
      console.error(t('payment.paymentFailed'), error);
      emit('payment-failed', error?.message || t('payment.failed'));
    } finally {
      processing.value = false;
    }
  };

  // 监听弹窗关闭，重置状态
  watch(isOpen, newValue => {
    if (!newValue) {
      selectedPaymentMethod.value = null;
      selectedEpayType.value = null;
    }
  });
</script>
