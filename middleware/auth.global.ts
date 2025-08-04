export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore();
  const localePath = useLocalePath();

  // 如果已经登录且访问登录页或注册页，重定向到用户主页
  if ((to.path === localePath('/user/login') || to.path === localePath('/user/register')) && userStore.isAuthenticated) {
    return navigateTo(localePath('/user'));
  }

  // 检查是否需要登录（排除登录页面和注册页面）
  if (
    (to.path.startsWith('/user') && 
     to.path !== localePath('/user/login') && 
     to.path !== localePath('/user/register')) ||
    to.path.startsWith('/admin')
  ) {
    if (!userStore.isAuthenticated) {
      return navigateTo(localePath('/user/login'));
    }
  }
});
