<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 bg-white/80 shadow-sm h-16 dark:bg-gray-900/80 backdrop-blur-md"
  >
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-full">
      <NuxtLinkLocale class="flex items-center space-x-2" to="/">
        <NuxtImg
          v-if="siteConfig?.site_logo"
          :src="siteConfig?.site_logo"
          class="w-8 h-8 rounded-full object-cover"
          :alt="siteConfig?.site_name || 'Logo'"
        />
        <span v-else class="text-xl font-bold text-gray-700 dark:text-white">{{
          siteConfig?.site_name || 'PicArt'
        }}</span>
      </NuxtLinkLocale>

      <!-- 桌面端导航 -->
      <div class="hidden md:flex items-center space-x-8">
        <NuxtLinkLocale to="/">{{ $t('header.nav.home') }}</NuxtLinkLocale>
        <template v-for="item in categories" :key="item.id">
          <template v-if="!item.children">
            <NuxtLinkLocale
              :to="item.link || `/category/${item.id}`"
              :target="item.link ? '_blank' : '_self'"
              :no-rel="!!item.link"
            >
              <span>{{ item.name }}</span>
            </NuxtLinkLocale>
          </template>
          <div class="group relative cursor-pointer flex items-center gap-1" v-else>
            <NuxtLinkLocale
              v-if="item.link"
              :to="item.link"
              :target="item.link ? '_blank' : '_self'"
              :no-rel="!!item.link"
              class="hover:text-primary dark:hover:text-primary-400 transition-colors"
            >
              <span>{{ item.name }}</span>
            </NuxtLinkLocale>
            <span v-else>{{ item.name }}</span>
            <Icon
              v-if="item.children?.length"
              name="mynaui:chevron-down"
              class="group-hover:rotate-180 transition-transform"
            />
            <div
              v-if="item.children?.length"
              class="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 dark:border-gray-700"
            >
              <div class="py-1">
                <NuxtLinkLocale
                  :target="child.link ? '_blank' : '_self'"
                  :no-rel="!!child.link"
                  v-for="child in item.children"
                  :key="child.id"
                  :to="child.link || `/category/${child.id}`"
                  class="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-colors duration-200"
                >
                  {{ child.name }}
                </NuxtLinkLocale>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 桌面端搜索、语言切换和用户 -->
      <div class="hidden md:flex items-center space-x-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('header.nav.search')"
            class="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm focus:outline-none border-none"
            @keyup.enter="handleSearch"
          />
          <Icon
            name="mynaui:search"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
            @click="handleSearch"
          />
        </div>

        <!-- 语言切换器 -->
        <div class="group relative cursor-pointer flex items-center gap-1">
          <span class="text-lg">{{ currentLanguageFlag }}</span>
          <span class="hidden sm:inline">{{ currentLanguageName }}</span>
          <Icon
            name="mynaui:chevron-down"
            class="w-4 h-4 transition-transform group-hover:rotate-180"
          />

          <!-- 语言选择菜单 -->
          <div
            class="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 dark:border-gray-700"
          >
            <div class="py-1">
              <UButton
                variant="ghost"
                v-for="locale in availableLocales"
                :key="locale.code"
                @click="handleLanguageSwitch(locale.code)"
                class="rounded-none w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                :class="{ 'bg-primary/10 text-primary': locale.code === currentLocale }"
              >
                <span class="text-lg">{{ getLanguageFlag(locale.code) }}</span>
                <span>{{ locale.name }}</span>
                <Icon
                  v-if="locale.code === currentLocale"
                  name="mynaui:check"
                  class="w-4 h-4 ml-auto text-primary"
                />
              </UButton>
            </div>
          </div>
        </div>

        <template v-if="userStore.isLoggedIn">
          <!-- 消息通知 -->
          <MessageNotification />

          <div class="group relative cursor-pointer flex items-center gap-1">
            <UAvatar
              :src="currentUserAvatar"
              :alt="userStore.userInfo?.nickname || userStore.userInfo?.username"
              fit="cover"
              class="w-8 h-8 rounded-full object-cover"
            />
            <div
              class="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 dark:border-gray-700"
            >
              <div class="py-1">
                <NuxtLinkLocale
                  to="/user"
                  class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary"
                >
                  <span>{{ $t('header.nav.profile') }}</span>
                </NuxtLinkLocale>

                <UButton
                  color="error"
                  variant="ghost"
                  @click="handleLogout"
                  class="block w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary"
                >
                  <span>{{ $t('user.logout') }}</span>
                </UButton>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <NuxtLinkLocale
            to="/user/login"
            class="px-4 py-2 text-sm font-medium text-primary hover:text-primary-600 dark:hover:text-primary-400"
          >
            {{ $t('login.login') }}
          </NuxtLinkLocale>
        </template>
      </div>

      <!-- 移动端汉堡菜单按钮 -->
      <UButton
        @click="toggleMobileMenu"
        variant="outline"
        class="mobile-menu-container md:hidden p-2 flex items-center cursor-pointer justify-center rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
        :aria-expanded="isMobileMenuOpen"
        :aria-label="isMobileMenuOpen ? '关闭菜单' : '打开菜单'"
      >
        <Icon :name="isMobileMenuOpen ? 'mynaui:x' : 'mynaui:menu'" class="w-6 h-6" />
      </UButton>

      <!-- 移动端菜单 -->
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isMobileMenuOpen"
          class="mobile-menu-container md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-xl border-t border-gray-200 dark:border-gray-700 max-h-[calc(100vh-4rem)] overflow-y-auto backdrop-blur-sm"
        >
          <div class="px-4 py-4 space-y-4">
            <NuxtLinkLocale
              to="/"
              class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              @click="closeMobileMenu"
            >
              {{ $t('header.nav.home') }}
            </NuxtLinkLocale>

            <template v-for="item in categories" :key="item.id">
              <div v-if="!item.children">
                <NuxtLinkLocale
                  :to="item.link || `/category/${item.id}`"
                  :target="item.link ? '_blank' : '_self'"
                  :no-rel="!!item.link"
                  class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  @click="closeMobileMenu"
                >
                  {{ item.name }}
                </NuxtLinkLocale>
              </div>
              <div v-else class="space-y-2">
                <div v-if="item.link" class="px-4 py-2">
                  <NuxtLinkLocale
                    :to="item.link"
                    :target="item.link ? '_blank' : '_self'"
                    :no-rel="!!item.link"
                    class="block text-gray-700 dark:text-gray-300 font-medium hover:text-primary dark:hover:text-primary-400 transition-colors"
                    @click="closeMobileMenu"
                  >
                    {{ item.name }}
                  </NuxtLinkLocale>
                </div>
                <div v-else class="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium">
                  {{ item.name }}
                </div>
                <div class="pl-4 space-y-1">
                  <NuxtLinkLocale
                    v-for="child in item.children"
                    :key="child.id"
                    :to="child.link || `/category/${child.id}`"
                    :target="child.link ? '_blank' : '_self'"
                    :no-rel="!!child.link"
                    class="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    @click="closeMobileMenu"
                  >
                    {{ child.name }}
                  </NuxtLinkLocale>
                </div>
              </div>
            </template>

            <div class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <!-- 移动端语言切换 -->
              <div class="px-4">
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('header.nav.language') || '语言' }}
                </div>
                <div class="flex space-x-2">
                  <UButton
                    variant="ghost"
                    v-for="locale in availableLocales"
                    :key="locale.code"
                    @click="handleLanguageSwitch(locale.code)"
                    class="w-10 h-10 flex items-center justify-center text-lg rounded-full transition-colors cursor-pointer"
                    :class="
                      locale.code === currentLocale
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    "
                  >
                    {{ locale.flag }}
                  </UButton>
                </div>
              </div>

              <div class="relative px-4">
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="$t('header.nav.search')"
                  class="w-full px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none border-none"
                  @keyup.enter="handleSearch"
                />
                <Icon
                  name="mynaui:search"
                  class="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                  @click="handleSearch"
                />
              </div>
              <template v-if="userStore.isLoggedIn">
                <!-- 移动端消息通知 -->
                <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <Icon name="mynaui:bell" class="w-5 h-5 text-primary" />
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {{ $t('message.title') }}
                      </span>
                      <span
                        v-if="unreadCount > 0"
                        class="text-red-500 font-medium bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-full text-xs"
                      >
                        {{ unreadCount > 99 ? '99+' : unreadCount }}
                      </span>
                    </div>
                    <NuxtLinkLocale
                      to="/user/messages"
                      class="text-sm text-primary hover:text-primary-600 dark:hover:text-primary-400 flex items-center space-x-1"
                      @click="closeMobileMenu"
                    >
                      <span>{{ $t('message.viewAll') }}</span>
                      <span class="text-gray-500 dark:text-gray-400">({{ totalCount }})</span>
                    </NuxtLinkLocale>
                  </div>
                </div>

                <NuxtLinkLocale
                  to="/user"
                  class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  @click="closeMobileMenu"
                >
                  <div class="flex items-center space-x-2">
                    <UAvatar
                      :src="currentUserAvatar"
                      :alt="userStore.userInfo?.nickname || userStore.userInfo?.username"
                      fit="cover"
                      class="w-6 h-6 rounded-full object-cover"
                    />
                    <span>{{ $t('header.nav.profile') }}</span>
                  </div>
                </NuxtLinkLocale>

                <button
                  @click="handleLogout"
                  class="block w-full cursor-pointer text-left px-4 py-2 text-red-400 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  {{ $t('user.logout') }}
                </button>
              </template>
              <template v-else>
                <NuxtLinkLocale
                  to="/user/login"
                  class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  @click="closeMobileMenu"
                >
                  {{ $t('login.login') }}
                </NuxtLinkLocale>
              </template>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>
