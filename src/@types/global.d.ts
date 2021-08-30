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
//表单返回
type ResponseTable<T> = {
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
     data: {
        rows: T,
        total: number,
     }
}

/*
|--------------------------------------------------------------------------
| 布局和权限相关声明
|--------------------------------------------------------------------------
| 声明：PermissionMenu(顶部导航菜单)
| 声明：PermissionRoleEnum(角色枚举信息)
| 声明：PermissionUserInfo(用户信息)
| 声明：PermissionUserBaseInfo(用户基本信息)
| 声明：PermissionClientRoute(前端路由列表)
| 声明：PermissionServerRoute(后端路由列表)
| 声明：PermissionClientMenu(前端菜单)
|
*/

//顶部导航菜单
type PermissionMenu = {
    name: string,
    path: string,
}
//角色枚举信息
type PermissionRoleEnum = { _id: string, roleName: string }[];
//用户信息
type PermissionUserInfo = {
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
type PermissionUserBaseInfo = {
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
//前端路由列表
type PermissionClientRoute = {
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
type PermissionServerRoute = {
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
type PermissionClientMenu = {
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
    children: PermissionClientMenu[] | [],
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
type ApidocProperty<T extends ApidocPropertyType = ApidocPropertyType> = {
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
    type: T,
    /**
     * 是否必填
     */
    required: boolean,
    /**
     * 备注信息
     */
    description: string,
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
//=========================================================================//
//=========================================================================//
//=========================================================================//
//文档基础信息
type ApidocBaseInfo = {
    /**
     * 文档名称
     */
    name: string,
    /**
     * 文档描述
     */
    description: string,
    /**
     * 版本信息
     */
    version: string,
    /**
     * 文档类型
     */
    type: "folder" | "api" | "markdown",
    /**
     * 文档标签
     */
    tag: {
        _id: string,
        name: string,
        color: string,
    },
    /**
     * 创建者
     */
    creator: string,
    /**
     * 维护人员
     */
    maintainer: string,
    /**
     * 删除人员
     */
    deletePerson: string,
    /**
     * 花费时间
     */
    spendTime: number,
}
//api文档ContentType
type ApidocContentType = "application/json" | "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain" | "application/xml" | "text/html";
type ApidocBodyMode = "json" | "raw" | "formdata" | "urlencoded" | "binary" | "none";
type ApidocBodyRawType = "application/xml" | "text/javascript" | "text/plain" | "text/html" | "application/json"
//api文档请求body
type ApidocBodyParams = {
    /**
     * 模式，对应相关的content-type值
     * json类型、formdata类型、urlencoded类型、binary类型需要单独处理，其余均为字符串(特殊类型可以做一些客户端校验，但本质上都是字符串)
     */
    mode: ApidocBodyMode,
    /**
     * json类型参数
     */
    json: ApidocProperty[],
    /**
     * formData类型参数
     */
    formdata: ApidocProperty<string>[],
    /**
     * urlencoded类型参数
     */
    urlencoded: ApidocProperty<string>[],
    /**
     * raw类型参数
     */
    raw: {
        data: string,
        dataType: ApidocBodyRawType
    },
    /**
     * file类型参数
     */
    file: {
        src: string,
    },
}
//api文档返回参数
type ApidocResponseParams = {
    /**
     * 返回参数表述
     */
    title: string,
    /**
     * 状态码
     */
    statusCode: number,
    /**
     * 返回值
     */
    value: {
        /**
         * 返回参数类型
         */
        dataType: ApidocContentType,
        /**
         * json返回类型数据
         */
        json: ApidocProperty[],
        /**
         * 文本类型返回数据
         */
        text: string,
        /**
         * 文件类型返回数据
         */
        file: {
            /**
             * 转换为可访问本地路径
             */
            url: string,
            /**
             * 原始值
             */
            raw: string,
        },
    }
};
//完整文档信息
type ApidocDetail = {
    /**
     * 父元素id
     */
    pid: string,
    /**
     * 项目id
     */
    projectId: string,
    /**
     * 是否为文件夹
     */
    isFolder: boolean,
    /**
     * 排序
     */
    sort: number,
    /**
     * 基本信息
     */
    info: ApidocBaseInfo,
    /**
     * 接口信息
     */
    item: {
        /**
         * 请求方法
         */
        method: ApidocHttpRequestMethod,
        /**
         * 请求地址
         */
        url: {
            /**
             * 服务器地址
             */
            host: string,
            /**
             * 请求路径
             */
            path: string,
        },
        /**
         * restful请求路径
         */
        paths: ApidocProperty<string>[],
        /**
         * 查询字符串
         */
        queryParams: ApidocProperty<string>[],
        /**
         * 请求body
         */
        requestBody: ApidocBodyParams,
        /**
         * 返回参数
         */
        responseParams: ApidocResponseParams[],
        /**
         * 请求头
         */
        headers: ApidocProperty<string>[],
        /**
         * ContentType类型
         */
        contentType: ApidocContentType,
    },
}

//=========================================================================//
//=========================================================================//
//=========================================================================//
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
     * 请求方法
     */
    method: ApidocHttpRequestMethod,
    /**
     * 请求url
     */
    url?: string,
    /**
     * 子节点
     */
    children: ApidocBanner[]
}
//工具栏操作
type ApidocOperations = "addRootFolder" | "addRootFile" | "freshBanner" | "generateLink" | "recycler" | "viewDoc" | "exportDoc" | "importDoc" | "history" | "config"

//=========================================================================//
//=========================================================================//
//=================================mock相关================================//
//=========================================================================//
//=========================================================================//
//mock项目
type MockItem = {
    name: string,
    value: string,
    tags: string[],
}



export {
    Response,
    ResponseTable,
    PermissionMenu,
    PermissionRoleEnum,
    PermissionClientRoute,
    PermissionServerRoute,
    PermissionUserInfo,
    PermissionUserBaseInfo,
    PermissionClientMenu,
    ApidocHttpRequestMethod,
    ApidocProjectListInfo,
    ApidocProjectInfo,
    ApidocProjectMemberInfo,
    ApidocProjectPermission,
    ApidocProperty,
    ApidocPropertyType,
    ApidocParamsType,
    ApidocBanner,
    ApidocOperations,
    ApidocDetail,
    ApidocContentType,
    ApidocBodyMode,
    ApidocBodyRawType,
    ApidocResponseParams,
    MockItem,
}
