<template>
  <aside
    :class="[
      'bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out dark:bg-gray-800  ',
      sidebarCollapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Logo 区域 -->
    <div
      class="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-600 relative"
    >
      <h1
        v-show="!sidebarCollapsed"
        class="text-xl font-bold text-gray-800 transition-opacity duration-200"
      >
        {{ $t('admin.menu.dashboard') }}
      </h1>
      <Icon v-show="sidebarCollapsed" name="mynaui:dashboard" class="w-6 h-6 text-gray-800" />

      <!-- 收起/展开按钮 -->
      <button
        @click="handleToggle"
        class="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
      >
        <Icon
          :name="sidebarCollapsed ? 'mynaui:chevron-right' : 'mynaui:chevron-left'"
          class="w-3 h-3 text-gray-600"
        />
      </button>
    </div>

    <!-- 导航菜单 -->
    <nav class="flex-1 p-4 bg-gay-800">
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
