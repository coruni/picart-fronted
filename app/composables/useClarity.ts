// Clarity 统计功能的 composable
// 提供便捷的方法来使用 Clarity 的功能

declare global {
  interface Window {
    clarity?: (action: string, ...args: any[]) => void;
  }
}

export const useClarity = () => {
  // 获取 window.clarity 函数
  const getClarity = () => {
    if (import.meta.client && typeof window !== 'undefined') {
      return window.clarity;
    }
    return undefined;
  };

  // 识别用户
  const identifyUser = (
    customId: string,
    customSessionId?: string,
    customPageId?: string,
    friendlyName?: string
  ) => {
    const clarity = getClarity();
    if (clarity) {
      try {
        clarity('identify', customId, customSessionId, customPageId, friendlyName);
      } catch (error) {
        console.error('Failed to identify user in Clarity:', error);
      }
    }
  };

  // 设置自定义标签
  const setTag = (key: string, value: string | string[]) => {
    const clarity = getClarity();
    if (clarity) {
      try {
        clarity('set', key, value);
      } catch (error) {
        console.error('Failed to set Clarity tag:', error);
      }
    }
  };

  // 升级会话
  const upgrade = (reason: string) => {
    const clarity = getClarity();
    if (clarity) {
      try {
        clarity('upgrade', reason);
      } catch (error) {
        console.error('Failed to upgrade Clarity session:', error);
      }
    }
  };

  // 触发自定义事件
  const event = (eventName: string) => {
    const clarity = getClarity();
    if (clarity) {
      try {
        clarity('event', eventName);
      } catch (error) {
        console.error('Failed to trigger Clarity event:', error);
      }
    }
  };

  return {
    identifyUser,
    setTag,
    upgrade,
    event
  };
};
