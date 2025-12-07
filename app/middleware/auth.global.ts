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
  if (requiresAuth && !userStore.isLoggedIn) {
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
    if (!userStore.isLoggedIn) {
      return navigateTo({
        path: localePath('/user/login'),
        query: { redirect: to.fullPath }
      });
    }

    // 用户已登录，但用户信息可能还在加载中
    // 对于管理页面，我们采用延迟权限检查策略
    if (import.meta.client) {
      // 在客户端，如果用户信息还未加载完成，等待一段时间再检查
      if (!userStore.userInfo) {
        // 设置一个短暂延迟，等待用户信息加载
        const checkPermission = () => {
          if (userStore.userInfo) {
            const hasAdminRole = userStore.userInfo?.roles?.some(
              role =>
                role.name === 'admin' ||
                role.name === 'super-admin' ||
                role.name === 'administrator'
            );

            if (!hasAdminRole) {
              // 非管理员用户访问管理页面，重定向到用户主页
              return navigateTo(localePath('/user'));
            }

            return;
          }

          // 如果等待后仍然没有用户信息，再次检查登录状态
          if (!userStore.isLoggedIn) {
            return navigateTo({
              path: localePath('/user/login'),
              query: { redirect: to.fullPath }
            });
          }

          // 继续等待用户信息加载（最多等待3秒）
          setTimeout(checkPermission, 100);
        };

        // 开始权限检查
        checkPermission();
        return;
      }

      // 用户信息已加载，直接检查权限
      const hasAdminRole = userStore.userInfo?.roles?.some(
        role =>
          role.name === 'admin' || role.name === 'super-admin' || role.name === 'administrator'
      );

      if (!hasAdminRole) {
        // 非管理员用户访问管理页面，重定向到用户主页
        return navigateTo(localePath('/user'));
      }
    } else {
      // 在服务器端，由于用户信息可能无法获取，我们采用更严格的策略
      // 只有在用户信息明确存在且有管理员权限时才允许访问
      const hasAdminRole = userStore.userInfo?.roles?.some(
        role =>
          role.name === 'admin' || role.name === 'super-admin' || role.name === 'administrator'
      );

      if (!hasAdminRole) {
        // 在服务器端无法确认权限时，默认拒绝访问
        return navigateTo(localePath('/user'));
      }
    }

    // 管理员访问 /admin 路径，允许通过
    return;
  }

  // 如果已经登录且访问登录页或注册页，重定向到适当的页面
  if (authPages.includes(to.path) && userStore.isLoggedIn) {
    // 检查是否为管理员
    if (import.meta.client) {
      // 在客户端，如果用户信息还未加载完成，等待一下再决定重定向
      if (!userStore.userInfo) {
        // 设置一个短暂延迟，等待用户信息加载
        const checkUserType = () => {
          if (userStore.userInfo) {
            const isAdmin = userStore.userInfo?.roles?.some(
              role => role.name === 'admin' || role.name === 'super-admin'
            );

            if (isAdmin) {
              return navigateTo(localePath('/admin'));
            }
            return navigateTo(localePath('/user'));
          }

          // 如果等待后仍然没有用户信息，基于登录状态重定向到用户页面
          return navigateTo(localePath('/user'));
        };

        // 开始用户类型检查
        setTimeout(checkUserType, 200);
        return;
      }

      // 用户信息已加载，直接检查权限
      const isAdmin = userStore.userInfo?.roles?.some(
        role => role.name === 'admin' || role.name === 'super-admin'
      );

      if (isAdmin) {
        return navigateTo(localePath('/admin'));
      }
    } else {
      // 在服务器端，基于登录状态重定向到用户页面
      return navigateTo(localePath('/user'));
    }

    return navigateTo(localePath('/user'));
  }
});
