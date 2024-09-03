import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { axiosPlugin } from './api/api';
import ElementPlus from 'element-plus';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia)
app.use(axiosPlugin).use(ElementPlus, { locale: zhCn });
app.mount('#app')
