<template>
  <div class="comment-item border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0">
    <!-- 查看详情弹窗 -->
    <UModal
      v-model:open="showRepliesModal"
      :title="$t('article.commentDetail')"
      :ui="{
        close: 'cursor-pointer'
      }"
      aria-describedby="comment-detail-description"
    >
      <!-- 触发器 -->
      <div class="flex space-x-4 cursor-pointer" @click="loadCommentDetail">
        <div class="relative h-8 w-8 flex-shrink-0">
          <UAvatar
            :src="comment.author?.avatar"
            :alt="comment.author?.nickname || comment.author?.username"
            class="w-8 h-8 rounded-full object-cover"
            loading="lazy"
            format="webp"
            sizes="40px"
          />
          <!-- VIP 标识 -->
          <div
            v-if="comment.author?.isMember"
            class="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-sm"
          >
            <Icon name="mynaui:heart-waves" class="w-3 h-3 text-white" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div
            class="bg-gray-50 dark:bg-gray-700 rounded-md p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {{ comment.author?.nickname || comment.author?.username }}
                </span>
              </div>
              <span class="text-sm text-gray-500">{{ formatTime(comment.createdAt || '') }}</span>
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {{ comment.content }}
            </p>
          </div>

          <!-- 操作按钮 -->
          <div class="flex flex-wrap items-center gap-1 sm:gap-2 mt-2 ml-2">
            <UButton
              variant="link"
              @click.stop="handleLike"
              :disabled="isLikeLoading"
              class="cursor-pointer text-gray-500 hover:text-primary-500 text-sm flex items-center space-x-1 transition-colors duration-200 min-w-0 px-1 sm:px-2"
              :class="{ 'text-primary-500': comment.isLiked }"
            >
              <Icon
                :name="comment.isLiked ? 'mynaui:heart-solid' : 'mynaui:heart'"
                class="w-4 h-4 flex-shrink-0"
              />
              <span class="hidden sm:inline">{{ comment.likes || 0 }}</span>
              <span class="sm:hidden">{{ comment.likes || 0 }}</span>
            </UButton>
            <UButton
              variant="link"
              @click.stop="toggleReply"
              class="cursor-pointer text-gray-500 hover:text-primary-500 text-sm transition-colors duration-200 min-w-0 px-1 sm:px-2"
            >
              <span class="hidden sm:inline">{{ $t('article.reply') }}</span>
              <span class="sm:hidden">{{ $t('article.reply') }}</span>
            </UButton>
            <UButton
              variant="link"
              v-if="canEdit"
              @click.stop="toggleEdit"
              class="cursor-pointer flex items-center space-x-1 text-gray-500 hover:text-primary-500 text-sm transition-colors duration-200 min-w-0 px-1 sm:px-2"
            >
              <Icon name="mynaui:edit" class="w-4 h-4 flex-shrink-0" />
              <span class="hidden sm:inline">{{ $t('common.edit') }}</span>
              <span class="sm:hidden">{{ $t('common.edit') }}</span>
            </UButton>
            <UPopover
              v-if="canDelete"
              :mode="popoverMode"
              :open-delay="popoverOpenDelay"
              :close-delay="popoverCloseDelay"
              :content="{
                side: 'top',
                align: 'center',
                sideOffset: 8
              }"
              aria-describedby="delete-confirm-description"
            >
              <UButton
                variant="link"
                :disabled="isDeleteLoading"
                class="cursor-pointer flex items-center space-x-1 text-gray-500 hover:text-red-500 text-sm transition-colors duration-200 min-w-0 px-1 sm:px-2"
                :aria-label="$t('common.delete')"
              >
                <Icon name="mynaui:trash" class="w-4 h-4 flex-shrink-0" />
                <span class="hidden sm:inline">{{ $t('common.delete') }}</span>
              </UButton>

              <template #content>
                <div id="delete-confirm-description" class="p-3 space-y-3">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ $t('article.deleteConfirm') }}
                  </div>
                  <div class="flex justify-end space-x-2">
                    <UButton variant="ghost" size="sm" class="text-xs">
                      {{ $t('common.cancel') }}
                    </UButton>
                    <UButton
                      color="error"
                      size="sm"
                      :loading="isDeleteLoading"
                      @click="handleDelete"
                      class="text-xs"
                    >
                      {{ $t('common.delete') }}
                    </UButton>
                  </div>
                </div>
              </template>
            </UPopover>
            <UButton
              variant="link"
              v-if="(comment.replyCount || 0) > 0"
              @click.stop="openRepliesModal"
              class="cursor-pointer flex items-center space-x-1 text-gray-500 hover:text-primary-500 text-sm transition-colors duration-200 min-w-0 px-1 sm:px-2"
            >
              <span class="hidden sm:inline"
                >{{ comment.replyCount || 0 }} {{ $t('article.replies') }}</span
              >
              <span class="sm:hidden"
                >{{ comment.replyCount || 0 }} {{ $t('article.replies') }}</span
              >
            </UButton>
          </div>
        </div>
      </div>

      <!-- 弹窗内容 -->
      <template #body>
        <div
          id="comment-detail-description"
          class="p-4 space-y-4 max-h-96 overflow-y-auto"
          @scroll="handleScroll"
          ref="modalContent"
        >
          <!-- 主评论内容 - 立即显示 -->
          <div>
            <div class="flex items-center space-x-3">
              <div class="relative">
                <UAvatar
                  :src="comment.author?.avatar"
                  :alt="comment.author?.nickname || comment.author?.username"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <!-- VIP 标识 -->
                <div
                  v-if="comment.author?.isMember"
                  class="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-sm"
                >
                  <Icon name="mynaui:heart-waves" class="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h4 class="font-bold text-gray-900 dark:text-gray-100">
                  {{ comment.author?.nickname || comment.author?.username }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatTime(comment.createdAt || '') }}
                </p>
              </div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mt-3">
              <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {{ comment.content }}
              </p>
            </div>
            <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-3">
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-1">
                  <Icon
                    :name="comment.isLiked ? 'mynaui:heart-solid' : 'mynaui:heart'"
                    class="w-4 h-4"
                  />
                  <span>{{ comment.likes || 0 }}</span>
                </div>
                <div>
                  {{ comment.replyCount }}
                  {{ $t('article.replies') }}
                </div>
              </div>
            </div>
          </div>

          <!-- 子回复列表 -->
          <div
            v-if="(comment.replyCount || 0) > 0"
            class="border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            <h5 class="font-medium text-gray-900 dark:text-gray-100 mb-3">
              {{ $t('article.replies') }} ({{ comment.replyCount || 0 }})
            </h5>

            <!-- 回复加载中状态 -->
            <div v-if="isLoadingReplies && replies.length === 0" class="flex justify-center py-4">
              <div
                class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"
              ></div>
            </div>

            <!-- 回复列表容器 -->
            <div ref="repliesContainer" class="space-y-3">
              <div
                v-for="reply in replies"
                :key="reply.id"
                class="flex space-x-3 bg-gray-50 dark:bg-gray-800 rounded-md p-3"
              >
                <div class="relative h-8 w-8">
                  <UAvatar
                    :src="reply.author?.avatar"
                    :alt="reply.author?.nickname || reply.author?.username"
                    class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    loading="lazy"
                    format="webp"
                    sizes="32px"
                  />
                  <!-- VIP 标识 -->
                  <div
                    v-if="reply.author?.isMember"
                    class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Icon name="mynaui:heart-waves" class="w-2 h-2 text-white" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {{ reply.author?.nickname || reply.author?.username }}
                    </span>
                    <span class="text-xs text-gray-500">{{
                      formatTime(reply.createdAt || '')
                    }}</span>
                  </div>
                  <!-- 回复了谁 -->
                  <div
                    v-if="reply.parent && (reply.parent as any).id !== props.comment.id"
                    class="mb-1"
                  >
                    <span class="text-xs text-gray-500">
                      {{ $t('article.reply') }}
                      <span class="text-primary font-medium">
                        {{
                          (reply.parent as any).author?.nickname ||
                          (reply.parent as any).author?.username
                        }}
                      </span>
                    </span>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300 text-sm">{{ reply.content }}</p>

                  <!-- 子评论操作按钮 -->
                  <div class="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
                    <UButton
                      variant="link"
                      @click.stop="handleReplyLike(reply)"
                      :disabled="isLikeLoading"
                      class="cursor-pointer text-gray-500 hover:text-primary-500 text-xs flex items-center space-x-1 transition-colors duration-200 min-w-0 px-1 sm:px-2"
                      :class="{ 'text-primary-500': reply.isLiked }"
                    >
                      <Icon
                        :name="reply.isLiked ? 'mynaui:heart-solid' : 'mynaui:heart'"
                        class="w-3 h-3 flex-shrink-0"
                      />
                      <span class="hidden sm:inline">{{ reply.likes || 0 }}</span>
                      <span class="sm:hidden">{{ reply.likes || 0 }}</span>
                    </UButton>
                    <UButton
                      variant="link"
                      @click.stop="toggleReplyToReply(reply)"
                      class="cursor-pointer text-gray-500 hover:text-primary-500 text-xs transition-colors duration-200 min-w-0 px-1 sm:px-2"
                    >
                      <span class="hidden sm:inline">{{ $t('article.reply') }}</span>
                      <span class="sm:hidden">{{ $t('article.reply') }}</span>
                    </UButton>
                    <UButton
                      variant="link"
                      v-if="canEditReply(reply)"
                      @click.stop="toggleEditReply(reply)"
                      class="cursor-pointer flex items-center space-x-1 text-gray-500 hover:text-primary-500 text-xs transition-colors duration-200 min-w-0 px-1 sm:px-2"
                    >
                      <Icon name="mynaui:edit" class="w-3 h-3 flex-shrink-0" />
                      <span class="hidden sm:inline">{{ $t('common.edit') }}</span>
                      <span class="sm:hidden">{{ $t('common.edit') }}</span>
                    </UButton>
                    <UPopover
                      v-if="canDeleteReply(reply)"
                      :mode="popoverMode"
                      :open-delay="popoverOpenDelay"
                      :close-delay="popoverCloseDelay"
                      :content="{
                        side: 'top',
                        align: 'center',
                        sideOffset: 8
                      }"
                      :aria-describedby="`delete-reply-confirm-${reply.id}`"
                    >
                      <UButton
                        variant="link"
                        :disabled="isDeleteLoading"
                        class="cursor-pointer flex items-center space-x-1 text-gray-500 hover:text-red-500 text-xs transition-colors duration-200 min-w-0 px-1 sm:px-2"
                        :aria-label="$t('common.delete')"
                      >
                        <Icon name="mynaui:trash" class="w-3 h-3 flex-shrink-0" />
                        <span class="hidden sm:inline">{{ $t('common.delete') }}</span>
                      </UButton>

                      <template #content>
                        <div :id="`delete-reply-confirm-${reply.id}`" class="p-3 space-y-3">
                          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {{ $t('article.deleteConfirm') }}
                          </div>
                          <div class="flex justify-end space-x-2">
                            <UButton variant="ghost" size="sm" class="text-xs cursor-pointer">
                              {{ $t('common.cancel') }}
                            </UButton>
                            <UButton
                              color="error"
                              size="sm"
                              :loading="isDeleteLoading"
                              @click="handleDeleteReply(reply)"
                              class="text-xs cursor-pointer"
                            >
                              {{ $t('common.delete') }}
                            </UButton>
                          </div>
                        </div>
                      </template>
                    </UPopover>
                  </div>

                  <!-- 子评论回复输入框 -->
                  <div v-if="reply.showReplyInput" class="mt-3">
                    <UForm
                      :schema="replyToReplySchema"
                      :state="replyToReplyState"
                      @submit="payload => handleReplyToReplySubmit(reply, payload)"
                    >
                      <UFormField name="content">
                        <UTextarea
                          v-model="replyToReplyState.content"
                          :placeholder="$t('article.replyPlaceholder')"
                          class="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-600 border-none resize-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-200 text-xs"
                        />
                      </UFormField>
                      <div class="flex justify-end space-x-2 mt-2">
                        <UButton
                          type="button"
                          variant="ghost"
                          @click="reply.showReplyInput = false"
                          class="text-xs cursor-pointer dark:text-white"
                        >
                          {{ $t('common.cancel') }}
                        </UButton>
                        <UButton
                          type="submit"
                          size="sm"
                          :loading="isReplyLoading"
                          class="text-xs cursor-pointer dark:text-white"
                        >
                          {{ $t('article.reply') }}
                        </UButton>
                      </div>
                    </UForm>
                  </div>

                  <!-- 子评论编辑输入框 -->
                  <div v-if="reply.showEditInput" class="mt-3">
                    <UForm
                      :schema="editReplySchema"
                      :state="editReplyState"
                      @submit="payload => handleEditReplySubmit(reply, payload)"
                    >
                      <UFormField name="content">
                        <UTextarea
                          v-model="editReplyState.content"
                          :placeholder="$t('article.commentText')"
                          class="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-600 border-none resize-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-200 text-xs"
                        />
                      </UFormField>
                      <div class="flex justify-end space-x-2 mt-2">
                        <UButton
                          type="button"
                          variant="ghost"
                          @click="reply.showEditInput = false"
                          class="text-xs cursor-pointer dark:text-white"
                        >
                          {{ $t('common.cancel') }}
                        </UButton>
                        <UButton
                          type="submit"
                          :loading="isEditLoading"
                          class="text-xs cursor-pointer dark:text-white"
                        >
                          {{ $t('common.save') }}
                        </UButton>
                      </div>
                    </UForm>
                  </div>
                </div>
              </div>

              <!-- 滚动加载提示 -->
              <div v-if="isLoadingReplies && hasMoreReplies" class="flex justify-center py-4">
                <div class="flex items-center space-x-2 text-sm text-gray-500">
                  <div
                    class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"
                  ></div>
                  <span>{{ $t('article.loadingMore') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- 回复输入框 -->
    <div v-if="showReplyInput" class="mt-4 ml-14">
      <UForm :schema="replySchema" :state="replyState" @submit="handleReplySubmit">
        <UFormField name="content">
          <UTextarea
            v-model="replyState.content"
            :placeholder="$t('article.replyPlaceholder')"
            class="w-full p-3 rounded-md bg-gray-50 dark:bg-gray-700 border-none resize-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-200 text-sm"
          />
        </UFormField>
        <div class="flex justify-end space-x-2 mt-2">
          <UButton
            type="button"
            variant="ghost"
            @click="showReplyInput = false"
            class="text-sm cursor-pointer dark:text-white"
          >
            {{ $t('common.cancel') }}
          </UButton>
          <UButton
            type="submit"
            :loading="isReplyLoading"
            class="text-sm cursor-pointer dark:text-white"
          >
            {{ $t('article.reply') }}
          </UButton>
        </div>
      </UForm>
    </div>

    <!-- 编辑输入框 -->
    <div v-if="showEditInput" class="mt-4 ml-14">
      <UForm :schema="editSchema" :state="editState" @submit="handleEditSubmit">
        <UFormField name="content">
          <UTextarea
            v-model="editState.content"
            :placeholder="$t('article.commentText')"
            class="w-full p-3 rounded-md bg-gray-50 dark:bg-gray-700 border-none resize-none focus:ring-2 focus:ring-primary-500 text-gray-700 dark:text-gray-200 text-sm"
          />
        </UFormField>
        <div class="flex justify-end space-x-2 mt-2">
          <UButton
            type="button"
            variant="ghost"
            @click="showEditInput = false"
            class="text-sm cursor-pointer dark:text-white"
          >
            {{ $t('common.cancel') }}
          </UButton>
          <UButton
            type="submit"
            :loading="isEditLoading"
            class="text-sm cursor-pointer dark:text-white"
          >
            {{ $t('common.save') }}
          </UButton>
        </div>
      </UForm>
    </div>

    <!-- 回复列表 -->
  </div>
</template>

<script lang="ts" setup>
  import type { FormSubmitEvent } from '@nuxt/ui';
  import { z } from 'zod';
  import type { CommentControllerFindAllResponse } from '~/api';
  import { useUserStore } from '~/stores/user';
  type Comment = CommentControllerFindAllResponse['data']['data'][0] & {
    isLiked: boolean;
    showReplyInput?: boolean;
    showEditInput?: boolean;
  };
  import {
    commentControllerLike,
    commentControllerCreate,
    commentControllerUpdate,
    commentControllerRemove,
    commentControllerFindOne
  } from '~/api';

  // 响应式状态 - 弹窗
  const showDetailModal = ref(false);
  const showRepliesModal = ref(false);

  const props = defineProps<{
    comment: Comment;
  }>();
  const emit = defineEmits<{
    'reply-added': [comment: Comment];
    'comment-updated': [comment: Comment];
    'comment-deleted': [commentId: number];
  }>();

  const { t } = useI18n();
  const userStore = useUserStore();
  const toast = useToast();

  // 响应式状态
  const showReplyInput = ref(false);
  const showEditInput = ref(false);
  const isLikeLoading = ref(false);
  const isReplyLoading = ref(false);
  const isEditLoading = ref(false);
  const isDeleteLoading = ref(false);
  const isLoadingReplies = ref(false);
  const replies = ref<Comment[]>([]);
  const hasMoreReplies = ref(false);
  const currentPage = ref(1);
  const currentRequest = ref<AbortController | null>(null);

  // 模板引用
  const repliesContainer = ref<HTMLElement>();
  const modalContent = ref<HTMLElement>();

  // 表单状态
  const replySchema = z.object({
    content: z.string().min(1, t('article.commentText'))
  });

  const editSchema = z.object({
    content: z.string().min(1, t('article.commentText'))
  });

  const replyToReplySchema = z.object({
    content: z.string().min(1, t('article.commentText'))
  });

  const editReplySchema = z.object({
    content: z.string().min(1, t('article.commentText'))
  });

  const replyState = reactive({
    content: ''
  });

  const editState = reactive({
    content: props.comment.content
  });

  const replyToReplyState = reactive({
    content: ''
  });

  const editReplyState = reactive({
    content: ''
  });

  // 计算属性
  const currentUser = computed(() => userStore.userInfo);
  const isLoggedIn = computed(() => userStore.isLoggedIn);

  // 响应式 Popover 模式
  const popoverMode = computed(() => {
    // 检测是否为移动设备
    if (process.client) {
      return window.innerWidth < 768 ? 'click' : 'hover';
    }
    return 'hover'; // 服务端默认使用 hover
  });

  // 响应式延迟时间
  const popoverOpenDelay = computed(() => (popoverMode.value === 'hover' ? 300 : 0));
  const popoverCloseDelay = computed(() => (popoverMode.value === 'hover' ? 100 : 0));

  const canEdit = computed(() => {
    if (!isLoggedIn.value || !currentUser.value) return false;
    return currentUser.value.id === props.comment.author?.id;
  });

  const canDelete = computed(() => {
    if (!isLoggedIn.value || !currentUser.value) return false;
    const isOwner = currentUser.value.id === props.comment.author?.id;
    const isAdmin = Array.isArray((currentUser.value as any).roles)
      ? (currentUser.value as any).roles.some((r: any) => r?.name === 'admin')
      : false;
    return isOwner || isAdmin;
  });

  // 方法
  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleReply = () => {
    if (!isLoggedIn.value) {
      toast.add({
        title: t('article.loginRequired'),
        color: 'error'
      });
      return;
    }
    showReplyInput.value = !showReplyInput.value;
    if (showReplyInput.value) {
      showEditInput.value = false;
    }
  };

  const openRepliesModal = async () => {
    showRepliesModal.value = true;
    // 若尚未加载任何回复，先加载第一页
    if (replies.value.length === 0) {
      await loadReplies();
    }
  };

  // 监听弹窗打开状态，自动加载评论详情
  // watch(showRepliesModal, async newValue => {
  //   if (newValue && (props.comment.replyCount || 0) > 0 && replies.value.length === 0) {
  //     await loadReplies();
  //   }
  // });

  // 监听弹窗关闭，重置回复状态
  watch(showRepliesModal, newValue => {
    if (!newValue) {
      replies.value = [];
      currentPage.value = 1;
      hasMoreReplies.value = false;
    }
  });

  // 监听评论详情弹窗关闭，重置回复状态
  watch(showDetailModal, newValue => {
    if (!newValue) {
      replies.value = [];
      currentPage.value = 1;
      hasMoreReplies.value = false;
    }
  });

  const loadCommentDetail = async () => {
    // 加载评论详情时，同时加载第一页回复
    if ((props.comment.replyCount || 0) > 0 && replies.value.length === 0) {
      await loadReplies();
    }
  };

  const toggleEdit = () => {
    showEditInput.value = !showEditInput.value;
    if (showEditInput.value) {
      showReplyInput.value = false;
      editState.content = props.comment.content;
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn.value) {
      toast.add({
        title: t('article.loginRequired'),
        color: 'error'
      });
      return;
    }

    try {
      isLikeLoading.value = true;
      await commentControllerLike({
        composable: 'useFetch',
        key: `comment_like_${props.comment.id}`,
        path: { id: props.comment.id! }
      });

      // 更新本地状态
      props.comment.isLiked = !props.comment.isLiked;
      props.comment.likes = props.comment.isLiked
        ? (props.comment.likes || 0) + 1
        : Math.max(0, (props.comment.likes || 0) - 1);

      // 移除点赞/取消点赞的 toast 通知，因为状态变化已经通过 UI 反映
    } catch (error) {
    } finally {
      isLikeLoading.value = false;
    }
  };

  const handleReplySubmit = async (payload: FormSubmitEvent<{ content: string }>) => {
    try {
      isReplyLoading.value = true;
      await commentControllerCreate({
        composable: '$fetch',
        key: `comment_reply_create_${props.comment.id}`,
        body: {
          content: payload.data.content,
          articleId: Number(props.comment.article?.id || 0),
          parentId: props.comment.id || 0
        }
      });

      // 重新拉取第一页回复，保证数据一致
      await resetAndReloadReplies();

      // 更新主评论的回复数量
      const currentReplyCount = props.comment.replyCount || 0;
      props.comment.replyCount = currentReplyCount + 1;

      replyState.content = '';
      showReplyInput.value = false;
    } catch (error) {
    } finally {
      isReplyLoading.value = false;
    }
  };

  const handleEditSubmit = async (payload: FormSubmitEvent<{ content: string }>) => {
    try {
      isEditLoading.value = true;
      await commentControllerUpdate({
        composable: '$fetch',
        key: `comment_update_${props.comment.id}`,
        path: { id: props.comment.id || 0 },
        body: {
          content: payload.data.content,
          articleId: Number(props.comment.article?.id || 0)
        }
      });
      // 简单本地更新
      props.comment.content = payload.data.content;
      showEditInput.value = false;
      // 移除编辑成功的 toast，因为用户可以看到内容已经更新
    } catch (error) {
    } finally {
      isEditLoading.value = false;
    }
  };

  const handleDelete = async () => {
    try {
      isDeleteLoading.value = true;
      await commentControllerRemove({
        composable: '$fetch',
        path: { id: props.comment.id! }
      });

      emit('comment-deleted', (props.comment.id as number) || 0);
    } catch (error) {
    } finally {
      isDeleteLoading.value = false;
    }
  };

  const loadReplies = async () => {
    // 如果已经有请求在进行中，取消之前的请求
    if (currentRequest.value) {
      currentRequest.value.abort();
    }

    // 创建新的 AbortController
    currentRequest.value = new AbortController();

    try {
      isLoadingReplies.value = true;
      const response = await commentControllerFindOne({
        composable: '$fetch',
        path: { id: props.comment.id! },
        query: { page: currentPage.value, limit: 10 }
      });

      const resVal: any = response as any;
      const newReplies = resVal?.data?.data ?? [];

      // 追加新回复到现有列表
      replies.value.push(...(newReplies as Comment[]));

      // 检查是否还有更多回复
      const meta = resVal?.data?.meta;
      hasMoreReplies.value = meta?.page < meta?.totalPages;

      // 增加页码
      currentPage.value++;
    } catch (error: any) {
      // 如果是取消请求的错误，不显示错误信息
      if (error.name === 'AbortError') {
        return;
      }
      console.error('加载回复失败:', error);
    } finally {
      isLoadingReplies.value = false;
      currentRequest.value = null;
    }
  };

  const loadMoreReplies = () => {
    loadReplies();
  };

  // 防抖函数
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const handleScroll = debounce((event: Event) => {
    const target = event.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    // 当滚动到距离底部 50px 时触发加载
    if (
      scrollHeight - scrollTop - clientHeight < 50 &&
      hasMoreReplies.value &&
      !isLoadingReplies.value
    ) {
      loadMoreReplies();
    }
  }, 100); // 100ms 防抖延迟

  const resetAndReloadReplies = async () => {
    // 取消当前请求
    if (currentRequest.value) {
      currentRequest.value.abort();
    }

    replies.value = [];
    currentPage.value = 1;
    hasMoreReplies.value = false;
    await loadReplies();
  };

  const handleReplyAdded = (comment: Comment) => {
    emit('reply-added', comment);
  };

  const handleCommentUpdated = (comment: Comment) => {
    emit('comment-updated', comment);
  };

  const handleCommentDeleted = (commentId: number) => {
    emit('comment-deleted', commentId);
  };

  // 子评论功能方法
  const handleReplyLike = async (reply: Comment) => {
    if (!isLoggedIn.value) {
      toast.add({
        title: t('article.loginRequired'),
        color: 'error'
      });
      return;
    }

    try {
      isLikeLoading.value = true;
      await commentControllerLike({
        composable: '$fetch',
        path: { id: reply.id! }
      });

      // 更新本地状态
      reply.isLiked = !reply.isLiked;
      reply.likes = reply.isLiked ? (reply.likes || 0) + 1 : Math.max(0, (reply.likes || 0) - 1);

      // 移除回复点赞/取消点赞的 toast 通知，因为状态变化已经通过 UI 反映
    } catch (error) {
    } finally {
      isLikeLoading.value = false;
    }
  };

  const toggleReplyToReply = (reply: Comment) => {
    if (!isLoggedIn.value) {
      toast.add({
        title: t('article.loginRequired'),
        color: 'error'
      });
      return;
    }

    // 为回复添加状态属性
    if (!reply.showReplyInput) {
      reply.showReplyInput = true;
      reply.showEditInput = false;
    } else {
      reply.showReplyInput = false;
    }
  };

  const toggleEditReply = (reply: Comment) => {
    // 为回复添加状态属性
    if (!reply.showEditInput) {
      reply.showEditInput = true;
      reply.showReplyInput = false;
      editReplyState.content = reply.content || '';
    } else {
      reply.showEditInput = false;
    }
  };

  const canEditReply = (reply: Comment) => {
    if (!isLoggedIn.value || !currentUser.value) return false;
    return currentUser.value.id === reply.author?.id;
  };

  const canDeleteReply = (reply: Comment) => {
    if (!isLoggedIn.value || !currentUser.value) return false;
    const isOwner = currentUser.value.id === reply.author?.id;
    const isAdmin = Array.isArray((currentUser.value as any).roles)
      ? (currentUser.value as any).roles.some((r: any) => r?.name === 'admin')
      : false;
    return isOwner || isAdmin;
  };

  const handleReplyToReplySubmit = async (
    reply: Comment,
    payload: FormSubmitEvent<{ content: string }>
  ) => {
    try {
      isReplyLoading.value = true;
      await commentControllerCreate({
        composable: '$fetch',
        key: `comment_reply_to_reply_${reply.id}`,
        body: {
          content: payload.data.content,
          articleId: Number(props.comment.article?.id),
          parentId: reply.id // 传递子评论的 ID 作为 parentId
        }
      });

      // 重新拉取回复列表
      await resetAndReloadReplies();

      // 更新主评论的回复数量
      const currentReplyCount = props.comment.replyCount || 0;
      props.comment.replyCount = currentReplyCount + 1;

      reply.showReplyInput = false;
      // 移除回复成功的 toast，因为用户可以看到新回复已经添加
    } catch (error) {
    } finally {
      isReplyLoading.value = false;
    }
  };

  const handleEditReplySubmit = async (
    reply: Comment,
    payload: FormSubmitEvent<{ content: string }>
  ) => {
    try {
      isEditLoading.value = true;
      await commentControllerUpdate({
        composable: '$fetch',
        path: { id: reply.id! },
        body: {
          content: payload.data.content,
          articleId: Number(props.comment.article?.id)
        }
      });

      reply.showEditInput = false;
      // 移除编辑成功的 toast，因为用户可以看到内容已经更新
    } catch (error) {
    } finally {
      isEditLoading.value = false;
    }
  };

  const handleDeleteReply = async (reply: Comment) => {
    try {
      isDeleteLoading.value = true;
      await commentControllerRemove({
        composable: '$fetch',
        path: { id: reply.id! }
      });

      // 从回复列表中移除
      const index = replies.value.findIndex(r => r.id === reply.id);
      if (index > -1) {
        replies.value.splice(index, 1);
      }

      // 更新主评论的回复数量
      const currentReplyCount = props.comment.replyCount || 0;
      props.comment.replyCount = Math.max(0, currentReplyCount - 1);

      // 移除删除成功的 toast，因为用户可以看到回复已经被删除
    } catch (error) {
    } finally {
      isDeleteLoading.value = false;
    }
  };

  // 组件卸载时清理请求
  onUnmounted(() => {
    if (currentRequest.value) {
      currentRequest.value.abort();
    }
  });
</script>

<style scoped></style>
