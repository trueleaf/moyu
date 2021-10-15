import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"
import check from "../check/check.vue"
import view from "../view/view.vue"
import notFound from "@/pages/layout/404/404.vue"
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
        component: () => check,
    },
    {
        path: "/:pathMatch(.*)*",
        name: "404",
        component: notFound,
    },
]
const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router;