<script lang="ts" setup>
  import type { Category } from '~~/types/category';
  import { useRoute } from 'vue-router';
  import type { ConfigControllerGetPublicResponse } from '~/api';
  type Config = ConfigControllerGetPublicResponse['data'];
  const siteConfig = inject<Config>('siteConfig');
  const userStore = useUserStore();
  const route = useRoute();
  const router = useRouter();

  // 消息相关数据
  const { unreadCount, totalCount } = useMessage();

  // 语言切换相关
  const { locale: currentLocale, locales, setLocale } = useI18n();

  // 搜索相关
  const searchQuery = ref('');

  const handleSearch = () => {
    if (searchQuery.value.trim()) {
      router.push({ path: '/search', query: { q: searchQuery.value } });
    }
  };

  defineProps({
    categories: {
      type: Array as PropType<Category[]>,
      default: () => []
    }
  });

  // 用户头像 - 使用computed确保响应式
  const currentUserAvatar = computed(() => userStore.userInfo?.avatar);
  const isMobileMenuOpen = ref(false);

  // 可用语言列表
  const availableLocales = computed(() => {
    return locales.value.map(locale => ({
      code: locale.code,
      name: locale.name || locale.code,
      flag: getLanguageFlag(locale.code)
    }));
  });

  // 当前语言名称
  const currentLanguageName = computed(() => {
    const current = availableLocales.value.find(l => l.code === currentLocale.value);
    return current?.name || currentLocale.value;
  });

  // 当前语言旗帜
  const currentLanguageFlag = computed(() => {
    return getLanguageFlag(currentLocale.value);
  });

  // 获取语言旗帜
  const getLanguageFlag = (code: string): string => {
    const flagMap: Record<string, string> = {
      zh: '🇨🇳',
      en: '🇺🇸',
      ja: '🇯🇵'
    };
    return flagMap[code] || '🌐';
  };

  // 处理语言切换
  const handleLanguageSwitch = async (newLocale: string) => {
    if (newLocale === currentLocale.value) {
      return;
    }

    try {
      await setLocale(newLocale as 'zh' | 'en' | 'ja');
      closeMobileMenu(); // 关闭移动端菜单
    } catch (error) {
      console.error('语言切换失败:', error);
    }
  };

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  };

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
  };

  // 点击外部区域关闭菜单
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.mobile-menu-container')) {
      closeMobileMenu();
    }
  };

  // 监听路由变化，自动关闭移动端菜单
  watch(
    () => route.path,
    () => {
      closeMobileMenu();
    }
  );

  // 监听移动端菜单状态，添加/移除点击外部关闭的事件监听
  watch(isMobileMenuOpen, newValue => {
    if (newValue) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
  });

  // 处理登出
  const handleLogout = () => {
    userStore.clearAuth();
    closeMobileMenu();
    // clearAuth 方法已经处理了页面跳转，这里不需要额外的跳转
  };

  // 组件卸载时清理事件监听
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>
<style scoped>
  /* 移动端菜单滚动条样式 */
  .mobile-menu-container::-webkit-scrollbar {
    width: 4px;
  }

  .mobile-menu-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .mobile-menu-container::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 2px;
  }

  .mobile-menu-container::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.8);
  }

  /* 暗色模式下的滚动条 */
  .dark .mobile-menu-container::-webkit-scrollbar-thumb {
    background: rgba(75, 85, 99, 0.5);
  }

  .dark .mobile-menu-container::-webkit-scrollbar-thumb:hover {
    background: rgba(75, 85, 99, 0.8);
  }
</style>
