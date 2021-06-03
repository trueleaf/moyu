/**
 * @description        权限相关
 * @author             shuxiaokai
 * @create             2020-02-25 16:38
 */
import api from "@/api/api";
import config from "@/../config";
import { routes, router } from "@/router";
import { unique } from "@/lib";
import layout from "@/pages/layout/index.vue";
import notFound from "@/pages/layout/404/404.vue";

const { axios } = api;

export default {
    namespaced: true,
    state: {
        userInfo: {}, //-----------用户信息
        routes: [], //-------------路由
        menus: [], //--------------用户菜单
        loadingBanner: false, //---是否加载banner中
    },
    mutations: {
        //改变当前访问菜单
        changeMenus(state, payload) {
            if (config.renderConfig.permission.free && state.userInfo.loginName === "admin") {
                state.menus = [{
                    path: "/v1/apidoc/doc-list",
                    name: "api文档",
                }, {
                    path: "/v1/permission/permission",
                    name: "权限管理",
                }];
            } else if (config.renderConfig.permission.free) {
                state.menus = [{
                    path: "/v1/apidoc/doc-list",
                    name: "api文档",
                }];
            } else {
                state.menus = payload;
            }
        },
        //改变用户可访问路由
        changeRoutes(state, payload) {
            if (config.renderConfig.permission.fre) {
                state.routes = routes;
            } else {
                let localRoutes = sessionStorage.getItem("permission/routes") || "[]";
                localRoutes = JSON.parse(localRoutes);
                const storeRoutes = unique(localRoutes.concat(payload), "path");
                sessionStorage.setItem("permission/routes", JSON.stringify(storeRoutes));
                state.routes = storeRoutes;
            }
        },
        // 动态生成路由
        generateRoutes(state) {
            if (config.renderConfig.permission.free) {
                router.addRoutes([
                    {
                        path: "/v1",
                        component: layout,
                        children: [
                            ...routes,
                        ],
                    },
                ]);
            } else {
                const matchedRoutes = [];
                routes.forEach((route) => { //遍历本地所有路由
                    state.routes.forEach((val) => {
                        if (val.path === route.path) {
                            if (!matchedRoutes.find((m) => m.path === val.path)) { //如果已经存在匹配的数据则不再push
                                matchedRoutes.push(route);
                            }
                        }
                    });
                });
                router.addRoutes([
                    {
                        path: "/v1",
                        component: layout,
                        children: [
                            ...matchedRoutes,
                        ],
                    },
                    {
                        path: "*",
                        redirect: "/404",
                    },
                    {
                        path: "/404",
                        component: notFound,
                    },
                ]);
            }
        },
        // 清空全部权限
        clearAllPermission(state) {
            state.userInfo = {};
            state.routes = [];
            state.menus = [];
        },
        //=====================================用户基本信息====================================//
        changeUserInfo(state, payload) {
            state.userInfo = {
                loginName: payload.loginName,
                realName: payload.realName,
                phone: payload.phone,
                id: payload.id,
            };
        },
    },
    actions: {
        async getPermission(context) {
            return new Promise((resolve, reject) => {
                axios.get("/api/security/user_base_info").then((res) => {
                    context.commit("changeUserInfo", res.data);
                    context.commit("changeMenus", res.data.clientBanner);
                    context.commit("changeRoutes", res.data.clientRoutes);
                    context.commit("generateRoutes");
                    resolve(res.data);
                    sessionStorage.setItem("permission/userInfo", JSON.stringify(res.data));
                }).catch((err) => {
                    router.push("/login");
                    reject(err);
                });
            });
        },
    },
};
