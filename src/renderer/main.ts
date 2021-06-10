import { createApp } from "vue"
import ElementPlus from "element-plus";
import mixin from "@/mixin/index"
import App from "./App.vue"
import axios from "@/api/api"
import "./registerServiceWorker"
import "element-plus/lib/theme-chalk/index.css";
import { router } from "./router"
import store from "./store"

const app = createApp(App, {
    mixin: [mixin]
})
app.use(axios).use(store).use(ElementPlus).use(router);
app.config.globalProperties.test = 22;

app.mount("#app")
