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
        // Clarity用户识别失败时静默处理
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
        // 设置Clarity标签失败时静默处理
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
        // Clarity升级会话失败时静默处理
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
        // Clarity触发事件失败时静默处理
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
