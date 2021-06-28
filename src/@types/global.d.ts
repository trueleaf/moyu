
//基础返回类型
interface Response<T> {
    code: number, //状态码
    msg: string, //登录名称
    data: T
}

/**
 * 用户信息
 */
 type UserInfo = {
     id: string, //用户id
     loginName: string, //登录名称
     phone: string, //手机号码
     realName: string, //真实姓名
     roleIds: Array<string>, //角色id列表
}
/**
 * 顶部导航菜单
 */
type Menu = {
    name: string,
    path: string,
}
/**
 * 角色枚举信息
 */
type RoleEnum = { _id: string, roleName: string }[];

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
    __select: boolean,
}

export { Menu, UserInfo, Response, RoleEnum, ClientRoute }
