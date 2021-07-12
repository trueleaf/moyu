import { UserInfo, Menu } from "./global"
import type { ResUserInfo } from "@@/global"

//权限相关state
interface PermissionState {
    userInfo: UserInfo,
    menus: Menu[],
    routes: ResUserInfo["clientRoutes"],
    loadingBanner: boolean,
}
//全局state
interface State {
    permission: PermissionState,
}
export { PermissionState, State }
