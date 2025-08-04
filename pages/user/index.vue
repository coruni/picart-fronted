<template>
  <div>
    <ClientOnly>
      <div class="max-w-7xl mx-auto px-4 py-4 md:py-8">
    <div class="flex flex-col lg:flex-row gap-4 md:gap-8">
      <!-- 左侧主内容区 -->
      <div class="flex-1">
        <!-- 用户信息区 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div
            class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6"
          >
            <div class="relative">
              <NuxtImg
                :src="userInfo?.avatar || 'https://via.placeholder.com/120'"
                alt="用户头像"
                class="w-24 h-24 md:w-32 md:h-32 rounded-full ring-2 ring-white"
                loading="lazy"
                format="webp"
                sizes="96px md:128px"
                @error="handleImageError($event as Event, 'avatar')"
              />
              <div
                class="absolute bottom-2 right-2 w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer"
              >
                <Icon name="mynaui:camera" class="text-white text-xs md:text-sm" />
              </div>
            </div>
            <div class="flex-1">
              <h1 class="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {{ userInfo?.nickname || userInfo?.username }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ userInfo?.description || $t('user.noDescription') }}
              </p>
              <div class="flex flex-wrap items-center gap-4 mt-3">
                <div class="text-center">
                  <div class="font-semibold text-gray-900 dark:text-white">
                    {{ userInfo?.articleCount || 0 }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ $t('user.articles') }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="font-semibold text-gray-900 dark:text-white">
                    {{ userInfo?.followerCount || 0 }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ $t('user.followers') }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="font-semibold text-gray-900 dark:text-white">
                    {{ userInfo?.followingCount || 0 }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ $t('user.following') }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="font-semibold text-gray-900 dark:text-white">
                    {{ userInfo?.wallet || 0 }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ $t('user.wallet') }}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex space-x-2">
              <UButton
                class="px-3 py-1.5 cursor-pointer md:px-4 md:py-2 bg-primary text-white text-sm md:text-base rounded-lg hover:bg-indigo-600 transition-colors !rounded-button whitespace-nowrap"
              >
                {{ $t('user.editProfile') }}
              </UButton>
              <UButton
                @click="handleLogout"
                class="px-3 py-1.5 cursor-pointer md:px-4 md:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm md:text-base rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors !rounded-button whitespace-nowrap"
              >
                {{ $t('user.logout') }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- 用户文章 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <div class="flex items-center justify-between mb-4 md:mb-6">
            <h2 class="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              {{ $t('user.myArticles') }}
            </h2>
            <NuxtLinkLocale
              to="/article/create"
              class="text-indigo-500 hover:text-indigo-600 text-sm md:text-base"
            >
              {{ $t('user.createArticle') }}
            </NuxtLinkLocale>
          </div>

          <div
            v-if="displayArticles.length > 0"
            class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            <template v-for="article in displayArticles" :key="article.id">
              <CommonArticleCard :data="article" class="!rounded-xl" />
            </template>
          </div>
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            {{ $t('user.noArticles') }}
          </div>
          <!-- 加载更多按钮 -->
          <div
            v-if="hasMore && displayArticles.length > 0"
            class="col-span-2 sm:col-span-2 lg:col-span-3 flex justify-center py-4"
          >
            <UButton
              @click="loadUserArticles"
              :disabled="loading"
              class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 !rounded-button"
            >
              <div
                v-if="loading"
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
              ></div>
              {{ loading ? $t('common.loading') : $t('common.loadMore') }}
            </UButton>
          </div>

          <!-- 没有更多数据提示 -->
          <div
            v-else-if="!hasMore && displayArticles.length > 0"
            class="col-span-2 sm:col-span-2 lg:col-span-3 text-center py-4 text-gray-500"
          >
            {{ $t('common.loading.noMore') }}
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="w-full lg:w-80 flex-shrink-0 mt-6 lg:mt-0">
        <!-- 会员等级 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
          <h3 class="font-bold text-gray-900 dark:text-white mb-3 md:mb-4 text-sm md:text-base">
            {{ $t('user.membershipLevel') }}
          </h3>
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-700 dark:text-gray-300">{{
              userInfo?.membershipLevelName || $t('user.basicMember')
            }}</span>
            <span class="text-sm font-medium text-indigo-500"
              >Lv.{{ userInfo?.membershipLevel || 0 }}</span
            >
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-primary h-2 rounded-full"
              :style="{ width: `${(userInfo?.experience || 0) % 100}%` }"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>{{ userInfo?.experience || 0 }} {{ $t('user.experience') }}</span>
            <span>{{ userInfo?.score || 0 }} {{ $t('user.score') }}</span>
          </div>
        </div>

        <!-- 邀请奖励 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
          <h3 class="font-bold text-gray-900 dark:text-white mb-3 md:mb-4 text-sm md:text-base">
            {{ $t('user.inviteRewards') }}
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">{{
                $t('user.inviteCode')
              }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                userInfo?.inviteCode || $t('user.noInviteCode')
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">{{
                $t('user.inviteCount')
              }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                userInfo?.inviteCount || 0
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">{{
                $t('user.inviteEarnings')
              }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                userInfo?.inviteEarnings || 0
              }}</span>
            </div>
          </div>
          <UButton
            class="w-full mt-4 py-2 px-4 bg-primary text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors !rounded-button"
          >
            {{ $t('user.copyInviteLink') }}
          </UButton>
        </div>
      </div>
    </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
  import { userControllerGetProfile, articleControllerFindArticleByAuthor } from '~~/api';

  const { t } = useI18n();
  const router = useRouter();
  const userStore = useUserStore();
  const userInfo = computed(() => userStore.userInfo);

  const pagination = ref({
    page: 1,
    limit: 6
  });
  const loading = ref(false);
  const hasMore = ref(true);
  const allArticles = ref<any[]>([]);

  // 用户资料
  const { data: userProfile } = userControllerGetProfile({
    composable: 'useFetch',
    key: 'user-profile'
  });
  // 处理用户资料
  if (userProfile.value?.data) {
    userStore.userInfo = userProfile.value?.data;
  }

  // 重置数据
  const resetData = () => {
    pagination.value.page = 1;
    allArticles.value = [];
    hasMore.value = true;
  };

  // 加载用户文章
  const loadUserArticles = async () => {
    // 添加额外的检查，确保不会重复触发
    if (loading.value || !hasMore.value) return;

    loading.value = true;
    try {
      const response = await articleControllerFindArticleByAuthor({
        composable: 'useFetch',
        key: `user-articles-${userProfile.value?.data?.id?.toString() || userInfo.value?.id?.toString()}-${pagination.value.page}`,
        path: {
          id: userProfile.value?.data?.id?.toString() || userInfo.value?.id?.toString()!
        },
        query: {
          page: pagination.value.page,
          limit: pagination.value.limit
        }
      });

      const newData = response.data.value?.data?.data || [];

      if (pagination.value.page === 1) {
        allArticles.value = newData;
      } else {
        allArticles.value = [...allArticles.value, ...newData];
      }

      // 检查是否还有更多数据
      hasMore.value = newData.length === pagination.value.limit;

      // 更新页码
      if (hasMore.value) {
        pagination.value.page++;
      }
    } catch (error) {
      console.error('加载用户文章失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 计算显示的文章
  const displayArticles = computed(() => {
    return allArticles.value;
  });

  loadUserArticles();

  // 图片错误处理
  const { handleImageError } = useImageError();

  onMounted(() => {
    // 移除 Intersection Observer，改为手动加载
  });

  // 页面元数据
  useHead({
    title: () => t('user.title'),
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow'
      }
    ]
  });

  // 处理登出
  const handleLogout = () => {
    // 清除认证信息
    userStore.logout();
    // 跳转到首页
    router.push('/');
  };
</script>
