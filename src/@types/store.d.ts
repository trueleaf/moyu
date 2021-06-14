import { UserInfo, Menu } from "./index"
import { RouteRecordRaw } from "vue-router"


//权限相关state
interface PermissionState {
    userInfo: UserInfo,
    menus: Menu[],
    routes: RouteRecordRaw[],
    loadingBanner: boolean,
}
//全局state
interface State {
    permission: PermissionState,
}
export { PermissionState, State };