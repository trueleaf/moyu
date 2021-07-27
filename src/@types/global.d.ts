/*
|--------------------------------------------------------------------------
| 工具类声明
|--------------------------------------------------------------------------
| 声明1：Response(基础返回类型)
|
*/
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

/*
|--------------------------------------------------------------------------
| 布局和权限相关声明
|--------------------------------------------------------------------------
| 声明：Menu(顶部导航菜单)
| 声明：RoleEnum(角色枚举信息)
| 声明：UserInfo(用户基本信息)
| 声明：ClientRoute(前端路由列表)
| 声明：ClientMenu(前端菜单)
| 声明：ResUserInfo(用户基本信息返回值)
|
*/
//顶部导航菜单
type Menu = {
    name: string,
    path: string,
}

//角色枚举信息
type RoleEnum = { _id: string, roleName: string }[];
//用户信息
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
//用户基本信息
type UserBaseInfo = {
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
//接口返回用户信息
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
//前端路由列表
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
//后端路由列表
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
//客户端菜单
type ClientMenu = {
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
    children: ClientMenu[] | [],
}
/*
|--------------------------------------------------------------------------
| 项目列表相关声明(Apidoc)
|--------------------------------------------------------------------------
| 声明：ApidocHttpRequestMethod(http请求方法)
| 声明：ApidocProjectPermission(项目权限枚举)
| 声明：ApidocProjectMemberInfo(项目成员基本信息)
| 声明：ApidocProjectInfo(项目成员基本信息)
| 声明：ApidocProjectListInfo(项目列表信息)
| 声明：ApidocPropertyType(接口文档相关类型声明)
| 声明：ApidocParamsType(文档参数类型)
| 声明：ApidocProperty(接口参数信息)
| 声明：ApidocBanner(文档banner信息)
|
*/
//http请求方法 https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods
type ApidocHttpRequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH" | "HEAD" | "CONNECTION" | "TRACE";
//项目权限枚举
type ApidocProjectPermission = "readAndWrite" | "readOnly" | "admin"
//项目成员基本信息
type ApidocProjectMemberInfo = {
    /**
     * 登录名称
     */
    loginName: string,
    /**
     * 用户权限 "readAndWrite" | "readOnly" | "admin"
     */
    permission: ApidocProjectPermission,
    /**
     * 真实姓名
     */
    realName: string,
    /**
     * 用户id
     */
    userId: string,
}
//项目成员基本信息
type ApidocProjectInfo = {
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
    members: ApidocProjectMemberInfo[],
    /**
     * 项目名称
     */
    projectName: string,
    /**
     * 备注
     */
    remark: string,
    /**
     * 最近一次更新日期
     */
    updatedAt: string,
    /**
     * 是否被收藏
     */
    isStared: boolean,
};
//项目列表信息
type ApidocProjectListInfo = {
    /**
     * 项目列表
     */
    list: ApidocProjectInfo[],
    /**
     * 最近访问项目ids
     */
    recentVisitProjects: string[],
    /**
     * 用户star的项目ids
     */
    starProjects: string[],
}
//接口文档相关类型声明
type ApidocPropertyType = "string" | "number" | "boolean" | "array" | "object" | "file";
//文档参数类型
type ApidocParamsType = "pathParams" | "queryParams" | "bodyParams" | "responseParams" | "headerParams";
//接口参数信息， header pathParams queryParams bodyParams
type ApidocProperty = {
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
    type: ApidocPropertyType,
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
    children: ApidocProperty[],
}
//文档banner信息
type ApidocBanner = {
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
    children: ApidocBanner[]
}
export {
    Menu,
    UserInfo,
    Response,
    RoleEnum,
    ClientRoute,
    ServerRoute,
    ResUserInfo,
    ClientMenu,
    ApidocHttpRequestMethod,
    ApidocProjectListInfo,
    ApidocProjectInfo,
    UserBaseInfo,
    ApidocProjectMemberInfo,
    ApidocProjectPermission,
    ApidocProperty,
    ApidocPropertyType,
    ApidocParamsType,
    ApidocBanner,
}
