import { UserInfo, Menu, DocBanner } from "./global"
import type { ResUserInfo } from "@@/global"

//权限相关state
type PermissionState = {
    userInfo: UserInfo,
    menus: Menu[],
    routes: ResUserInfo["clientRoutes"],
    loadingBanner: boolean,
}
//文档banner state
type DocBannerState = DocBanner[];
//全局state
type State = {
    permission: PermissionState,
}
export { PermissionState, State, DocBannerState }
