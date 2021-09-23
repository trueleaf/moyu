import { PermissionUserInfo, PermissionMenu, ApidocBanner, ApidocPropertyType, ApidocProperty } from "./global"
import type { ApidocParamsType, PermissionClientRoute, ApidocDetail, ApidocContentType, ApidocMindParam } from "@@/global"

/*
|--------------------------------------------------------------------------
| 权限相关store
|--------------------------------------------------------------------------
| 模块：PermissionState 权限相关模块
|
*/
//权限state
type PermissionState = {
    userInfo: PermissionUserInfo,
    menus: PermissionMenu[],
    routes: PermissionClientRoute[],
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
    banner: ApidocBanner[],
    defaultExpandedKeys: string[],
};
//项目基本信息
type ApidocProjectVariable = {
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
type ApidocProjectHost = {
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

//项目参数模板
type ApidocProjectParamsTemplate = {
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
//请求方法规则
type ApidocRequestMethodRule = {
    /**
     * 允许请求参数类型
     */
    enabledContenTypes: ApidocContentType[],
    /**
     * 方法名称
     */
    name: string,
    /**
     * 值
     */
    value: string,
    /**
     * 颜色
     */
    iconColor: string,
    /**
     * 是否启用
     */
    enabled: boolean,
};
//项目规则
type ApidocProjectRules = {
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
    fileInFolderLimit: number,
    /**
     * 是否开启折叠动画
     */
    enableCollapseAnimation: boolean,
    /**
     * 域名个数限制
     */
    dominLimit: number,
    /**
     * 请求方法
     */
    requestMethods: ApidocRequestMethodRule[],
}
//项目基本信息
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
    variables: ApidocProjectVariable[],
    /**
     * 项目host信息
     */
    hosts: ApidocProjectHost[],
    /**
     * 联想参数
     */
    mindParams: ApidocMindParam[],
    /**
     * 参数模板信息
     */
    paramsTemplate: ApidocProjectParamsTemplate[],
    /**
     * 项目规则
     */
    rules: ApidocProjectRules,
    /**
     * 全局cookie信息
     */
    globalCookies: Record<string, ApidocCookieInfo[]>,
    /**
     * 布局
     */
    layout: "vertical" | "horizontal",
    /**
     * 是否启用web端代理功能
     */
    webProxy: boolean,
    /**
     * 代理服务器信息
     */
    proxy: {
        /**
         * 代理服务器地址
         */
        path: string,
        /**
         * 是否启用代理
         */
        enabled: boolean
    },
};
//=========================================================================//
type ApidocTabType = "doc" | "config" | "paramsTemplate" | "onlineLink" | "exportDoc" | "importDoc" | "history" | "variable" | "mock" | "recycler" | "guide" | "mindParams"
//tabs导航

type ApidocTab = {
    /**
     * 节点id
     */
    _id: string,
    /**
     * 项目id
     */
    projectId: string,
    /**
     * tab类型
     */
    tabType: ApidocTabType,
    /**
     * tab文案显示
     */
    label: string,
    /**
     * 头部图标
     */
    head: {
        /**
         * 图标
         */
        icon: string,
        /**
         * 颜色
         */
        color: string,
    },
    /**
     * 是否保存
     */
    saved: boolean,
    /**
     * 是否固定
     */
    fixed: boolean,
    /**
     * 是否选中
     */
    selected: boolean,
};
type ApidocTabsState = {
    tabs: {
        [prop: string]: ApidocTab[]
    }
}
/*
|--------------------------------------------------------------------------
| api文档，文档录入、远端返回值
|--------------------------------------------------------------------------
|
*/
type ApidocState = {
    apidoc: ApidocDetail,
    originApidoc: ApidocDetail,
    defaultHeaders: ApidocProperty<"string">[],
    loading: boolean,
    saveLoading: boolean,
}
type ApidocCookieInfo = {
    /**
     * cookie键
     */
    name: string,
    /**
     * cookie值
     */
    value: string,
    /**
     * 有效域
     */
    domin: string,
    /**
     * path
     */
    path: string,
    /**
     * expires
     */
    expires: string,
    /**
     * httpOnly
     */
    httpOnly: boolean,
    /**
     * secure
     */
    secure: boolean,
    /**
     * sameSite
     */
    sameSite: string,
}
type ApidocResponseState = {
    /**
     * 返回头信息
     */
    header: Record<string, unknown>,
    /**
     * 返回值contentType
     */
    contentType: string,
    /**
     * http版本信息
     */
    httpVersion: string,
    /**
     * 远端ip信息
     */
    ip: string,
    /**
     * 状态码
     */
    statusCode: number,
    /**
     * 状态信息
     */
    statusMessage: string,
    /**
     * 耗时
     */
    rt: number,
    /**
     * 返回值大小
     */
    size: number,
    /**
     * 是否正在请求中
     */
    loading: boolean,
    /**
     * cookie信息
     */
    cookies: ApidocCookieInfo[],
    /**
     * 返回进度
     */
    process: {
        /**
         * 百分比
         */
        percent: number,
        /**
         * 总大小
         */
        total: number,
        /**
         * 当前传输数据大小
         */
        transferred: number,
    },
    /**
     * 返回值
     */
    data: {
        /**
         * 文件类型
         */
        file: {
            url: string,
            raw: string,
        },
        /**
         * 数据类型
         */
        type: string,
        /**
         * 文本返回值
         */
        text: string,
    },
}

/*
|--------------------------------------------------------------------------
| 其他
|--------------------------------------------------------------------------
|
*/
//全局state
type State = {
    permission: PermissionState,
    "apidoc/banner": ApidocBannerState,
    "apidoc/baseInfo": ApidocProjectBaseInfoState,
    "apidoc/tabs": ApidocTabsState,
    "apidoc/apidoc": ApidocState,
    "apidoc/response": ApidocResponseState,
}
export {
    PermissionState,
    ApidocBannerState,
    ApidocProjectBaseInfoState,
    ApidocTabsState,
    ApidocTab,
    ApidocState,
    ApidocProjectHost,
    ApidocRequestMethodRule,
    ApidocResponseState,
    ApidocCookieInfo,
    ApidocProjectParamsTemplate,
    State,
}
