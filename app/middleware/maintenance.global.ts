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

          // 如果用户已登录，检查是否为管理员
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
      console.error('检查维护模式失败:', error);
      // 如果检查失败，为了安全起见，不启用维护模式
      const appStore = useAppStore();
      appStore.setMaintenanceMode(false);
    }
  }
});
