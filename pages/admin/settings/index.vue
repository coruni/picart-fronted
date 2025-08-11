<template>
  <div class="p-4 sm:p-6">
    <h1 class="text-2xl font-bold mb-6">{{ t('admin.settings.title') }}</h1>

    <UTabs :items="tabs" class="w-full" v-model="activeTab">
      <template #general="{ item }">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField :label="t('admin.settings.siteName')" name="site_name" class="w-full">
            <UInput v-model="config.site_name" class="w-full" />
          </UFormField>

          <UFormField :label="t('admin.settings.siteSubtitle')" name="site_subtitle" class="w-full">
            <UInput v-model="config.site_subtitle" class="w-full" />
          </UFormField>

          <UFormField :label="t('admin.settings.siteKeywords')" name="site_keywords" class="w-full">
            <UInput v-model="config.site_keywords" class="w-full" />
          </UFormField>

          <UFormField
            :label="t('admin.settings.siteDescription')"
            name="site_description"
            class="md:col-span-2"
          >
            <UTextarea v-model="config.site_description" class="w-full" />
          </UFormField>

          <UFormField :label="t('admin.settings.siteLogo')" name="site_logo" class="w-full">
            <div class="space-y-2">
              <UFileUpload
                v-model:modelValue="logoFile"
                accept="image/*"
                @update:modelValue="onLogoUpload"
                :loading="logoUploading"
                :ui="{ base: 'w-24 h-24', root: 'w-24 h-24' }"
              />
              <p class="text-sm text-gray-500">{{ t('admin.settings.siteLogoPlaceholder') }}</p>
            </div>
          </UFormField>

          <UFormField :label="t('admin.settings.siteFavicon')" name="site_favicon" class="w-full">
            <div class="space-y-2">
              <UFileUpload
                v-model:modelValue="faviconFile"
                accept="image/*"
                @update:modelValue="onFaviconUpload"
                :loading="faviconUploading"
                :ui="{ base: 'w-16 h-16', root: 'w-16 h-16' }"
              />
              <p class="text-sm text-gray-500">{{ t('admin.settings.siteFaviconPlaceholder') }}</p>
            </div>
          </UFormField>
        </div>
      </template>

      <template #user="{ item }">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField
            :label="t('admin.settings.userRegistrationEnabled')"
            name="user_registration_enabled"
            class="w-full"
          >
            <USwitch v-model="config.user_registration_enabled" />
          </UFormField>

          <UFormField
            :label="t('admin.settings.userEmailVerification')"
            name="user_email_verification"
            class="w-full"
          >
            <USwitch v-model="config.user_email_verification" />
          </UFormField>
        </div>
      </template>

      <template #content="{ item }">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField
            :label="t('admin.settings.commentApprovalRequired')"
            name="comment_approval_required"
            class="w-full"
          >
            <USwitch v-model="config.comment_approval_required" />
          </UFormField>

          <UFormField
            :label="t('admin.settings.articleApprovalRequired')"
            name="article_approval_required"
            class="w-full"
          >
            <USwitch v-model="config.article_approval_required" />
          </UFormField>
        </div>
      </template>

      <template #payment="{ item }">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField
            :label="t('admin.settings.paymentAlipayEnabled')"
            name="payment_alipay_enabled"
            class="w-full"
          >
            <USwitch v-model="config.payment_alipay_enabled" />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentWechatEnabled')"
            name="payment_wechat_enabled"
            class="w-full"
          >
            <USwitch v-model="config.payment_wechat_enabled" />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentEpayEnabled')"
            name="payment_epay_enabled"
            class="w-full"
          >
            <USwitch v-model="config.payment_epay_enabled" />
          </UFormField>

          <!-- 支付宝配置 -->
          <UFormField
            :label="t('admin.settings.paymentAlipayAppId')"
            name="payment_alipay_app_id"
            class="w-full"
          >
            <UInput
              v-model="config.payment_alipay_app_id"
              :disabled="!config.payment_alipay_enabled"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentAlipayPrivateKey')"
            name="payment_alipay_private_key"
            class="w-full"
          >
            <UTextarea
              v-model="config.payment_alipay_private_key"
              :disabled="!config.payment_alipay_enabled"
              class="w-full"
              rows="3"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentAlipayPublicKey')"
            name="payment_alipay_public_key"
            class="w-full"
          >
            <UTextarea
              v-model="config.payment_alipay_public_key"
              :disabled="!config.payment_alipay_enabled"
              class="w-full"
              rows="3"
            />
          </UFormField>

          <!-- 微信支付配置 -->
          <UFormField
            :label="t('admin.settings.paymentWechatAppId')"
            name="payment_wechat_app_id"
            class="w-full"
          >
            <UInput
              v-model="config.payment_wechat_app_id"
              :disabled="!config.payment_wechat_enabled"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentWechatApiKey')"
            name="payment_wechat_api_key"
            class="w-full"
          >
            <UInput
              v-model="config.payment_wechat_api_key"
              :disabled="!config.payment_wechat_enabled"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentWechatMchId')"
            name="payment_wechat_mch_id"
            class="w-full"
          >
            <UInput
              v-model="config.payment_wechat_mch_id"
              :disabled="!config.payment_wechat_enabled"
              class="w-full"
            />
          </UFormField>

          <!-- 易支付配置 -->
          <UFormField
            :label="t('admin.settings.paymentEpayPid')"
            name="payment_epay_pid"
            class="w-full"
          >
            <UInput
              v-model="config.payment_epay_pid"
              :disabled="!config.payment_epay_enabled"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentEpayKey')"
            name="payment_epay_key"
            class="w-full"
          >
            <UInput
              v-model="config.payment_epay_key"
              :disabled="!config.payment_epay_enabled"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentEpayNotifyUrl')"
            name="payment_epay_notify_url"
            class="w-full"
          >
            <UInput
              v-model="config.payment_epay_notify_url"
              :disabled="!config.payment_epay_enabled"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentEpayReturnUrl')"
            name="payment_epay_return_url"
            class="w-full"
          >
            <UInput
              v-model="config.payment_epay_return_url"
              :disabled="!config.payment_epay_enabled"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>

      <template #commission="{ item }">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField
            :label="t('admin.settings.commissionAuthorRate')"
            name="commission_author_rate"
            class="w-full"
          >
            <UInput
              v-model="config.commission_author_rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              class="w-full"
              @update:modelValue="value => (config.commission_author_rate = Number(value) || 0)"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.commissionPlatformRate')"
            name="commission_platform_rate"
            class="w-full"
          >
            <UInput
              v-model="config.commission_platform_rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              class="w-full"
              @update:modelValue="value => (config.commission_platform_rate = Number(value) || 0)"
            />
          </UFormField>
        </div>
      </template>

      <template #membership="{ item }">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField
            :label="t('admin.settings.membershipEnabled')"
            name="membership_enabled"
            class="w-full"
          >
            <USwitch v-model="config.membership_enabled" />
          </UFormField>

          <UFormField
            :label="t('admin.settings.membershipName')"
            name="membership_name"
            class="w-full"
          >
            <UInput
              v-model="config.membership_name"
              :disabled="!config.membership_enabled"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.membershipPrice')"
            name="membership_price"
            class="w-full"
          >
            <UInput
              v-model="config.membership_price"
              type="number"
              min="0"
              step="0.01"
              :disabled="!config.membership_enabled"
              class="w-full"
              @update:modelValue="value => (config.membership_price = Number(value) || 0)"
            />
          </UFormField>
        </div>
      </template>

      <template #maintenance="{ item }">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField
            :label="t('admin.settings.maintenanceMode')"
            name="maintenance_mode"
            class="w-full"
          >
            <USwitch v-model="config.maintenance_mode" />
          </UFormField>

          <div></div>

          <UFormField
            :label="t('admin.settings.maintenanceMessage')"
            name="maintenance_message"
            class="md:col-span-2"
          >
            <UTextarea
              v-model="config.maintenance_message"
              :disabled="!config.maintenance_mode"
              class="w-full"
            />
          </UFormField>
        </div>
      </template>

      <template #invite="{ item }">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField
            :label="t('admin.settings.inviteCodeEnabled')"
            name="invite_code_enabled"
            class="w-full"
          >
            <USwitch v-model="config.invite_code_enabled" />
          </UFormField>

          <UFormField
            :label="t('admin.settings.inviteCodeRequired')"
            name="invite_code_required"
            class="w-full"
          >
            <USwitch
              v-model="config.invite_code_required"
              :disabled="!config.invite_code_enabled"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.inviteDefaultCommissionRate')"
            name="invite_default_commission_rate"
            class="w-full"
          >
            <UInput
              v-model="config.invite_default_commission_rate"
              type="number"
              min="0"
              max="100"
              :disabled="!config.invite_code_enabled"
              class="w-full"
              @update:modelValue="
                value => (config.invite_default_commission_rate = Number(value) || 0)
              "
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.inviteCodeExpireDays')"
            name="invite_code_expire_days"
            class="w-full"
          >
            <UInput
              v-model="config.invite_code_expire_days"
              type="number"
              min="1"
              :disabled="!config.invite_code_enabled"
              class="w-full"
              @update:modelValue="value => (config.invite_code_expire_days = Number(value) || 7)"
            />
          </UFormField>
        </div>
      </template>
    </UTabs>

    <div class="mt-8 flex justify-end">
      <UButton @click="saveConfig" :loading="saving">
        {{ t('common.save') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { TabsItem } from '@nuxt/ui';
  import {
    configControllerFindAll,
    configControllerUpdateAll,
    uploadControllerUploadFile
  } from '~~/api';
  import { ref, watch } from 'vue';

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  const { t } = useI18n();
  const toast = useToast();

  // 活动标签
  const activeTab = ref('0');

  // 扩展File接口，添加自定义属性
  interface ExtendedFile extends File {
    _url?: string;
    _uploaded?: boolean;
    _uploading?: boolean;
    _id?: string;
  }

  // 文件上传状态
  const logoFile = ref<ExtendedFile | null>(null);
  const faviconFile = ref<ExtendedFile | null>(null);
  const logoUploading = ref(false);
  const faviconUploading = ref(false);

  // 标签页配置
  const tabs = ref<TabsItem[]>([
    { label: t('admin.settings.tabs.general'), slot: 'general', icon: 'i-mynaui-cog' },
    { label: t('admin.settings.tabs.user'), slot: 'user', icon: 'i-mynaui-users' },
    { label: t('admin.settings.tabs.content'), slot: 'content', icon: 'i-mynaui-document' },
    { label: t('admin.settings.tabs.payment'), slot: 'payment', icon: 'i-mynaui-credit-card' },
    { label: t('admin.settings.tabs.commission'), slot: 'commission', icon: 'i-mynaui-percentage' },
    { label: t('admin.settings.tabs.membership'), slot: 'membership', icon: 'i-mynaui-crown' },
    {
      label: t('admin.settings.tabs.maintenance'),
      slot: 'maintenance',
      icon: 'i-mynaui-wrench'
    },
    { label: t('admin.settings.tabs.invite'), slot: 'invite', icon: 'i-mynaui-gift' }
  ]);

  // 配置数据
  const config = ref<Record<string, any>>({
    site_name: '',
    site_subtitle: '',
    site_description: '',
    site_keywords: '',
    site_logo: '',
    site_favicon: '',
    user_registration_enabled: true,
    user_email_verification: true,
    comment_approval_required: true,
    article_approval_required: true,
    payment_alipay_enabled: true,
    payment_wechat_enabled: true,
    payment_epay_enabled: true,
    membership_enabled: true,
    membership_name: '',
    membership_price: 0,
    maintenance_mode: true,
    maintenance_message: '',
    invite_code_required: true,
    invite_code_enabled: true,
    invite_default_commission_rate: 0,
    invite_code_expire_days: 7,
    // 新增配置项
    commission_author_rate: 0,
    commission_platform_rate: 0,
    payment_alipay_app_id: '',
    payment_alipay_private_key: '',
    payment_alipay_public_key: '',
    payment_wechat_app_id: '',
    payment_wechat_api_key: '',
    payment_wechat_mch_id: '',
    payment_epay_pid: '',
    payment_epay_key: '',
    payment_epay_notify_url: '',
    payment_epay_return_url: ''
  });

  // 将URL转换为File对象
  const createVirtualFile = async (url: string, index: number = 0): Promise<ExtendedFile> => {
    try {
      // 从URL获取图片数据
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      // 将响应转换为Blob
      const blob = await response.blob();

      // 从URL获取文件名
      const fileName = url.split('/').pop() || `image-${index + 1}.${blob.type.split('/')[1]}`;

      // 从Blob创建File对象
      const file = new File([blob], fileName, { type: blob.type }) as ExtendedFile;
      file._url = url;
      file._uploaded = true;
      file._id = `existing_${index}_${Date.now()}`;

      return file;
    } catch (error) {
      console.error('Error converting URL to File:', error);
      // 创建一个默认的虚拟文件作为备选
      const fileName = url.split('/').pop() || `image-${index + 1}.jpg`;
      const file = new File([''], fileName, { type: 'image/jpeg' }) as ExtendedFile;
      file._url = url;
      file._uploaded = true;
      file._id = `existing_${index}_${Date.now()}`;
      return file;
    }
  };

  // 获取配置
  const { data: configData } = await configControllerFindAll({
    composable: 'useFetch'
  });

  // 初始化配置数据和文件
  const initializeConfig = async () => {
    if (configData.value?.data.data) {
      configData.value.data.data.forEach(item => {
        // 根据配置项的类型进行转换
        if (item.type === 'number') {
          config.value[item.key] = Number(item.value) || 0;
        } else if (item.type === 'boolean') {
          config.value[item.key] = item.value === 'true';
        } else {
          config.value[item.key] = item.value;
        }
      });

      // 初始化logo文件
      if (config.value.site_logo) {
        logoFile.value = await createVirtualFile(config.value.site_logo, 0);
      }

      // 初始化favicon文件
      if (config.value.site_favicon) {
        faviconFile.value = await createVirtualFile(config.value.site_favicon, 1);
      }
    }
  };

  await initializeConfig();

  // Logo上传处理
  const onLogoUpload = async (files: unknown) => {
    if (!files || (Array.isArray(files) && files.length === 0)) return;

    let newFile: ExtendedFile | null = null;

    if (Array.isArray(files) && files[0] instanceof File) {
      newFile = files[0] as ExtendedFile;
      if (newFile._uploaded || newFile._uploading) {
        return;
      }
    } else if (files instanceof File) {
      newFile = files as ExtendedFile;
      if (newFile._uploaded || newFile._uploading) {
        return;
      }
    }

    if (!newFile) return;

    newFile._uploading = true;
    logoFile.value = newFile;
    logoUploading.value = true;

    try {
      const formData = new FormData();
      formData.append('files', newFile);

      const res = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {},
        bodySerializer: () => formData
      });

      if (res.data && res.data[0]) {
        newFile._url = res.data[0].url!;
        newFile._uploaded = true;
        newFile._uploading = false;
        newFile._id = `uploaded_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

        config.value.site_logo = newFile._url;
        logoFile.value = newFile;

        toast.add({
          title: t('common.message.uploadSuccess'),
          color: 'primary'
        });
      } else {
        newFile._uploading = false;
        logoFile.value = null;

        toast.add({
          title: t('common.message.uploadFailed'),
          color: 'error'
        });
      }
    } catch (error: any) {
      console.error('Failed to upload logo:', error);
      logoFile.value = null;

      toast.add({
        title: error?.message || t('common.message.uploadFailed'),
        color: 'error'
      });
    } finally {
      logoUploading.value = false;
    }
  };

  // Favicon上传处理
  const onFaviconUpload = async (files: unknown) => {
    if (!files || (Array.isArray(files) && files.length === 0)) return;

    let newFile: ExtendedFile | null = null;

    if (Array.isArray(files) && files[0] instanceof File) {
      newFile = files[0] as ExtendedFile;
      if (newFile._uploaded || newFile._uploading) {
        return;
      }
    } else if (files instanceof File) {
      newFile = files as ExtendedFile;
      if (newFile._uploaded || newFile._uploading) {
        return;
      }
    }

    if (!newFile) return;

    newFile._uploading = true;
    faviconFile.value = newFile;
    faviconUploading.value = true;

    try {
      const formData = new FormData();
      formData.append('files', newFile);

      const res = await uploadControllerUploadFile({
        composable: '$fetch',
        body: {},
        bodySerializer: () => formData
      });

      if (res.data && res.data[0]) {
        newFile._url = res.data[0].url!;
        newFile._uploaded = true;
        newFile._uploading = false;
        newFile._id = `uploaded_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

        config.value.site_favicon = newFile._url;
        faviconFile.value = newFile;

        toast.add({
          title: t('common.message.uploadSuccess'),
          color: 'primary'
        });
      } else {
        newFile._uploading = false;
        faviconFile.value = null;

        toast.add({
          title: t('common.message.uploadFailed'),
          color: 'error'
        });
      }
    } catch (error: any) {
      console.error('Failed to upload favicon:', error);
      faviconFile.value = null;

      toast.add({
        title: error?.message || t('common.message.uploadFailed'),
        color: 'error'
      });
    } finally {
      faviconUploading.value = false;
    }
  };

  // 监听文件变化，同步更新配置
  watch(
    () => logoFile.value?._url,
    newUrl => {
      if (newUrl && logoFile.value?._uploaded) {
        config.value.site_logo = newUrl;
      }
    }
  );

  watch(
    () => faviconFile.value?._url,
    newUrl => {
      if (newUrl && faviconFile.value?._uploaded) {
        config.value.site_favicon = newUrl;
      }
    }
  );

  // 保存状态
  const saving = ref(false);

  // 保存配置
  const saveConfig = async () => {
    try {
      saving.value = true;
      // 构建提交体 根据config的key去找原数据里的对应项并更新value值
      const submitData = configData.value?.data.data.map(item => {
        if (config.value.hasOwnProperty(item.key)) {
          return {
            ...item,
            value: String(config.value[item.key])
          };
        }
        return item;
      });

      // 调用API保存配置
      await configControllerUpdateAll({
        composable: '$fetch',
        body: submitData as any
      });

      toast.add({
        title: t('admin.settings.saveSuccess'),
        color: 'success'
      });
    } catch (error) {
      toast.add({
        title: t('admin.settings.saveFailed'),
        color: 'error'
      });
    } finally {
      saving.value = false;
    }
  };
</script>
