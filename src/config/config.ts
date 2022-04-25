/*
|--------------------------------------------------------------------------
| 默认项目全局配置信息
|--------------------------------------------------------------------------
*/
import type { Config } from "@@/config"

let ip = "127.0.0.1";
if (typeof window !== "undefined" && window.require) {
    const ipFn = window.require("ip");
    ip = ipFn.address();
}

const isDev = process.env.NODE_ENV === "development";
function isElectron(): boolean {
    if (typeof window !== "undefined" && typeof window.process === "object" && window.process.type === "renderer") {
        return true;
    }
    if (typeof process !== "undefined" && typeof process.versions === "object" && !!process.versions.electron) {
        return true;
    }
    if (typeof navigator === "object" && typeof navigator.userAgent === "string" && navigator.userAgent.indexOf("Electron") >= 0) {
        return true;
    }
    return false;
}
const config: Config = {
    ip,
    isElectron: isElectron(),
    isDev,
    //更新相关配置
    updateConfig: {
        url: "http://xxx.xxx.cn/electron/windows", //更新服务器地址
        autoUpdate: false, //是否开启自动更新
    },
    //渲染进程配置
    renderConfig: {
        //布局相关
        layout: {
            size: "default", //项目中组件库大小
        },
        //权限相关
        permission: {
            free: false,
            whiteList: ["/", "/login", "/test", "/check", "view"],
        },
        //http请求相关
        httpRequest: {
            url: isDev ? "http://127.0.0.1:7004" : "https://online.jobtool.cn",
            imgUrl: isDev ? "http://happymoyu.oss-cn-beijing.aliyuncs.com" : "http://happymoyu.oss-cn-beijing.aliyuncs.com",
            timeout: 20000,
            withCredentials: true,
        },
        //mock相关配置
        mock: {
            enabled: true,
            port: 55555,
            ip,
        },
        //全局组件配置
        components: {
            tableConfig: {
                pageSizes: [10, 20, 30, 50, 70, 100], //每页条数
                pageSize: 20, //每页默认显示数量
            },
        },
        //本地数据库配置
        indexedDB: {
            dbName: "moyu", //indexedDB名称
            version: 1, //indexedDB版本信息
        },
        //导入文档相关配置
        import: {
            size: 1024 * 1024 * 5, //导入文件大小
        },
        shareUrl: "https://share.jobtool.cn"
    },
    //主进程配置
    mainConfig: {
        width: 1440,
        height: 768,
        useLocalFile: false, //使用本地文件作为主进程加载内容
        onlineUrl: "https://online.jobtool.cn", //若useLocalFile为false则使用当前地址作为electron加载地址
    },
    //本地部署相关配置
    localization: {
        version: "0.8.0", //当前项目版本
        title: "moyu", //项目名称
        consoleWelcome: true, //是否打印欢迎信息
        download: {
            enabled: false, //是否允许提示用户下载electron
            url: "https://gitee.com/shuzhikai/moyu/releases", //下载地址
        },
        enableRegister: true, //是否允许用户自主注册账号
        enableGuest: true, //是否允许来宾用户体验
        enableDocLink: true, //是否显示文档和帮助链接
    },
}
export default config;
