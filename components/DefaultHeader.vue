<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 bg-white/80 shadow-sm h-16 dark:bg-gray-900/80 backdrop-blur-md"
  >
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-full">
      <div class="flex items-center space-x-2">
        <span class="text-xl font-bold text-gray-700 dark:text-white">PicArt</span>
      </div>

      <!-- 修改为使用动画过渡 -->
      <div
        class="md:flex items-center space-x-8 transition-all duration-300 transform md:translate-y-0 -translate-y-full md:opacity-100 opacity-0 md:static absolute left-0 right-0 top-full bg-white/80 dark:bg-black/80 md:bg-transparent md:dark:bg-transparent"
      >
        <NuxtLinkLocale to="/">{{ $t('header.nav.home') }}</NuxtLinkLocale>
        <template v-for="item in categories" :key="item.id">
          <NuxtLinkLocale v-if="!item.children">
            <span>{{ item.name }}</span>
          </NuxtLinkLocale>
          <div class="group relative cursor-pointer flex items-center gap-1" v-else>
            <span>{{ item.name }}</span>
            <Icon name="mynaui:chevron-down group-hover:rotate-180 transition-transform" />
            <div
              class="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
            >
              <div class="py-1">
                <NuxtLinkLocale
                  v-for="child in item.children"
                  :key="child.id"
                  :to="`/category/${child.id}`"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
                >
                  {{ child.name }}
                </NuxtLinkLocale>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 修改为使用动画过渡 -->
      <div
        class="md:flex items-center space-x-4 transition-all duration-300 transform md:translate-y-0 -translate-y-full md:opacity-100 opacity-0 md:static absolute left-0 right-0 top-full bg-white/80 dark:bg-black/80 md:bg-transparent md:dark:bg-transparent"
      >
        <div class="relative">
          <input
            type="text"
            :placeholder="$t('header.nav.search')"
            class="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm focus:outline-none border-none"
          />
          <Icon
            name="mynaui:search"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          />
        </div>
        <div class="w-8 h-8 rounded-full overflow-hidden cursor-pointer group">
          <NuxtImg alt="user avatar" class="w-full h-full object-cover" />
          <div
            class="absolute top-full right-0 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 dark:bg-gray-800 dark:text-white"
          >
            <div class="py-1">
              <NuxtLinkLocale
                to="/profile"
                class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary"
              >
                <span>{{ $t('header.nav.profile') }}</span>
              </NuxtLinkLocale>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
<script lang="ts" setup>
  import type { Category } from '~~/types/category';

  defineProps({
    categories: {
      type: Array as PropType<Category[]>,
      default: () => []
    }
  });
</script>
