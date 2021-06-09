import { createApp } from "vue"
import ElementPlus from "element-plus";
import mixin from "@/mixin/index"
import App from "./App.vue"
import "./registerServiceWorker"
import "element-plus/lib/theme-chalk/index.css";
import { router } from "./router"
import store from "./store"

const app = createApp(App)
app.use(store).use(ElementPlus).use(router)
app.mixin(mixin)
app.mount("#app")
