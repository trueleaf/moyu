/**
 * @description        默认项目全局配置信息
 * @author             shuxiaokai
 * @create             2020-09-30 22:25
 */

const packageJSON = require("../../package.json");

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
            url: isDev ? "http://127.0.0.1:7004" : "http://47.107.70.26:7005",
            imgUrl: isDev ? "http://happymoyu.oss-cn-beijing.aliyuncs.com" : "http://happymoyu.oss-cn-beijing.aliyuncs.com",
            timeout: 20000,
            withCredentials: true,
            whiteList: ["/login"],
        },
        //mock相关配置
        mock: {
            enabled: true,
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
    },
    //主进程配置
    mainConfig: {
        width: 1440,
        height: 768,
        useLocalFile: true, //使用本地文件作为主进程加载内容
        onlineUrl: "http://47.107.70.26/jobtool", //线上地址
    },
    //打包相关配置
    build: {
        publicPath: "/jobtool",
    },
};
