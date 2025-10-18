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
    // 插件配置 - 启用所有常用插件
    plugins: [
      'advlist', // 高级列表
      'autolink', // 自动链接
      'lists', // 列表
      'link', // 链接
      'image', // 图片
      'charmap', // 特殊字符
      'preview', // 预览
      'anchor', // 锚点
      'searchreplace', // 搜索替换
      'visualblocks', // 可视化块
      'code', // 代码
      'fullscreen', // 全屏
      'insertdatetime', // 插入日期时间
      'media', // 媒体
      'table', // 表格
      'help', // 帮助
      'wordcount', // 字数统计
      'emoticons', // 表情符号
      'codesample', // 代码示例
      'directionality', // 文字方向
      'nonbreaking', // 不间断空格
      'pagebreak', // 分页符
      'quickbars', // 快速工具栏
      'save', // 保存
      'visualchars' // 显示不可见字符
    ],

    // 紧凑工具栏配置 - 尽可能放在一行
    toolbar:
      'undo redo | styles fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table codesample | emoticons charmap insertdatetime | searchreplace code fullscreen | removeformat help',

    // 禁用菜单栏
    menubar: false,

    // 内容样式 - 更好的排版
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        font-size: 14px;
        line-height: 1.6;
        color: #333;
        padding: 16px;
      }
      pre {
        background-color: #f4f4f4;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        overflow-x: auto;
      }
      code {
        background-color: #f4f4f4;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', Courier, monospace;
      }
      blockquote {
        border-left: 4px solid #ccc;
        margin: 16px 0;
        padding-left: 16px;
        color: #666;
      }
      table {
        border-collapse: collapse;
        width: 100%;
      }
      table td, table th {
        border: 1px solid #ddd;
        padding: 8px;
      }
      table th {
        background-color: #f4f4f4;
        font-weight: bold;
      }
      img {
        max-width: 100%;
        height: auto;
      }
    `,

    // 基础配置
    height: 600,

    // 语言配置
    language: locale,

    // 字体选项
    font_family_formats:
      '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;' +
      '苹方=PingFang SC,Microsoft YaHei,sans-serif;' +
      '宋体=simsun,serif;' +
      '仿宋=FangSong,serif;' +
      '黑体=SimHei,sans-serif;' +
      '楷体=KaiTi,serif;' +
      'Arial=arial,helvetica,sans-serif;' +
      'Arial Black=arial black,avant garde;' +
      'Comic Sans MS=comic sans ms,sans-serif;' +
      'Courier New=courier new,courier;' +
      'Georgia=georgia,palatino;' +
      'Times New Roman=times new roman,times;' +
      'Trebuchet MS=trebuchet ms,geneva;' +
      'Verdana=verdana,geneva',

    // 字号选项
    font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',

    // 块格式选项
    block_formats: '段落=p;标题1=h1;标题2=h2;标题3=h3;标题4=h4;标题5=h5;标题6=h6;预格式化=pre',

    // 样式格式
    style_formats: [
      {
        title: '标题',
        items: [
          { title: '标题 1', format: 'h1' },
          { title: '标题 2', format: 'h2' },
          { title: '标题 3', format: 'h3' },
          { title: '标题 4', format: 'h4' },
          { title: '标题 5', format: 'h5' },
          { title: '标题 6', format: 'h6' }
        ]
      },
      {
        title: '内联',
        items: [
          { title: '粗体', format: 'bold' },
          { title: '斜体', format: 'italic' },
          { title: '下划线', format: 'underline' },
          { title: '删除线', format: 'strikethrough' },
          { title: '上标', format: 'superscript' },
          { title: '下标', format: 'subscript' },
          { title: '代码', format: 'code' }
        ]
      },
      {
        title: '块',
        items: [
          { title: '段落', format: 'p' },
          { title: '引用', format: 'blockquote' },
          { title: '代码块', format: 'pre' }
        ]
      },
      {
        title: '对齐',
        items: [
          { title: '左对齐', format: 'alignleft' },
          { title: '居中', format: 'aligncenter' },
          { title: '右对齐', format: 'alignright' },
          { title: '两端对齐', format: 'alignjustify' }
        ]
      }
    ],

    // 行高选项
    line_height_formats: '1 1.2 1.4 1.5 1.6 1.8 2 2.5 3',

    // 颜色选择器
    color_cols: 8,
    custom_colors: true,

    // 表格默认样式
    table_default_attributes: {
      border: '1'
    },
    table_default_styles: {
      'border-collapse': 'collapse',
      width: '100%'
    },
    table_responsive_width: true,
    table_class_list: [
      { title: '无', value: '' },
      { title: '边框表格', value: 'table-bordered' },
      { title: '斑马纹表格', value: 'table-striped' }
    ],

    // 代码示例语言
    codesample_languages: [
      { text: 'HTML/XML', value: 'markup' },
      { text: 'JavaScript', value: 'javascript' },
      { text: 'TypeScript', value: 'typescript' },
      { text: 'CSS', value: 'css' },
      { text: 'Python', value: 'python' },
      { text: 'Java', value: 'java' },
      { text: 'C', value: 'c' },
      { text: 'C++', value: 'cpp' },
      { text: 'C#', value: 'csharp' },
      { text: 'PHP', value: 'php' },
      { text: 'Ruby', value: 'ruby' },
      { text: 'Go', value: 'go' },
      { text: 'Rust', value: 'rust' },
      { text: 'SQL', value: 'sql' },
      { text: 'Bash', value: 'bash' },
      { text: 'JSON', value: 'json' },
      { text: 'Markdown', value: 'markdown' }
    ],

    // 快速工具栏
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
    quickbars_insert_toolbar: 'quickimage quicktable',

    // 上下文菜单
    contextmenu: 'link image table',

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
    smart_paste: true, // 智能粘贴
    paste_word_valid_elements: 'b,strong,i,em,h1,h2,h3,h4,h5,h6,p,ul,ol,li,a,table,tr,td,th', // Word粘贴过滤

    // 图片设置
    image_advtab: true, // 高级图片选项
    image_caption: true, // 图片标题
    image_description: true, // 图片描述
    image_title: true, // 图片title
    image_dimensions: true, // 图片尺寸

    // 链接设置
    link_title: true, // 链接标题
    link_target_list: [
      { title: '当前窗口', value: '' },
      { title: '新窗口', value: '_blank' }
    ],
    link_default_target: '_blank', // 默认新窗口打开

    // 媒体设置
    media_live_embeds: true, // 实时嵌入预览
    media_alt_source: true, // 备用源
    media_poster: true, // 视频封面

    // 响应式配置
    width: '100%',
    min_height: 400,
    max_height: 800,
    autoresize_bottom_margin: 50,

    // 状态栏设置
    elementpath: true, // 显示元素路径
    resize: 'both', // 允许调整大小
    statusbar: true, // 显示状态栏

    // 自动保存
    autosave_ask_before_unload: true,
    autosave_interval: '30s',
    autosave_prefix: 'tinymce-autosave-{path}{query}-{id}-',
    autosave_restore_when_empty: false,
    autosave_retention: '30m',

    // 文本模式
    directionality: 'ltr', // 文字方向

    // 拖拽设置
    draggable_modal: true,

    // 其他设置
    verify_html: false,
    cleanup: false,
    readonly: false,
    browser_spellcheck: true, // 浏览器拼写检查
    convert_urls: false, // 不转换URL

    // 模板（如果需要可以添加）
    templates: [
      {
        title: '基础文章模板',
        description: '包含标题、正文和结尾的基础模板',
        content:
          '<h2>文章标题</h2><p>在这里开始编写你的内容...</p><p>&nbsp;</p><hr><p><em>结束语</em></p>'
      },
      {
        title: '图文混排模板',
        description: '图片和文字混排的模板',
        content:
          '<h2>标题</h2><p><img src="https://via.placeholder.com/800x400" alt="示例图片" style="float: left; margin: 0 15px 15px 0;" />这里是文字内容...</p><div style="clear: both;"></div>'
      }
    ]
  });

  return {
    getBaseConfig,
    getEditorConfig
  };
};
