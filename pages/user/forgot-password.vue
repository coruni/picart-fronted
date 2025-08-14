<template>
  <div class="max-w-md mx-auto px-4 py-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8">
      <h1 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
        {{ $t('forgotPassword.title') }}
      </h1>

      <UForm :schema="schema" :state="forgotForm" @submit="handleForgotPassword" class="space-y-6">
        <UFormField name="email" required :label="$t('forgotPassword.email')">
          <UInput
            v-model="forgotForm.email"
            type="email"
            size="xl"
            :placeholder="$t('forgotPassword.emailPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField name="verificationCode" required :label="$t('forgotPassword.verificationCode')">
          <div class="flex space-x-2">
            <UInput
              v-model="forgotForm.verificationCode"
              type="text"
              size="xl"
              :placeholder="$t('forgotPassword.verificationCodePlaceholder')"
              class="flex-1"
            />
            <UButton
              @click="sendVerificationCode"
              :disabled="!forgotForm.email || countdown > 0"
              :loading="sendingCode"
              size="xl"
              variant="outline"
              class="whitespace-nowrap"
            >
              {{ countdown > 0 ? `${countdown}s` : $t('forgotPassword.sendCode') }}
            </UButton>
          </div>
        </UFormField>

        <UFormField name="newPassword" required :label="$t('forgotPassword.newPassword')">
          <UInput
            v-model="forgotForm.newPassword"
            size="xl"
            type="password"
            :placeholder="$t('forgotPassword.newPasswordPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <UFormField name="confirmPassword" required :label="$t('forgotPassword.confirmPassword')">
          <UInput
            v-model="forgotForm.confirmPassword"
            size="xl"
            type="password"
            :placeholder="$t('forgotPassword.confirmPasswordPlaceholder')"
            class="w-full"
          />
        </UFormField>

        <div>
          <UButton
            type="submit"
            :loading="loading"
            class="w-full flex items-center justify-center cursor-pointer"
            size="xl"
          >
            <span v-if="!loading">{{ $t('forgotPassword.resetPassword') }}</span>
            <span v-else>{{ $t('forgotPassword.resetting') }}</span>
          </UButton>
        </div>
      </UForm>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t('forgotPassword.rememberPassword') }}
          <NuxtLinkLocale
            to="/user/login"
            class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {{ $t('forgotPassword.backToLogin') }}
          </NuxtLinkLocale>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { userControllerPasswordReset, userControllerSendVerificationCode } from '~~/api';
  import { z } from 'zod';

  const { t } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const localePath = useLocalePath();

  // 定义表单验证模式
  const schema = z
    .object({
      email: z.string().email(t('validation.emailInvalid')),
      verificationCode: z.string().min(1, t('validation.required')),
      newPassword: z
        .string()
        .min(6, t('validation.passwordMin'))
        .max(50, t('validation.passwordMax')),
      confirmPassword: z.string().min(1, t('validation.required'))
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword']
    });

  type Schema = z.infer<typeof schema>;

  const forgotForm = ref<Schema>({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const loading = ref(false);
  const sendingCode = ref(false);
  const countdown = ref(0);

  // 发送验证码
  const sendVerificationCode = async () => {
    if (!forgotForm.value.email) {
      toast.add({
        title: t('forgotPassword.enterEmailFirst'),
        color: 'error'
      });
      return;
    }

    try {
      sendingCode.value = true;

      // 调用发送验证码API
      await userControllerSendVerificationCode({
        composable: '$fetch',
        body: {
          email: forgotForm.value.email,
          type: 'reset_password'
        }
      });

      toast.add({
        title: t('forgotPassword.codeSent'),
        color: 'success'
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

  // 处理密码重置
  const handleForgotPassword = async () => {
    try {
      loading.value = true;

      await userControllerPasswordReset({
        composable: '$fetch',
        body: {
          email: forgotForm.value.email,
          code: forgotForm.value.verificationCode,
          newPassword: forgotForm.value.newPassword
        }
      });

      toast.add({
        title: t('forgotPassword.resetSuccess'),
        color: 'success'
      });

      // 跳转到登录页
      router.push(localePath('/user/login'));
    } catch (error: any) {
      console.error('密码重置失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 页面元数据
  useHead({
    title: () => t('forgotPassword.title')
  });
</script>
