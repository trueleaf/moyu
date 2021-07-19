
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
//=========================================================================//
/**
 * http请求方法
 * https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods
 */
type HttpRequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH" | "HEAD" | "CONNECTION" | "TRACE";

/**
 * 项目列表
 */
type ApiProjectInfo = {
    _id: string,
    docNum: number,
    owner: {
        id: string,
        name: string,
    },
    projectName: string,
    remark: string,
    updatedAt: string,
    /**
     * 是否被收藏
     */
    isStared: boolean,
};
type ResApiProjectInfo = {
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
    /**
     * 权限
     */
    permission?: "readAndWrite" | "readOnly" | "admin"
};

export { Menu, UserInfo, Response, RoleEnum, ClientRoute, ServerRoute, ResUserInfo, ResClientMenu, ResClientRoute, HttpRequestMethod, ResApiProjectInfo, ApiProjectInfo, ResUserBaseInfo }
