<script setup lang="ts">
  import type { DropdownMenuItem } from '@nuxt/ui';
  import { useUserStore } from '~/stores/user';
  import { confirmLogout } from '~/utils/logout';

  defineProps<{
    collapsed?: boolean;
  }>();

  const { t } = useI18n();
  const userStore = useUserStore();
  const colorMode = useColorMode();
  const { locale: currentLocale, locales, setLocale } = useI18n();

  // 可用语言列表
  const availableLocales = computed(() => {
    return locales.value.map(locale => ({
      code: locale.code,
      name: locale.name || locale.code,
      flag: getLanguageFlag(locale.code)
    }));
  });

  // 获取语言旗帜
  const getLanguageFlag = (code: string) => {
    switch (code) {
      case 'en':
        return '🇺🇸';
      case 'zh':
        return '🇨🇳';
      case 'ja':
        return '🇯🇵';
      default:
        return '🏳️';
    }
  };

  // 当前语言显示
  const currentLanguageDisplay = computed(() => {
    const current = availableLocales.value.find(l => l.code === currentLocale.value);
    return `${current?.flag || '🏳️'} ${current?.name || currentLocale.value}`;
  });

  // 处理登出
  const handleLogout = async () => {
    await confirmLogout();
  };

  // 用户信息
  const user = computed(() => ({
    name: userStore.userInfo?.nickname || userStore.userInfo?.username || 'User',
    avatar: {
      src: userStore.userInfo?.avatar,
      alt: userStore.userInfo?.nickname || userStore.userInfo?.username || 'User'
    }
  }));

  // 菜单项
  const items = computed<DropdownMenuItem[][]>(() => [
    // 用户信息标签
    [
      {
        type: 'label',
        label: user.value.name,
        avatar: user.value.avatar
      }
    ],
    // 主题切换
    [
      {
        label: t('header.nav.profile'),
        icon: 'mynaui:user',
        to: '/user'
      },
      {
        label: t('user.orders.title'),
        icon: 'mynaui:cart',
        to: '/user/orders'
      },
      {
        label: t('header.nav.theme'),
        icon: 'mynaui:sun',
        children: [
          {
            label: t('header.nav.light'),
            icon: 'mynaui:sun',
            type: 'checkbox',
            checked: colorMode.value === 'light',
            onSelect(e: Event) {
              e.preventDefault();
              colorMode.preference = 'light';
            }
          },
          {
            label: t('header.nav.dark'),
            icon: 'mynaui:moon',
            type: 'checkbox',
            checked: colorMode.value === 'dark',
            onSelect(e: Event) {
              e.preventDefault();
              colorMode.preference = 'dark';
            }
          },
          {
            label: t('header.nav.system'),
            icon: 'mynaui:airplay',
            type: 'checkbox',
            checked: colorMode.value === 'system',
            onSelect(e: Event) {
              e.preventDefault();
              colorMode.preference = 'system';
            }
          }
        ]
      },
      {
        label: t('header.nav.language'),
        icon: 'i-lucide-languages',
        children: availableLocales.value.map(locale => ({
          label: `${locale.flag} ${locale.name}`,
          type: 'checkbox' as const,
          checked: currentLocale.value === locale.code,
          onSelect(e: Event) {
            e.preventDefault();
            setLocale(locale.code);
          }
        }))
      },
      {
        label: t('header.nav.logout'),
        icon: 'mynaui:logout',
        onSelect: handleLogout
      }
    ]
  ]);
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...user,
        label: user.name,
        trailingIcon: 'mynaui:chevron-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />
  </UDropdownMenu>
</template>
