/**
 * 图片预加载和缓存优化插件
 * 在客户端优化图片加载和缓存策略
 */
export default defineNuxtPlugin({
  name: 'image-preload',
  setup() {
    // 图片预加载缓存
    const imageCache = new Map<string, HTMLImageElement>();

    // 预加载图片
    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // 检查缓存
        if (imageCache.has(src)) {
          resolve();
          return;
        }

        const img = new Image();
        img.onload = () => {
          imageCache.set(src, img);
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    };

    // 批量预加载图片
    const preloadImages = async (srcs: string[]) => {
      try {
        await Promise.all(srcs.map(src => preloadImage(src)));
      } catch (error) {
        console.warn('图片预加载失败:', error);
      }
    };

    // 清理缓存（可选）
    const clearImageCache = () => {
      imageCache.clear();
    };

    // 暴露给全局使用
    return {
      provide: {
        preloadImage,
        preloadImages,
        clearImageCache
      }
    };
  }
});
