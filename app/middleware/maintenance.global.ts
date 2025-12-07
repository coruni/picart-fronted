import { configControllerGetPublic } from '~/api';
import { useUserStore } from '~/stores/user';

export default defineNuxtRouteMiddleware(async (to, from) => {
  // 只在客户端执行维护模式检查
  if (import.meta.client) {
    try {
      // 使用现有的API接口获取配置
      const { data: configData } = await configControllerGetPublic({
        composable: 'useFetch'
      });

      let isMaintenanceMode = false;
      let maintenanceMessage = '';

      // 从配置数据中查找维护模式相关配置
      if (configData.value?.data) {
        isMaintenanceMode = configData.value.data.maintenance_mode || false;
        maintenanceMessage = configData.value.data.maintenance_message || '';
      }

      // 更新store中的维护模式状态
      const appStore = useAppStore();
      appStore.updateMaintenance({
        enabled: isMaintenanceMode,
        message: maintenanceMessage
      });

      if (isMaintenanceMode) {
        // 定义允许在维护模式下访问的路径
        const allowedPaths = [
          '/maintenance', // 维护页面本身
          '/user/login', // 登录页面
          '/user/register', // 注册页面
          '/user/forgot-password' // 忘记密码页面
        ];

        // 检查是否为管理后台路径
        const isAdminPath = to.path.startsWith('/admin');

        // 如果是管理后台路径，检查用户是否已登录且是管理员
        if (isAdminPath) {
          const userStore = useUserStore();

          // 如果用户未登录，重定向到登录页面
          if (!userStore.isLoggedIn) {
            return navigateToLoginWithNavigateTo(to.fullPath);
          }

          // 用户已登录，但用户信息可能还在加载中
          // 对于维护模式下的管理页面，我们也采用延迟权限检查策略
          if (!userStore.userInfo) {
            // 设置一个短暂延迟，等待用户信息加载
            const checkAdminPermission = () => {
              if (userStore.userInfo) {
                const isAdmin = userStore.userInfo?.roles?.some(
                  role =>
                    role.name === 'admin' ||
                    role.name === 'super-admin' ||
                    role.name === 'administrator'
                );

                if (!isAdmin) {
                  // 不是管理员，重定向到维护页面
                  return navigateTo('/maintenance');
                }

                return;
              }

              // 如果等待后仍然没有用户信息，再次检查登录状态
              if (!userStore.isLoggedIn) {
                return navigateToLoginWithNavigateTo(to.fullPath);
              }

              // 继续等待用户信息加载（最多等待3秒）
              setTimeout(checkAdminPermission, 100);
            };

            // 开始权限检查
            checkAdminPermission();
            return;
          }

          // 用户信息已加载，直接检查权限
          const isAdmin = userStore.userInfo?.roles?.some(
            role =>
              role.name === 'admin' || role.name === 'super-admin' || role.name === 'administrator'
          );

          // 如果不是管理员，重定向到维护页面
          if (!isAdmin) {
            return navigateTo('/maintenance');
          }

          // 如果是管理员，允许访问管理后台
          return;
        }

        // 如果不是允许的路径，则重定向到维护页面
        if (!allowedPaths.includes(to.path)) {
          return navigateTo('/maintenance');
        }
      }
    } catch (error) {
      // 如果检查失败，为了安全起见，不启用维护模式
      const appStore = useAppStore();
      appStore.setMaintenanceMode(false);
    }
  }
});
