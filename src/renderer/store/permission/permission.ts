import { ActionContext } from "vuex"
import { axios } from "@/api/api"
import { router } from "@/router/index"
import type { State as RootState, PermissionState } from "@@/store"
import { UserInfo, Response, ResUserInfo } from "@@/global"
const permission = {
    namespaced: true,
    state: {
        userInfo: {}, //-----------用户信息
        routes: [], //-------------路由
        menus: [], //--------------用户菜单
        loadingBanner: false, //---是否加载banner中
    },
    mutations: {
        //=====================================用户基本信息====================================//
        changeUserInfo(state: PermissionState, payload: UserInfo): void {
            state.userInfo = {
                id: payload.id,
                loginName: payload.loginName,
                phone: payload.phone,
                realName: payload.realName,
                roleIds: payload.roleIds,
            };
        },
    },
    actions: {
        async getPermission(context: ActionContext<PermissionState, RootState>): Promise<ResUserInfo> {
            return new Promise((resolve, reject) => {
                axios.get<Response<ResUserInfo>, Response<ResUserInfo>>("/api/security/user_base_info").then((res) => {
                    context.commit("changeUserInfo", res.data);
                    // context.commit("changeMenus", res.data.clientBanner);
                    // context.commit("changeRoutes", res.data.clientRoutes);
                    // context.commit("generateRoutes");
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
