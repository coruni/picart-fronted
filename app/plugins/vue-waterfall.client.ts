import { LazyImg, Waterfall } from 'vue-waterfall-plugin-next';
import 'vue-waterfall-plugin-next/dist/style.css';

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.component('Waterfall', Waterfall);
  nuxtApp.vueApp.component('LazyImg', LazyImg);
});
