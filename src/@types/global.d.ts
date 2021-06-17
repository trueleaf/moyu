
//基础返回类型
interface Response<T> {
    code: number, //状态码
    msg: string, //登录名称
    data?: T
}

/**
 * @description        用户信息
 * @author             shuxiaokai
 * @create             2021-06-14 14:43
 */
 interface UserInfo {
     id: string, //用户id
     loginName: string, //登录名称
     phone: string, //手机号码
     realName: string, //真实姓名
     roleIds: Array<string>, //角色id列表
}
/**
 * @description        顶部导航菜单
 * @author             shuxiaokai
 * @create             2021-06-14 14:35
 */
interface Menu {
    name: string,
    path: string,
}
export { Menu, UserInfo, Response }