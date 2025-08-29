<template>
  <div class="flex flex-col min-h-full relative z-10">
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
          <span class="font-medium">{{ $t('admin.comments.searchAndFilter') }}</span>
        </div>
      </UButton>
      <template #content>
        <div
          class="p-4 bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border-t border-gray-200 dark:border-gray-700"
        >
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <UInput
              v-model="filters.keyword"
              :placeholder="t('common.table.keyword')"
              class="w-full"
            />
            <UInput
              v-model="filters.userId"
              type="number"
              :placeholder="t('common.table.userId')"
              class="w-full"
            />
            <UInput
              v-model="filters.articleId"
              type="number"
              :placeholder="t('common.table.articleId')"
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
        {{ t('admin.menu.comments') }}
      </h1>
    </div>

    <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        sticky="header"
        :loading="comments.pending.value"
        loading-color="primary"
        loading-animation="carousel"
        :data="tableData"
        :columns="columns"
        :key="tableKey"
        class="min-w-[800px] sm:min-w-0"
      />
    </div>

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
        <UButton variant="outline" @click="showDeleteModal = false" class="cursor-pointer">
          {{ t('common.button.cancel') }}
        </UButton>
        <UButton color="error" @click="confirmDelete" class="cursor-pointer">
          {{ t('common.button.confirm') }}
        </UButton>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
  import { debounce } from 'lodash-es';
  import type { TableColumn } from '@nuxt/ui';

  import { commentControllerFindAllWithAdmin } from '~~/api';
  import type { Row } from '@tanstack/vue-table';
  import type { CommentControllerFindAllWithAdminResponse } from '~/api';

  type Comment = CommentControllerFindAllWithAdminResponse['data']['data'][0];
  type CommentStatus = Comment['status'];

  const UButton = resolveComponent('UButton');
  const UDropdownMenu = resolveComponent('UDropdownMenu');
  const UBadge = resolveComponent('UBadge');
  const UModal = resolveComponent('UModal');
  const router = useRouter();
  const toast = useToast();
  const table = useTemplateRef('table');
  const { t } = useI18n();

  definePageMeta({
    layout: 'dashboard',
    requiresAuth: true
  });

  // 筛选状态
  const showFilters = ref(false);
  const filters = ref({
    keyword: '',
    userId: null as number | null,
    articleId: null as number | null
  });

  // 分页状态
  const pagination = ref({
    pageIndex: 0,
    pageSize: 20
  });

  const currentPage = computed(() => pagination.value.pageIndex + 1);
  const tableKey = ref(0);

  // 删除确认模态框状态
  const showDeleteModal = ref(false);
  const currentCommentId = ref<number | null>(null);

  // 搜索功能
  const handleSearch = () => {
    pagination.value.pageIndex = 0;
    tableKey.value++;
  };

  const handlePageChange = (newPage: number) => {
    pagination.value.pageIndex = newPage - 1;
    tableKey.value++;
  };

  const columns: TableColumn<Comment>[] = [
    {
      accessorKey: 'id',
      header: '#'
    },
    {
      accessorKey: 'content',
      header: t('common.table.content'),
      cell: ({ row }) => {
        const content = row.getValue('content') as string;
        return h('div', { class: 'max-w-xs truncate' }, content);
      }
    },
    {
      accessorKey: 'article.title',
      header: t('common.table.article'),
      cell: ({ row }) => {
        const article = row.original.article;
        return h('div', { class: 'max-w-xs' }, [
          h('div', { class: 'font-medium' }, article?.title || '-'),
          h('div', { class: 'text-xs text-gray-500' }, `ID: ${article?.id || '-'}`)
        ]);
      }
    },
    {
      accessorKey: 'author',
      header: t('common.table.author'),
      cell: ({ row }) => {
        const author = row.original.author;
        if (author) {
          const displayName = author.nickname || author.username || '-';
          return h('div', { class: 'max-w-xs' }, [
            h('div', { class: 'font-medium' }, displayName),
            h('div', { class: 'text-xs text-gray-500' }, `ID: ${author.id || '-'}`)
          ]);
        }
        return h('div', { class: 'text-gray-500' }, '-');
      }
    },
    {
      accessorKey: 'status',
      header: t('common.table.status'),
      cell: ({ row }) => {
        const color =
          {
            PUBLISHED: 'success' as const,
            PENDING: 'warning' as const,
            REJECTED: 'error' as const,
            DELETED: 'error' as const
          }[row.getValue('status') as CommentStatus] || 'neutral';

        return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
          row.getValue('status')
        );
      }
    },
    {
      accessorKey: 'likes',
      header: t('common.table.likes')
    },
    {
      accessorKey: 'replyCount',
      header: t('common.table.replyCount')
    },
    {
      accessorKey: 'rootId',
      header: t('common.table.rootId'),
      cell: ({ row }) => {
        const rootId = row.getValue('rootId');
        return rootId ? rootId : '-';
      }
    },
    {
      accessorKey: 'createdAt',
      header: t('common.table.createdAt')
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

  const getRowItems = (row: Row<Comment>) => {
    return [
      {
        type: 'label',
        label: t('common.table.actions')
      },
      {
        label: t('common.table.view'),
        class: 'cursor-pointer',
        onClick: () => {
          // 跳转到文章详情页面
          if (row.original.article?.id) {
            router.push(`/article/${row.original.article.id}`);
          }
        }
      },
      {
        label: t('common.table.delete'),
        class: 'cursor-pointer',
        color: 'error',
        onClick: () => {
          currentCommentId.value = row.original.id!;
          showDeleteModal.value = true;
        }
      }
    ];
  };

  // 确认删除评论
  const confirmDelete = async () => {
    if (!currentCommentId.value) return;

    try {
      // TODO: 实现评论删除接口
      // await commentControllerRemove({
      //   composable: '$fetch',
      //   path: {
      //     id: currentCommentId.value
      //   }
      // });
      comments.refresh?.();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      showDeleteModal.value = false;
      currentCommentId.value = null;
    }
  };

  // 获取评论数据
  const comments = await commentControllerFindAllWithAdmin({
    composable: 'useFetch',
    key: 'comments',
    query: computed(() => ({
      page: pagination.value.pageIndex + 1,
      limit: pagination.value.pageSize,
      ...(filters.value.keyword && { keyword: filters.value.keyword }),
      ...(filters.value.userId && { userId: filters.value.userId }),
      ...(filters.value.articleId && { articleId: filters.value.articleId })
    }))
  });

  // 计算属性：表格数据
  const tableData = computed(() => {
    const data = comments.data.value?.data?.data || [];
    return [...data];
  });

  // 计算属性：总条目数
  const totalItems = computed(() => {
    return comments.data.value?.data?.meta?.total || 0;
  });
</script>
