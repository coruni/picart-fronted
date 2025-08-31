<template>
  <div class="min-h-screen flex relative">
    <!-- 左侧导航栏 - 桌面端 -->
    <DashboardSidebar
      :sidebar-collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
      :class="[
        'transition-all duration-300 ease-in-out',
        'lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:z-30',
        'hidden lg:block',
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
      ]"
    />

    <!-- 移动端侧边栏 -->
    <USlideover v-model:open="toggleMobileSidebar" side="left" :title="$t('admin.menu.dashboard')">
      <template #body>
        <nav class="flex-1 p-4 overflow-y-auto">
          <ul class="space-y-2">
            <li v-for="item in menuItems" :key="item.path">
              <NuxtLinkLocale
                :to="item.path"
                class="flex items-center px-3 py-2 text-gray-800 rounded-md hover:bg-gray-100 dark:text-white/80 dark:hover:bg-gray-700 hover:text-primary transition-all duration-200 group"
                active-class="bg-gray-100 text-primary dark:bg-gray-700"
                @click="toggleMobileSidebar = false"
              >
                <Icon :name="item.icon" class="w-5 h-5 flex-shrink-0 mr-3" />
                <span>{{ $t(item.text) }}</span>
              </NuxtLinkLocale>
            </li>
          </ul>
        </nav>
      </template>
    </USlideover>

    <!-- 右侧内容区域 -->
    <main
      :class="[
        'flex-1 flex flex-col min-w-0',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64',
        'ml-0'
      ]"
    >
      <!-- 顶部导航栏 -->
      <header
        class="bg-white shadow-sm border-b border-gray-200 dark:border-gray-600 h-16 dark:bg-gray-800 flex items-center justify-between px-6"
      >
        <div class="flex items-center space-x-3">
          <!-- 移动端菜单按钮 -->
          <UButton
            @click="toggleMobileSidebar = true"
            variant="link"
            color="neutral"
            class="cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <Icon name="mynaui:menu" class="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </UButton>
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white/80">
            {{ $t(pageTitle) }}
          </h2>
        </div>

        <div class="flex items-center space-x-2 sm:space-x-4">
          <!-- 暗黑模式切换按钮 -->
          <UButton
            variant="link"
            color="neutral"
            @click="toggleColorMode"
            class="cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :title="$t('common.toggleTheme')"
          >
            <Icon
              :name="colorMode.value === 'dark' ? 'mynaui:sun' : 'mynaui:moon'"
              class="w-5 h-5 text-gray-600 dark:text-gray-300"
            />
          </UButton>

          <!-- 用户菜单 -->
          <div class="group relative">
            <UButton
              variant="link"
              color="neutral"
              class="cursor-pointer flex items-center p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <Icon name="mynaui:user" class="w-4 h-4 sm:w-5 sm:h-5" />
              <Icon
                name="mynaui:chevron-down"
                class="w-3 h-3 sm:w-4 sm:h-4 ml-1 hidden sm:block group-hover:rotate-180 transition-transform"
              />
            </UButton>

            <!-- 下拉菜单 -->
            <div
              class="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50 border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300"
            >
              <a
                href="#"
                class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded mx-1 sm:mx-2"
                >个人资料</a
              >
              <a
                href="#"
                class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded mx-1 sm:mx-2"
                >账户设置</a
              >
              <hr class="my-1 sm:my-2 mx-1 sm:mx-2 border-gray-200 dark:border-gray-600" />
              <a
                href="#"
                class="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded mx-1 sm:mx-2"
                >退出登录</a
              >
            </div>
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="flex-1 p-4 sm:p-6 overflow-auto flex flex-col">
        <div
          class="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4 sm:p-6 min-h-full flex-1 flex flex-col"
        >
          <NuxtPage />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const sidebarCollapsed = ref(false);
  const toggleMobileSidebar = ref(false);

  // 暗黑模式
  const colorMode = useColorMode();

  const toggleColorMode = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  };

  // 菜单数据
  const menuItems = [
    {
      path: '/admin',
      icon: 'mynaui:brand-trello',
      text: 'admin.menu.dashboard'
    },
    {
      path: '/admin/articles',
      icon: 'mynaui:box',
      text: 'admin.menu.articles'
    },
    {
      path: '/admin/categories',
      icon: 'mynaui:box',
      text: 'admin.menu.categories'
    },
    {
      path: '/admin/tags',
      icon: 'mynaui:box',
      text: 'admin.menu.tags'
    },
    {
      path: '/admin/roles',
      icon: 'mynaui:shield',
      text: 'admin.menu.roles'
    },
    {
      path: '/admin/users',
      icon: 'mynaui:users',
      text: 'admin.menu.users'
    },
    {
      path: '/admin/orders',
      icon: 'mynaui:cart',
      text: 'admin.menu.orders'
    },
    {
      path: '/admin/comments',
      icon: 'mynaui:chat',
      text: 'admin.menu.comments'
    },
    {
      path: '/admin/banners',
      icon: 'mynaui:image',
      text: 'admin.menu.banners'
    },
    // {
    //   path: '/admin/analytics',
    //   icon: 'mynaui:chart-line',
    //   text: 'admin.menu.analytics'
    // },
    {
      path: '/admin/settings',
      icon: 'mynaui:cog-four',
      text: 'admin.menu.settings'
    }
  ];

  // 根据路由动态设置页面标题
  const pageTitle = computed(() => {
    const titleMap = menuItems.reduce((map, item) => {
      map[item.path] = item.text;
      return map;
    }, {});
    return titleMap[route.path] || '管理后台';
  });

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  // 监听路由变化，自动关闭移动端菜单
  watch(
    () => route.path,
    () => {
      toggleMobileSidebar.value = false;
    }
  );
</script>

<style scoped>
  /* 自定义滚动条样式 */
  .overflow-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .overflow-auto::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .overflow-auto::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* 暗黑模式下的滚动条 */
  .dark .overflow-auto::-webkit-scrollbar-track {
    background: #374151;
  }

  .dark .overflow-auto::-webkit-scrollbar-thumb {
    background: #6b7280;
  }

  .dark .overflow-auto::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
</style>
