/*
|--------------------------------------------------------------------------
| api相关类型声明
|--------------------------------------------------------------------------
*/
//基础返回类型
interface Response {
    code: number, //状态码
    msg: string, //登录名称
}

//用户信息
interface UserInfo extends Response {
    data: {
        id: string, //用户id
        loginName: string, //登录名称
        phone: string, //手机号码
        realName: string, //真实姓名
        roleIds: Array<string>, //角色id列表
    }
}
export { UserInfo };