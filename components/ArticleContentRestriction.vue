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
    v-else-if="type === 'follow'"
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
</template>

<script lang="ts" setup>
  interface Props {
    type: 'login' | 'follow' | 'membership' | 'payment' | 'restricted';
    price?: string | number;
  }

  const props = withDefaults(defineProps<Props>(), {
    price: 0
  });
  const route = useRoute();

  const router = useRouter();
  const localePath = useLocalePath();
  const { t } = useI18n();

  // 简单状态管理
  const isFollowing = ref(false);
  const isFollowLoading = ref(false);
  const isPaid = ref(false);
  const isPaymentLoading = ref(false);

  // 处理登录
  const handleLogin = () => {
    router.push(localePath('/user/login?redirect=' + route.path));
  };

  // 处理关注
  const handleFollow = async () => {
    if (isFollowing.value || isFollowLoading.value) return;

    isFollowLoading.value = true;
    // TODO: 调用关注API
    await new Promise(resolve => setTimeout(resolve, 1000));
    isFollowing.value = true;
    isFollowLoading.value = false;
  };

  // 处理付费
  const handlePayment = async () => {
    if (isPaid.value || isPaymentLoading.value) return;

    isPaymentLoading.value = true;
    // TODO: 调用支付API
    await new Promise(resolve => setTimeout(resolve, 1500));
    isPaid.value = true;
    isPaymentLoading.value = false;
  };

  // 处理会员升级
  const handleMembership = () => {
    router.push(localePath('/user'));
  };
</script>
