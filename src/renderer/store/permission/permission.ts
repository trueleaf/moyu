import { UserInfo } from "@@/index"
import { PermissionState } from "@@/store"

export default {
    namespaced: true,
    state: {
        userInfo: {} as UserInfo, //-----------用户信息
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
}
