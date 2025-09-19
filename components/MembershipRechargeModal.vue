<template>
  <UModal
    :ui="{ close: 'cursor-pointer' }"
    v-model:open="isOpen"
    :title="$t('user.recharge.title')"
    size="lg"
  >
    <template #body>
      <div class="space-y-6">
        <!-- 当前状态 -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {{ $t('user.recharge.currentStatus') }}
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t('user.recharge.membershipLevel') }}
              </div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {{
                  (props.userProfile?.membershipLevel || 0) > 0
                    ? $t('user.vipMember')
                    : $t('user.basicMember')
                }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t('user.recharge.expireDate') }}
              </div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ formatDate(props.userProfile?.membershipEndDate as string) || '-' }}
              </div>
            </div>
          </div>
          <div class="mt-3">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('user.recharge.walletBalance') }}
            </div>
            <div class="text-lg font-semibold text-primary">
              ¥{{ props.userProfile?.wallet?.toFixed(2) || 0 }}
            </div>
          </div>
        </div>

        <!-- 套餐选择 -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">
            {{ $t('user.recharge.selectPackage') }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="pkg in packages"
              :key="pkg.plan || pkg.duration"
              @click="selectPackage(pkg)"
              :class="[
                'p-4 border rounded-lg cursor-pointer transition-all',
                (selectedPackage?.plan || selectedPackage?.duration) === (pkg.plan || pkg.duration)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              ]"
            >
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{
                    pkg.plan === 'lifetime'
                      ? $t('user.recharge.lifetime')
                      : `${pkg?.duration || ''}${$t('user.recharge.month')}`
                  }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ pkg.description }}
                </div>
                <div class="text-lg font-bold text-primary mt-2">¥{{ pkg.price }}</div>
                <div v-if="pkg.duration" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ $t('user.recharge.perMonth') }} ¥{{
                    (pkg.price / (pkg.duration || 1)).toFixed(2)
                  }}
                </div>
                <div v-if="pkg.save" class="text-xs text-green-600 dark:text-green-400 mt-1">
                  {{ $t('user.recharge.save') }} {{ pkg.save }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 支付方式选择 -->
        <div v-if="selectedPackage" class="space-y-3">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">
            {{ $t('user.recharge.selectPayment') }}
          </h3>

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
                    {{ $t('payment.balanceDesc') }}: ¥{{
                      props.userProfile?.wallet?.toFixed(2) || 0
                    }}
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
          <div v-if="siteConfig?.payment_epay_enabled && epayTypes.length > 0" class="space-y-2">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('payment.epay') }}
            </div>
            <div class="grid grid-cols-3 gap-2">
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

        <!-- 订单确认 -->
        <div
          v-if="selectedPackage && selectedPaymentMethod"
          class="bg-gray-50 dark:bg-gray-800 rounded-md p-4"
        >
          <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {{ $t('user.recharge.confirmOrder') }}
          </h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{
                $t('user.recharge.package')
              }}</span>
              <span class="text-sm text-gray-900 dark:text-white">
                {{
                  selectedPackage.plan === 'lifetime'
                    ? $t('user.recharge.lifetime')
                    : `${selectedPackage.duration}${$t('user.recharge.month')}`
                }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{
                $t('user.recharge.paymentMethod')
              }}</span>
              <span class="text-sm text-gray-900 dark:text-white">
                {{ getPaymentMethodName(selectedPaymentMethod) }}
                <span v-if="selectedPaymentMethod === 'EPAY' && selectedEpayType">
                  ({{ getEpayTypeName(selectedEpayType) }})
                </span>
              </span>
            </div>
            <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                $t('user.recharge.totalAmount')
              }}</span>
              <span class="text-lg font-bold text-primary">¥{{ selectedPackage.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex space-x-3">
        <UButton
          @click="handleRecharge"
          :disabled="!selectedPackage || !selectedPaymentMethod || processing"
          :loading="processing"
          color="primary"
          class="flex-1 cursor-pointer"
        >
          {{ processing ? $t('payment.processing') : $t('user.recharge.confirmRecharge') }}
        </UButton>
        <UButton @click="closeModal" variant="outline" class="cursor-pointer">
          {{ $t('common.cancel') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { orderControllerCreateMembershipOrder, paymentControllerCreatePayment } from '~/api';
  import type { ConfigControllerGetPublicResponse } from '~/api';

  type SiteConfig = ConfigControllerGetPublicResponse['data'];

  interface Props {
    modelValue: boolean;
    userProfile?: any; // 添加userProfile prop
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'recharge-success': [orderId: number];
    'recharge-failed': [error: string];
  }>();

  const { t } = useI18n();
  const toast = useToast();
  const userStore = useUserStore();
  const siteConfig = inject<SiteConfig>('siteConfig');

  // 响应式数据
  const isOpen = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value)
  });

  const selectedPackage = ref<Package | null>(null);
  const selectedPaymentMethod = ref<'ALIPAY' | 'WECHAT' | 'BALANCE' | 'EPAY' | null>(null);
  const selectedEpayType = ref<'alipay' | 'wxpay' | 'usdt' | null>(null);
  const processing = ref(false);

  // 套餐选项
  interface Package {
    duration?: number;
    plan?: '1m' | '3m' | '6m' | '12m' | 'lifetime';
    price: number;
    description: string;
    save?: string;
    label?: string;
  }

  const packages = computed<Package[]>(() => {
    const p1 = Number(siteConfig?.membership_price_1m ?? siteConfig?.membership_price ?? 0) || 0;
    const p3 = Number(siteConfig?.membership_price_3m ?? 0) || (p1 > 0 ? p1 * 3 : 0);
    const p6 = Number(siteConfig?.membership_price_6m ?? 0) || (p1 > 0 ? p1 * 6 : 0);
    const p12 = Number(siteConfig?.membership_price_12m ?? 0) || (p1 > 0 ? p1 * 12 : 0);
    const plife = Number(siteConfig?.membership_price_lifetime ?? 0) || 0;

    const list: Package[] = [];
    if (p1 > 0)
      list.push({
        plan: '1m',
        duration: 1,
        price: p1,
        description: t('user.recharge.package1Description')
      });
    if (p3 > 0)
      list.push({
        plan: '3m',
        duration: 3,
        price: p3,
        description: t('user.recharge.package3Description')
      });
    if (p6 > 0)
      list.push({
        plan: '6m',
        duration: 6,
        price: p6,
        description: t('user.recharge.package6Description')
      });
    if (p12 > 0)
      list.push({
        plan: '12m',
        duration: 12,
        price: p12,
        description: t('user.recharge.package12Description')
      });
    if (plife > 0)
      list.push({
        plan: 'lifetime',
        price: plife,
        description: t('user.recharge.packageLifetimeDescription')
      });

    return list;
  });

  // 易支付类型选项
  const epayTypes = computed(() => {
    const types = [];

    if (siteConfig?.payment_epay_alipay_enabled) {
      types.push({
        value: 'alipay' as const,
        label: t('payment.epayAlipay'),
        icon: 'mynaui:brand-alipay'
      });
    }

    if (siteConfig?.payment_epay_wxpay_enabled) {
      types.push({
        value: 'wxpay' as const,
        label: t('payment.epayWechat'),
        icon: 'mynaui:brand-wechat'
      });
    }

    if (siteConfig?.payment_epay_usdt_enabled) {
      types.push({
        value: 'usdt' as const,
        label: t('payment.epayUsdt'),
        icon: 'mynaui:currency-dollar'
      });
    }

    return types;
  });

  // 选择套餐
  const selectPackage = (pkg: Package) => {
    selectedPackage.value = pkg;
  };

  // 选择支付方式
  const selectPaymentMethod = (method: 'ALIPAY' | 'WECHAT' | 'BALANCE' | 'EPAY') => {
    selectedPaymentMethod.value = method;

    // 如果选择易支付，默认选择第一个可用的易支付方式
    if (method === 'EPAY' && !selectedEpayType.value && epayTypes.value.length > 0) {
      selectedEpayType.value = epayTypes.value[0].value;
    }

    // 如果选择其他支付方式，清除易支付类型选择
    if (method !== 'EPAY') {
      selectedEpayType.value = null;
    }
  };

  // 选择易支付类型
  const selectEpayType = (type: 'alipay' | 'wxpay' | 'usdt') => {
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
      case 'usdt':
        return t('payment.epayUsdt');
      default:
        return '';
    }
  };

  // 格式化日期
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 关闭弹窗
  const closeModal = () => {
    isOpen.value = false;
    selectedPackage.value = null;
    selectedPaymentMethod.value = null;
    selectedEpayType.value = null;
  };

  // 处理充值
  const handleRecharge = async () => {
    if (!selectedPackage.value || !selectedPaymentMethod.value) {
      toast.add({
        title: t('user.recharge.selectPackageAndPayment'),
        color: 'error'
      });
      return;
    }

    // 检查余额支付
    if (selectedPaymentMethod.value === 'BALANCE') {
      if ((props.userProfile?.wallet || 0) < selectedPackage.value.price) {
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
      // 创建会员订单
      const response = await orderControllerCreateMembershipOrder({
        composable: '$fetch',
        body: {
          duration: selectedPackage.value.duration,
          plan: selectedPackage.value.plan,
          remark: `${t('user.recharge.membershipRecharge')} ${selectedPackage.value.plan === 'lifetime' ? t('user.recharge.lifetime') : `${selectedPackage.value.duration}${t('user.recharge.month')}`}`
        }
      });

      const order = response.data.data;

      // 构建支付请求参数
      const paymentData = {
        orderId: order.id,
        paymentMethod: selectedPaymentMethod.value
      } as any;

      // 如果是易支付，必须传入type参数
      if (selectedPaymentMethod.value === 'EPAY') {
        if (!selectedEpayType.value) {
          throw new Error(t('payment.selectEpayType'));
        }
        paymentData.type = selectedEpayType.value;
      }

      // 调用支付API
      const paymentResponse = await paymentControllerCreatePayment({
        composable: '$fetch',
        body: paymentData
      });

      if (paymentResponse.data.data.paymentUrl) {
        window.open(paymentResponse.data.data.paymentUrl, '_blank');
      }
    } catch (error: any) {
      console.error(t('payment.paymentFailed'), error);
      emit('recharge-failed', error?.message || t('payment.failed'));
    } finally {
      processing.value = false;
    }
  };

  // 监听弹窗关闭，重置状态
  watch(isOpen, newValue => {
    if (!newValue) {
      selectedPackage.value = null;
      selectedPaymentMethod.value = null;
      selectedEpayType.value = null;
    }
  });
</script>
