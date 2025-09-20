<template>
  <div class="flex flex-col min-h-full">
    <Title>{{ $t('admin.users.title') }}</Title>
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

    <!-- 用户详情模态框 -->
    <UModal v-model:open="showDetailModal" size="2xl">
      <template #header>
        {{ $t('admin.users.userDetails') }}
      </template>
      <template #body>
        <div v-if="selectedUser" class="space-y-6">
          <!-- 基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('admin.users.username') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">{{ selectedUser.username }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('admin.users.nickname') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ selectedUser.nickname || '-' }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('admin.users.status') }}
              </label>
              <UBadge :color="getStatusColor(selectedUser.status)" variant="subtle" class="mt-1">
                {{ selectedUser.status }}
              </UBadge>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('admin.users.description') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ selectedUser.description || '-' }}
              </p>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">
                {{ selectedUser.followerCount || 0 }}
              </div>
              <div class="text-sm text-gray-500">{{ $t('admin.users.followerCount') }}</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">
                {{ selectedUser.followingCount || 0 }}
              </div>
              <div class="text-sm text-gray-500">{{ $t('admin.users.followingCount') }}</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">{{ selectedUser.score || 0 }}</div>
              <div class="text-sm text-gray-500">{{ $t('admin.users.score') }}</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary">{{ selectedUser.wallet || 0 }}</div>
              <div class="text-sm text-gray-500">{{ $t('admin.users.wallet') }}</div>
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('admin.users.createdAt') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{
                  selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '-'
                }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('admin.users.updatedAt') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{
                  selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : '-'
                }}
              </p>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <UButton variant="outline" @click="showDetailModal = false">
          {{ $t('common.button.close') }}
        </UButton>
        <UButton @click="navigateTo(`/admin/users/${selectedUser?.id}`)" color="primary">
          {{ $t('common.button.edit') }}
        </UButton>
      </template>
    </UModal>

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
  import { userControllerFindAll, userControllerRemove } from '~/api';
  import type { Row } from '@tanstack/vue-table';
  import type { Role, Status, User } from '~/types';

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

  // 用户详情模态框状态
  const showDetailModal = ref(false);
  const selectedUser = ref<User | null>(null);

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
        label: t('common.table.view'),
        class: 'cursor-pointer',
        onClick: () => {
          selectedUser.value = row.original;
          showDetailModal.value = true;
        }
      },
      {
        label: t('common.table.edit'),
        class: 'cursor-pointer',
        onClick: () => {
          navigateTo(`/admin/users/${row.original.id}`);
        }
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

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      ACTIVE: 'success',
      INACTIVE: 'error',
      BANNED: 'warning'
    };
    return statusColors[status] || 'neutral';
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
