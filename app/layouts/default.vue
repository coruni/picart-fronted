<script lang="ts" setup>
  import type { NavigationMenuItem } from '@nuxt/ui';
  import { categoryControllerFindAll } from '~/api';
  import type { Category } from '~/types/category';
  import type { SiteConfig } from '~/types/site-config';
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const localePath = useLocalePath();

  const userStore = useUserStore();
  const { data: categories } = categoryControllerFindAll({
    composable: 'useFetch',
    key: 'categories',
    query: {
      page: 1,
      limit: 100
    }
  });

  // 搜索相关
  const searchQuery = ref('');

  const handleSearch = () => {
    if (searchQuery.value.trim()) {
      router.push({ path: localePath('/search'), query: { q: searchQuery.value } });
    }
  };

  const siteConfig = inject<SiteConfig>('siteConfig');

  const menuItems = computed<NavigationMenuItem[]>(() => {
    const homeItem = {
      label: t('header.nav.home'),
      to: '/',
      ...(route.path === '/' && { active: true })
    };

    return [
      homeItem,
      ...((categories.value?.data.data as Category[]).map(item => {
        // 检查是否有子菜单
        const hasChildren = item.children && item.children.length > 0;

        // 如果有link，直接使用link作为path
        if (item.link) {
          return {
            label: item.name,
            to: item.link,
            // 如果链接以http开头，添加target="_blank"
            ...(item.link.startsWith('http') && { target: '_blank' }),
            children: hasChildren
              ? item.children?.map(child => ({
                  label: child.name,
                  to: child.link || `/category/${child.id}`,
                  // 如果链接以http开头，添加target="_blank"
                  ...(child.link?.startsWith('http') && { target: '_blank' })
                }))
              : []
          };
        }

        // 如果没有link但有子菜单，不设置path（不可跳转但可展开）
        if (hasChildren) {
          return {
            label: item.name,
            children: item.children?.map(child => ({
              label: child.name,
              to: child.link || `/category/${child.id}`,
              // 如果链接以http开头，添加target="_blank"
              ...(child.link?.startsWith('http') && { target: '_blank' })
            }))
          };
        }

        // 如果既没有link也没有子菜单，使用默认路径
        return {
          label: item.name,
          path: `/category/${item.id}`
        };
      }) || [])
    ];
  });
</script>
<template>
  <UDashboardGroup>
    <UDashboardSidebar
      toggle-side="right"
      id="default"
      :ui="{ footer: 'lg:border-t lg:border-default', root: 'w-64' }"
    >
      <template #header>
        <!-- logo -->
        <NuxtLinkLocale
          to="/"
          class="flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
          v-if="siteConfig?.site_logo"
        >
          <NuxtImg :src="siteConfig?.site_logo" alt="logo" class="w-12 h-12" />
        </NuxtLinkLocale>
        <NuxtLinkLocale
          to="/"
          class="flex-1 items-center justify-center flex hover:opacity-80 transition-opacity cursor-pointer"
          v-else
        >
          <h1 class="text-2xl font-bold">{{ siteConfig?.site_name }}</h1>
        </NuxtLinkLocale>
      </template>
      <template #default="slotProps">
        <UNavigationMenu
          :ui="{ link: 'py-2' }"
          orientation="vertical"
          tooltip
          :collapsed="slotProps?.collapsed ?? false"
          :items="menuItems"
        />
        <UInput
          icon="mynaui:search"
          v-model="searchQuery"
          placeholder="Search..."
          class="w-full"
          clearable
          @keyup.enter="handleSearch"
        />
      </template>
      <template #footer="slotProps">
        <div class="flex flex-col flex-1">
          <template v-if="userStore.isLoggedIn">
            <UserMenu :collapsed="slotProps?.collapsed ?? true" />
          </template>
          <template v-else>
            <UButton to="/user/login" class="w-full flex items-center justify-center" size="lg">{{
              t('header.nav.login')
            }}</UButton>
          </template>
        </div>
      </template>
    </UDashboardSidebar>
    <UDashboardPanel :ui="{ body: 'pt-0!' }">
      <template #header>
        <UDashboardNavbar toggle-side="right"> </UDashboardNavbar>
      </template>
      <template #body>
        <NuxtPage
          :keepalive="{
            include: ['dashboard', 'index', 'search', 'category'],
            exclude: ['login'],
            max: 10
          }"
        />
      </template>
    </UDashboardPanel>
    <!-- Cookie Consent -->
    <CookieConsent />
  </UDashboardGroup>
</template>
<style scoped></style>
