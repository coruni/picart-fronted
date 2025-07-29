<template>
  <div class="flex flex-col min-h-full">
    <UTable
      ref="table"
      v-model:pagination="pagination"
      sticky="header"
      :loading="users.pending.value"
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
</template>

<script setup lang="ts">
  import { getPaginationRowModel } from '@tanstack/vue-table';
  import type { TableColumn } from '@nuxt/ui';
  import { useI18n } from 'vue-i18n';
  import { userControllerFindAll, userControllerRemove } from '~~/api';
  import type { Row } from '@tanstack/vue-table';
  import type { Role, Status, User } from '~~/types/user';

  const UButton = resolveComponent('UButton');
  const UDropdownMenu = resolveComponent('UDropdownMenu');
  const UBadge = resolveComponent('UBadge');
  const UModal = resolveComponent('UModal');
  const toast = useToast();
  const table = useTemplateRef('table');

  const { t } = useI18n();

  // 分页状态 - 注意这里使用 pageIndex 从 0 开始
  const pagination = ref({
    pageIndex: 0,
    pageSize: 20
  });

  // 删除确认模态框状态
  const showDeleteModal = ref(false);
  const currentUserId = ref<number | null>(null);

  definePageMeta({
    layout: 'dashboard'
  });

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
        onClick: () => {
          console.log('Edit row:', row.original);
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
      toast.add({
        title: t('common.message.deleteFailed'),
        color: 'error'
      });
      console.error('Failed to delete user:', error);
    } finally {
      showDeleteModal.value = false;
      currentUserId.value = null;
    }
  };

  const users = await userControllerFindAll({
    composable: 'useAsyncData',
    key: 'users',
    query: computed(() => ({
      page: pagination.value.pageIndex + 1,
      limit: pagination.value.pageSize
    }))
  });

  // 计算属性：表格数据
  const tableData = computed(() => {
    const data = users.data.value?.data?.data || [];
    return data as User[];
  });

  // 监听分页变化
  watch(
    [() => pagination.value.pageIndex, () => pagination.value.pageSize],
    () => {
      users.refresh?.();
    },
    { deep: true }
  );
</script>
