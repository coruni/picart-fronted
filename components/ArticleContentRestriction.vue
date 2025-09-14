<template>
  <!-- 登录限制 -->
  <div
    v-if="type === 'login'"
    class="bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/10 rounded-xl p-6 text-center my-8 border border-blue-200/50 dark:border-blue-800/30"
  >
    <Icon name="mynaui:lock" class="text-3xl text-primary mb-3" />
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {{ $t('article.restrictions.loginRequired.title') }}
    </h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
      {{ $t('article.restrictions.loginRequired.description') }}
    </p>
    <UButton @click="handleLogin" class="cursor-pointer text-white px-6 py-2">
      {{ $t('article.restrictions.loginRequired.loginButton') }}
    </UButton>
  </div>

  <!-- 关注限制 -->
  <div
    v-else-if="type === 'follow' && !isAuthor"
    class="bg-gradient-to-br from-pink-50/50 to-pink-100/50 dark:from-pink-900/10 dark:to-pink-800/10 rounded-xl p-6 text-center my-8 border border-pink-200/50 dark:border-pink-800/30"
  >
    <Icon name="mynaui:heart" class="text-3xl text-pink-600 dark:text-pink-400 mb-3" />
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {{ $t('article.restrictions.followRequired.title') }}
    </h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
      {{ $t('article.restrictions.followRequired.description') }}
    </p>
    <UButton
      @click="handleFollow"
      :disabled="isFollowing || isFollowLoading"
      class="cursor-pointer bg-primary hover:bg-primary/80 text-white px-6 py-2"
    >
      {{
        isFollowLoading
          ? $t('common.loading.loading')
          : isFollowing
            ? $t('article.restrictions.followRequired.followingText')
            : $t('article.restrictions.followRequired.followButton')
      }}
    </UButton>
  </div>

  <!-- 会员限制 -->
  <div
    v-else-if="type === 'membership'"
    class="bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/10 rounded-xl p-6 text-center my-8 border border-purple-200/50 dark:border-purple-800/30"
  >
    <Icon name="mynaui:heart-waves" class="text-3xl text-purple-600 dark:text-purple-400 mb-3" />
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {{ $t('article.restrictions.membershipRequired.title') }}
    </h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
      {{ $t('article.restrictions.membershipRequired.description') }}
    </p>
    <UButton
      @click="handleMembership"
      class="cursor-pointer bg-primary hover:bg-primary/80 text-white px-6 py-2"
    >
      {{ $t('article.restrictions.membershipRequired.upgradeButton') }}
    </UButton>
  </div>

  <!-- 付费限制 -->
  <div
    v-else-if="type === 'payment'"
    class="bg-gradient-to-br from-amber-50/50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-800/10 rounded-xl p-6 text-center my-8 border border-amber-200/50 dark:border-amber-800/30"
  >
    <Icon name="mynaui:diamond" class="text-3xl text-amber-600 dark:text-amber-400 mb-3" />
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {{ $t('article.restrictions.paymentRequired.title') }}
    </h3>
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
      {{ $t('article.restrictions.paymentRequired.description') }}
    </p>
    <div class="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-4">¥{{ price }}</div>
    <UButton
      @click="handlePayment"
      :disabled="isPaid || isPaymentLoading"
      class="cursor-pointer bg-primary hover:bg-primary/80 text-white px-6 py-2"
    >
      {{
        isPaymentLoading
          ? $t('common.loading.loading')
          : isPaid
            ? $t('article.restrictions.paymentRequired.paidText')
            : $t('article.restrictions.paymentRequired.payButton')
      }}
    </UButton>
  </div>

  <!-- 内容受限 -->
  <div
    v-else-if="type === 'restricted'"
    class="bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl p-6 text-center my-8 border border-gray-200/50 dark:border-gray-600/50"
  >
    <Icon name="mynaui:shield-exclamation" class="text-3xl text-gray-500 dark:text-gray-400 mb-3" />
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {{ $t('article.restrictions.contentRestricted.title') }}
    </h3>
    <p class="text-sm text-gray-600 dark:text-gray-400">
      {{ $t('article.restrictions.contentRestricted.description') }}
    </p>
  </div>

  <!-- 支付弹窗 -->
  <PaymentModal
    v-model="showPaymentModal"
    :order-info="currentOrder"
    :user-wallet="userStore.currentUser?.wallet"
    @payment-success="onPaymentSuccess"
    @payment-failed="onPaymentFailed"
  />
