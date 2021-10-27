import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"
import check from "../check/check.vue"
import view from "../view/view.vue"
//=====================================路由====================================//
const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        redirect: process.env.VUE_APP_BUILD_SHARE ? "/check" : "/view",
    },
    {
        path: "/view",
        name: "View",
        component: view,
    },
    {
        path: "/check",
        name: "Check",
        component: check,
    },
]
const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router;
