// Microsoft Clarity 统计插件 - 只在客户端加载
// 只有在用户同意 analytics cookie 后才加载
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return;

  const appConfig = useAppConfig();
  const clarityId = appConfig.clarityId || 'sw54hoqei8';

  // 检查 Clarity ID 是否有效
  if (!clarityId || clarityId === '' || clarityId.length < 10) {
    // Clarity ID 未配置或无效，跳过初始化
    return;
  }

  // 手动加载 Clarity 脚本
  const loadClarityScript = () => {
    // 检查是否已经加载
    if (window.clarity) {
      // Clarity 已经加载
      return;
    }

    // 初始化 Clarity 队列
    window.clarity = window.clarity = function (...params: any[]) {
      ((window.clarity as any).q = (window.clarity as any).q || []).push(params);
    };

    // 创建 script 标签
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${clarityId}`;

    // 错误处理
    script.onerror = error => {
      // 加载 Clarity 脚本失败时静默处理
    };

    // 成功加载
    script.onload = () => {
      // Clarity 脚本加载成功
    };

    // 添加到页面
    document.head.appendChild(script);
  };

  // 监听 cookie 同意状态并加载 Clarity
  const checkAndLoadClarity = () => {
    const cookieSettings = useCookie('cookie-settings');

    if (cookieSettings.value && (cookieSettings.value as any).analytics) {
      // 用户同意了分析 cookie，加载 Clarity
      loadClarityScript();
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
