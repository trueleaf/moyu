import { createApp } from "vue"
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn"
import config from "@/../config/config"
import mixin from "@/mixin/index"
import { axiosPlugin } from "@/api/api"
import * as helper from "@/helper/index"
import "element-plus/dist/index.css"
import { mockServer } from "@/server/mock-server"
import "@/../../public/font/iconfont"
import "@/../../public/font/iconfont.css"
import { registeGlobalComponent } from "@/components"
import "@/assets/css/index.css"
import i18n from "@/i18n/i18n"
import App from "./App.vue"
import { router } from "./router"
import registeDirective from "./directive/directive";
import { store, key } from "./store"

mockServer();
const app = createApp(App, {
    mixin: [mixin]
})

app.config.globalProperties.$helper = helper; //挂载全局辅助函数
app.config.globalProperties.config = config; //挂载全局辅助函数

registeGlobalComponent(app); //注册全局组件
registeDirective(app); //注册全局指令
app.use(store, key);
app.use(axiosPlugin).use(ElementPlus, { locale: zhCn }).use(router).use(i18n);
app.mount("#app")
