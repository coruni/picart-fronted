export default defineAppConfig({
  apiBaseUrl: 'https://api.example.com/api/v1',
  ui: {
    colors: {
      primary: 'indigo'
    },
    button: {
      variants: {}
    },
    close: 'cursor-pointer',
    icons: {
      arrowLeft: 'mynaui:arrow-left',
      arrowRight: 'mynaui:arrow-right',
      check: 'mynaui:check',
      chevronDoubleLeft: 'mynaui:chevron-double-left',
      chevronDoubleRight: 'mynaui:chevron-double-right',
      chevronDown: 'mynaui:chevron-down',
      chevronLeft: 'mynaui:chevron-left',
      chevronRight: 'mynaui:chevron-right',
      chevronUp: 'mynaui:chevron-up',
      close: 'mynaui:x',
      ellipsis: 'mynaui:dots',
      external: 'mynaui:external-link',
      file: 'mynaui:file',
      folder: 'mynaui:folder',
      folderOpen: 'mynaui:folder-two',
      loading: 'mynaui:circle-notch',
      minus: 'mynaui:minus',
      plus: 'mynaui:plus',
      search: 'mynaui:search',
      upload: 'mynaui:upload'
    }
  },
  icon: {
    mode: 'css',
    cssLayer: 'base'
  }
});
