<template>
  <div class="p-4 sm:p-6">
    <Title>{{ $t('admin.settings.title') }}</Title>
    <h1 class="text-2xl font-bold mb-6">{{ t('admin.settings.title') }}</h1>

    <UTabs :items="tabs" class="w-full" v-model="activeTab" :ui="{ trigger: 'cursor-pointer' }">
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
            <ImageUpload
              v-model="config.site_logo"
              :existing-image-url="existingLogoUrl"
              accept="image/*"
              :max-size="2 * 1024 * 1024"
              :help-text="t('admin.settings.siteLogoPlaceholder')"
              aspect-ratio="1/1"
            />
          </UFormField>

          <UFormField :label="t('admin.settings.siteFavicon')" name="site_favicon" class="w-full">
            <ImageUpload
              v-model="config.site_favicon"
              :existing-image-url="existingFaviconUrl"
              accept="image/*"
              :max-size="1 * 1024 * 1024"
              :help-text="t('admin.settings.siteFaviconPlaceholder')"
              aspect-ratio="1/1"
            />
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

          <!-- 易支付具体支付方式开关 -->
          <UFormField
            :label="t('admin.settings.paymentEpayAlipayEnabled')"
            name="payment_epay_alipay_enabled"
            class="w-full"
          >
            <USwitch
              v-model="config.payment_epay_alipay_enabled"
              :disabled="!config.payment_epay_enabled"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentEpayWxpayEnabled')"
            name="payment_epay_wxpay_enabled"
            class="w-full"
          >
            <USwitch
              v-model="config.payment_epay_wxpay_enabled"
              :disabled="!config.payment_epay_enabled"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentEpayUsdtEnabled')"
            name="payment_epay_usdt_enabled"
            class="w-full"
          >
            <USwitch
              v-model="config.payment_epay_usdt_enabled"
              :disabled="!config.payment_epay_enabled"
            />
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
            :label="t('admin.settings.paymentAlipayGateway')"
            name="payment_alipay_gateway"
            class="w-full"
          >
            <UInput
              v-model="config.payment_alipay_gateway"
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

          <UFormField
            :label="t('admin.settings.paymentWechatPrivateKey')"
            name="payment_wechat_private_key"
            class="w-full"
          >
            <UTextarea
              v-model="config.payment_wechat_private_key"
              :disabled="!config.payment_wechat_enabled"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentWechatPublicKey')"
            name="payment_wechat_public_key"
            class="w-full"
          >
            <UTextarea
              v-model="config.payment_wechat_public_key"
              :disabled="!config.payment_wechat_enabled"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentWechatSerialNo')"
            name="payment_wechat_serial_no"
            class="w-full"
          >
            <UInput
              v-model="config.payment_wechat_serial_no"
              :disabled="!config.payment_wechat_enabled"
              class="w-full"
            />
          </UFormField>

          <!-- 易支付配置 -->
          <UFormField
            :label="t('admin.settings.paymentEpayAppId')"
            name="payment_epay_app_id"
            class="w-full"
          >
            <UInput
              v-model="config.payment_epay_app_id"
              :disabled="!config.payment_epay_enabled"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentEpayAppKey')"
            name="payment_epay_app_key"
            class="w-full"
          >
            <UInput
              v-model="config.payment_epay_app_key"
              :disabled="!config.payment_epay_enabled"
              class="w-full"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentEpayGateway')"
            name="payment_epay_gateway"
            class="w-full"
          >
            <UInput
              v-model="config.payment_epay_gateway"
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

          <!-- 通用支付配置 -->
          <UFormField
            :label="t('admin.settings.paymentNotifyUrl')"
            name="payment_notify_url"
            class="w-full"
          >
            <UInput v-model="config.payment_notify_url" class="w-full" />
          </UFormField>

          <UFormField
            :label="t('admin.settings.paymentReturnUrl')"
            name="payment_return_url"
            class="w-full"
          >
            <UInput v-model="config.payment_return_url" class="w-full" />
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
            :label="t('admin.settings.membershipPrice1m')"
            name="membership_price_1m"
            class="w-full"
          >
            <UInput
              v-model="config.membership_price_1m"
              type="number"
              min="0"
              step="0.01"
              :disabled="!config.membership_enabled"
              class="w-full"
              @update:modelValue="value => (config.membership_price_1m = Number(value) || 0)"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.membershipPrice3m')"
            name="membership_price_3m"
            class="w-full"
          >
            <UInput
              v-model="config.membership_price_3m"
              type="number"
              min="0"
              step="0.01"
              :disabled="!config.membership_enabled"
              class="w-full"
              @update:modelValue="value => (config.membership_price_3m = Number(value) || 0)"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.membershipPrice6m')"
            name="membership_price_6m"
            class="w-full"
          >
            <UInput
              v-model="config.membership_price_6m"
              type="number"
              min="0"
              step="0.01"
              :disabled="!config.membership_enabled"
              class="w-full"
              @update:modelValue="value => (config.membership_price_6m = Number(value) || 0)"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.membershipPrice12m')"
            name="membership_price_12m"
            class="w-full"
          >
            <UInput
              v-model="config.membership_price_12m"
              type="number"
              min="0"
              step="0.01"
              :disabled="!config.membership_enabled"
              class="w-full"
              @update:modelValue="value => (config.membership_price_12m = Number(value) || 0)"
            />
          </UFormField>

          <UFormField
            :label="t('admin.settings.membershipPriceLifetime')"
            name="membership_price_lifetime"
            class="w-full"
          >
            <UInput
              v-model="config.membership_price_lifetime"
              type="number"
              min="0"
              step="0.01"
              :disabled="!config.membership_enabled"
              class="w-full"
              @update:modelValue="value => (config.membership_price_lifetime = Number(value) || 0)"
            />
          </UFormField>
        </div>
      </template>

      <template #advertisement="{ item }">
        <div class="space-y-8">
          <!-- 首页广告 -->
          <UCard>
            <h3 class="text-lg font-semibold mb-4">{{ t('admin.settings.adHomepage') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField
                :label="t('admin.settings.adHomepageEnabled')"
                name="ad_homepage_enabled"
                class="w-full"
              >
                <USwitch v-model="config.ad_homepage_enabled" />
              </UFormField>

              <UFormField
                :label="t('admin.settings.adHomepagePosition')"
                name="ad_homepage_position"
                class="w-full"
              >
                <USelect
                  v-model="config.ad_homepage_position"
                  :disabled="!config.ad_homepage_enabled"
                  class="w-full"
                  :items="[
                    { label: t('admin.settings.adPositionTop'), value: 'top' },
                    { label: t('admin.settings.adPositionBottom'), value: 'bottom' },
                    { label: t('admin.settings.adPositionSidebar'), value: 'sidebar' }
                  ]"
                  option-attribute="label"
                  value-attribute="value"
                />
              </UFormField>

              <UFormField
                :label="t('admin.settings.adHomepageContent')"
                name="ad_homepage_content"
                class="md:col-span-2"
              >
                <UTextarea
                  v-model="config.ad_homepage_content"
                  :disabled="!config.ad_homepage_enabled"
                  class="w-full"
                  :placeholder="t('admin.settings.adContentPlaceholder')"
                  :rows="4"
                />
              </UFormField>
            </div>

            <!-- 广告预览 -->
            <AdvertisementPreview
              type="homepage"
              :content="config.ad_homepage_content"
              :enabled="config.ad_homepage_enabled"
              :position="config.ad_homepage_position"
            />
          </UCard>

          <!-- 文章顶部广告 -->
          <UCard>
            <h3 class="text-lg font-semibold mb-4">{{ t('admin.settings.adArticleTop') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField
                :label="t('admin.settings.adArticleTopEnabled')"
                name="ad_article_top_enabled"
                class="w-full"
              >
                <USwitch v-model="config.ad_article_top_enabled" />
              </UFormField>

              <div></div>

              <UFormField
                :label="t('admin.settings.adArticleTopContent')"
                name="ad_article_top_content"
                class="md:col-span-2"
              >
                <UTextarea
                  v-model="config.ad_article_top_content"
                  :disabled="!config.ad_article_top_enabled"
                  class="w-full"
                  :placeholder="t('admin.settings.adContentPlaceholder')"
                  :rows="4"
                />
              </UFormField>
            </div>

            <!-- 广告预览 -->
            <AdvertisementPreview
              type="article-top"
              :content="config.ad_article_top_content"
              :enabled="config.ad_article_top_enabled"
            />
          </UCard>

          <!-- 文章底部广告 -->
          <UCard>
            <h3 class="text-lg font-semibold mb-4">{{ t('admin.settings.adArticleBottom') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField
                :label="t('admin.settings.adArticleBottomEnabled')"
                name="ad_article_bottom_enabled"
                class="w-full"
              >
                <USwitch v-model="config.ad_article_bottom_enabled" />
              </UFormField>

              <div></div>

              <UFormField
                :label="t('admin.settings.adArticleBottomContent')"
                name="ad_article_bottom_content"
                class="md:col-span-2"
              >
                <UTextarea
                  v-model="config.ad_article_bottom_content"
                  :disabled="!config.ad_article_bottom_enabled"
                  class="w-full"
                  :placeholder="t('admin.settings.adContentPlaceholder')"
                  :rows="4"
                />
              </UFormField>
            </div>

            <!-- 广告预览 -->
            <AdvertisementPreview
              type="article-bottom"
              :content="config.ad_article_bottom_content"
              :enabled="config.ad_article_bottom_enabled"
            />
          </UCard>

          <!-- 全局广告 -->
          <UCard>
            <h3 class="text-lg font-semibold mb-4">{{ t('admin.settings.adGlobal') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField
                :label="t('admin.settings.adGlobalEnabled')"
                name="ad_global_enabled"
                class="w-full"
              >
                <USwitch v-model="config.ad_global_enabled" />
              </UFormField>

              <UFormField
                :label="t('admin.settings.adGlobalPosition')"
                name="ad_global_position"
                class="w-full"
              >
                <USelect
                  v-model="config.ad_global_position"
                  :disabled="!config.ad_global_enabled"
                  class="w-full"
                  :items="[
                    { label: t('admin.settings.adPositionFixedTop'), value: 'fixed-top' },
                    { label: t('admin.settings.adPositionFixedBottom'), value: 'fixed-bottom' },
                    { label: t('admin.settings.adPositionFloating'), value: 'floating' }
                  ]"
                  option-attribute="label"
                  value-attribute="value"
                />
              </UFormField>

              <UFormField
                :label="t('admin.settings.adGlobalContent')"
                name="ad_global_content"
                class="md:col-span-2"
              >
                <UTextarea
                  v-model="config.ad_global_content"
                  :disabled="!config.ad_global_enabled"
                  class="w-full"
                  :placeholder="t('admin.settings.adContentPlaceholder')"
                  :rows="4"
                />
              </UFormField>

              <UFormField
                :label="t('admin.settings.adGlobalStyle')"
                name="ad_global_style"
                class="md:col-span-2"
              >
                <UTextarea
                  v-model="config.ad_global_style"
                  :disabled="!config.ad_global_enabled"
                  class="w-full"
                  :placeholder="t('admin.settings.adStylePlaceholder')"
                  :rows="3"
                />
              </UFormField>
            </div>

            <!-- 广告预览 -->
            <AdvertisementPreview
              type="global"
              :content="config.ad_global_content"
              :enabled="config.ad_global_enabled"
              :position="config.ad_global_position"
              :style="config.ad_global_style"
            />
          </UCard>
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
  import { configControllerFindAll, configControllerUpdateAll } from '~/api';
  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  const { t } = useI18n();
  const toast = useToast();

  // 活动标签
  const activeTab = ref('0');

  // 用于新组件的现有图片数据
  const existingLogoUrl = ref<string>('');
  const existingFaviconUrl = ref<string>('');

  // 标签页配置
  const tabs = ref<TabsItem[]>([
    { label: t('admin.settings.tabs.general'), slot: 'general', icon: 'mynaui:cog' },
    { label: t('admin.settings.tabs.user'), slot: 'user', icon: 'mynaui:users' },
    { label: t('admin.settings.tabs.content'), slot: 'content', icon: 'mynaui:file' },
    { label: t('admin.settings.tabs.payment'), slot: 'payment', icon: 'mynaui:credit-card' },
    { label: t('admin.settings.tabs.commission'), slot: 'commission', icon: 'mynaui:percentage' },
    { label: t('admin.settings.tabs.membership'), slot: 'membership', icon: 'mynaui:heart-waves' },
    {
      label: t('admin.settings.tabs.advertisement'),
      slot: 'advertisement',
      icon: 'mynaui:megaphone'
    },
    {
      label: t('admin.settings.tabs.maintenance'),
      slot: 'maintenance',
      icon: 'mynaui:wrench'
    },
    { label: t('admin.settings.tabs.invite'), slot: 'invite', icon: 'mynaui:gift' }
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
    payment_epay_alipay_enabled: true,
    payment_epay_wxpay_enabled: true,
    payment_epay_usdt_enabled: false,
    membership_enabled: true,
    membership_name: '',
    membership_price_1m: 0,
    membership_price_3m: 0,
    membership_price_6m: 0,
    membership_price_12m: 0,
    membership_price_lifetime: 0,
    maintenance_mode: false,
    maintenance_message: '',
    invite_code_required: true,
    invite_code_enabled: true,
    invite_default_commission_rate: 0,
    invite_code_expire_days: 7,
    // 新增配置项
    commission_author_rate: 0,
    commission_platform_rate: 0,
    // 支付宝配置
    payment_alipay_app_id: '',
    payment_alipay_gateway: 'https://openapi.alipay.com/gateway.do',
    payment_alipay_private_key: '',
    payment_alipay_public_key: '',
    // 微信支付配置
    payment_wechat_app_id: '',
    payment_wechat_api_key: '',
    payment_wechat_mch_id: '',
    payment_wechat_private_key: '',
    payment_wechat_public_key: '',
    payment_wechat_serial_no: '',
    // 易支付配置
    payment_epay_app_id: '',
    payment_epay_app_key: '',
    payment_epay_gateway: 'https://pay.example.com',
    payment_epay_notify_url: '',
    // 通用支付配置
    payment_notify_url: 'https://your-domain.com/api/payment/notify',
    payment_return_url: 'https://your-domain.com/payment/result',
    // 广告配置
    ad_homepage_enabled: false,
    ad_homepage_content: '',
    ad_homepage_position: 'top',
    ad_article_top_enabled: false,
    ad_article_top_content: '',
    ad_article_bottom_enabled: false,
    ad_article_bottom_content: '',
    ad_global_enabled: false,
    ad_global_content: '',
    ad_global_position: 'fixed-bottom',
    ad_global_style: 'background: #f8f9fa; padding: 10px; text-align: center;'
  });

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
        existingLogoUrl.value = config.value.site_logo;
      }

      // 初始化favicon文件
      if (config.value.site_favicon) {
        existingFaviconUrl.value = config.value.site_favicon;
      }
    }
  };

  await initializeConfig();

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
        title: t('common.message.updateSuccess'),
        color: 'primary'
      });
    } catch (error) {
      toast.add({
        title: t('common.message.updateFailed'),
        color: 'error'
      });
    } finally {
      saving.value = false;
    }
  };
</script>
