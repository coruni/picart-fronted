export default defineAppConfig({
  apiBaseUrl:
    process.env.NODE_ENV === 'production'
      ? 'https://picend.cosfan.cc/api/v1'
      : 'http://picend.cosfan.cc/api/v1',
  ui: {
    colors: {
      primary: 'indigo'
    }
  }
});
