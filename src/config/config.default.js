/** 
 * @description        默认项目全局配置信息
 * @author             shuxiaokai
 * @create             2020-09-30 22:25
 */

const packageJSON = require("../../package.json")

module.exports = {
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
            title: packageJSON.name,
            size: "mini"
        },
        //http请求相关
        httpRequest: {
            url: process.env.NODE_ENV === "development" ? "http://127.0.0.1:7004" : "http://47.107.70.26:7005",
            imgUrl: process.env.NODE_ENV === "development" ? "http://happymoyu.oss-cn-beijing.aliyuncs.com" : "http://happymoyu.oss-cn-beijing.aliyuncs.com",
            timeout: 20000,
            withCredentials: true,
            whiteList: ["/login"]
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
            }
        },
        //本地数据库配置
        indexedDB: {
            dbName: "moyu",
            version: 1,
        }
    },
    //主进程配置
    mainConfig: {
        width: 1440,
        height: 768,
        onlineUrl: "https://baidu.cn", //线上地址
    },
    //打包相关配置
    build: {
        publicPath: "/jobtool"
    }
};
