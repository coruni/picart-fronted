import { uploadControllerUploadFile } from '~/api';

export const useTinyMCE = () => {
  const config = useRuntimeConfig();

  // 获取基础 TinyMCE 配置
  const getBaseConfig = () => ({
    // 基础路径配置 - 指向 public/tinymce 目录
    base_url: '/tinymce',
    suffix: '.min',
    // 设置 GPL 许可证
    license_key: (config.public.tinymceLicenseKey as string) || 'gpl',
    // 禁用品牌和推广
    branding: false,
    promotion: false
  });

  // 获取完整的编辑器配置
  const getEditorConfig = (locale = 'zh') => ({
    ...getBaseConfig(),
    // 插件配置
    plugins: [
      'advlist',
      'autolink',
      'lists',
      'link',
      'image',
      'charmap',
      'preview',
      'anchor',
      'searchreplace',
      'visualblocks',
      'code',
      'fullscreen',
      'insertdatetime',
      'media',
      'table',
      'help',
      'wordcount'
    ],

    // 工具栏配置
    toolbar:
      'undo redo | formatselect | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat | help',

    // 内容样式
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',

    // 基础配置
    height: 400,
    menubar: false,

    // 语言配置
    language: locale,

    // 图片上传配置（使用服务器上传）
    images_upload_handler: async (blobInfo: any, progress: any) => {
      try {
        const formData = new FormData();
        formData.append('files', blobInfo.blob(), blobInfo.filename());

        const res = await uploadControllerUploadFile({
          composable: '$fetch',
          body: {},
          bodySerializer: () => formData
        });

        if (res.data && res.data[0]) {
          return res.data[0].url;
        } else {
          throw new Error('上传失败');
        }
      } catch (error) {
        console.error('图片上传失败:', error);
        throw error;
      }
    },

    // 启用在线功能
    automatic_uploads: true,
    file_picker_types: 'image',

    // 编辑器设置
    paste_data_images: true, // 允许粘贴图片
    paste_as_text: false,

    // 响应式配置
    width: '100%',
    min_height: 300,
    max_height: 600,

    // 移除不需要的功能
    elementpath: false,
    resize: true,
    statusbar: false,

    // 禁用在线验证
    verify_html: false,
    cleanup: false,

    // 设置编辑器为可编辑
    readonly: false
  });

  return {
    getBaseConfig,
    getEditorConfig
  };
};
