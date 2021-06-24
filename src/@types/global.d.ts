
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
 * 角色信息
 */
type RoleEnum = { _id: string, roleName: string }[];

export { Menu, UserInfo, Response, RoleEnum }
