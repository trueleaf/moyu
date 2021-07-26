
//基础返回类型
type Response<T> = {
    /**
     * 状态码
     */
    code: number,
    /**
     * 登录名称
     */
    msg: string,
    /**
     * 返回数据
     */
    data: T
}
//=========================================================================//
/**
 * 顶部导航菜单
 */
type Menu = {
    name: string,
    path: string,
}
//=========================================================================//
/**
 * 角色枚举信息
 */
type RoleEnum = { _id: string, roleName: string }[];
//=========================================================================//
/**
 * 前端路由列表
 */
type ClientRoute = {
    /**
     * 分组名称
     */
    groupName: string,
    /**
     * 路由名称
     */
    name: string,
    /**
     * 路径
     */
    path: string,
    /**
     * 路由id
     */
    _id: string,
}
//=========================================================================//
/**
 * 后端路由列表
 */
type ServerRoute = {
    /**
     * 分组名称
     */
     groupName: string,
     /**
      * 路由名称
      */
     name: string,
     /**
      * 路径
      */
     path: string,
     /**
      * 路由id
      */
     _id: string,
}
//=========================================================================//
/**
 * 用户信息
 */
 type UserInfo = {
     /**
      * 用户id
      */
    id: string,
    /**
     * 登录名称
     */
    loginName: string,
    /**
     * 手机号码
     */
    phone: string,
    /**
     * 真实姓名
     */
    realName: string,
    /**
     * 角色id列表
     */
    roleIds: string[],
}
//=========================================================================//
type ResUserInfo = UserInfo & {
    /**
     * 客户端menu，banner信息
     */
     clientBanner: {
        name: string,
        path: string,
        id: string,
    }[],
    /**
     * 客户端路由
     */
    clientRoutes: {
        name: string,
        path: string,
        id: string,
    }[],
}
//=========================================================================//
/**
 * 客户端菜单
 */
type ResClientMenu = {
    id?: string,
    /**
     * 菜单id
     */
    _id: string,
    /**
     * 菜单名称
     */
    name: string,
    /**
     * 菜单路径
     */
    path: string,
    /**
     * 菜单父元素id
     */
    pid: string,
    /**
     * 菜单排序
     */
    sort: number,
    /**
     * 菜单类型，inline:内联菜单  link:外链跳转
     */
    type: "inline" | "link",
    /**
     * 子菜单
     */
    children: ResClientMenu[] | [],
}
//=========================================================================//
/**
 * 前端路由
 */
type ResClientRoute = {
    /**
     * 前端路由id
     */
    _id: string,
    /**
     * 前端路由名称
     */
    name: string,
    /**
     * 前端路由路径
     */
    path: string,
    /**
     * 分组名称
     */
     groupName: string,
}
/*
|--------------------------------------------------------------------------
| 项目列表相关申明
|--------------------------------------------------------------------------
|
*/
/**
 * http请求方法
 * https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods
 */
type HttpRequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH" | "HEAD" | "CONNECTION" | "TRACE";
type ProjectPermission = "readAndWrite" | "readOnly" | "admin"

type ProjectMemberInfo = {
    /**
     * 登录名称
     */
    loginName: string,
    /**
     * 用户权限 "readAndWrite" | "readOnly" | "admin"
     */
    permission: ProjectPermission,
    /**
     * 真实姓名
     */
    realName: string,
    /**
     * 用户id
     */
    userId: string,
}
/**
 * 项目列表
 */
type ApiProjectInfo = {
    /**
     * 项目id
     */
    _id: string,
    /**
     * 项目接口数量
     */
    docNum: number,
    /**
     * 项目创建者
     */
    owner: {
        id: string,
        name: string,
    },
    /**
     * 项目成员信息
     */
    members: ProjectMemberInfo[],
    projectName: string,
    remark: string,
    updatedAt: string,
    /**
     * 是否被收藏
     */
    isStared: boolean,
};
type ResApiProjectListInfo = {
    /**
     * 项目列表
     */
    list: ApiProjectInfo[],
    /**
     * 最近访问项目ids
     */
    recentVisitProjects: string[],
    /**
     * 用户star的项目ids
     */
    starProjects: string[],
}

type ResUserBaseInfo = {
    /**
     * 登录名称
     */
    loginName: string,
    /**
     * 真实姓名
     */
    realName: string,
    /**
     * 用户id
     */
    userId: string,
};
/*
|--------------------------------------------------------------------------
| 接口文档相关类型声明
|--------------------------------------------------------------------------
|
*/
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
//接口参数信息， header pathParams queryParams bodyParams
type DocProperty = {
    /**
     * 参数id
     */
    _id: string,
    /**
     * 字段名称(键)
     */
    key: string,
    /**
     * 字段值
     */
    value: string,
    /**
     * 字段类型
     */
    type: "string" | "number" | "boolean" | "array" | "object" | "file",
    /**
     * 是否必填
     */
    required: string
    /**
     * 是否选中(选中数据会随请求一起发送)
     */
    select: boolean,
    /**
     * 最后修改人
     */
    editor: string,
    /**
     * 最后修改人id
     */
    editorId: string,
    /**
     * 子节点信息
     */
    children: DocProperty[],
}
//文档banner信息
type DocBanner = {
    /**
     * 文档id
     */
    _id: string,
    /**
     * 最近一次更新日期
     */
    updatedAt: string,
    /**
     * 文档类型
     */
    type: "folder" | "api" | "markdown",
    /**
     * 排序值
     */
    sort: number,
    /**
     * 父元素id
     */
    pid: string,
    /**
     * 名称
     */
    name: string,
    /**
     * 是否为文件夹
     */
    isFolder: boolean,
    /**
     * 更新人
     */
    updator: string,
    /**
     * 子节点
     */
    children: docBanner[]
}

export {
    Menu,
    UserInfo,
    Response,
    RoleEnum,
    ClientRoute,
    ServerRoute,
    ResUserInfo,
    ResClientMenu,
    ResClientRoute,
    HttpRequestMethod,
    ResApiProjectListInfo,
    ApiProjectInfo,
    ResUserBaseInfo,
    ProjectMemberInfo,
    ProjectPermission,
    ProjectHost,
    DocProperty,
    DocBanner,
}
