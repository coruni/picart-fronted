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
    
    <!-- 删除确认模态框 -->
    <UModal v-model:open="showDeleteModal" :close-on-backdrop="false" :ui="{ footer: 'justify-end' }">
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
  import type { Category } from '~~/types/category';
  import { useI18n } from 'vue-i18n';
  import { categoryControllerFindAll, categoryControllerRemove } from '~~/api';
  import type { Row } from '@tanstack/vue-table';
  const router = useRouter();
  const UButton = resolveComponent('UButton');
  const UDropdownMenu = resolveComponent('UDropdownMenu');
  const UModal = resolveComponent('UModal');
  const toast = useToast();
  const table = useTemplateRef('table');
  const { t } = useI18n();
  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  // 分页状态 - 注意这里使用 pageIndex 从 0 开始
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

  // 防抖筛选
  const onFilterChange = debounce(() => {
    table.value?.tableApi?.setPageIndex(0);
  }, 300);

  const columns: TableColumn<Category>[] = [
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
      accessorKey: 'parentId',
      header: t('common.table.parent'),
      cell: ({ row }) => {
        const parentId = row.getValue('parentId');
        if (!parentId || parentId === row.original.id) return '-';
        return parentId;
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

  // 计算属性：表格数据
  const tableData = computed(() => {
    const data = categories.data.value?.data?.data || [];
    return data as Category[];
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
  onMounted(() => {});
</script>
