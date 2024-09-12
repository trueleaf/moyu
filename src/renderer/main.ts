import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { axiosPlugin } from './api/api';
import ElementPlus from 'element-plus';
import i18next from 'i18next';
import I18NextVue from "i18next-vue";
import Backend from 'i18next-http-backend'


const pinia = createPinia();
const app = createApp(App);


await i18next.use(Backend).init({
  lng: 'zh',
  fallbackLng: "zh",
});
app.use(pinia)
app.use(axiosPlugin).use(I18NextVue, { i18next }).use(ElementPlus, { locale: zhCn });
app.mount('#app')
