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
          <span class="font-medium">{{ $t('admin.articles.searchAndFilter') }}</span>
        </div>
      </UButton>
      <template #content>
        <div
          class="p-4 bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border-t border-gray-200 dark:border-gray-700"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UInput v-model="filters.title" :placeholder="t('common.table.title')" class="w-full" />
            <USelectMenu
              v-model="filters.categoryId"
              :items="categoryOptions"
              value-key="value"
              clearable
              option-attribute="label"
              :placeholder="t('common.table.category')"
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
        {{ t('admin.menu.articles') }}
      </h1>
      <UButton @click="onCreate()" class="w-full sm:w-auto cursor-pointer">
        {{ t('common.button.create') }}
      </UButton>
    </div>

    <div class="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        sticky="header"
        :loading="articles.pending.value"
        loading-color="primary"
        loading-animation="carousel"
        :data="tableData"
        :columns="columns"
        :key="tableKey"
        class="min-w-[600px] sm:min-w-0"
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
  import type { SelectMenuItem } from '@nuxt/ui';

  import {
    articleControllerFindAll,
    articleControllerRemove,
    categoryControllerFindAll
  } from '~~/api';
  import type { Row } from '@tanstack/vue-table';
  import type { Category } from '~~/types/category';
  import type { ArticleControllerFindAllResponse } from '~/api';

  type Article = ArticleControllerFindAllResponse['data']['data'][0];
  type ArticleStatus = Article['status'];

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
    title: '',
    categoryId: null as number | null
  });

  // 分页状态 - 关键修改点1: 简化分页状态管理
  const pagination = ref({
    pageIndex: 0,
    pageSize: 20
  });

  // 关键修改点2: 添加当前页面计算属性和表格key
  const currentPage = computed(() => pagination.value.pageIndex + 1);
  const tableKey = ref(0); // 强制重新渲染表格

  // 删除确认模态框状态
  const showDeleteModal = ref(false);
  const currentArticleId = ref<number | null>(null);

  // 搜索功能 - 关键修改点3: 修改搜索逻辑
  const handleSearch = () => {
    pagination.value.pageIndex = 0;
    tableKey.value++; // 强制重新渲染
    // 不需要手动刷新，reactive query会自动处理
  };

  // 关键修改点4: 添加页面变化处理函数
  const handlePageChange = (newPage: number) => {
    pagination.value.pageIndex = newPage - 1;
    tableKey.value++; // 强制重新渲染
  };

  const columns: TableColumn<Article>[] = [
    {
      accessorKey: 'id',
      header: '#'
    },
    {
      accessorKey: 'title',
      header: t('common.table.title')
    },
    {
      accessorKey: 'summary',
      header: t('common.table.summary')
    },
    {
      accessorKey: 'status',
      header: t('common.table.status'),
      cell: ({ row }) => {
        const color = {
          PUBLISHED: 'success' as const,
          DRAFT: 'warning' as const,
          REJECTED: 'neutral' as const,
          ARCHIVED: 'info' as const,
          DELETED: 'error' as const,
          BANNED: 'error' as const
        }[row.getValue('status') as ArticleStatus];

        return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
          row.getValue('status')
        );
      }
    },
    {
      accessorKey: 'author',
      header: t('common.table.author'),
      cell: ({ row }) => {
        return row.original.author?.nickname || row.original.author?.username || '-';
      }
    },
    {
      accessorKey: 'likes',
      header: t('common.table.likes')
    },
    {
      accessorKey: 'collections',
      header: t('common.table.collections')
    },
    {
      accessorKey: 'views',
      header: t('common.table.views')
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

  const getRowItems = (row: Row<Article>) => {
    return [
      {
        type: 'label',
        label: t('common.table.actions')
      },
      {
        label: t('common.table.edit'),
        class: 'cursor-pointer',
        onClick: () => {
          router.push(`articles/${row.original.id}`);
        }
      },
      {
        label: t('common.table.delete'),
        class: 'cursor-pointer',
        color: 'error',
        onClick: () => {
          currentArticleId.value = row.original.id!;
          showDeleteModal.value = true;
        }
      }
    ];
  };

  // 确认删除文章
  const confirmDelete = async () => {
    if (!currentArticleId.value) return;

    try {
      await articleControllerRemove({
        composable: '$fetch',
        path: {
          id: currentArticleId.value.toString()
        }
      });
      toast.add({
        title: t('common.message.deleteSuccess'),
        color: 'success'
      });
      articles.refresh?.();
    } catch (error) {
      console.error('Failed to delete article:', error);
    } finally {
      showDeleteModal.value = false;
      currentArticleId.value = null;
    }
  };

  // 获取分类数据
  const { data: categories } = await categoryControllerFindAll({
    composable: 'useFetch',
    key: 'article-categories',
    query: computed(() => ({
      page: 1,
      limit: 100
    }))
  });

  // 分类选项
  const categoryOptions = computed<SelectMenuItem[]>(() => {
    const allCategories = categories.value?.data.data || [];
    const flattened: SelectMenuItem[] = [];

    const flattenCategories = (cats: Category[], prefix = '') => {
      cats.forEach(cat => {
        flattened.push({
          value: cat.id,
          label: `${prefix}${cat.name}`,
          children: cat.children
        });

        if (cat.children && cat.children.length > 0) {
          flattenCategories(cat.children, `${prefix}${cat.name} > `);
        }
      });
    };

    flattenCategories(allCategories);
    return flattened;
  });

  // 关键修改点5: 优化数据获取逻辑
  const articles = await articleControllerFindAll({
    composable: 'useFetch',
    key: 'articles',
    query: computed(() => ({
      page: pagination.value.pageIndex + 1,
      limit: pagination.value.pageSize,
      ...(filters.value.title && { title: filters.value.title }),
      ...(filters.value.categoryId && { categoryId: filters.value.categoryId })
    }))
  });

  // 计算属性：表格数据
  const tableData = computed(() => {
    const data = articles.data.value?.data?.data || [];
    return [...data];
  });

  // 计算属性：总条目数
  const totalItems = computed(() => {
    return articles.data.value?.data?.meta?.total || 0;
  });

  const onCreate = () => {
    router.push('articles/create');
  };
</script>
