/*
|--------------------------------------------------------------------------
| Electron更新相关配置
|--------------------------------------------------------------------------
*/
interface UpdateConfig {
    readonly version: string, //当前项目版本
    readonly server: string, //更新服务器地址
    readonly filePath: string, //更新文件地址
    readonly autoUpdate: boolean, //是否开启自动更新
}
/*
|--------------------------------------------------------------------------
| renderer相关配置
|--------------------------------------------------------------------------
*/
//=====================================布局相关====================================//
enum Size {
    mini = "mini",
    small = "small",
    medium = "medium",
    large = "large",
}
interface Layout {
    readonly title: string,
    readonly size: string,
}
//=====================================权限====================================//
interface Permission {
    readonly free: boolean,
    readonly whiteList: string[],
}
//=====================================Http请求====================================//
interface HttpRequest {
    readonly url: string,
    readonly imgUrl: string,
    readonly timeout: number,
    readonly withCredentials: boolean,
}
//=====================================Mock相关====================================//
interface Mock {
    enabled: boolean,
    port: number,
    ip: string,
}
//==================================组件配置=======================================//
interface TableConfig {
    pageSizes: Array<number>,
    pageSize: number,
}
interface RichText {
    useOss: boolean,
}
interface Components {
    tableConfig: TableConfig,
    richText: RichText,
}
//===================================indexedDB数据库======================================//
interface IndexedDB {
    dbName: string,
    version: number,
}
//=====================================分享文档相关配置====================================//
interface ShareDoc {
    baseUrl: string,
}
//======================================导入文档相关配置===================================//
interface ImportDoc {
    size: number,
}
//=====================================Electron下载====================================//
interface ElectronDownload {
    gitee: string,
}

interface RendererConfig {
    layout: Layout,
    permission: Permission,
    httpRequest: HttpRequest,
    mock: Mock,
    components: Components,
    indexedDB: IndexedDB,
    share: ShareDoc,
    import: ImportDoc,
    download: ElectronDownload,
}
/*
|--------------------------------------------------------------------------
| 主进程相关配置
|--------------------------------------------------------------------------
*/
interface MainConfig {
    width: number,
    height: number,
    useLocalFile: boolean, //使用本地文件作为主进程加载内容
    onlineUrl: string, //线上地址
}
/*
|--------------------------------------------------------------------------
| 打包相关配置
|--------------------------------------------------------------------------
|
*/
interface BuildConfig {
    publicPath
}
/*
|--------------------------------------------------------------------------
| 本地部署相关配置
|--------------------------------------------------------------------------
*/
interface Localization {
    enableRegister: boolean, //是否允许注册
    enableGuest: boolean, //是否允许来宾用户体验
    enableDocLink: boolean, //是否显示文档和帮助链接
}


//Electron配置
interface Config {
    readonly isDev: boolean, //是否开发环境
    readonly version: string, //版本信息
    updateConfig: UpdateConfig, //更新配置
    renderConfig: RendererConfig, //渲染进程相关配置
    mainConfig: MainConfig, //主进程相关配置
    localization: Localization, //本地部署相关配置
}
//=========================================================================//

//=========================================================================//
export { Config, global, process };