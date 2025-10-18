// Microsoft Clarity 统计插件 - 只在客户端加载
// 只有在用户同意 analytics cookie 后才加载

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  const appConfig = useAppConfig();
  const clarityId = appConfig.clarityId;

  // 检查 Clarity ID 是否有效
  if (!clarityId || clarityId === '') {
    console.warn('Clarity ID not configured or invalid. Skipping Clarity initialization.');
    return;
  }

  // 使用 useScriptClarity
  const { load } = useScriptClarity({
    id: clarityId
  });

  // 监听 cookie 同意状态
  const checkAndLoadClarity = () => {
    const cookieSettings = useCookie('cookie-settings');

    if (cookieSettings.value && (cookieSettings.value as any).analytics) {
      // 用户同意了分析 cookie，加载 Clarity
      load()
        .then(() => {
          console.log('Clarity loaded successfully');
        })
        .catch(error => {
          console.error('Failed to load Clarity:', error);
        });
    }
  };

  // 页面加载后检查（使用 nextTick 代替 onMounted）
  nextTick(() => {
    checkAndLoadClarity();
  });

  // 监听 cookie 设置变化
  watch(
    () => useCookie('cookie-settings').value,
    newSettings => {
      if (newSettings && (newSettings as any).analytics) {
        checkAndLoadClarity();
      }
    },
    { immediate: false }
  );
});
