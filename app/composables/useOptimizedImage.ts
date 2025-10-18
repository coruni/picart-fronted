/**
 * 图片优化 Composable
 * 生成优化后的图片 URL 用于 VueEasyLightbox 等第三方组件
 */

export const useOptimizedImage = () => {
  const { $img } = useNuxtApp();

  /**
   * 生成优化后的图片 URL
   * @param src 原始图片 URL
   * @param options 优化选项
   */
  const getOptimizedImageUrl = (
    src: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpg' | 'png';
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    } = {}
  ): string => {
    if (!src) return '';

    try {
      // 使用 Nuxt Image 的 $img 工具生成优化后的 URL
      return $img(src, {
        width: options.width || 1920,
        quality: options.quality || 90,
        format: options.format || 'webp',
        fit: options.fit || 'cover'
      });
    } catch (error) {
      console.warn('图片优化失败，使用原始 URL:', error);
      return src;
    }
  };

  /**
   * 批量生成优化后的图片 URL
   * @param srcs 原始图片 URL 数组
   * @param options 优化选项
   */
  const getOptimizedImageUrls = (
    srcs: string[],
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpg' | 'png';
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    } = {}
  ): string[] => {
    return srcs.map(src => getOptimizedImageUrl(src, options));
  };

  /**
   * 为 VueEasyLightbox 生成优化后的图片对象数组
   * @param srcs 原始图片 URL 数组
   * @param titles 图片标题数组（可选）
   * @param options 优化选项
   */
  const getOptimizedLightboxImages = (
    srcs: string[],
    titles?: string[],
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpg' | 'png';
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    } = {}
  ): Array<{ src: string; title?: string }> => {
    return srcs.map((src, index) => ({
      src: getOptimizedImageUrl(src, options),
      title: titles?.[index]
    }));
  };

  return {
    getOptimizedImageUrl,
    getOptimizedImageUrls,
    getOptimizedLightboxImages
  };
};
