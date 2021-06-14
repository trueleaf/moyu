import { createApp } from "vue"
import ElementPlus from "element-plus";
import mixin from "@/mixin/index"
import App from "./App.vue"
import axios from "@/api/api"
import "./registerServiceWorker"
import "element-plus/lib/theme-chalk/index.css";
import { router } from "./router"
import store from "./store"
import { registeGlobalComponent } from "@/components"
const app = createApp(App, {
    mixin: [mixin]
})
registeGlobalComponent(app); //注册全局组件
app.use(axios).use(store).use(ElementPlus).use(router);

app.mount("#app")
