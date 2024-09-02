import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { config } from '@/../config/config';
import { zhCn } from 'element-plus/es/locales.mjs';
import { axiosPlugin } from './api/api';
import db from './cache/database';
import { registeGlobalComponent } from './components';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'
import registeDirective from './directive/directive';
import i18n from './i18n/i18n';
import { router } from './router';
import * as helper from '@/helper/index'
import { store, key } from './store';
import '@/../../public/font/iconfont'
import '@/../../public/font/iconfont.css'
import '@/assets/css/index.css'


const pinia = createPinia();
const app = createApp(App);

app.config.globalProperties.$helper = helper; //挂载全局辅助函数
app.config.globalProperties.config = config; //挂载全局辅助函数
app.config.globalProperties.db = db; //挂载全局数据库

registeGlobalComponent(app); //注册全局组件
registeDirective(app); //注册全局指令
app.use(pinia)
app.use(store, key);
app.use(axiosPlugin).use(ElementPlus, { locale: zhCn }).use(router).use(i18n);
app.mount('#app')
