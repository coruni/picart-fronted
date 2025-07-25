<template>
  <div class="min-h-screen flex">
    <!-- 左侧导航栏 -->
    <DashboardSidebar
      :sidebar-collapsed="sidebarCollapsed"
      :menu-items="menuItems"
      @toggle="toggleSidebar"
    />

    <!-- 右侧内容区域 -->
    <main class="flex-1 flex flex-col">
      <!-- 顶部导航栏 -->
      <header
        class="bg-white shadow-sm border-b border-gray-200 dark:border-gray-600 h-16 dark:bg-gray-800 flex items-center justify-between px-6"
      >
        <div class="flex items-center">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white/80">
            {{ $t(pageTitle) }}
          </h2>
        </div>

        <div class="flex items-center space-x-4">
          <!-- 通知 -->
          <button
            class="p-2 text-gray-500 hover:text-gray-700 relative rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            <Icon name="mynaui:bell" class="w-5 h-5" />
            <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <!-- 用户菜单 -->
          <div class="relative">
            <button
              @click="toggleUserMenu"
              class="flex items-center p-2 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <Icon name="mynaui:user" class="w-5 h-5" />
              <Icon name="mynaui:chevron-down" class="w-4 h-4 ml-1" />
            </button>

            <!-- 下拉菜单 -->
            <div
              v-show="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-50 border border-gray-100"
            >
              <a
                href="#"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mx-2"
                >个人资料</a
              >
              <a
                href="#"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mx-2"
                >账户设置</a
              >
              <hr class="my-2 mx-2" />
              <a
                href="#"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg mx-2"
                >退出登录</a
              >
            </div>
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="flex-1 p-6 overflow-auto flex flex-col">
        <div
          class="bg-white dark:bg-gray-800 rounded-md shadow-sm p-6 min-h-full flex-1 flex flex-col"
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
  const showUserMenu = ref(false);
  const sidebarCollapsed = ref(false);

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
      path: '/admin/analytics',
      icon: 'mynaui:chart-line',
      text: 'admin.menu.analytics'
    },
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

  const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value;
  };

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  // 点击外部关闭用户菜单
  const handleClickOutside = event => {
    if (!event.target.closest('.relative')) {
      showUserMenu.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
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
</style>
