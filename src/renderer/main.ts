import { createApp } from "vue"
import ElementPlus from "element-plus";
import zhLocale from "element-plus/lib/locale/lang/zh-cn"
import mixin from "@/mixin/index"
import App from "./App.vue"
import axios from "@/api/api"
import * as helper from "@/helper/index"
import "./registerServiceWorker"
import "element-plus/lib/theme-chalk/index.css";
import { router } from "./router"
import store from "./store"
import { registeGlobalComponent } from "@/components"
const app = createApp(App, {
    mixin: [mixin]
})

app.config.globalProperties.$helper = helper; //挂载全局辅助函数
registeGlobalComponent(app); //注册全局组件
app.use(axios).use(store).use(ElementPlus, { locale: zhLocale }).use(router);
app.mount("#app")
