<template>
  <div class="flex flex-col min-h-full">
    <UTable
      ref="table"
      v-model:pagination="pagination"
      sticky="header"
      :loading="articles.pending.value"
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
  import type { Article } from '~~/types/article';
  import { useI18n } from 'vue-i18n';
  import { articleControllerFindAll } from '~~/api';
  import type { Row } from '@tanstack/vue-table';

  const UButton = resolveComponent('UButton');
  const UDropdownMenu = resolveComponent('UDropdownMenu');
  const UBadge = resolveComponent('UBadge');
  const table = useTemplateRef('table');
  const { t } = useI18n();

  // 分页状态
  const pagination = ref({
    pageIndex: 0,
    pageSize: 20
  });

  definePageMeta({
    layout: 'dashboard'
  });

  const columns: TableColumn<Article>[] = [
    {
      accessorKey: 'id',
      header: '#'
    },
    {
      accessorKey: 'title',
      header: t('common.table.title')
    },
    {
      accessorKey: 'summary',
      header: t('common.table.summary')
    },
    {
      accessorKey: 'status',
      header: t('common.table.status'),
      cell: ({ row }) => {
        const color = {
          PUBLISHED: 'success' as const,
          DRAFT: 'error' as const,
          REJECTED: 'neutral' as const
        }[row.getValue('status') as string];

        return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
          row.getValue('status')
        );
      }
    },
    {
      accessorKey: 'author',
      header: t('common.table.author'),
      cell: ({ row }) => {
        return row.original.author.nickname || row.original.author.name || '-';
      }
    },
    {
      accessorKey: 'likes',
      header: t('common.table.likes')
    },
    {
      accessorKey: 'collections',
      header: t('common.table.collections')
    },
    {
      accessorKey: 'views',
      header: t('common.table.views')
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

  const getRowItems = (row: Row<Article>) => {
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

  const articles = await articleControllerFindAll({
    composable: 'useAsyncData',
    query: computed(() => ({
      page: pagination.value.pageIndex + 1,
      limit: pagination.value.pageSize
    }))
  });

  // 计算属性：表格数据
  const tableData = computed(() => {
    const data = articles.data.value?.data?.data || [];
    return data as Article[];
  });

  // 监听分页变化
  watch(
    [() => pagination.value.pageIndex, () => pagination.value.pageSize],
    () => {
      articles.refresh?.();
    },
    { deep: true }
  );
</script>
