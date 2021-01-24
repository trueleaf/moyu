import Vue from "vue";
import Router from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import config from "@/../config";
import store from "@/store/index";
//=====================================注册登陆页面====================================//
import login from "@/pages/login/login.vue";
//=====================================业务模块====================================//
import docEdit from "@/pages/modules/apidoc/doc-edit/doc-edit.vue";
import docView from "@/pages/modules/apidoc/doc-view/doc-view.vue";

Vue.use(Router);

const allRoutes = [
    {
        path: "/v1/apidoc/doc-list",
        name: "文档工具-文档列表",
        meta: {
            title: "项目列表",
        },
        component: () => import("@/pages/modules/apidoc/doc-list/doc-list"),
    },
    {
        path: "/v1/apidoc/doc-edit",
        name: "文档工具-文档编辑",
        meta: {
            title: "文档编辑",
        },
        component: docEdit,
    },
    {
        path: "/v1/apidoc/doc-view",
        name: "文档工具-文档预览",
        meta: {
            title: "文档预览",
        },
        component: docView,
    },
    {
        path: "/v1/settings/user",
        name: "设置-用户信息",
        meta: {
            title: "用户信息",
        },
        component: () => import("@/pages/modules/settings/user/user"),
    },
    {
        path: "/v1/permission/permission",
        name: "权限管理",
        meta: {
            title: "权限管理",
        },
        component: () => import("@/pages/modules/permission/permission"),
    },
    {
        path: "/v1/easycode",
        name: "代码生成",
        meta: {
            title: "代码生成",
        },
        component: () => import("@/pages/modules/easycode/easycode"),
    },
    {
        path: "/v1/ci-cd",
        name: "持续集成",
        meta: {
            title: "持续集成",
        },
        component: () => import("@/pages/modules/ci-cd/index"),
    },
];
const lastVisitPage = localStorage.getItem("history/lastVisitePage"); //回复上次访问的页面
const router = new Router({
    routes: [
        {
            path: "/",
            redirect: lastVisitPage || "/v1/apidoc/doc-list",
        },
        {
            path: "/login",
            name: "登录页面",
            component: login,
        },
    ],
});

router.beforeEach((to, from, next) => {
    NProgress.start();
    const hasPermission = store.state.permission.routes.length > 0; //挂载了路由代表存在权限
    if (config.renderConfig.httpRequest.whiteList.find((val) => val === to.path)) {
        //白名单内的路由直接放行
        next();
        return;
    }
    if (!hasPermission) {
        //未获取到路由
        store.dispatch("permission/getPermission").then(() => {
            next();
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            NProgress.done();
        });
    }
    next();
});

router.afterEach((to) => {
    localStorage.setItem("history/lastVisitePage", to.fullPath);
    NProgress.done(); // 页面顶部的加载条
});

export {
    router,
    allRoutes as routes,
};
