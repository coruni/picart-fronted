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
            <UButton @click="handleSearch" color="primary" class="w-full">
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
      <UButton icon="mynaui:plus" @click="onCreate" class="w-full sm:w-auto cursor-pointer">
        {{ t('common.button.create') }}
      </UButton>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      sticky="header"
      :loading="categories.pending.value"
      loading-color="primary"
      loading-animation="carousel"
      :data="tableData"
      :columns="columns"
      :grouping="['parentId']"
      :grouping-options="groupingOptions"
      :key="tableKey"
      :ui="{
        root: 'min-w-full',
        td: 'empty:p-0'
      }"
      class="flex-1"
    >
      <!-- 分组标题模板 -->
      <template #title-cell="{ row }">
        <div
          v-if="row.getIsGrouped()"
          class="flex items-center justify-between w-full p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <UButton
              variant="outline"
              color="neutral"
              size="xs"
              :icon="row.getIsExpanded() ? 'mynaui:minus' : 'mynaui:plus'"
              @click="row.toggleExpanded()"
            />

            <div class="flex items-center gap-2">
              <img
                v-if="getParentCategory(row)?.avatar"
                :src="getParentCategory(row)?.avatar"
                :alt="getParentCategory(row)?.name"
                class="w-8 h-8 rounded-full object-cover"
              />
              <div class="flex flex-col">
                <strong class="text-lg font-semibold">{{ getGroupTitle(row) }}</strong>
                <span class="text-sm text-gray-500">{{
                  getParentCategory(row)?.description || $t('admin.categories.noDescription')
                }}</span>
              </div>
              <UBadge color="blue" variant="subtle"
                >{{ row.subRows?.length || 0 }} {{ $t('admin.categories.subCategories') }}</UBadge
              >
            </div>
          </div>

          <!-- 主分类操作按钮 -->
          <div class="flex items-center gap-2">
            <UDropdownMenu
              :content="{ align: 'end' }"
              :items="getParentCategoryActions(row)"
              aria-label="Actions dropdown"
            >
              <template #default>
                <UButton
                  icon="mynaui:dots-vertical-solid"
                  color="neutral"
                  variant="ghost"
                  class="text-2xl cursor-pointer"
                  aria-label="Actions dropdown"
                />
              </template>
            </UDropdownMenu>
          </div>
        </div>
      </template>
    </UTable>

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
          @update:model-value="value => handlePageSizeChange(value as number)"
          class="w-20"
        />
      </div>

      <!-- 分页器 -->
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
  import { getPaginationRowModel, getGroupedRowModel } from '@tanstack/vue-table';
  import { debounce } from 'lodash-es';
  import type { TableColumn } from '@nuxt/ui';
  import type { Category } from '~/types/category';
  import type { GroupingOptions } from '@tanstack/vue-table';
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

  // 分组选项 - 优化配置
  const groupingOptions = ref<GroupingOptions>({
    groupedColumnMode: 'remove',
    getGroupedRowModel: getGroupedRowModel(),
    manualGrouping: false,
    onGroupingChange: () => {
      // 分组变化时的处理
    }
  });

  // 防抖筛选
  const onFilterChange = debounce(() => {
    table.value?.tableApi?.setPageIndex(0);
  }, 300);

  // 获取父分类信息（用于分组标题）
  const getParentCategory = (row: Row<Category>) => {
    if (row.groupingColumnId === 'parentId') {
      const parentId = row.groupingValue;
      // 查找父分类
      return tableData.value.find(cat => cat.id === parentId) || null;
    }
    return null;
  };

  // 获取分组标题
  const getGroupTitle = (row: Row<Category>) => {
    if (row.groupingColumnId === 'parentId') {
      const parentCategory = getParentCategory(row);
      return parentCategory?.name || '未分类';
    }
    return row.original.name;
  };

  // 获取父分类的操作菜单
  const getParentCategoryActions = (row: Row<Category>) => {
    const parentCategory = getParentCategory(row);
    if (!parentCategory) return [];

    return [
      {
        type: 'label',
        label: t('common.table.actions')
      },
      {
        label: t('common.table.edit'),
        class: 'cursor-pointer',
        onClick: () => {
          navigateTo(`/admin/categories/${parentCategory.id}`);
        }
      },
      {
        label: t('common.table.delete'),
        class: 'cursor-pointer',
        color: 'error',
        onClick: () => {
          currentCategoryId.value = parentCategory.id!;
          showDeleteModal.value = true;
        }
      }
    ];
  };

  const columns: TableColumn<Category>[] = [
    {
      accessorKey: 'id',
      header: '#',
      cell: ({ row }) => {
        if (row.getIsGrouped()) {
          return h(
            'div',
            { class: 'text-sm text-gray-500' },
            `${row.subRows?.length || 0} ${t('admin.categories.subCategories')}`
          );
        }
        return h('span', { class: 'font-mono' }, `#${row.getValue('id')}`);
      },
      aggregationFn: 'count'
    },
    {
      accessorKey: 'name',
      header: t('common.table.name'),
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null;
        const avatar = row.getValue('avatar') as string;
        const name = row.getValue('name') as string;
        return h('div', { class: 'flex items-center gap-2' }, [
          avatar &&
            h('img', {
              src: avatar,
              alt: name,
              class: 'w-6 h-6 rounded-full object-cover'
            }),
          h('span', { class: 'font-medium' }, name)
        ]);
      },
      aggregationFn: 'count'
    },
    {
      accessorKey: 'description',
      header: t('common.table.description'),
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null;
        const description = row.getValue('description') as string;
        return h(
          'span',
          {
            class: 'text-sm text-gray-600 dark:text-gray-400',
            title: description || t('admin.categories.noDescription')
          },
          description || '-'
        );
      },
      aggregationFn: 'uniqueCount'
    },
    {
      accessorKey: 'articleCount',
      header: t('common.table.articleCount'),
      cell: ({ row }) => {
        const count = Number(row.getValue('articleCount') || 0);
        if (row.getIsGrouped()) {
          return h('div', { class: 'text-center' }, [
            h('div', { class: 'text-lg font-bold text-primary' }, count),
            h('div', { class: 'text-xs text-gray-500' }, t('admin.categories.totalArticles'))
          ]);
        }
        return h('span', { class: 'font-mono' }, count);
      },
      aggregationFn: 'sum'
    },
    {
      accessorKey: 'sort',
      header: t('common.table.sort'),
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null;
        const sort = row.getValue('sort') as number;
        return h('span', { class: 'font-mono text-sm' }, sort);
      },
      aggregationFn: 'mean'
    },
    {
      accessorKey: 'status',
      header: t('common.table.status'),
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null;
        const status = row.getValue('status') as string;
        return h(
          UBadge,
          {
            color: status === 'ACTIVE' ? 'green' : 'gray',
            variant: 'subtle',
            class: 'text-xs'
          },
          status || 'UNKNOWN'
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: t('common.table.createdAt'),
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null;
        const date = row.getValue('createdAt') as string;
        return h(
          'time',
          {
            datetime: date,
            class: 'text-sm text-gray-500'
          },
          new Date(date).toLocaleDateString()
        );
      },
      aggregationFn: 'max'
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null;
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

  // 优化数据扁平化逻辑 - 更好地处理父子关系
  const flattenedData = computed(() => {
    const data = categories.data.value?.data?.data || [];
    const flattened: (Category & { parentId?: number | null })[] = [];

    data.forEach(category => {
      // 添加主分类（parentId 为 null 或 undefined）
      flattened.push({
        ...category,
        parentId: category.parentId || null
      });

      // 添加子分类
      if (category.children && category.children.length > 0) {
        category.children.forEach(child => {
          flattened.push({
            ...child,
            parentId: child.parentId || category.id
          });
        });
      }
    });

    return flattened;
  });

  // 计算属性：表格数据
  const tableData = computed(() => {
    return [...flattenedData.value];
  });

  // 计算属性：总条目数
  const totalItems = computed(() => {
    return categories.data.value?.data?.meta?.total || 0;
  });

  const onCreate = () => {
    router.push('categories/create');
  };

  // 调试信息
  onMounted(() => {
    console.log('Categories data:', tableData.value);
  });
</script>
