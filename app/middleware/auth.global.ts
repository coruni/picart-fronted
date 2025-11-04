import { useUserStore } from '~/stores/user';
import { defineNuxtRouteMiddleware } from '#imports';

export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();
  const localePath = useLocalePath();

  // 登录注册页面路径
  const authPages = [localePath('/user/login'), localePath('/user/register')];

  // 检查页面是否需要认证
  const requiresAuth = to.meta.requiresAuth ?? false;

  // 如果页面需要认证且用户未登录，重定向到登录页
  if (requiresAuth && !userStore.isAuthenticated) {
    // 只在客户端使用 navigateToLoginWithNavigateTo
    if (import.meta.client) {
      return navigateToLoginWithNavigateTo(to.fullPath);
    } else {
      return navigateTo({
        path: localePath('/user/login'),
        query: { redirect: to.fullPath }
      });
    }
  }

  // 检查管理员路径的权限
  if (to.path.startsWith(localePath('/admin'))) {
    // 如果用户未登录，重定向到登录页
    if (!userStore.isAuthenticated) {
      return navigateTo({
        path: localePath('/user/login'),
        query: { redirect: to.fullPath }
      });
    }

    // 检查用户是否有管理员角色
    const hasAdminRole = userStore.userInfo?.roles?.some(
      role => role.name === 'admin' || role.name === 'super-admin' || role.name === 'administrator'
    );

    if (!hasAdminRole) {
      // 非管理员用户访问管理页面，重定向到用户主页
      return navigateTo(localePath('/user'));
    }

    // 管理员访问 /admin 路径，允许通过
    return;
  }

  // 如果已经登录且访问登录页或注册页，重定向到适当的页面
  if (authPages.includes(to.path) && userStore.isAuthenticated) {
    // 检查是否为管理员
    const isAdmin = userStore.userInfo?.roles?.some(
      role => role.name === 'admin' || role.name === 'super-admin'
    );

    if (isAdmin) {
      return navigateTo(localePath('/admin'));
    }
    return navigateTo(localePath('/user'));
  }
});
