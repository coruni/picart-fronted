<template>
  <div class="flex flex-col min-h-full relative z-10">
    <!-- 筛选面板 -->
    <UCollapsible class="mb-4" v-model:open="showFilters">
      <UButton
        :label="t('common.table.filter')"
        color="neutral"
        variant="soft"
        trailing-icon="i-mynaui-chevron-down"
        block
      />
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <UInput
            v-model="filters.name"
            :placeholder="t('common.table.name')"
            @update:model-value="onFilterChange"
          />
          <UInput
            v-model="filters.description"
            :placeholder="t('common.table.description')"
            @update:model-value="onFilterChange"
          />
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
      :grouping="['groupKey']"
      :grouping-options="groupingOptions"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }"
      :ui="{
        root: 'min-w-full',
        td: 'empty:p-0'
      }"
      class="flex-1"
    >
      <!-- 分组标题模板 -->
      <template #title-cell="{ row }">
        <div v-if="row.getIsGrouped()" class="flex items-center justify-between w-full">
          <div class="flex items-center">
            <span class="inline-block" :style="{ width: `calc(${row.depth} * 1rem)` }" />

            <UButton
              variant="outline"
              color="neutral"
              class="mr-2"
              size="xs"
              :icon="row.getIsExpanded() ? 'i-lucide-minus' : 'i-lucide-plus'"
              @click="row.toggleExpanded()"
            />

            <div class="flex items-center gap-2">
              <img
                v-if="getMainCategory(row)?.avatar"
                :src="getMainCategory(row)?.avatar"
                :alt="getMainCategory(row)?.name"
                class="w-8 h-8 rounded-full object-cover"
              />
              <strong class="text-lg">{{ getGroupTitle(row) }}</strong>
              <UBadge color="blue" variant="subtle"> 主分类 </UBadge>
            </div>
          </div>

          <!-- 主分类操作按钮 -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">{{ row.subRows?.length || 0 }} 个子分类</span>
            <UDropdownMenu
              :content="{ align: 'end' }"
              :items="getMainCategoryActions(row)"
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

    <div class="flex justify-center border-t border-default pt-4">
      <UPagination
        :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="p => table?.tableApi?.setPageIndex(p - 1)"
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
  import type { Category } from '~~/types/category';
  import type { GroupingOptions } from '@tanstack/vue-table';
  import { useI18n } from 'vue-i18n';
  import { categoryControllerFindAll, categoryControllerRemove } from '~~/api';
  import type { Row } from '@tanstack/vue-table';

  const router = useRouter();
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

  // 分页状态
  const pagination = ref({
    pageIndex: 0,
    pageSize: 20
  });

  // 筛选状态
  const showFilters = ref(false);
  const filters = ref({
    name: '',
    description: ''
  });

  // 删除确认模态框状态
  const showDeleteModal = ref(false);
  const currentCategoryId = ref<number | null>(null);

  // 分组选项
  const groupingOptions = ref<GroupingOptions>({
    groupedColumnMode: 'remove',
    getGroupedRowModel: getGroupedRowModel()
  });

  // 防抖筛选
  const onFilterChange = debounce(() => {
    table.value?.tableApi?.setPageIndex(0);
  }, 300);

  // 获取主分类信息（用于分组标题）
  const getMainCategory = (row: Row<Category>) => {
    if (row.groupingColumnId === 'groupKey') {
      // 根据 groupKey 查找主分类
      return tableData.value.find(cat => cat.id === row.groupingValue) || row.original;
    }
    return null;
  };

  // 获取分组标题
  const getGroupTitle = (row: Row<Category>) => {
    if (row.groupingColumnId === 'groupKey') {
      // 根据 groupKey 查找主分类名称
      const mainCategory = getMainCategory(row);
      return mainCategory?.name || '未知分类';
    }
    return row.original.name;
  };

  // 获取主分类的操作菜单
  const getMainCategoryActions = (row: Row<Category>) => {
    const mainCategory = getMainCategory(row);
    if (!mainCategory) return [];

    return [
      {
        type: 'label',
        label: t('common.table.actions')
      },
      {
        label: t('common.table.edit'),
        class: 'cursor-pointer',
        onClick: () => {
          navigateTo(`/admin/categories/${mainCategory.id}`);
        }
      },
      {
        label: t('common.table.delete'),
        class: 'cursor-pointer',
        color: 'error',
        onClick: () => {
          currentCategoryId.value = mainCategory.id!;
          showDeleteModal.value = true;
        }
      }
    ];
  };

  const columns: TableColumn<Category>[] = [
    {
      id: 'title',
      header: '分类信息'
    },
    {
      id: 'groupKey',
      accessorKey: 'groupKey'
    },
    {
      accessorKey: 'id',
      header: '#',
      cell: ({ row }) =>
        row.getIsGrouped() ? `${row.subRows?.length || 0} 个分类` : `#${row.getValue('id')}`,
      aggregationFn: 'count'
    },
    {
      accessorKey: 'name',
      header: t('common.table.name'),
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null;
        return row.getValue('name');
      },
      aggregationFn: 'count'
    },
    {
      accessorKey: 'description',
      header: t('common.table.description'),
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null;
        return row.getValue('description') || '-';
      },
      aggregationFn: 'uniqueCount'
    },
    {
      accessorKey: 'avatar',
      header: t('common.table.avatar'),
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null;
        return h('img', {
          src: row.getValue('avatar'),
          alt: row.getValue('name'),
          class: 'w-10 h-10 rounded-full object-cover'
        });
      }
    },
    {
      accessorKey: 'articleCount',
      header: t('common.table.articleCount'),
      cell: ({ row }) => {
        const count = Number(row.getValue('articleCount') || 0);
        return count;
      },
      aggregationFn: 'sum'
    },
    {
      accessorKey: 'sort',
      header: t('common.table.sort'),
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null;
        return row.getValue('sort');
      },
      aggregationFn: 'mean'
    },
    {
      accessorKey: 'createdAt',
      header: t('common.table.createdAt'),
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null;
        return h(
          'time',
          {
            datetime: row.getValue('createdAt')
          },
          new Date(row.getValue('createdAt')).toLocaleDateString()
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
      toast.add({
        title: t('common.message.deleteSuccess'),
        color: 'success'
      });
      categories.refresh?.();
    } catch (error) {
      toast.add({
        title: t('common.message.deleteFailed'),
        color: 'error'
      });
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
      name: filters.value.name || undefined
    }))
  });

  // 将嵌套数据扁平化 - 直接使用原始的 parentId 字段
  const flattenedData = computed(() => {
    const data = categories.data.value?.data?.data || [];
    const flattened: (Category & { groupKey?: number })[] = [];

    data.forEach(category => {
      // 为主分类添加 groupKey
      flattened.push({ ...category, groupKey: category.id });

      // 为子分类添加 groupKey（使用 parentId 关联主分类）
      if (category.children && category.children.length > 0) {
        category.children.forEach(child => {
          flattened.push({ ...child, groupKey: child.parentId });
        });
      }
    });

    return flattened;
  });

  // 计算属性：表格数据
  const tableData = computed(() => {
    return flattenedData.value;
  });

  // 监听分页和筛选变化
  watch(
    [() => pagination.value.pageIndex, () => pagination.value.pageSize, () => filters.value],
    () => {
      categories.refresh?.();
    },
    { deep: true }
  );

  const onCreate = () => {
    router.push('categories/create');
  };

  // 调试信息
  onMounted(() => {
    console.log('Categories data:', tableData.value);
  });
</script>
