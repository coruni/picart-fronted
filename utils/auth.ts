/**
 * 认证相关的工具函数
 */

/**
 * 跳转到登录页面，自动添加重定向参数
 * @param currentPath 当前页面路径，用于登录后重定向
 * @param router 路由实例（可选，如果不提供则使用默认的）
 */
export const navigateToLogin = (currentPath?: string, router?: any) => {
  const route = useRoute();
  const routerInstance = router || useRouter();
  const localePath = useLocalePath();

  // 如果没有提供当前路径，使用当前路由的完整路径
  const redirectPath = currentPath || route.fullPath;

  // 构建登录URL，包含重定向参数
  const loginPath = localePath('/user/login');
  const query = redirectPath && redirectPath !== '/user/login' ? { redirect: redirectPath } : {};

  return routerInstance.push({
    path: loginPath,
    query
  });
};

/**
 * 跳转到登录页面（使用 navigateTo）
 * @param currentPath 当前页面路径，用于登录后重定向
 */
export const navigateToLoginWithNavigateTo = (currentPath?: string) => {
  const route = useRoute();
  const localePath = useLocalePath();

  // 如果没有提供当前路径，使用当前路由的完整路径
  const redirectPath = currentPath || route.fullPath;

  // 构建登录URL，包含重定向参数
  const loginPath = localePath('/user/login');
  const query = redirectPath && redirectPath !== '/user/login' ? { redirect: redirectPath } : {};

  return navigateTo({
    path: loginPath,
    query
  });
};

/**
 * 检查是否需要重定向到登录页面
 * @param requiresAuth 是否需要认证
 * @param isAuthenticated 是否已认证
 * @param currentPath 当前页面路径
 * @returns 如果需要重定向则返回重定向配置，否则返回 null
 */
export const checkAuthRedirect = (
  requiresAuth: boolean,
  isAuthenticated: boolean,
  currentPath?: string
) => {
  if (requiresAuth && !isAuthenticated) {
    const route = useRoute();
    const localePath = useLocalePath();

    const redirectPath = currentPath || route.fullPath;
    const loginPath = localePath('/user/login');

    return {
      path: loginPath,
      query: redirectPath && redirectPath !== '/user/login' ? { redirect: redirectPath } : {}
    };
  }

  return null;
};
