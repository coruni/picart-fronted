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
          <span class="font-medium">{{ $t('admin.users.searchAndFilter') }}</span>
        </div>
      </UButton>
      <template #content>
        <div
          class="p-4 bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border-t border-gray-200 dark:border-gray-700"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UInput
              v-model="filters.username"
              :placeholder="$t('admin.users.searchUsername')"
              class="w-full"
            />
            <UButton @click="handleSearch" color="primary" class="w-full">
              {{ $t('common.button.search') }}
            </UButton>
          </div>
        </div>
      </template>
    </UCollapsible>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      sticky="header"
      :loading="users.pending.value"
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
  import type { TableColumn } from '@nuxt/ui';
  import { useI18n } from 'vue-i18n';
  import { userControllerFindAll, userControllerRemove } from '~~/api';
  import type { Row } from '@tanstack/vue-table';
  import type { Role, Status, User } from '~~/types';

  const UButton = resolveComponent('UButton');
  const UDropdownMenu = resolveComponent('UDropdownMenu');
  const UBadge = resolveComponent('UBadge');
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

  // 搜索和筛选状态
  const showFilters = ref(false);
  const filters = ref({
    username: ''
  });

  // 删除确认模态框状态
  const showDeleteModal = ref(false);
  const currentUserId = ref<number | null>(null);

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  // 搜索功能 - 关键修改点3: 修改搜索逻辑
  const handleSearch = () => {
    pagination.value.pageIndex = 0;
    tableKey.value++; // 强制重新渲染
  };

  // 关键修改点4: 添加页面变化处理函数
  const handlePageChange = (newPage: number) => {
    pagination.value.pageIndex = newPage - 1;
    tableKey.value++; // 强制重新渲染
  };

  const columns: TableColumn<User>[] = [
    { accessorKey: 'id', header: '#' },
    { accessorKey: 'username', header: t('common.table.name') },
    { accessorKey: 'nickname', header: t('common.table.description') },
    {
      accessorKey: 'avatar',
      header: t('common.table.avatar'),
      cell: ({ row }) => {
        return h('img', {
          src: row.getValue('avatar'),
          alt: row.getValue('username'),
          class: 'w-10 h-10 rounded-full object-cover'
        });
      }
    },
    {
      accessorKey: 'roles',
      header: t('common.table.roles'),
      cell: ({ row }) => {
        return h('div', { class: 'flex flex-wrap' }, () => {
          return row.original.roles?.map((role: Role) => {
            return h(UBadge, { color: 'primary', variant: 'subtle' }, () => role.name || '');
          });
        });
      }
    },
    {
      accessorKey: 'status',
      header: t('common.table.status'),
      cell: ({ row }) => {
        const statusColor =
          { ACTIVE: 'success', INACTIVE: 'error', BANNED: 'warning' }[
            row.getValue('status') as Status
          ] || 'neutral';
        return h(UBadge, { color: statusColor, variant: 'subtle' }, () => row.getValue('status'));
      }
    },
    {
      accessorKey: 'createdAt',
      header: t('common.table.createdAt'),
      cell: ({ row }) => {
        return h(
          'time',
          { datetime: row.getValue('createdAt') },
          new Date(row.getValue('createdAt')).toLocaleDateString()
        );
      }
    },
    {
      accessorKey: 'updatedAt',
      header: t('common.table.updatedAt'),
      cell: ({ row }) => {
        return h(
          'time',
          { datetime: row.getValue('updatedAt') },
          new Date(row.getValue('updatedAt')).toLocaleDateString()
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
              content: { align: 'end' },
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

  const getRowItems = (row: Row<User>) => {
    return [
      {
        type: 'label',
        label: t('common.table.actions')
      },
      {
        label: t('common.table.edit'),
        class: 'cursor-pointer',
        onClick: () => {}
      },
      {
        label: t('common.table.delete'),
        class: 'cursor-pointer',
        color: 'error',
        onClick: () => {
          currentUserId.value = row.original.id!;
          showDeleteModal.value = true;
        }
      }
    ];
  };

  // 确认删除用户
  const confirmDelete = async () => {
    if (!currentUserId.value) return;

    try {
      await userControllerRemove({
        composable: '$fetch',
        path: {
          id: currentUserId.value.toString()
        }
      });
      toast.add({
        title: t('common.message.deleteSuccess'),
        color: 'success'
      });
      users.refresh?.();
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      showDeleteModal.value = false;
      currentUserId.value = null;
    }
  };

  const users = await userControllerFindAll({
    composable: import.meta.client ? 'useFetch' : 'useAsyncData',
    key: 'users',
    query: computed(() => ({
      page: (pagination.value.pageIndex + 1).toString(),
      limit: pagination.value.pageSize.toString(),
      ...(filters.value.username && { username: filters.value.username })
    }))
  });

  // 计算属性：表格数据
  const tableData = computed(() => {
    const data = users.data.value?.data?.data || [];
    return [...data];
  });

  // 计算属性：总条目数
  const totalItems = computed(() => {
    return users.data.value?.data?.meta?.total || 0;
  });

  // 移除 watch，让 reactive query 自动处理数据获取
</script>
