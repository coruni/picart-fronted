<template>
  <div class="max-w-md mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8">
      <h1 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
        {{ $t('register.title') }}
      </h1>

      <UForm :schema="schema" :state="registerForm" @submit="handleRegister" class="space-y-6">
        <UFormField name="username" required :label="$t('register.username')">
          <UInput
            v-model="registerForm.username"
            type="text"
            size="xl"
            :placeholder="$t('register.usernamePlaceholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField name="email" required :label="$t('register.email')">
          <UInput
            v-model="registerForm.email"
            type="email"
            size="xl"
            :placeholder="$t('register.emailPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField name="password" required :label="$t('register.password')">
          <UInput
            v-model="registerForm.password"
            size="xl"
            type="password"
            :placeholder="$t('register.passwordPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField name="confirmPassword" required :label="$t('register.confirmPassword')">
          <UInput
            v-model="registerForm.confirmPassword"
            size="xl"
            type="password"
            :placeholder="$t('register.confirmPasswordPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <div class="flex items-center">
          <UCheckbox v-model="agreeTerms" :label="$t('register.agreeTerms')" />
        </div>

        <div>
          <UButton
            type="submit"
            :loading="loading"
            :disabled="!agreeTerms"
            class="w-full flex items-center justify-center cursor-pointer"
            size="xl"
          >
            <span v-if="!loading">{{ $t('register.register') }}</span>
            <span v-else>{{ $t('register.registering') }}</span>
          </UButton>
        </div>
      </UForm>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('register.hasAccount') }}
          <NuxtLinkLocale
            to="/user/login"
            class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {{ $t('register.login') }}
          </NuxtLinkLocale>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { userControllerRegisterUser } from '~~/api';
  import { z } from 'zod';
  const userStore = useUserStore();
  const { t } = useI18n();
  const router = useRouter();

  // 定义表单验证模式
  const schema = z
    .object({
      username: z.string().min(3, t('validation.usernameMin')).max(20, t('validation.usernameMax')),
      email: z.string().email(t('validation.emailInvalid')),
      password: z.string().min(6, t('validation.passwordMin')).max(50, t('validation.passwordMax')),
      confirmPassword: z.string()
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword']
    });

  type Schema = z.infer<typeof schema>;

  const registerForm = ref<Schema>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const agreeTerms = ref(false);
  const loading = ref(false);

  const handleRegister = async () => {
    try {
      loading.value = true;

      // 调用注册API
      const { data } = await userControllerRegisterUser({
        composable: '$fetch',
        body: {
          username: registerForm.value.username,
          email: registerForm.value.email,
          password: registerForm.value.password
        }
      });

      if (data.token) {
        // 注册成功后直接登录并跳转到用户主页
        userStore.login(data.token, data.refreshToken, data);
        router.push('/user');
      }
    } catch (error: any) {
      console.error('Register failed:', error);

      // 显示错误消息
      const errorMessage = error?.data?.message || t('register.registerFailed');
      alert(errorMessage);
    } finally {
      loading.value = false;
    }
  };
</script>
