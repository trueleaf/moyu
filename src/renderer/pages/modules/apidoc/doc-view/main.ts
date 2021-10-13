import { createApp } from "vue"
import ElementPlus from "element-plus";
import mixin from "@/mixin/index"
import { cache } from "@/cache/cache"
import App from "./App.vue"
import { axiosPlugin } from "@/api/api"
import * as helper from "@/helper/index"
import "element-plus/dist/index.css"
import { store, key } from "@/store"
import { registeGlobalComponent } from "@/components"
import "@/assets/css/index.css"
import registeDirective from "@/directive/directive";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"

//=====================================路由====================================//
const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        redirect: process.env.VUE_APP_BUILD_SHARE ? "/check" : "/view",
    },
    {
        path: "/view",
        name: "View",
        component: () => import(/* webpackChunkName: "View" */ "./view/view.vue"),
    },
    {
        path: "/check",
        name: "Check",
        component: () => import(/* webpackChunkName: "Check" */ "./check/check.vue"),
    },
    {
        path: "/:pathMatch(.*)*",
        name: "404",
        component: () => import(/* webpackChunkName: "404" */ "@/pages/layout/404/404.vue"),
    },
]
const router = createRouter({
    history: createWebHashHistory(),
    routes
})
//=========================================================================//

const app = createApp(App, {
    mixin: [mixin]
})

app.config.globalProperties.$helper = helper; //挂载全局辅助函数
app.config.globalProperties.$cache = cache; //挂载全局storage方法

registeGlobalComponent(app); //注册全局组件
registeDirective(app); //注册全局指令
app.use(store, key);
app.use(axiosPlugin).use(ElementPlus).use(router);
app.mount("#app")
