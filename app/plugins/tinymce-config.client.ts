// 扩展 Window 接口以包含 TinyMCE
declare global {
  interface Window {
    tinymce?: {
      settings?: {
        license_key?: string;
        base_url?: string;
        suffix?: string;
        branding?: boolean;
        promotion?: boolean;
        language?: string;
      };
    };
  }
}

export default defineNuxtPlugin(() => {
  // 在客户端设置 TinyMCE 全局配置
  if (import.meta.client) {
    const config = useRuntimeConfig();

    // 等待 TinyMCE 加载完成后设置配置
    const setupTinyMCE = () => {
      if (window.tinymce) {
        // 设置全局默认配置
        window.tinymce.settings = window.tinymce.settings || {};

        // 设置 GPL 许可证
        window.tinymce.settings.license_key = (config.public.tinymceLicenseKey as string) || 'gpl';

        // 设置基础配置
        window.tinymce.settings.base_url = '/tinymce';
        window.tinymce.settings.suffix = '.min';

        // 禁用品牌和推广
        window.tinymce.settings.branding = false;
        window.tinymce.settings.promotion = false;

        // 设置默认语言
        window.tinymce.settings.language = 'zh';

        console.log('TinyMCE GPL license configured');
      } else {
        // 如果 TinyMCE 还没加载，等待一下再试
        setTimeout(setupTinyMCE, 100);
      }
    };

    // 立即尝试设置
    setupTinyMCE();

    // 监听 TinyMCE 脚本加载完成
    const checkForScript = () => {
      const script = document.querySelector('script[src*="tinymce"]');
      if (script) {
        // 确保脚本已正确加载
        if (script.hasAttribute('type')) {
          script.setAttribute('type', 'application/javascript');
        }
        script.addEventListener('load', setupTinyMCE);
      } else {
        // 如果还没找到脚本，继续检查
        setTimeout(checkForScript, 100);
      }
    };

    // 开始检查脚本
    checkForScript();
  }
});