</template>

<script lang="ts" setup>
  import { userControllerFollow, orderControllerCreateArticleOrder } from '~/api';
  import type { ConfigControllerGetPublicResponse } from '~/api';
  import { navigateToLogin } from '~/utils/auth';
  type SiteConfig = ConfigControllerGetPublicResponse['data'];
  interface Props {
    type: 'login' | 'follow' | 'membership' | 'payment' | 'restricted';
    price?: string | number;
    articleTitle?: string;
    authorId?: number;
    articleId?: number;
    refreshArticle?: () => void;
  }

  // 注入配置
  const siteConfig = inject<SiteConfig>('siteConfig');
  const userStore = useUserStore();

  const props = withDefaults(defineProps<Props>(), {
    price: 0
  });
  const route = useRoute();

  const router = useRouter();
  const localePath = useLocalePath();
  const { t } = useI18n();
  const toast = useToast();

  // 简单状态管理
  const isFollowing = ref(false);
  const isFollowLoading = ref(false);
  const isPaid = ref(false);
  const isPaymentLoading = ref(false);
  const showPaymentModal = ref(false);
  const currentOrder = ref<any>(null);

  // 计算属性
  const isAuthor = computed(() => {
    if (!userStore.isLoggedIn || !userStore.userInfo || !props.authorId) {
      return false;
    }
    return userStore.userInfo.id === props.authorId;
  });

  // 确保在客户端才执行交互逻辑
  const isClient = ref(false);
  onMounted(() => {
    isClient.value = true;
  });

  // 处理登录
  const handleLogin = () => {
    navigateToLogin();
  };

  // 处理关注
  const handleFollow = async () => {
    if (!isClient.value || isFollowing.value || isFollowLoading.value || isAuthor.value) return;

    isFollowLoading.value = true;
    try {
      // 使用传递的作者ID
      if (!props.authorId) {
        throw new Error('作者ID不存在');
      }

      await userControllerFollow({
        composable: '$fetch',
        path: {
          id: String(props.authorId)
        }
      });
      isFollowing.value = true;

      // 调用刷新文章回调
      if (props.refreshArticle) {
        props.refreshArticle();
      }
    } catch (error: any) {
      console.error('关注失败:', error);
    } finally {
      isFollowLoading.value = false;
    }
  };

  // 处理付费
  const handlePayment = async () => {
    if (!isClient.value || isPaid.value || isPaymentLoading.value) return;

    // 创建订单
    try {
      isPaymentLoading.value = true;

      // 调用创建文章订单API
      const orderResponse = await orderControllerCreateArticleOrder({
        composable: '$fetch',
        body: {
          articleId: props.articleId!,
          remark: `查看文章: ${props.articleTitle || '未知文章'}`
        }
      });

      const order = (orderResponse as any).data;

      // 显示支付弹窗
      showPaymentModal.value = true;
      currentOrder.value = {
        orderId: order.id,
        orderNo: order.orderNo,
        amount: order.amount,
        remark: order.remark
      };
    } catch (error: any) {
      console.error('创建订单失败:', error);
    } finally {
      isPaymentLoading.value = false;
    }
  };

  // 支付成功回调
  const onPaymentSuccess = (orderId: number) => {
    isPaid.value = true;
    showPaymentModal.value = false;
    currentOrder.value = null;

    // 调用刷新文章回调
    if (props.refreshArticle) {
      props.refreshArticle();
    }

    toast.add({
      title: t('payment.articlePaymentSuccess'),
      color: 'success'
    });
  };

  // 支付失败回调
  const onPaymentFailed = (error: string) => {
    showPaymentModal.value = false;
    currentOrder.value = null;

    toast.add({
      title: error,
      color: 'error'
    });
  };

  // 处理会员升级
  const handleMembership = () => {
    if (!isClient.value) return;
    router.push(localePath('/user'));
  };
</script>
