/**
 * 登出相关的工具函数
 */

import { useUserStore } from '~/stores/user';

/**
 * 统一的登出处理函数
 * @param showConfirm 是否显示确认对话框
 * @param redirectPath 登出后重定向的路径，默认为首页
 */
export async function handleLogout(
  showConfirm: boolean = false,
  redirectPath: string = '/'
): Promise<void> {
  try {
    // 如果需要确认
    if (showConfirm) {
      const confirmed = confirm('确定要退出登录吗？');
      if (!confirmed) {
        return;
      }
    }

    // 获取用户store
    const userStore = useUserStore();

    // 执行登出
    await userStore.clearAuth(true);

    // 如果指定了重定向路径且不是首页，则跳转到指定路径
    if (redirectPath !== '/' && import.meta.client) {
      await navigateTo(redirectPath, { replace: true });
    }
  } catch (error) {
    // 登出失败时静默处理

    // 即使出错也要跳转到首页
    if (import.meta.client) {
      await navigateTo('/', { replace: true });
    }
  }
}

/**
 * 静默登出（不显示确认对话框）
 * @param redirectPath 登出后重定向的路径
 */
export async function silentLogout(redirectPath: string = '/'): Promise<void> {
  return handleLogout(false, redirectPath);
}

/**
 * 带确认的登出
 * @param redirectPath 登出后重定向的路径
 */
export async function confirmLogout(redirectPath: string = '/'): Promise<void> {
  await forceLogout();
  return handleLogout(true, redirectPath);
}

/**
 * 强制登出（用于token过期等情况）
 */
export async function forceLogout(): Promise<void> {
  try {
    const userStore = useUserStore();
    await userStore.clearAuth(false); // 不调用API，直接清理本地状态
  } catch (error) {
    // 强制登出失败时静默处理
    if (import.meta.client) {
      await navigateTo('/', { replace: true });
    }
  }
}
