/**
 * @description        默认项目全局配置信息
 * @author             shuxiaokai
 * @create             2020-09-30 22:25
 */

const packageJSON = require("../../package.json");

let ip = "127.0.0.1";

if (global && global.require) {
    const internalIp = global.require("internal-ip");
    ip = internalIp.v4.sync()
    // console.log(, global.require)
}
//https://github.com/cheton/is-electron
//https://github.com/electron/electron/issues/2288
function isElectron() {
    // Renderer process
    if (typeof window !== "undefined" && typeof window.process === "object" && window.process.type === "renderer") {
        return true;
    }
    // Main process
    if (typeof process !== "undefined" && typeof process.versions === "object" && !!process.versions.electron) {
        return true;
    }
    // Detect the user agent when the `nodeIntegration` option is set to true
    if (typeof navigator === "object" && typeof navigator.userAgent === "string" && navigator.userAgent.indexOf("Electron") >= 0) {
        return true;
    }
    return false;
}
const isDev = process.env.NODE_ENV === "development";
module.exports = {
    isElectron: isElectron(), //是否为electron环境
    version: packageJSON.version, //当前项目版本
    isDev,
    //更新相关配置
    updateConfig: {
        version: packageJSON.version, //当前项目版本
        server: "http://xxx.xxx.cn", //更新服务器地址
        filePath: "/electron/windows", //更新文件地址
    },
    //渲染进程配置
    renderConfig: {
        //布局相关
        layout: {
            title: packageJSON.name, //项目标题
            size: "mini", //项目中组件库大小
        },
        //http请求相关
        httpRequest: {
            url: isDev ? "http://127.0.0.1:7004" : "https://online.jobtool.cn",
            imgUrl: isDev ? "http://happymoyu.oss-cn-beijing.aliyuncs.com" : "http://happymoyu.oss-cn-beijing.aliyuncs.com",
            timeout: 20000,
            withCredentials: true,
            whiteList: ["/", "/login", "/test"],
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
            richText: {
                useOss: false,
            },
        },
        //本地数据库配置
        indexedDB: {
            dbName: "moyu", //indexedDB名称
            version: 1, //indexedDB版本信息
        },
        //导出文档相关配置
        share: {
            baseUrl: "https://share.jobtool.cn",
        },
        //导入文档相关配置
        import: {
            size: 1024 * 1024 * 5, //导入文件大小
        },
        //下载相关
        download: {
            gitee: "https://gitee.com/shuzhikai/moyu/attach_files/696158/download/moyu%20Setup%200.5.0.exe",
        },
    },
    //主进程配置
    mainConfig: {
        width: 1440,
        height: 768,
        useLocalFile: false, //使用本地文件作为主进程加载内容
        onlineUrl: "https://online.jobtool.cn", //线上地址
    },
    //打包相关配置
    build: {
        publicPath: "/",
    },
};
