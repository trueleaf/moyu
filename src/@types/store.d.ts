import { UserInfo, Menu, ApidocBanner, ApidocPropertyType, ApidocProperty } from "./global"
import type { ResUserInfo, ApidocParamsType } from "@@/global"

/*
|--------------------------------------------------------------------------
| 权限相关store
|--------------------------------------------------------------------------
| 模块：PermissionState 权限相关模块
|
*/
//权限state
type PermissionState = {
    userInfo: UserInfo,
    menus: Menu[],
    routes: ResUserInfo["clientRoutes"],
    loadingBanner: boolean,
}
/*
|--------------------------------------------------------------------------
| apidoc相关store
|--------------------------------------------------------------------------
| 模块1：ApidocBannerState 文档左侧导航栏
| 模块2: ApidocProjectBaseInfo 项目基本信息
|
*/

//文档banner state
type ApidocBannerState = {
    banner: ApidocBanner[]
};
//项目基本信息
type ProjectVariable = {
    /**
     * 变量id
     */
    _id: string,
    /**
     * 变量名称
     */
    name: string,
    /**
     * 变量类型
     */
    type: ApidocPropertyType,
    /**
     * 变量值
     */
    value: string,
}
//项目host信息
type ProjectHost = {
    /**
     * 主机名称
     */
    name: string,
    /**
     * 主机地址
     */
    url: string,
    /**
     * 主机id
     */
    _id: string,
}
//项目联想参数
type ProjectMindParam = {
    paths: ApidocProperty[],
    queryParams: ApidocProperty[],
    requestBody: ApidocProperty[],
    responseParams: ApidocProperty[],
}
//项目参数模板
type ProjectParamsTemplate = {
    /**
     * 模板id
     */
    _id: string,
    /**
     * 模板名称
     */
    name: string,
    /**
     * 模板参数类型
     */
    presetParamsType: ApidocParamsType,
    /**
     * 创建者
     */
    creatorName: string,
    /**
     * 参数信息
     */
    items: ApidocProperty[],
}
//项目规则
type ProjectRules = {
    /**
     * 参数值是否必填
     */
    requireValue: boolean,
    /**
     * 备注是否必填
     */
    requireDescription: boolean,
    /**
     * 单个文件夹允许最大文件个数
     */
    fileInFolderLimit: boolean,
    /**
     * 是否开启折叠动画
     */
    enableCollapseAnimation: boolean,
    /**
     * 域名个数限制
     */
    dominLimit: number,
}

type ApidocProjectBaseInfoState = {
    /**
     * 项目id
     */
    _id: string,
    /**
     * 项目名称
     */
    projectName: string,
    /**
     * 项目变量信息
     */
    variables: ProjectVariable[],
    /**
     * 项目host信息
     */
    hosts: ProjectHost[],
    /**
     * 联想参数
     */
    mindParams: ProjectMindParam[],
    /**
     * 参数模板信息
     */
    paramsTemplate: ProjectParamsTemplate,
    /**
     * 项目规则
     */
    rules: ProjectRules,
};
/*
|--------------------------------------------------------------------------
| 其他
|--------------------------------------------------------------------------
|
*/
//全局state
type State = {
    permission: PermissionState,
    banner: ApidocBannerState,
}
export {
    PermissionState,
    ApidocBannerState,
    ApidocProjectBaseInfoState,
    State,
}
