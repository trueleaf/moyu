import { ActionContext } from "vuex"
import { axios } from "@/api/api"
import { uniqueByKey } from "@/helper/index"
import { router, routes } from "@/router/index"
import { RouteRecordRaw } from "vue-router"
import type { State as RootState, PermissionState } from "@@/store"
import { UserInfo, Response, ResUserInfo } from "@@/global"
import config from "@/../config/config"
import layout from "@/pages/layout/layout.vue";

const permission = {
    namespaced: true,
    state: {
        userInfo: {}, //-----------用户信息
        routes: [], //-------------路由
        menus: [], //--------------用户菜单
        loadingBanner: false, //---是否加载banner中
    },
    mutations: {
        /**
         * 改变用户基本信息
         */
        changeUserInfo(state: PermissionState, payload: UserInfo): void {
            state.userInfo = {
                id: payload.id,
                loginName: payload.loginName,
                phone: payload.phone,
                realName: payload.realName,
                roleIds: payload.roleIds,
            };
        },
        /**
         * 动态生成路由
         */
        generateRoutes(state: PermissionState): void {
            if (config.renderConfig.permission.free) { //free模式允许看见所有路由信息
                router.addRoute({
                    path: "/v1",
                    component: layout,
                    children: [
                        ...routes,
                    ],
                });
            } else {
                const matchedRoutes: RouteRecordRaw[] = [];
                routes.forEach((route) => { //遍历本地所有路由
                    state.routes.forEach((val) => {
                        if (val.path === route.path) {
                            if (!matchedRoutes.find((m) => m.path === val.path)) { //如果已经存在匹配的数据则不再push
                                matchedRoutes.push(route);
                            }
                        }
                    });
                });
                console.log(33, matchedRoutes, routes)
                router.addRoute({
                    path: "/v1",
                    component: layout,
                    children: [
                        ...matchedRoutes,
                    ],
                });
            }
        },
        /**
         * 改变用户可访问路由
         */
        changeRoutes(state: PermissionState, payload: ResUserInfo["clientRoutes"]): void {
            const routes = payload;
            const localRoutesStr = sessionStorage.getItem("permission/routes") || "[]";
            const localRoutes = JSON.parse(localRoutesStr) as ResUserInfo["clientRoutes"];
            const storeRoutes = uniqueByKey(localRoutes.concat(routes), "path");
            sessionStorage.setItem("permission/routes", JSON.stringify(storeRoutes));
            state.routes = storeRoutes;
        },
        /**
         * 改变当前访问菜单
         */
        changeMenus(state: PermissionState, payload: ResUserInfo["clientBanner"]): void {
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
    },
    actions: {
        async getPermission(context: ActionContext<PermissionState, RootState>): Promise<ResUserInfo> {
            return new Promise((resolve, reject) => {
                axios.get<Response<ResUserInfo>, Response<ResUserInfo>>("/api/security/user_base_info").then((res) => {
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
}

export { permission }
