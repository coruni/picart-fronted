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
          format="webp"
          quality="90"
          width="32"
          height="32"
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

      <!-- 桌面端搜索和用户 -->
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

        <template v-if="userStore.isLoggedIn">
          <!-- 消息通知 -->
          <MessageNotification />

          <!-- 主题切换按钮 -->
          <ColorScheme placeholder="..." tag="span">
            <UButton
              variant="link"
              color="neutral"
              @click="toggleColorMode"
              class="cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out"
              :title="$t('common.toggleTheme')"
            >
              <div class="relative w-5 h-5 flex items-center justify-center">
                <transition name="icon-transition" mode="out-in">
                  <Icon
                    :key="isDarkMode ? 'sun' : 'moon'"
                    :name="isDarkMode ? 'mynaui:sun' : 'mynaui:moon'"
                    class="w-5 h-5 text-gray-600 dark:text-gray-300 transition-all duration-300 ease-in-out"
                  />
                </transition>
              </div>
            </UButton>
          </ColorScheme>

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

                <!-- 语言切换选项 -->
                <div class="relative group/language" ref="languageMenuRef">
                  <div
                    class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary flex items-center justify-between cursor-pointer"
                  >
                    <div class="flex items-center space-x-2">
                      <span class="text-lg">{{ currentLanguageFlag }}</span>
                      <span>{{ currentLanguageName }}</span>
                    </div>
                    <Icon
                      name="mynaui:chevron-right"
                      class="w-4 h-4 transition-transform group-hover/language:rotate-90"
                    />
                  </div>

                  <!-- 语言选择子菜单 -->
                  <div
                    class="absolute top-0 w-40 bg-white dark:bg-gray-800 rounded-md shadow-xl opacity-0 invisible group-hover/language:opacity-100 group-hover/language:visible transition-all duration-300 z-50 dark:border-gray-700"
                    :class="languageSubmenuPosition"
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

                <UButton
                  color="error"
                  variant="link"
                  @click="handleLogout"
                  class="block w-full cursor-pointer rounded-none text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary"
                >
                  <span>{{ $t('user.logout') }}</span>
                </UButton>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <UButton
            @click="handleLoginClick"
            variant="link"
            class="px-4 py-2 text-sm font-medium text-primary hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer"
          >
            {{ $t('login.login') }}
          </UButton>
        </template>
      </div>

      <!-- 移动端汉堡菜单按钮 -->
      <UButton
        @click="toggleMobileMenu"
        variant="link"
        class="mobile-menu-container md:hidden p-1 flex items-center cursor-pointer justify-center rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
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

                <!-- 移动端主题切换 -->
                <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      {{ $t('common.toggleTheme') || '主题' }}
                    </span>
                    <ColorScheme placeholder="..." tag="span">
                      <UButton
                        variant="ghost"
                        @click="toggleColorMode"
                        class="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <div class="relative w-5 h-5 flex items-center justify-center">
                          <transition name="icon-transition" mode="out-in">
                            <Icon
                              :key="isDarkMode ? 'sun' : 'moon'"
                              :name="isDarkMode ? 'mynaui:sun' : 'mynaui:moon'"
                              class="w-5 h-5 text-gray-700 dark:text-gray-300 transition-all duration-300 ease-in-out"
                            />
                          </transition>
                        </div>
                      </UButton>
                    </ColorScheme>
                  </div>
                </div>

                <!-- 移动端语言切换 -->
                <div class="px-4 py-2">
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

                <button
                  @click="handleLogout"
                  class="block w-full cursor-pointer text-left px-4 py-2 text-red-400 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  {{ $t('user.logout') }}
                </button>
              </template>
              <template v-else>
                <UButton
                  @click="handleLoginClick"
                  variant="link"
                  class="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                >
                  {{ $t('login.login') }}
                </UButton>
              </template>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<style scoped>
.icon-transition-enter-active,
.icon-transition-leave-active {
  transition: all 0.3s ease-in-out;
}

.icon-transition-enter-from {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}

.icon-transition-leave-to {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}
</style>

<script lang="ts" setup>
  import type { Category } from '~/types/category';
  import type { ConfigControllerGetPublicResponse } from '~/api';
  import { navigateToLogin } from '~/utils/auth';
  import { useUserStore } from '~/stores/user';
  import { confirmLogout } from '~/utils/logout';
  type Config = ConfigControllerGetPublicResponse['data'];
  const siteConfig = inject<Config>('siteConfig');
  const userStore = useUserStore();
  const route = useRoute();
  const router = useRouter();
  const localePath = useLocalePath();
  // 消息相关数据
  const { unreadCount } = useMessageCount();
  const { totalCount } = useMessage();

  // 语言切换相关
  const { locale: currentLocale, locales, setLocale } = useI18n();

  // 主题切换相关
  const colorMode = useColorMode();

  const toggleColorMode = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  };

  // 确保主题状态在客户端正确获取
  const isDarkMode = computed(() => {
    // 使用 ColorScheme 组件时，可以安全地访问 colorMode.value
    return colorMode.value === 'dark';
  });

  // 搜索相关
  const searchQuery = ref('');

  const handleSearch = () => {
    if (searchQuery.value.trim()) {
      router.push({ path: localePath('/search'), query: { q: searchQuery.value } });
    }
  };

  // 处理登录点击
  const handleLoginClick = () => {
    navigateToLogin();
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
  const languageMenuRef = ref<HTMLElement>();

  // 语言子菜单位置计算
  const languageSubmenuPosition = computed(() => {
    if (!languageMenuRef.value) return 'left-full ml-1';

    const rect = languageMenuRef.value.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const submenuWidth = 160; // w-40 = 160px
    const margin = 4; // ml-1 = 4px

    // 检查右侧是否有足够空间
    const rightSpace = windowWidth - rect.right - margin;

    if (rightSpace >= submenuWidth) {
      return 'left-full ml-1'; // 右侧显示
    } else {
      return 'right-full mr-1'; // 左侧显示
    }
  });

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

  // 监听窗口大小变化，重新计算语言子菜单位置
  const handleResize = () => {
    // 触发响应式更新
    languageSubmenuPosition.value;
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('click', handleClickOutside);
  });

  // 处理登出
  const handleLogout = async () => {
    await confirmLogout();
    closeMobileMenu();
  };
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
