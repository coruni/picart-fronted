import { configControllerGetPublic } from '~/api';
import type { ConfigControllerGetPublicResponse } from '~/api';
type Config = ConfigControllerGetPublicResponse['data'];

export const useAdvertisement = async () => {
  // 获取配置数据
  const { data: configData } = await configControllerGetPublic({
    composable: 'useFetch'
  });

  // 将配置数据转换为对象
  const config = computed<Config>(() => {
    if (!configData.value?.data) return {} as Config;

    // configData.value.data 已经是一个对象，直接返回
    return configData.value.data as Config;
  });

  // 检查广告是否启用
  const isAdEnabled = (type: 'homepage' | 'article-top' | 'article-bottom' | 'global') => {
    switch (type) {
      case 'homepage':
        return config.value.ad_homepage_enabled;
      case 'article-top':
        return config.value.ad_article_top_enabled;
      case 'article-bottom':
        return config.value.ad_article_bottom_enabled;
      case 'global':
        return config.value.ad_global_enabled;
      default:
        return false;
    }
  };

  // 获取广告内容
  const getAdContent = (type: 'homepage' | 'article-top' | 'article-bottom' | 'global') => {
    switch (type) {
      case 'homepage':
        return config.value.ad_homepage_content || '';
      case 'article-top':
        return config.value.ad_article_top_content || '';
      case 'article-bottom':
        return config.value.ad_article_bottom_content || '';
      case 'global':
        return config.value.ad_global_content || '';
      default:
        return '';
    }
  };

  // 获取广告位置
  const getAdPosition = (type: 'homepage' | 'global') => {
    switch (type) {
      case 'homepage':
        return config.value.ad_homepage_position || 'top';
      case 'global':
        return config.value.ad_global_position || 'fixed-bottom';
      default:
        return '';
    }
  };

  // 获取广告样式
  const getAdStyle = (type: 'global') => {
    if (type === 'global' && config.value.ad_global_style) {
      return config.value.ad_global_style;
    }
    return {};
  };

  // 获取广告容器样式类
  const getAdContainerClass = (
    type: 'homepage' | 'article-top' | 'article-bottom' | 'global',
    position?: string
  ) => {
    const baseClasses = 'advertisement-container';
    let adPosition = position;

    if (type === 'homepage') {
      adPosition = config.value.ad_homepage_position || 'top';
    } else if (type === 'global') {
      adPosition = config.value.ad_global_position || 'fixed-bottom';
    }

    switch (adPosition) {
      case 'fixed-top':
        return `${baseClasses} fixed top-0 left-0 right-0 z-50`;
      case 'fixed-bottom':
        return `${baseClasses} fixed bottom-0 left-0 right-0 z-50`;
      case 'floating':
        return `${baseClasses} fixed bottom-4 right-4 z-50`;
      case 'top':
        return `${baseClasses} mb-6`;
      case 'bottom':
        return `${baseClasses} mt-6`;
      case 'sidebar':
        return `${baseClasses} mb-6`;
      default:
        return baseClasses;
    }
  };

  return {
    config,
    isAdEnabled,
    getAdContent,
    getAdPosition,
    getAdStyle,
    getAdContainerClass
  };
};
