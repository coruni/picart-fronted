<template>
  <div class="max-w-md mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8">
      <h1 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
        {{ $t('login.title') }}
      </h1>

      <UForm :schema="schema" :state="loginForm" @submit="handleLogin" class="space-y-6">
        <UFormField name="username" required :label="$t('login.username')">
          <UInput
            v-model="loginForm.username"
            type="text"
            size="xl"
            :placeholder="$t('login.usernamePlaceholder')"
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
            <UButton variant="link" color="primary">
              {{ $t('login.forgotPassword') }}
            </UButton>
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
            class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
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
  import { userControllerLogin } from '~~/api';
  import { z } from 'zod';
  const localePath = useLocalePath();

  const { t } = useI18n();
  const router = useRouter();
  const userStore = useUserStore();
  const toast = useToast();

  // 定义表单验证模式
  const schema = z.object({
    username: z.string().min(1, t('validation.required')),
    password: z.string().min(1, t('validation.required'))
  });

  type Schema = z.infer<typeof schema>;

  const loginForm = ref<Schema>({
    username: '',
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

      // 保存token到用户store
      if (data?.token) {
        // 登录用户
        userStore.login(data.token, data.refreshToken, data as any);

        // 设置cookie以支持SSR环境下的token传递
        const authToken = useCookie('auth-token', {
          expires: rememberMe.value ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined, // 30天或会话cookie
          secure: true, // HTTPS only
          sameSite: 'lax', // 防止CSRF攻击
          httpOnly: false // 允许JavaScript访问
        });
        authToken.value = data.token;

        // 如果有refresh token，也设置到cookie
        if (data.refreshToken) {
          const refreshToken = useCookie('refresh-token', {
            expires: rememberMe.value ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined,
            secure: true,
            sameSite: 'lax',
            httpOnly: false
          });
          refreshToken.value = data.refreshToken;
        }

        // 如果选择了记住我，保存用户名
        if (rememberMe.value) {
          userStore.setRememberedUsername(loginForm.value.username);
        } else {
          userStore.clearRememberedUsername();
        }

        // 跳转到用户中心
        router.push(localePath('/user'));
      }
    } catch (error) {
      console.error('Login failed:', error);
      // 显示错误消息
      toast.add({
        title: t('login.loginFailed'),
        description: t('login.loginFailedDescription')
      });
    } finally {
      loading.value = false;
    }
  };

  // 页面加载时，如果之前选择了记住我，填充用户名
  onMounted(() => {
    if (userStore.hasRememberedUsername) {
      loginForm.value.username = userStore.rememberedUsername || '';
      rememberMe.value = true;
    }
  });
</script>
