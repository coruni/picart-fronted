/**
 * 图片缓存 Composable
 * 提供图片预加载、缓存管理等功能
 */

export const useImageCache = () => {
  const { $preloadImage, $preloadImages, $clearImageCache } = useNuxtApp();

  /**
   * 预加载单张图片
   */
  const preloadImage = async (src: string): Promise<void> => {
    if (import.meta.client && $preloadImage) {
      await $preloadImage(src);
    }
  };

  /**
   * 批量预加载图片
   */
  const preloadImages = async (srcs: string[]): Promise<void> => {
    if (import.meta.client && $preloadImages) {
      await $preloadImages(srcs);
    }
  };

  /**
   * 清理图片缓存
   */
  const clearImageCache = () => {
    if (import.meta.client && $clearImageCache) {
      $clearImageCache();
    }
  };

  /**
   * 预加载文章图片
   */
  const preloadArticleImages = (images: string[]) => {
    if (import.meta.client) {
      // 使用 requestIdleCallback 在浏览器空闲时预加载
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          preloadImages(images);
        });
      } else {
        // 降级方案
        setTimeout(() => {
          preloadImages(images);
        }, 1000);
      }
    }
  };

  /**
   * 预加载下一页的图片（用于无限滚动）
   */
  const preloadNextPageImages = (images: string[]) => {
    if (import.meta.client) {
      // 使用 Intersection Observer 延迟加载
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              preloadImages(images);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '200px' } // 提前 200px 开始预加载
      );

      // 创建一个虚拟元素来触发观察
      const trigger = document.createElement('div');
      trigger.style.position = 'absolute';
      trigger.style.bottom = '0';
      document.body.appendChild(trigger);
      observer.observe(trigger);

      return () => {
        observer.disconnect();
        document.body.removeChild(trigger);
      };
    }
  };

  return {
    preloadImage,
    preloadImages,
    clearImageCache,
    preloadArticleImages,
    preloadNextPageImages
  };
};
