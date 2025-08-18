<template>
  <div class="flex flex-col min-h-full">
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
          <span class="font-medium">{{ $t('admin.tags.searchAndFilter') }}</span>
        </div>
      </UButton>
      <template #content>
        <div
          class="p-4 bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border-t border-gray-200 dark:border-gray-700"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UInput v-model="filters.name" :placeholder="t('admin.tags.name')" class="w-full" />
            <UInput
              v-model="filters.description"
              :placeholder="t('admin.tags.description')"
              class="w-full"
            />
            <UButton @click="handleSearch" color="primary" class="w-full">
              {{ $t('common.button.search') }}
            </UButton>
          </div>
        </div>
      </template>
    </UCollapsible>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">{{ t('admin.tags.title') }}</h1>
      <UButton color="primary" @click="$router.push('/admin/tags/create')">
        <template #leading>
          <span class="mynaui:plus" />
        </template>
        {{ t('common.button.create') }}
      </UButton>
    </div>
    <UTable
      ref="table"
      v-model:pagination="pagination"
      sticky="header"
      :loading="tags.pending.value"
      loading-color="primary"
      loading-animation="carousel"
      :data="tableData"
      :columns="columns"
      :key="tableKey"
      class="flex-1"
    />
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
        <UButton variant="outline" class="cursor-pointer" @click="showDeleteModal = false">
          {{ t('common.button.cancel') }}
        </UButton>
        <UButton color="error" class="cursor-pointer" @click="confirmDelete">
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
  import { tagControllerFindAll, tagControllerRemove } from '~~/api';
  import type { Row } from '@tanstack/vue-table';
  import type { Tag } from '~~/types/tag';

  const UButton = resolveComponent('UButton');
  const UDropdownMenu = resolveComponent('UDropdownMenu');
  const UModal = resolveComponent('UModal');
  const toast = useToast();
  const table = useTemplateRef('table');
  const { t } = useI18n();

  // 分页状态
  const pagination = ref({
    pageIndex: 0,
    pageSize: 20
  });

  // 关键修改点2: 添加当前页面计算属性和表格key
  const currentPage = computed(() => pagination.value.pageIndex + 1);
  const tableKey = ref(0); // 强制重新渲染表格

  // 筛选状态
  const showFilters = ref(false);
  const filters = ref({
    name: '',
    description: ''
  });

  // 删除确认模态框状态
  const showDeleteModal = ref(false);
  const currentTagId = ref<number | null>(null);

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  // 搜索功能 - 关键修改点3: 修改搜索逻辑
  const handleSearch = () => {
    pagination.value.pageIndex = 0;
    tableKey.value++; // 强制重新渲染
  };

  // 防抖筛选
  const onFilterChange = debounce(() => {
    table.value?.tableApi?.setPageIndex(0);
  }, 300);

  // 关键修改点4: 添加页面变化处理函数
  const handlePageChange = (newPage: number) => {
    pagination.value.pageIndex = newPage - 1;
    tableKey.value++; // 强制重新渲染
  };

  const columns: TableColumn<any>[] = [
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
                class: 'ml-auto text-2xl cursor-pointer',
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
          navigateTo(`/admin/tags/${row.original.id}`);
        }
      },
      {
        label: t('common.table.delete'),
        class: 'cursor-pointer',
        color: 'error',
        onClick: () => {
          currentTagId.value = row.original.id!;
          showDeleteModal.value = true;
        }
      }
    ];
  };

  // 确认删除标签
  const confirmDelete = async () => {
    if (!currentTagId.value) return;

    try {
      await tagControllerRemove({
        composable: '$fetch',
        path: {
          id: currentTagId.value.toString()
        }
      });
      tags.refresh?.();
    } catch (error) {
      console.error('Failed to delete tag:', error);
    } finally {
      showDeleteModal.value = false;
      currentTagId.value = null;
    }
  };

  const tags = await tagControllerFindAll({
    composable: 'useFetch',
    key: 'tags',
    query: computed(() => ({
      page: pagination.value.pageIndex + 1,
      limit: pagination.value.pageSize,
      ...(filters.value.name && { name: filters.value.name }),
      ...(filters.value.description && { description: filters.value.description })
    }))
  });

  // 计算属性：表格数据
  const tableData = computed(() => {
    const data = tags.data.value?.data?.data || [];
    return [...data];
  });

  // 计算属性：总条目数
  const totalItems = computed(() => {
    return tags.data.value?.data?.meta?.total || 0;
  });

  // 移除 watch，让 reactive query 自动处理数据获取
</script>
