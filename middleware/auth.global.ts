export default defineNuxtRouteMiddleware((to, from) => {
  // 只在客户端执行中间件逻辑，避免服务端渲染时状态未恢复的问题
  if (import.meta.client) {
    const userStore = useUserStore();
    const localePath = useLocalePath();

    // 登录注册页面路径
    const authPages = [localePath('/user/login'), localePath('/user/register')];

    // 如果已经登录且访问登录页或注册页，重定向到适当的页面
    if (authPages.includes(to.path) && userStore.isAuthenticated) {
      // 检查是否为管理员 - 注意这里使用连字符
      const isAdmin = userStore.userInfo?.roles?.some(
        role => role.name === 'admin' || role.name === 'super-admin'
      );

      if (isAdmin) {
        return navigateTo(localePath('/admin'));
      }
      return navigateTo(localePath('/user'));
    }

    // 检查页面是否需要认证
    const requiresAuth = to.meta.requiresAuth ?? false;

    // 如果页面需要认证且用户未登录，重定向到登录页
    if (requiresAuth && !userStore.isAuthenticated) {
      console.log('页面需要认证但用户未登录，重定向到登录页');
      const redirectPath = to.fullPath;
      return navigateTo({
        path: localePath('/user/login'),
        query: { redirect: redirectPath }
      });
    }

    // 检查管理员权限（如果是 admin 路径）
    if (to.path.startsWith(localePath('/admin'))) {
      // 如果用户未登录，重定向到登录页
      if (!userStore.isAuthenticated) {
        console.log('访问管理面板但用户未登录，重定向到登录页');
        const redirectPath = to.fullPath;
        return navigateTo({
          path: localePath('/user/login'),
          query: { redirect: redirectPath }
        });
      }

      // 检查用户是否有管理员角色
      const hasAdminRole = userStore.userInfo?.roles?.some(
        role =>
          role.name === 'admin' || role.name === 'super-admin' || role.name === 'administrator'
      );

      console.log('访问管理面板，用户是否有管理员权限:', hasAdminRole);

      if (!hasAdminRole) {
        // 非管理员用户访问管理页面，重定向到用户主页
        console.log('用户没有管理员权限，重定向到用户面板');
        return navigateTo(localePath('/user'));
      }

      console.log('管理员权限验证通过，允许访问');
    }
  }
});
