/*
|--------------------------------------------------------------------------
| 全局数据
|--------------------------------------------------------------------------
| 属性参考： src/@types/global.d.ts/ApidocDetail
*/
const GlobalData = {
    /**
     * 当前文档id值
     */
    _id: "",
    /**
     * 公共请求头
     */
    commonHeaders: {},
    /**
     * 文档数据：参考src/@types/global.d.ts/ApidocDetail
     */
    apidocInfo: {},
    /**
     * 项目内变量 Record<string, any>
     */
    projectVaribles: {},
    /**
     * 仅当前接口生效变量
     */
    tempVariables: {},
    /**
     * 全局安装包
     */
    packages: []
}
