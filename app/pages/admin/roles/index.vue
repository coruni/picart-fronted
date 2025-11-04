<template>
  <div class="flex flex-col min-h-full relative z-10">
    <Title>{{ $t('admin.roles.title') }}</Title>
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
          <span class="font-medium">{{ $t('role.search') }}</span>
        </div>
      </UButton>
      <template #content>
        <div
          class="p-4 bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border-t border-gray-200 dark:border-gray-700"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UInput
              v-model="filters.name"
              :placeholder="$t('role.searchPlaceholder')"
              class="w-full"
            />
            <USelect
              v-model="filters.isActive"
              :options="statusOptions"
              :placeholder="$t('role.status')"
              class="w-full"
            />
            <UButton color="primary" class="w-full cursor-pointer" @click="handleSearch">
              {{ $t('common.button.search') }}
            </UButton>
          </div>
        </div>
      </template>
    </UCollapsible>

    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
      <h1 class="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">
        {{ $t('role.title') }}
      </h1>
      <UButton icon="mynaui:plus" class="w-full sm:w-auto cursor-pointer" @click="onCreate">
        {{ $t('role.create') }}
      </UButton>
    </div>

    <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 flex-1">
      <UTable
        ref="table"
        :key="tableKey"
        v-model:pagination="pagination"
        sticky="header"
        :loading="roles.pending.value"
        loading-color="primary"
        loading-animation="carousel"
        :data="tableData || []"
        :columns="columns"
        :ui="{
          root: 'min-w-full',
          td: 'empty:p-0'
        }"
        class="h-full"
      />
    </div>

    <!-- 查看角色详情模态框 -->
    <UModal v-model="showViewModal">
      <UCard v-if="selectedRole">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ $t('role.view') }}</h3>
            <UButton
              icon="mynaui:x"
              color="neutral"
              variant="ghost"
              class="cursor-pointer"
              @click="showViewModal = false"
            />
          </div>
        </template>

        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
                $t('role.name')
              }}</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedRole.name }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
                $t('role.displayName')
              }}</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ selectedRole.displayName || '-' }}
              </p>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
              $t('role.description')
            }}</label>
            <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedRole.description }}</p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
              $t('role.status')
            }}</label>
            <div class="mt-1">
              <UBadge
                :color="selectedRole.isActive ? 'success' : 'error'"
                variant="subtle"
                size="sm"
              >
                {{ selectedRole.isActive ? $t('role.statusActive') : $t('role.statusInactive') }}
              </UBadge>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
              $t('role.permissions')
            }}</label>
            <div class="mt-2 flex flex-wrap gap-1">
              <UBadge
                v-for="permission in selectedRole.permissions"
                :key="permission.id"
                color="primary"
                variant="subtle"
                size="sm"
              >
                {{ permission.name }}
              </UBadge>
              <span v-if="!selectedRole.permissions?.length" class="text-sm text-gray-500">
                {{ $t('role.noPermissions') }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
                $t('role.createdAt')
              }}</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(selectedRole.createdAt) }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
                $t('role.updatedAt')
              }}</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(selectedRole.updatedAt) }}
              </p>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              class="cursor-pointer"
              @click="showViewModal = false"
            >
              {{ $t('common.button.close') }}
            </UButton>
            <UButton color="primary" class="cursor-pointer" @click="onEdit(selectedRole)">
              {{ $t('role.edit') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- 删除确认模态框 -->
    <UModal
      v-model:open="showDeleteModal"
      :close-on-backdrop="false"
      :ui="{ footer: 'justify-end' }"
    >
      <template #header>
        {{ $t('role.confirmDelete') }}
      </template>
      <template #body>
        <p>{{ $t('role.confirmDeleteMessage') }}</p>
        <p v-if="selectedRole" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          角色名称: <strong>{{ selectedRole.name }}</strong>
        </p>
      </template>
      <template #footer>
        <UButton variant="outline" class="cursor-pointer" @click="showDeleteModal = false">
          {{ $t('common.button.cancel') }}
        </UButton>
        <UButton color="error" class="cursor-pointer" @click="confirmDelete">
          {{ $t('common.button.confirm') }}
        </UButton>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
  import { h } from 'vue';
  import type { TableColumn } from '@nuxt/ui';
  import type { RoleControllerFindAllResponse } from '~/api';
  import {
    roleControllerFindWithPagination,
    roleControllerCreate,
    roleControllerRemove,
    permissionControllerFindAll
  } from '~/api';
  type Role = RoleControllerFindAllResponse['data']['data'][number];

  // 页面元数据
  definePageMeta({
    requiresAuth: true,
    layout: 'dashboard'
  });

  // 国际化
  const { t } = useI18n();

  // 组件解析
  const UButton = resolveComponent('UButton');
  const UDropdownMenu = resolveComponent('UDropdownMenu');

  // 响应式数据
  const showFilters = ref(false);
  const showViewModal = ref(false);
  const showDeleteModal = ref(false);
  const selectedRole = ref<Role | null>(null);
  const tableKey = ref(0);

  // 筛选条件
  const filters = ref({
    name: '',
    isActive: null as boolean | null
  });

  // 状态选项
  const statusOptions = computed(() => [
    { label: t('role.statusAll'), value: null },
    { label: t('role.statusActive'), value: true },
    { label: t('role.statusInactive'), value: false }
  ]);

  // 获取行操作项
  const getRowItems = (row: any) => {
    return [
      {
        label: t('role.view'),
        icon: 'mynaui:eye',
        onClick: () => onView(row.original)
      },
      {
        label: t('role.edit'),
        icon: 'mynaui:edit',
        onClick: () => onEdit(row.original)
      },
      {
        label: t('role.delete'),
        icon: 'mynaui:trash',
        color: 'error' as const,
        onClick: () => onDelete(row.original)
      }
    ];
  };

  // 分页
  const pagination = ref({
    pageIndex: 0,
    pageSize: 20
  });

  // 获取角色列表
  const roles = await roleControllerFindWithPagination({
    composable: 'useAsyncData',
    key: 'roles',
    query: {
      page: pagination.value.pageIndex + 1,
      limit: pagination.value.pageSize,
      name: filters.value.name
    }
  });

  // 获取权限列表
  const permissions = await permissionControllerFindAll({
    composable: 'useAsyncData',
    key: 'permissions'
  });

  // 表格数据
  const tableData = computed(() => {
    return roles.data.value?.data?.data || [];
  });

  // 表格列定义
  const columns: TableColumn<Role>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: () => t('role.name'),
      enableSorting: false
    },
    {
      id: 'displayName',
      accessorKey: 'displayName',
      header: () => t('role.displayName'),
      enableSorting: false
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: () => t('role.description')
    },

    {
      id: 'status',
      accessorKey: 'isActive',
      header: () => t('role.status'),
      enableSorting: false
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: () => t('role.createdAt'),
      enableSorting: false
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

  // 消息提示
  const toast = useToast();

  // 格式化日期
  const formatDate = (date: string | Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('zh-CN');
  };

  // 搜索处理
  const handleSearch = async () => {
    pagination.value.pageIndex = 0;
    await refreshData();
  };

  // 刷新数据
  const refreshData = async () => {
    await roles.refresh();
    tableKey.value++;
  };

  // 创建角色
  const onCreate = () => {
    navigateTo('/admin/roles/create');
  };

  // 编辑角色
  const onEdit = (role: Role) => {
    if (showViewModal.value) {
      showViewModal.value = false;
    }
    navigateTo(`/admin/roles/${role.id}`);
  };

  // 查看角色
  const onView = (role: Role) => {
    selectedRole.value = role;
    showViewModal.value = true;
  };

  // 删除角色
  const onDelete = async (role: Role) => {
    selectedRole.value = role;
    showDeleteModal.value = true;
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!selectedRole.value) return;
    try {
      await roleControllerRemove({
        composable: 'useAsyncData',
        key: 'deleteRole',
        path: { id: String(selectedRole.value.id) }
      });
      await refreshData();
      showDeleteModal.value = false;
    } catch (err) {}
  };

  // 监听分页变化
  watch(
    pagination,
    async () => {
      await refreshData();
    },
    { deep: true }
  );
</script>
