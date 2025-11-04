<template>
  <div class="flex flex-col min-h-full">
    <Title>{{ $t('admin.orders.title') }}</Title>
    <!-- 搜索和筛选区域 -->
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
          <span class="font-medium">{{ $t('admin.orders.searchAndFilter') }}</span>
        </div>
      </UButton>

      <template #content>
        <div
          class="p-4 bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border-t border-gray-200 dark:border-gray-700"
        >
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- 订单状态筛选 -->
            <USelect
              v-model="filters.status"
              :items="statusOptions"
              :placeholder="$t('admin.orders.selectStatus')"
              class="w-full"
            />

            <!-- 订单类型筛选 -->
            <USelect
              v-model="filters.type"
              :items="typeOptions"
              :placeholder="$t('admin.orders.selectType')"
              class="w-full"
            />

            <!-- 用户ID搜索 -->
            <UInput
              v-model="filters.userId"
              :placeholder="$t('admin.orders.searchUserId')"
              type="number"
              class="w-full"
            />

            <!-- 搜索按钮 -->
            <UButton color="primary" class="w-full" @click="handleSearch">
              {{ $t('common.button.search') }}
            </UButton>
          </div>
        </div>
      </template>
    </UCollapsible>

    <!-- 订单表格 -->
    <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 flex-1">
      <UTable
        ref="table"
        :key="tableKey"
        v-model:pagination="pagination"
        sticky="header"
        :loading="orders.pending.value"
        loading-color="primary"
        loading-animation="carousel"
        :data="tableData"
        :columns="columns"
        class="h-full"
      />
    </div>

    <!-- 分页 -->
    <div class="flex justify-center border-t border-default pt-4">
      <UPagination
        :page="currentPage"
        :items-per-page="pagination.pageSize"
        :total="totalItems"
        color="neutral"
        @update:page="handlePageChange"
      />
    </div>

    <!-- 订单详情模态框 -->
    <UModal v-model:open="showDetailModal" size="2xl">
      <template #header>
        {{ $t('admin.orders.orderDetail') }}
      </template>
      <template #body>
        <div v-if="selectedOrder" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('admin.orders.orderNo') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">{{ selectedOrder.orderNo }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('admin.orders.status') }}
              </label>
              <UBadge
                :color="
                  selectedOrder.status
                    ? getStatusColor(selectedOrder.status as OrderStatus)
                    : 'neutral'
                "
                variant="subtle"
                class="mt-1"
              >
                {{ selectedOrder.status || '-' }}
              </UBadge>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('admin.orders.type') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">{{ selectedOrder.type }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('admin.orders.amount') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{ selectedOrder.amount || '-' }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('admin.orders.userId') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">{{ selectedOrder.userId }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ $t('admin.orders.createdAt') }}
              </label>
              <p class="text-sm text-gray-900 dark:text-white">
                {{
                  selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : '-'
                }}
              </p>
            </div>
          </div>
          <div v-if="selectedOrder.remark">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ $t('admin.orders.description') }}
            </label>
            <p class="text-sm text-gray-900 dark:text-white">{{ selectedOrder.remark }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <UButton variant="outline" @click="showDetailModal = false">
          {{ $t('common.button.close') }}
        </UButton>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
  import { getPaginationRowModel } from '@tanstack/vue-table';
  import type { TableColumn, SelectItem  } from '@nuxt/ui';
  import { useI18n } from 'vue-i18n';
  import { orderControllerGetOrders } from '~/api';
  import type { Row } from '@tanstack/vue-table';
  import type { OrderControllerGetOrdersResponse } from '~/api';
  

  // 从API响应类型中提取订单类型
  type Order = OrderControllerGetOrdersResponse['data']['data'][0];
  type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED' | 'ALL';
  type OrderType = 'MEMBERSHIP' | 'PRODUCT' | 'SERVICE' | 'ARTICLE' | 'ALL';

  const UButton = resolveComponent('UButton');
  const UDropdownMenu = resolveComponent('UDropdownMenu');
  const UBadge = resolveComponent('UBadge');
  const UModal = resolveComponent('UModal');
  const USelect = resolveComponent('USelect');
  const UInput = resolveComponent('UInput');
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

  // 筛选条件
  const filters = ref({
    status: 'ALL' as OrderStatus,
    type: 'ALL' as OrderType,
    userId: ''
  });

  // 模态框状态
  const showDetailModal = ref(false);
  const selectedOrder = ref<Order | null>(null);

  // 筛选区域显示状态
  const showFilters = ref(false);

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  // 状态选项
  const statusOptions = computed<SelectItem[]>(() => [
    { label: t('admin.orders.allStatus'), value: 'ALL' },
    { label: t('admin.orders.pending'), value: 'PENDING' },
    { label: t('admin.orders.paid'), value: 'PAID' },
    { label: t('admin.orders.cancelled'), value: 'CANCELLED' },
    { label: t('admin.orders.refunded'), value: 'REFUNDED' }
  ]);

  // 类型选项
  const typeOptions = computed<SelectItem[]>(() => [
    { label: t('admin.orders.allTypes'), value: 'ALL' },
    { label: t('admin.orders.membership'), value: 'MEMBERSHIP' },
    { label: t('admin.orders.product'), value: 'PRODUCT' },
    { label: t('admin.orders.service'), value: 'SERVICE' },
    { label: t('admin.orders.article'), value: 'ARTICLE' }
  ]);

  // 获取状态颜色
  const getStatusColor = (status: OrderStatus) => {
    const colorMap = {
      PENDING: 'warning',
      PAID: 'success',
      CANCELLED: 'error',
      REFUNDED: 'neutral',
      ALL: 'neutral'
    };
    return colorMap[status] || 'neutral';
  };

  // 表格列定义
  const columns: TableColumn<Order>[] = [
    { accessorKey: 'id', header: '#' },
    { accessorKey: 'orderNo', header: t('admin.orders.orderNo') },
    { accessorKey: 'userId', header: t('admin.orders.userId') },
    { accessorKey: 'type', header: t('admin.orders.type') },
    {
      accessorKey: 'status',
      header: t('admin.orders.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        if (!status) return '-';
        return h(
          UBadge,
          {
            color: getStatusColor(status as OrderStatus),
            variant: 'subtle'
          },
          () => status
        );
      }
    },
    {
      accessorKey: 'amount',
      header: t('admin.orders.amount'),
      cell: ({ row }) => {
        const order = row.original;
        return order.amount || '-';
      }
    },
    {
      accessorKey: 'createdAt',
      header: t('admin.orders.createdAt'),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as string;
        if (!createdAt) return '-';
        return h('time', { datetime: createdAt }, new Date(createdAt).toLocaleDateString());
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

  // 行操作菜单
  const getRowItems = (row: Row<Order>) => {
    return [
      {
        type: 'label',
        label: t('common.table.actions')
      },
      {
        label: t('admin.orders.viewDetail'),
        class: 'cursor-pointer',
        onClick: () => {
          selectedOrder.value = row.original;
          showDetailModal.value = true;
        }
      }
    ];
  };

  // 搜索功能 - 关键修改点3: 修改搜索逻辑
  const handleSearch = () => {
    // 重置到第一页
    pagination.value.pageIndex = 0;
    tableKey.value++; // 强制重新渲染
  };

  // 关键修改点4: 添加页面变化处理函数
  const handlePageChange = (newPage: number) => {
    pagination.value.pageIndex = newPage - 1;
    tableKey.value++; // 强制重新渲染
  };

  // 获取订单数据
  const orders = await orderControllerGetOrders({
    composable: import.meta.client ? 'useFetch' : 'useAsyncData',
    key: 'orders',
    query: computed(() => ({
      page: (pagination.value.pageIndex + 1).toString(),
      limit: pagination.value.pageSize.toString(),
      ...(filters.value.status !== 'ALL' && { status: filters.value.status }),
      ...(filters.value.type !== 'ALL' && { type: filters.value.type }),
      ...(filters.value.userId && { userId: parseInt(filters.value.userId) })
    }))
  });

  // 计算属性：表格数据
  const tableData = computed(() => {
    const data = orders.data.value?.data?.data || [];
    return [...data];
  });

  // 计算属性：总条目数
  const totalItems = computed(() => {
    return orders.data.value?.data?.meta?.total || 0;
  });

  // 移除 watch，让 reactive query 自动处理数据获取
</script>
