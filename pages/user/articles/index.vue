<template>
  <div class="flex-1 flex flex-col w-full">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ $t('user.articles.title') }}</h1>
      <UButton
        :to="localePath('/user/articles/create')"
        icon="mynaui:plus"
        color="primary"
        class="cursor-pointer"
      >
        {{ $t('user.articles.create') }}
      </UButton>
    </div>

    <!-- 筛选和搜索 -->
    <div class="bg-card rounded-lg p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <UFormField name="search" class="flex-1 min-w-[200px]">
          <UInput
            v-model="filters.search"
            :placeholder="$t('user.articles.searchPlaceholder')"
            icon="mynaui:search"
            variant="soft"
            @input="handleSearch"
          />
        </UFormField>
        <UFormField name="status" class="w-48">
          <USelect
            v-model="filters.status"
            :items="statusOptions"
            :placeholder="$t('user.articles.statusPlaceholder')"
            value-key="value"
            variant="soft"
            @update:model-value="handleSearch"
          />
        </UFormField>
        <UFormField name="category" class="w-48">
          <USelectMenu
            v-model="filters.categoryId"
            :items="categoryOptions"
            :placeholder="$t('user.articles.categoryPlaceholder')"
            value-key="id"
            variant="soft"
            searchable
            @update:model-value="handleSearch"
          />
        </UFormField>
      </div>
    </div>

    <!-- 文章列表 -->
    <UTable
      :rows="articles"
      :columns="columns"
      :loading="loading"
      :empty-state="{ icon: 'mynaui:document', label: $t('user.articles.empty') }"
      class="flex-1"
    >
      <template #status-data="{ row }">
        <UBadge
          :color="getStatusColor(row.status)"
          :label="$t(`user.articles.status.${row.status.toLowerCase()}`)"
          size="sm"
        />
      </template>

      <template #actions-data="{ row }">
        <UDropdownMenu :items="getRowActions(row)" :ui="{ item: 'cursor-pointer' }">
          <UButton icon="mynaui:dots-vertical" color="gray" variant="ghost" size="sm" />
        </UDropdownMenu>
      </template>
    </UTable>

    <!-- 分页 -->
    <div class="flex justify-center mt-6">
      <UPagination
        v-model="currentPage"
        :page-count="totalPages"
        :total="totalItems"
        :ui="{ wrapper: 'flex items-center gap-1' }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { debounce } from 'lodash-es';
  import type { SelectMenuItem } from '#ui/types';

  const { t } = useI18n();
  const localePath = useLocalePath();
  const toast = useToast();

  definePageMeta({
    layout: 'default',
    requiresAuth: true
  });

  // 状态
  const loading = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalItems = ref(0);
  const articles = ref([]);

  // 筛选条件
  const filters = ref({
    search: '',
    status: '',
    categoryId: null
  });

  // 状态选项
  const statusOptions = ref<SelectMenuItem[]>([
    { label: t('user.articles.status.all'), value: '' },
    { label: t('user.articles.status.published'), value: 'PUBLISHED' },
    { label: t('user.articles.status.draft'), value: 'DRAFT' },
    { label: t('user.articles.status.pending'), value: 'PENDING' },
    { label: t('user.articles.status.rejected'), value: 'REJECTED' }
  ]);

  // 分类选项
  const categoryOptions = ref<SelectMenuItem[]>([]);

  // 表格列定义
  const columns = [
    {
      key: 'title',
      label: t('user.articles.columns.title'),
      sortable: true
    },
    {
      key: 'category',
      label: t('user.articles.columns.category'),
      sortable: true
    },
    {
      key: 'status',
      label: t('user.articles.columns.status'),
      sortable: true
    },
    {
      key: 'createdAt',
      label: t('user.articles.columns.createdAt'),
      sortable: true
    },
    {
      key: 'updatedAt',
      label: t('user.articles.columns.updatedAt'),
      sortable: true
    },
    {
      key: 'actions',
      label: t('user.articles.columns.actions')
    }
  ];

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const colors = {
      PUBLISHED: 'green',
      DRAFT: 'gray',
      PENDING: 'yellow',
      REJECTED: 'red'
    };
    return colors[status] || 'gray';
  };

  // 获取行操作
  const getRowActions = (row: any) => {
    return [
      {
        label: t('user.articles.actions.view'),
        icon: 'mynaui:eye',
        click: () => navigateTo(`/article/${row.id}`)
      },
      {
        label: t('user.articles.actions.edit'),
        icon: 'mynaui:edit',
        click: () => navigateTo(`/user/articles/${row.id}`)
      },
      {
        label: t('user.articles.actions.delete'),
        icon: 'mynaui:trash',
        color: 'red',
        click: () => handleDelete(row.id)
      }
    ];
  };

  // 搜索处理
  const handleSearch = debounce(() => {
    currentPage.value = 1;
    fetchArticles();
  }, 300);

  // 获取文章列表
  const fetchArticles = async () => {
    try {
      loading.value = true;
      // 这里调用您的API
      // const response = await articleControllerFindAll({
      //   composable: '$fetch',
      //   query: {
      //     page: currentPage.value,
      //     limit: 20,
      //     ...filters.value
      //   }
      // });

      // 模拟数据
      articles.value = [
        {
          id: 1,
          title: '示例文章标题',
          category: '技术',
          status: 'PUBLISHED',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ];
      totalItems.value = 1;
      totalPages.value = 1;
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      toast.add({
        title: t('common.message.fetchFailed'),
        color: 'error'
      });
    } finally {
      loading.value = false;
    }
  };

  // 删除文章
  const handleDelete = async (id: number) => {
    try {
      // 这里调用删除API
      // await articleControllerRemove({
      //   composable: '$fetch',
      //   path: { id: id.toString() }
      // });

      toast.add({
        title: t('common.message.deleteSuccess'),
        color: 'success'
      });

      fetchArticles();
    } catch (error) {
      console.error('Failed to delete article:', error);
      toast.add({
        title: t('common.message.deleteFailed'),
        color: 'error'
      });
    }
  };

  // 监听分页变化
  watch(currentPage, () => {
    fetchArticles();
  });

  // 初始化
  onMounted(() => {
    fetchArticles();
  });
</script>
