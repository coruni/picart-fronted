<template>
  <div class="flex flex-col min-h-full relative z-10">
    <!-- 搜索和筛选面板 -->
    <UCollapsible v-model:open="showFilters" class="mb-6">
      <UButton
        class="group w-full justify-between p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm"
        color="neutral"
        variant="ghost"
        trailing-icon="mynaui:chevron-down"
        :ui="{
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
        }"
      >
        <div class="flex items-center gap-2">
          <UIcon name="mynaui:search" class="w-5 h-5" />
          <span class="font-medium">{{ $t('admin.banners.searchAndFilter') }}</span>
        </div>
      </UButton>
      <template #content>
        <div
          class="p-4 bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border-t border-gray-200 dark:border-gray-700"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UInput v-model="filters.title" :placeholder="t('banners.title')" class="w-full" />
            <UButton @click="handleSearch" color="primary" class="w-full">
              {{ $t('common.button.search') }}
            </UButton>
          </div>
        </div>
      </template>
    </UCollapsible>
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
      <h1 class="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">
        {{ t('admin.menu.banners') }}
      </h1>
      <UButton @click="onCreate()" class="w-full sm:w-auto cursor-pointer">
        {{ t('common.button.create') }}
      </UButton>
    </div>

    <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        sticky="header"
        :loading="banners.pending.value"
        loading-color="primary"
        loading-animation="carousel"
        :data="tableData"
        :columns="columns"
        :key="tableKey"
        class="min-w-[600px] sm:min-w-0"
      />
    </div>
    <div class="flex justify-center border-t border-default pt-4">
      <UPagination
        :page="currentPage"
        :items-per-page="pagination.pageSize"
        :total="totalItems"
        @update:page="handlePageChange"
        color="neutral"
      />
    </div>

    <!-- 删除确认模态框 -->
    <UModal
      v-model:open="showDeleteModal"
      :close-on-backdrop="false"
      :ui="{ footer: 'justify-end' }"
    >
      <template #header>
        {{ t('common.modal.confirmDelete') }}
      </template>
      <template #body>
        {{ t('common.modal.confirmDeleteMessage') }}
      </template>
      <template #footer>
        <UButton variant="outline" @click="showDeleteModal = false" class="cursor-pointer">
          {{ t('common.button.cancel') }}
        </UButton>
        <UButton color="error" @click="confirmDelete" class="cursor-pointer">
          {{ t('common.button.confirm') }}
        </UButton>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
  import { getPaginationRowModel } from '@tanstack/vue-table';
  import { debounce } from 'lodash-es';
  import type { TableColumn } from '@nuxt/ui';
  import { useI18n } from 'vue-i18n';
  import { bannersControllerFindAll, bannersControllerDeleteById } from '~~/api';
  import type { BannersControllerFindAllResponse } from '~~/api';
  type Banner = BannersControllerFindAllResponse['data']['data'][0];
  import type { Row } from '@tanstack/vue-table';

  const UButton = resolveComponent('UButton');
  const UDropdownMenu = resolveComponent('UDropdownMenu');
  const UBadge = resolveComponent('UBadge');
  const UModal = resolveComponent('UModal');
  const router = useRouter();
  const toast = useToast();
  const table = useTemplateRef('table');
  const { t } = useI18n();
  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  // 搜索功能 - 不需要手动刷新，reactive query 会自动处理
  const handleSearch = () => {
    pagination.value.pageIndex = 0;
    tableKey.value++; // 强制重新渲染
  };

  // 筛选状态
  const showFilters = ref(false);
  const filters = ref({
    title: ''
  });

  // 分页状态
  const pagination = ref({
    pageIndex: 0,
    pageSize: 20
  });

  // 关键修改点2: 添加当前页面计算属性和表格key
  const currentPage = computed(() => pagination.value.pageIndex + 1);
  const tableKey = ref(0); // 强制重新渲染表格

  // 删除确认模态框状态
  const showDeleteModal = ref(false);
  const currentBannerId = ref<number | null>(null);

  // 关键修改点4: 添加页面变化处理函数
  const handlePageChange = (newPage: number) => {
    pagination.value.pageIndex = newPage - 1;
    tableKey.value++; // 强制重新渲染
  };

  const columns: TableColumn<Banner>[] = [
    {
      accessorKey: 'id',
      header: '#'
    },
    {
      accessorKey: 'title',
      header: t('banners.title')
    },
    {
      accessorKey: 'imageUrl',
      header: t('banners.image'),
      cell: ({ row }) => {
        return h('img', {
          src: row.getValue('imageUrl'),
          class: 'w-16 h-16 object-cover rounded',
          alt: row.getValue('title')
        });
      }
    },
    {
      accessorKey: 'url',
      header: t('banners.link')
    },
    {
      accessorKey: 'sortOrder',
      header: t('banners.sortOrder')
    },
    {
      accessorKey: 'isActive',
      header: t('banners.status'),
      cell: ({ row }) => {
        const isActive = row.getValue('isActive');
        return h(
          UBadge,
          {
            class: 'capitalize',
            variant: 'subtle',
            color: isActive ? 'success' : 'neutral'
          },
          () => (isActive ? t('banners.active') : t('banners.inactive'))
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: t('common.table.createdAt')
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return h(
          'div',
          { class: 'text-right' },
          h(
            UDropdownMenu,
            {
              content: {
                align: 'end'
              },
              items: getRowItems(row),
              'aria-label': 'Actions dropdown'
            },
            () =>
              h(UButton, {
                icon: 'mynaui:dots-vertical-solid',
                color: 'neutral',
                variant: 'ghost',
                class: 'ml-auto text-2xl cursor-pointer',
                'aria-label': 'Actions dropdown'
              })
          )
        );
      }
    }
  ];

  const getRowItems = (row: Row<Banner>) => {
    return [
      {
        type: 'label',
        label: t('common.table.actions')
      },
      {
        label: t('common.table.edit'),
        class: 'cursor-pointer',
        onClick: () => {
          router.push(`banners/${row.original.id}`);
        }
      },
      {
        label: t('common.table.delete'),
        class: 'cursor-pointer',
        color: 'error',
        onClick: () => {
          currentBannerId.value = row.original.id!;
          showDeleteModal.value = true;
        }
      }
    ];
  };

  // 确认删除轮播图
  const confirmDelete = async () => {
    if (!currentBannerId.value) return;

    try {
      await bannersControllerDeleteById({
        composable: '$fetch',
        path: {
          id: currentBannerId.value.toString()
        }
      });
      toast.add({
        title: t('common.message.deleteSuccess'),
        color: 'success'
      });
      banners.refresh?.();
    } catch (error) {
      toast.add({
        title: t('common.message.deleteFailed'),
        color: 'error'
      });
      console.error('Failed to delete banner:', error);
    } finally {
      showDeleteModal.value = false;
      currentBannerId.value = null;
    }
  };

  const onFilterChange = debounce(() => {
    // 重置到第一页
    pagination.value.pageIndex = 0;
    // 刷新数据
    banners.refresh?.();
  }, 300);

  const banners = await bannersControllerFindAll({
    composable: 'useFetch',
    key: 'banners',
    query: computed(() => ({
      page: pagination.value.pageIndex + 1,
      limit: pagination.value.pageSize,
      ...(filters.value.title && { title: filters.value.title })
    }))
  });

  // 计算属性：表格数据
  const tableData = computed(() => {
    const data = banners.data.value?.data?.data || [];
    return [...data];
  });

  // 计算属性：总条目数
  const totalItems = computed(() => {
    return banners.data.value?.data?.meta?.total || 0;
  });

  // 移除 watch，让 reactive query 自动处理数据获取

  const onCreate = () => {
    router.push('banners/create');
  };
</script>
