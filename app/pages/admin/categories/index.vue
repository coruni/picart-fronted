<template>
  <div class="flex flex-col min-h-full relative z-10">
    <Title>{{ $t('admin.categories.title') }}</Title>
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
          <span class="font-medium">{{ $t('admin.categories.searchAndFilter') }}</span>
        </div>
      </UButton>
      <template #content>
        <div
          class="p-4 bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border-t border-gray-200 dark:border-gray-700"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UInput v-model="filters.name" :placeholder="t('common.table.name')" class="w-full" />
            <UInput
              v-model="filters.description"
              :placeholder="t('common.table.description')"
              class="w-full"
            />
            <UButton color="primary" class="w-full" @click="handleSearch">
              {{ $t('common.button.search') }}
            </UButton>
          </div>
        </div>
      </template>
    </UCollapsible>

    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
      <h1 class="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">
        {{ t('admin.categories.title') }}
      </h1>
      <UButton icon="mynaui:plus" class="w-full sm:w-auto cursor-pointer" @click="onCreate">
        {{ t('common.button.create') }}
      </UButton>
    </div>

    <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 flex-1">
      <UTable
        ref="table"
        :key="tableKey"
        v-model:pagination="pagination"
        sticky="header"
        :loading="categories.pending.value"
        loading-color="primary"
        loading-animation="carousel"
        :data="tableData as any"
        :columns="columns as any"
        :get-sub-rows="(row: any) => row.children"
        :ui="{
          td: 'empty:hidden',
          tr: '[&:has(td:only-child:empty)]:hidden'
        }"
        class="h-full"
      />
    </div>

    <div
      class="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-default pt-4"
    >
      <!-- 页面大小选择器 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400"
          >{{ $t('common.table.itemsPerPage') }}:</span
        >
        <USelect
          :model-value="pagination.pageSize"
          :items="[10, 20, 50, 100]"
          class="w-20"
          @update:model-value="value => handlePageSizeChange(value as number)"
        />
      </div>

      <!-- 分页器 -->
      <UPagination
        :page="currentPage"
        :items-per-page="pagination.pageSize"
        :total="totalItems"
        color="neutral"
        @update:page="handlePageChange"
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
  import type { Category } from '~/types/category';
  import { useI18n } from 'vue-i18n';
  import { categoryControllerFindAll, categoryControllerRemove } from '~/api';
  import type { Row } from '@tanstack/vue-table';

  const router = useRouter();
  const route = useRoute();
  const UButton = resolveComponent('UButton');
  const UBadge = resolveComponent('UBadge');
  const UDropdownMenu = resolveComponent('UDropdownMenu');
  const UModal = resolveComponent('UModal');
  const toast = useToast();
  const table = useTemplateRef('table');
  const { t } = useI18n();

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  // 分页状态 - 使用URL查询参数持久化
  const pagination = ref({
    pageIndex: parseInt(route.query.pageIndex as string) || 0,
    pageSize: parseInt(route.query.pageSize as string) || 20
  });

  // 当前页面计算属性和表格key
  const currentPage = computed(() => pagination.value.pageIndex + 1);
  const tableKey = ref(0); // 强制重新渲染表格

  // 筛选状态 - 从URL查询参数初始化
  const showFilters = ref(false);
  const filters = ref({
    name: (route.query.name as string) || '',
    description: (route.query.description as string) || ''
  });

  // 删除确认模态框状态
  const showDeleteModal = ref(false);
  const currentCategoryId = ref<number | null>(null);

  // 更新URL查询参数
  const updateQueryParams = () => {
    const query: Record<string, string> = {};

    // 分页参数
    if (pagination.value.pageIndex > 0) {
      query.pageIndex = pagination.value.pageIndex.toString();
    }
    if (pagination.value.pageSize !== 20) {
      query.pageSize = pagination.value.pageSize.toString();
    }

    // 筛选参数
    if (filters.value.name) {
      query.name = filters.value.name;
    }
    if (filters.value.description) {
      query.description = filters.value.description;
    }

    // 更新URL
    router.replace({ query });
  };

  // 搜索功能
  const handleSearch = () => {
    pagination.value.pageIndex = 0;
    updateQueryParams();
    tableKey.value++; // 强制重新渲染
  };

  // 页面变化处理函数
  const handlePageChange = (newPage: number) => {
    pagination.value.pageIndex = newPage - 1;
    updateQueryParams();
    tableKey.value++; // 强制重新渲染
  };

  // 页面大小变化处理函数
  const handlePageSizeChange = (newPageSize: number | string) => {
    const pageSize = typeof newPageSize === 'string' ? parseInt(newPageSize) : newPageSize;
    pagination.value.pageSize = pageSize;
    pagination.value.pageIndex = 0; // 重置到第一页
    updateQueryParams();
    tableKey.value++; // 强制重新渲染
  };

  // 防抖筛选
  const onFilterChange = debounce(() => {
    table.value?.tableApi?.setPageIndex(0);
  }, 300);

  const columns: TableColumn<Category>[] = [
    {
      accessorKey: 'id',
      header: '#',
      cell: ({ row }) => {
        return h('span', { class: 'font-mono' }, `#${row.getValue('id')}`);
      }
    },
    {
      accessorKey: 'name',
      header: t('common.table.name'),
      cell: ({ row }) => {
        const avatar = row.getValue('avatar') as string;
        const name = row.getValue('name') as string;
        const depth = row.depth;
        // 使用原始数据判断是否有子项
        const hasChildren = row.original.children && row.original.children.length > 0;
        const childrenCount = row.original.children?.length || 0;

        const elements = [];

        // 展开/收起按钮
        if (hasChildren) {
          elements.push(
            h(UButton, {
              icon: row.getIsExpanded() ? 'mynaui:chevron-down' : 'mynaui:chevron-right',
              variant: 'ghost',
              color: 'neutral',
              size: 'xs',
              onClick: () => row.toggleExpanded(),
              class: 'cursor-pointer'
            })
          );
        } else {
          // 占位符，保持对齐
          elements.push(h('div', { class: 'w-6' }));
        }

        // 头像
        if (avatar) {
          elements.push(
            h('img', {
              src: avatar,
              alt: name,
              class: 'w-6 h-6 rounded-full object-cover'
            })
          );
        }

        // 名称
        elements.push(h('span', { class: 'font-medium' }, name));

        // 子分类数量标识
        if (hasChildren) {
          elements.push(
            h(
              UBadge,
              {
                color: 'primary',
                variant: 'subtle',
                size: 'xs'
              },
              () => `${childrenCount}`
            )
          );
        }

        return h(
          'div',
          {
            class: 'flex items-center gap-2',
            style: { paddingLeft: `${depth * 1.5}rem` }
          },
          elements
        );
      }
    },
    {
      accessorKey: 'description',
      header: t('common.table.description'),
      cell: ({ row }) => {
        const description = row.getValue('description') as string;
        return h(
          'span',
          {
            class: 'text-sm text-gray-600 dark:text-gray-400',
            title: description || t('admin.categories.noDescription')
          },
          description || '-'
        );
      }
    },
    {
      accessorKey: 'articleCount',
      header: t('common.table.articleCount'),
      cell: ({ row }) => {
        const count = Number(row.getValue('articleCount') || 0);
        return h('span', { class: 'font-mono' }, count);
      }
    },
    {
      accessorKey: 'sort',
      header: t('common.table.sort'),
      cell: ({ row }) => {
        const sort = row.getValue('sort') as number;
        return h('span', { class: 'font-mono text-sm' }, sort);
      }
    },
    {
      accessorKey: 'status',
      header: t('common.table.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return h(
          UBadge,
          {
            color: status === 'ACTIVE' ? 'green' : 'gray',
            variant: 'subtle',
            class: 'text-xs'
          },
          () => status || 'UNKNOWN'
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: t('common.table.createdAt'),
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string;
        return h(
          'time',
          {
            datetime: date,
            class: 'text-sm text-gray-500'
          },
          new Date(date).toLocaleDateString()
        );
      }
    },
    {
      id: 'actions',
      header: t('common.table.actions'),
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

  const getRowItems = (row: Row<Category>) => {
    return [
      {
        type: 'label',
        label: t('common.table.actions')
      },
      {
        label: t('common.table.edit'),
        class: 'cursor-pointer',
        onClick: () => {
          navigateTo(`/admin/categories/${row.original.id}`);
        }
      },
      {
        label: t('common.table.delete'),
        class: 'cursor-pointer',
        color: 'error',
        onClick: () => {
          currentCategoryId.value = row.original.id!;
          showDeleteModal.value = true;
        }
      }
    ];
  };

  // 确认删除分类
  const confirmDelete = async () => {
    if (!currentCategoryId.value) return;

    try {
      await categoryControllerRemove({
        composable: '$fetch',
        path: {
          id: currentCategoryId.value.toString()
        }
      });
      categories.refresh?.();
    } catch (error) {
      console.error('Failed to delete category:', error);
    } finally {
      showDeleteModal.value = false;
      currentCategoryId.value = null;
    }
  };

  const categories = await categoryControllerFindAll({
    composable: 'useFetch',
    key: 'categories',
    query: computed(() => ({
      page: pagination.value.pageIndex + 1,
      limit: pagination.value.pageSize,
      ...(filters.value.name && { name: filters.value.name }),
      ...(filters.value.description && { description: filters.value.description })
    }))
  });

  // 计算属性：表格数据（树形结构）
  const tableData = computed(() => {
    const data = categories.data.value?.data?.data || [];
    // 直接返回带有 children 的数据，UTable 会自动处理树形结构
    return data;
  });

  // 计算属性：总条目数
  const totalItems = computed(() => {
    return categories.data.value?.data?.meta?.total || 0;
  });

  const onCreate = () => {
    router.push('categories/create');
  };
</script>
