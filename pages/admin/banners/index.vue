<template>
  <div class="flex flex-col min-h-full relative z-10">
    <!-- 筛选面板 -->
    <UCollapsible class="mb-4" v-model:open="showFilters">
      <UButton
        :label="$t('common.table.filter')"
        color="neutral"
        variant="soft"
        trailing-icon="i-mynaui-chevron-down"
        block
      />
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <UInput
            v-model="filters.title"
            :placeholder="t('banners.title')"
            @update:model-value="onFilterChange"
          />
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
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
        class="min-w-[600px] sm:min-w-0"
      />
    </div>
    <div class="flex justify-center border-t border-default pt-4">
      <UPagination
        :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="p => table?.tableApi?.setPageIndex(p - 1)"
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

  // 筛选状态
  const showFilters = ref(false);
  const filters = ref({
    title: ''
  });

  // 分页状态
  const pagination = ref({ pageIndex: 0, pageSize: 20 });

  // 删除确认模态框状态
  const showDeleteModal = ref(false);
  const currentBannerId = ref<number | null>(null);

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
      title: filters.value.title || undefined
    }))
  });

  // 计算属性：表格数据
  const tableData = computed(() => {
    const data = banners.data.value?.data?.data || [];
    return data as Banner[];
  });

  // 监听分页变化
  watch(
    [() => pagination.value.pageIndex, () => pagination.value.pageSize],
    () => {
      banners.refresh?.();
    },
    { deep: true }
  );

  const onCreate = () => {
    router.push('banners/create');
  };
</script>
