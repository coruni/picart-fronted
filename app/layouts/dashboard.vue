<script lang="ts" setup>
  import type { NavigationMenuItem } from '@nuxt/ui';
  import { confirmLogout } from '~/utils/logout';
  import type { SiteConfig } from '~/types/site-config';

  const { t } = useI18n();
  const route = useRoute();
  const userStore = useUserStore();
  const siteConfig = inject<SiteConfig>('siteConfig');

  // 处理登出
  const handleLogout = async () => {
    await confirmLogout();
  };

  // 菜单数据 - 转换为 NavigationMenuItem 格式
  const menuItems = computed<NavigationMenuItem[]>(() => [
    {
      label: t('admin.menu.dashboard'),
      to: '/admin',
      icon: 'mynaui:brand-trello'
    },
    {
      label: t('admin.menu.articles'),
      to: '/admin/articles',
      icon: 'mynaui:box'
    },
    {
      label: t('admin.menu.categories'),
      to: '/admin/categories',
      icon: 'mynaui:box'
    },
    {
      label: t('admin.menu.tags'),
      to: '/admin/tags',
      icon: 'mynaui:box'
    },
    {
      label: t('admin.menu.roles'),
      to: '/admin/roles',
      icon: 'mynaui:shield'
    },
    {
      label: t('admin.menu.users'),
      to: '/admin/users',
      icon: 'mynaui:users'
    },
    {
      label: t('admin.menu.orders'),
      to: '/admin/orders',
      icon: 'mynaui:cart'
    },
    {
      label: t('admin.menu.comments'),
      to: '/admin/comments',
      icon: 'mynaui:chat'
    },
    {
      label: t('admin.menu.banners'),
      to: '/admin/banners',
      icon: 'mynaui:image'
    },
    {
      label: t('admin.menu.settings'),
      to: '/admin/settings',
      icon: 'mynaui:cog-four'
    }
  ]);

  // 根据路由动态设置页面标题
  const pageTitle = computed(() => {
    const currentItem = menuItems.value.find(
      item => item.to === route.path || route.path.startsWith(item.to + '/')
    );
    return currentItem?.label || t('admin.menu.dashboard');
  });
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      toggle-side="left"
      id="dashboard"
      :ui="{ footer: 'lg:border-t lg:border-default', root: 'w-64' }"
    >
      <template #header>
        <!-- Logo -->
        <div class="flex items-center gap-3 px-2 py-1">
          <NuxtImg
            v-if="siteConfig?.site_logo"
            :src="siteConfig.site_logo"
            alt="logo"
            class="w-10 h-10"
          />
          <div class="flex-1">
            <h1 class="text-lg font-bold truncate">{{ siteConfig?.site_name || 'Admin' }}</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('admin.menu.dashboard') }}</p>
          </div>
        </div>
      </template>

      <template #default="slotProps">
        <UNavigationMenu
          :ui="{ link: 'py-2' }"
          orientation="vertical"
          tooltip
          :collapsed="slotProps?.collapsed ?? false"
          :items="menuItems"
        />
      </template>

      <template #footer="slotProps">
        <div class="flex flex-col flex-1 gap-2">
          <UserMenu :collapsed="slotProps?.collapsed ?? false" />
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel :ui="{ body: 'p-4 sm:p-6' }">
      <template #header>
        <UDashboardNavbar toggle-side="left">
          <template #left>
            <h2 class="text-lg font-semibold">{{ pageTitle }}</h2>
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <NuxtPage keepalive />
      </template>
    </UDashboardPanel>

    <!-- Cookie Consent -->
    <CookieConsent />
  </UDashboardGroup>
</template>

<style scoped></style>
