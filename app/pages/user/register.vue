<template>
  <div class="m-auto max-w-lg w-full">
    <Title>{{ $t('register.title') }}</Title>
    <Meta name="description" :content="$t('register.description')" />
    <Meta name="keywords" :content="$t('register.keywords')" />
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8">
      <h1 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
        {{ $t('register.title') }}
      </h1>

      <!-- 注册功能已关闭提示 -->
      <div v-if="!siteConfig?.user_registration_enabled" class="text-center py-8">
        <Icon name="mynaui:lock" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ $t('register.registrationDisabled') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ $t('register.registrationDisabledDescription') }}
        </p>
        <NuxtLinkLocale
          to="/user/login"
          class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          {{ $t('register.backToLogin') }}
        </NuxtLinkLocale>
      </div>

      <!-- 注册表单 -->
      <UForm
        v-else
        :schema="schema"
        :state="registerForm"
        @submit="handleRegister"
        class="space-y-6"
      >
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
            @input="() => (registerForm.email = registerForm.email)"
          />
        </UFormField>

        <!-- 邮箱验证码 -->
        <UFormField
          v-if="siteConfig?.user_email_verification"
          name="verificationCode"
          required
          :label="$t('register.verificationCode')"
        >
          <div class="flex space-x-2">
            <UInput
              v-model="registerForm.verificationCode"
              type="text"
              size="xl"
              :placeholder="$t('register.verificationCodePlaceholder')"
              class="flex-1"
            />
            <UButton
              @click="sendVerificationCode"
              :disabled="!registerForm.email || countdown > 0"
              :loading="sendingCode"
              size="xl"
              variant="outline"
              class="whitespace-nowrap"
            >
              {{ countdown > 0 ? `${countdown}s` : $t('register.sendCode') }}
            </UButton>
          </div>
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

        <!-- 邀请码 -->
        <UFormField
          v-if="siteConfig?.invite_code_enabled"
          name="inviteCode"
          :required="siteConfig?.invite_code_required"
          :label="$t('register.inviteCode')"
        >
          <UInput
            v-model="registerForm.inviteCode"
            type="text"
            size="xl"
            :placeholder="
              siteConfig?.invite_code_required
                ? $t('register.inviteCodeRequiredPlaceholder')
                : $t('register.inviteCodePlaceholder')
            "
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
            :disabled="
              !agreeTerms ||
              (siteConfig?.user_email_verification && !registerForm.verificationCode) ||
              (siteConfig?.invite_code_required && !registerForm.inviteCode)
            "
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
          <UButton
            @click="handleLoginClick"
            variant="link"
            class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 cursor-pointer"
          >
            {{ $t('register.login') }}
          </UButton>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { userControllerRegisterUser, userControllerSendVerificationCode } from '~/api';
  import type { ConfigControllerGetPublicResponse } from '~/api';
  import { z } from 'zod';
  import { navigateToLogin } from '~/utils/auth';
  import { useUserStore } from '~/stores/user';
  const userStore = useUserStore();
  const localePath = useLocalePath();
  const { t } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const siteConfig: ConfigControllerGetPublicResponse['data'] = inject(
    'siteConfig'
  ) as ConfigControllerGetPublicResponse['data'];

  // 定义基础表单类型
  interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    verificationCode?: string;
    inviteCode?: string;
  }

  // 动态构建表单验证模式
  const buildSchema = () => {
    const baseSchema: any = {
      username: z.string().min(3, t('validation.usernameMin')).max(20, t('validation.usernameMax')),
      email: z.string().email(t('validation.emailInvalid')),
      password: z.string().min(6, t('validation.passwordMin')).max(50, t('validation.passwordMax')),
      confirmPassword: z.string()
    };

    // 根据配置添加验证码字段
    if (siteConfig?.user_email_verification) {
      baseSchema.verificationCode = z.string().min(1, t('validation.required'));
    }

    // 根据配置添加邀请码字段
    if (siteConfig?.invite_code_enabled) {
      if (siteConfig?.invite_code_required) {
        baseSchema.inviteCode = z.string().min(1, t('validation.required'));
      } else {
        baseSchema.inviteCode = z.string().optional();
      }
    }

    return z.object(baseSchema).refine(data => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword']
    });
  };

  const schema = buildSchema();

  const registerForm = ref<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    ...(siteConfig?.user_email_verification && { verificationCode: '' }),
    ...(siteConfig?.invite_code_enabled && { inviteCode: '' })
  });

  const agreeTerms = ref(false);
  const loading = ref(false);
  const sendingCode = ref(false);
  const countdown = ref(0);

  // 发送验证码
  const sendVerificationCode = async () => {
    if (!registerForm.value.email) {
      toast.add({
        title: t('register.enterEmailFirst'),
        color: 'error'
      });
      return;
    }

    try {
      sendingCode.value = true;

      // 调用发送验证码API
      const { data } = await userControllerSendVerificationCode({
        composable: '$fetch',
        body: {
          email: registerForm.value.email,
          type: 'verification'
        }
      });

      // 开始倒计时
      countdown.value = 60;
      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    } catch (error: any) {
      console.error('发送验证码失败:', error);
    } finally {
      sendingCode.value = false;
    }
  };

  const handleRegister = async () => {
    try {
      loading.value = true;

      // 构建注册请求体
      const registerBody: any = {
        username: registerForm.value.username,
        email: registerForm.value.email,
        password: registerForm.value.password
      };

      // 根据配置添加验证码
      if (siteConfig?.user_email_verification && registerForm.value.verificationCode) {
        registerBody.verificationCode = registerForm.value.verificationCode;
      }

      // 根据配置添加邀请码
      if (siteConfig?.invite_code_enabled && registerForm.value.inviteCode) {
        registerBody.inviteCode = registerForm.value.inviteCode;
      }

      // 调用注册API
      const { data } = await userControllerRegisterUser({
        composable: '$fetch',
        body: registerBody
      });

      if (data.token) {
        // 注册成功后直接登录并跳转到用户主页
        userStore.login(data.token, data.refreshToken, data as any);
        router.push(localePath('/user'));
      }
    } catch (error: any) {
    } finally {
      loading.value = false;
    }
  };

  // 处理登录点击
  const handleLoginClick = () => {
    navigateToLogin();
  };

  // 页面元数据
  useHead({
    title: () => t('register.title')
  });
</script>
