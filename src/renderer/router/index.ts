import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        redirect: "/login",
    },
    {
        path: "/login",
        name: "Login",
        component: () => import(/* webpackChunkName: "login" */ "@/pages/login/login.vue")
    },
    {
        path: "/layout",
        name: "Layout",
        component: () => import(/* webpackChunkName: "Layout" */ "@/pages/layout/layout.vue"),
        children: [{
            path: "/layout/test",
            name: "Test",
            component: () => import(/* webpackChunkName: "Test" */ "@/pages/test/test.vue"),
        }],
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export {
    routes,
    router,
}
