<template>
  <aside
    :class="[
      'bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out dark:bg-gray-800 h-full',
      $attrs.class || ''
    ]"
  >
    <!-- Logo 区域 -->
    <div
      class="h-16 flex items-center justify-between border-b border-gray-200 dark:border-gray-600 px-4"
    >
      <h1
        v-show="!sidebarCollapsed"
        class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white transition-opacity duration-200 truncate"
      >
        {{ $t('admin.menu.dashboard') }}
      </h1>
      <Icon
        v-show="sidebarCollapsed"
        name="mynaui:brand-trello"
        class="w-5 h-5 text-gray-800 dark:text-white"
      />

      <!-- 收起/展开按钮 -->
      <UButton
        variant="link"
        color="neutral"
        @click="handleToggle"
        class="cursor-pointer absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-300 rounded-full items-center justify-center hover:bg-gray-50 transition-colors shadow-sm flex"
      >
        <Icon
          :name="sidebarCollapsed ? 'mynaui:chevron-right' : 'mynaui:chevron-left'"
          class="w-3 h-3 text-gray-600"
        />
      </UButton>
    </div>

    <!-- 导航菜单 -->
    <nav class="flex-1 p-4 overflow-y-auto">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.path">
          <NuxtLinkLocale
            :to="item.path"
            :class="[
              'flex items-center px-3 py-2 text-gray-800 rounded-md hover:bg-gray-100 dark:text-white/80 dark:hover:bg-gray-700 hover:text-primary transition-all duration-200 group',
              sidebarCollapsed ? 'justify-center' : ''
            ]"
            active-class="bg-gray-100 text-primary dark:bg-gray-700"
            :title="sidebarCollapsed ? $t(item.text) : ''"
          >
            <Icon
              :name="item.icon"
              class="w-5 h-5 flex-shrink-0"
              :class="sidebarCollapsed ? '' : 'mr-3'"
            />
            <span v-show="!sidebarCollapsed" class="transition-opacity duration-200">{{
              $t(item.text)
            }}</span>
          </NuxtLinkLocale>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const props = defineProps({
    sidebarCollapsed: {
      type: Boolean,
      required: true
    },
    menuItems: {
      type: Array,
      required: true
    }
  });

  const emit = defineEmits(['toggle']);

  const handleToggle = () => {
    emit('toggle');
  };
</script>

<style scoped>
  /* 自定义滚动条样式 */
  nav::-webkit-scrollbar {
    width: 4px;
  }

  nav::-webkit-scrollbar-track {
    background: transparent;
  }

  nav::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 2px;
  }

  nav::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.8);
  }

  /* 暗色模式下的滚动条 */
  .dark nav::-webkit-scrollbar-thumb {
    background: rgba(75, 85, 99, 0.5);
  }

  .dark nav::-webkit-scrollbar-thumb:hover {
    background: rgba(75, 85, 99, 0.8);
  }
</style>
