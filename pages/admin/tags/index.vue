<template>
  <div class="flex flex-col min-h-full">
    <UTable
      ref="table"
      v-model:pagination="pagination"
      sticky="header"
      :loading="tags.pending.value"
      loading-color="primary"
      loading-animation="carousel"
      :data="tableData"
      :columns="columns"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }"
      class="flex-1"
    />
    <div class="flex justify-center border-t border-default pt-4">
      <UPagination
        :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="p => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { getPaginationRowModel } from '@tanstack/vue-table';
  import type { TableColumn } from '@nuxt/ui';
  import { useI18n } from 'vue-i18n';
  import { tagControllerFindAll } from '~~/api';
  import type { Row } from '@tanstack/vue-table';
  import type { Tag } from '~~/types/tag';

  const UButton = resolveComponent('UButton');
  const UDropdownMenu = resolveComponent('UDropdownMenu');
  const table = useTemplateRef('table');
  const { t } = useI18n();

  // 分页状态 - 注意这里使用 pageIndex 从 0 开始
  const pagination = ref({
    pageIndex: 0,
    pageSize: 20
  });

  definePageMeta({
    layout: 'dashboard'
  });

  const columns: TableColumn<Tag>[] = [
    {
      accessorKey: 'id',
      header: '#'
    },
    {
      accessorKey: 'name',
      header: t('common.table.name')
    },
    {
      accessorKey: 'description',
      header: t('common.table.description')
    },
    {
      accessorKey: 'avatar',
      header: t('common.table.avatar'),
      cell: ({ row }) => {
        return h('img', {
          src: row.getValue('avatar'),
          alt: row.getValue('name'),
          class: 'w-10 h-10 rounded-full object-cover'
        });
      }
    },

    {
      accessorKey: 'articleCount',
      header: t('common.table.articleCount')
    },
    {
      accessorKey: 'sort',
      header: t('common.table.sort')
    },
    {
      accessorKey: 'createdAt',
      header: t('common.table.createdAt'),
      cell: ({ row }) => {
        return h(
          'time',
          {
            datetime: row.getValue('createdAt')
          },
          new Date(row.getValue('createdAt')).toLocaleDateString()
        );
      }
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
                class: 'ml-auto text-2xl',
                'aria-label': 'Actions dropdown'
              })
          )
        );
      }
    }
  ];

  const getRowItems = (row: Row<Tag>) => {
    return [
      {
        type: 'label',
        label: t('common.table.actions')
      },
      {
        label: t('common.table.edit'),
        class: 'cursor-pointer',
        onClick: () => {
          console.log('Edit row:', row.original);
        }
      },
      {
        label: t('common.table.delete'),
        class: 'cursor-pointer',
        color: 'error',
        onClick: () => {
          console.log('Delete row:', row.original);
        }
      }
    ];
  };

  const tags = await tagControllerFindAll({
    composable: 'useAsyncData',
    query: computed(() => ({
      page: pagination.value.pageIndex + 1,
      limit: pagination.value.pageSize
    }))
  });

  // 计算属性：表格数据
  const tableData = computed(() => {
    const data = tags.data.value?.data?.data || [];
    return data as Tag[];
  });

  // 监听分页变化
  watch(
    [() => pagination.value.pageIndex, () => pagination.value.pageSize],
    () => {
      tags.refresh?.();
    },
    { deep: true }
  );

  // 调试信息
  onMounted(() => {});
</script>
