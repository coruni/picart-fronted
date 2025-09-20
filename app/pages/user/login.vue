<template>
  <div class="max-w-md mx-auto px-4 py-8">
    <Title>{{ $t('login.title') }}</Title>
    <Meta name="description" :content="$t('login.description')" />
    <Meta name="keywords" :content="$t('login.keywords')" />
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8">
      <h1 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
        {{ $t('login.title') }}
      </h1>

      <UForm :schema="schema" :state="loginForm" @submit="handleLogin" class="space-y-6">
        <UFormField name="account" required :label="$t('login.account')">
          <UInput
            v-model="loginForm.account"
            type="text"
            size="xl"
            :placeholder="$t('login.accountPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField name="password" required :label="$t('login.password')">
          <UInput
            v-model="loginForm.password"
            size="xl"
            type="password"
            :placeholder="$t('login.passwordPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <UCheckbox v-model="rememberMe" :label="$t('login.rememberMe')" />
          </div>

          <div class="text-sm">
            <NuxtLinkLocale to="/user/forgot-password">
              <UButton variant="link" color="primary" class="cursor-pointer">
                {{ $t('login.forgotPassword') }}
              </UButton>
            </NuxtLinkLocale>
          </div>
        </div>

        <div>
          <UButton
            type="submit"
            :loading="loading"
            class="w-full flex items-center justify-center cursor-pointer"
            size="xl"
          >
            <span v-if="!loading">{{ $t('login.login') }}</span>
            <span v-else>{{ $t('login.loggingIn') }}</span>
          </UButton>
        </div>
      </UForm>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('login.noAccount') }}
          <NuxtLinkLocale
            to="/user/register"
            class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {{ $t('login.register') }}
          </NuxtLinkLocale>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { userControllerLogin } from '~/api';
  import { z } from 'zod';
  import { isSafeRedirectPath } from '~/utils/auth';
  import { useUserStore } from '~/stores/user';
  const localePath = useLocalePath();
  const route = useRoute();

  const { t } = useI18n();
  const router = useRouter();
  const userStore = useUserStore();
  const toast = useToast();

  // 定义表单验证模式
  const schema = z.object({
    account: z.string().min(1, t('validation.required')),
    password: z.string().min(1, t('validation.required'))
  });

  type Schema = z.infer<typeof schema>;

  const loginForm = ref<Schema>({
    account: '',
    password: ''
  });

  const rememberMe = ref(false);
  const loading = ref(false);

  const handleLogin = async () => {
    try {
      loading.value = true;

      // 调用登录API
      const { data } = await userControllerLogin({
        composable: '$fetch',
        body: loginForm.value
      });

      // 保存token和用户信息
      if (data?.token) {
        // 使用统一的token设置函数
        const authToken = useCookie('auth-token', {
          default: () => '',
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          httpOnly: false
        });
        authToken.value = data.token;

        // 如果有refresh token，设置到cookie
        if (data.refreshToken) {
          const refreshToken = useCookie('refresh-token', {
            default: () => '',
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: false
          });
          refreshToken.value = data.refreshToken;
        }

        // 登录用户并保存用户信息到store
        userStore.login(data.token, data.refreshToken, data as any);

        // 处理"记住我"功能
        if (rememberMe.value) {
          userStore.setRememberedUsername(loginForm.value.account);
        } else {
          userStore.clearRememberedUsername();
        }

        // 跳转处理 - 安全检查重定向路径
        const redirectPath = route.query.redirect as string;
        if (redirectPath && isSafeRedirectPath(redirectPath)) {
          await router.push(localePath(redirectPath));
        } else {
          await router.push(localePath('/user'));
        }
      } else {
        throw new Error('No token received from server');
      }
    } catch (error: any) {
    } finally {
      loading.value = false;
    }
  };

  // 处理记住的用户名
  const loadRememberedUser = () => {
    if (userStore.hasRememberedUsername) {
      loginForm.value.account = userStore.rememberedUsername || '';
      rememberMe.value = true;
    }
  };

  // 页面加载时处理记住的用户信息
  onMounted(() => {
    loadRememberedUser();
  });

  // 监听记住我状态变化
  watch(rememberMe, newValue => {
    if (!newValue) {
      // 如果取消记住我，清除记住的用户名
      userStore.clearRememberedUsername();
    }
  });
</script>
