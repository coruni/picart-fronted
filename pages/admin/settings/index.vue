<template>
  <div class="p-4 sm:p-6">
    <h1 class="text-2xl font-bold mb-6">{{ t('settings.title') }}</h1>

    <UTabs :items="tabs" class="w-full" v-model="activeTab">
      <template #general="{ item }">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField :label="t('settings.siteName')" name="site_name" class="w-full">
            <UInput v-model="config.site_name" class="w-full" />
          </UFormField>

          <UFormField :label="t('settings.siteKeywords')" name="site_keywords" class="w-full">
            <UInput v-model="config.site_keywords" class="w-full" />
          </UFormField>

          <UFormField
            :label="t('settings.siteDescription')"
            name="site_description"
            class="md:col-span-2"
          >
            <UTextarea v-model="config.site_description" class="w-full" />
          </UFormField>

          <UFormField :label="t('settings.siteLogo')" name="site_logo" class="w-full">
            <UInput v-model="config.site_logo" class="w-full" />
          </UFormField>

          <UFormField :label="t('settings.siteFavicon')" name="site_favicon" class="w-full">
            <UInput v-model="config.site_favicon" class="w-full" />
          </UFormField>
        </div>
      </template>

      <template #user="{ item }">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField
            :label="t('settings.userRegistrationEnabled')"
            name="user_registration_enabled"
            class="w-full"
          >
            <USwitch v-model="config.user_registration_enabled" />
          </UFormField>

          <UFormField
            :label="t('settings.userEmailVerification')"
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
            :label="t('settings.commentApprovalRequired')"
            name="comment_approval_required"
            class="w-full"
          >
            <USwitch v-model="config.comment_approval_required" />
          </UFormField>

          <UFormField
            :label="t('settings.articleApprovalRequired')"
            name="article_approval_required"
            class="w-full"
          >
            <USwitch v-model="config.article_approval_required" />
          </UFormField>
        </div>
      </template>

      <template #maintenance="{ item }">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField :label="t('settings.maintenanceMode')" name="maintenance_mode" class="w-full">
            <USwitch v-model="config.maintenance_mode" />
          </UFormField>

          <div></div>

          <UFormField
            :label="t('settings.maintenanceMessage')"
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
            :label="t('settings.inviteCodeEnabled')"
            name="invite_code_enabled"
            class="w-full"
          >
            <USwitch v-model="config.invite_code_enabled" />
          </UFormField>

          <UFormField
            :label="t('settings.inviteCodeRequired')"
            name="invite_code_required"
            class="w-full"
          >
            <USwitch
              v-model="config.invite_code_required"
              :disabled="!config.invite_code_enabled"
            />
          </UFormField>

          <UFormField
            :label="t('settings.inviteDefaultCommissionRate')"
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
            />
          </UFormField>

          <UFormField
            :label="t('settings.inviteCodeExpireDays')"
            name="invite_code_expire_days"
            class="w-full"
          >
            <UInput
              v-model="config.invite_code_expire_days"
              type="number"
              min="1"
              :disabled="!config.invite_code_enabled"
              class="w-full"
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
  import { configControllerFindAll, configControllerUpdateAll } from '~~/api';
  import { ref, watch } from 'vue';

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  const { t } = useI18n();
  const toast = useToast();

  // 活动标签
  const activeTab = ref('0');

  // 标签页配置
  const tabs = ref<TabsItem[]>([
    { label: t('settings.tabs.general'), slot: 'general', icon: 'i-mynaui-cog' },
    { label: t('settings.tabs.user'), slot: 'user', icon: 'i-mynaui-users' },
    { label: t('settings.tabs.content'), slot: 'content', icon: 'i-mynaui-document' },
    {
      label: t('settings.tabs.maintenance'),
      slot: 'maintenance',
      icon: 'i-mynaui-wrench'
    },
    { label: t('settings.tabs.invite'), slot: 'invite', icon: 'i-mynaui-gift' }
  ]);

  // 配置数据
  const config = ref<Record<string, any>>({
    site_name: '',
    site_description: '',
    site_keywords: '',
    site_logo: '',
    site_favicon: '',
    user_registration_enabled: true,
    user_email_verification: false,
    comment_approval_required: false,
    article_approval_required: false,
    maintenance_mode: false,
    maintenance_message: '',
    invite_code_required: false,
    invite_code_enabled: false,
    invite_default_commission_rate: 0,
    invite_code_expire_days: 7
  });

  // 获取配置
  const { data: configData } = await configControllerFindAll({
    composable: 'useFetch'
  });

  configData.value?.data.data.forEach(item => {
    config.value[item.key] = item.value;
  });

  // 使用 watch 确保数据加载后执行初始化
  // watch(
  //   configData,
  //   newData => {
  //     if (newData?.data?.data) {
  //       newData.data.data.forEach(item => {
  //         config.value[item.key] = item.value;
  //       });
  //     }
  //   },
  //   { immediate: true }
  // );

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
        title: t('settings.saveSuccess'),
        color: 'success'
      });
    } catch (error) {
      toast.add({
        title: t('settings.saveFailed'),
        color: 'error'
      });
    } finally {
      saving.value = false;
    }
  };
</script>
