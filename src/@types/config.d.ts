import type { ComponentSize } from "element-plus/es/constants";

/*
|--------------------------------------------------------------------------
| Electron更新相关配置
|--------------------------------------------------------------------------
*/

type Config = {
    /**
     * 内网ip地址
     */
    ip: string,
    /**
     * 是否为electron环境
     */
    isElectron: boolean,

    /**
     * 是否为开发环境
     */
    isDev: boolean,

    /**
     * 更新相关配置
     */
    updateConfig: {
        /**
         * 更新服务器地址
         */
        url: string,

        /**
         * 是否开启自动更新
         */
        autoUpdate: boolean,
    },

    /**
     * 渲染进程配置
     */
    renderConfig: {
        /**
         * 布局相关
         */
        layout: {
            /**
             * 项目中组件库大小
             */
            size: ComponentSize,
        },

        /**
         * 权限相关
         */
        permission: {
            /**
             * 是否开启严格权限校验
             */
            free: boolean,
            /**
             * 路由白名单，free模式下所有路由都不拦截
             */
            whiteList: string[],
        },
        /**
         * http请求相关
         */
        httpRequest: {
            /**
             * 请求url
             */
            url: string,

            /**
             * 图片url
             */
            imgUrl: string,

            /**
             * 超时时间
             */
            timeout: number,

            /**
             * 请求是否携带cookie
             */
            withCredentials: boolean,
        },
        /**
         * mock相关配置
         */
        mock: {
            /**
             * 是否启动mock功能
             */
            enabled: boolean,

            /**
             * mock服务器默认端口
             */
            port: number,

            /**
             * 当前所处环境ip地址
             */
            ip: string,
        },
        /**
         * 全局组件配置
         */
        components: {
            /**
             * 表格相关配置信息
             */
            tableConfig: {
                /**
                 * 每页条数
                 */
                pageSizes: number[],

                /**
                 * 每页默认显示数量
                 */
                pageSize: number,
            },
        },
        /**
         * 本地数据库配置
         */
        indexedDB: {
            /**
             * indexedDB数据库名称
             */
            dbName: string,

            /**
             * indexedDB数据库版本
             */
            version: number,
        },
        /**
         * 导入文档相关配置
         */
        import: {
            /**
             * 导入文件大小限制
             */
            size: number,
        },
        /**
         * 分享url
         */
        shareUrl: string
    },
    /**
     * 主进程配置
     */
    mainConfig: {
        /**
         * 默认electron窗口宽度
         */
        width: number,

        /**
         * 默认electron窗口高度
         */
        height: number,

        /**
         * 使用本地文件作为主进程加载内容
         */
        useLocalFile: boolean,

        /**
         * 若useLocalFile为false则使用当前地址作为electron加载地址
         */
        onlineUrl: string,
    },
    /**
     * 本地部署相关配置
     */
    localization: {
        /**
         * 版本信息 eg: 0.6.3
         */
        version: string,
        /**
         * 项目名称
         */
        title: string,
        /**
         * 是否开启控制台欢迎文案
         */
         consoleWelcome: boolean,
         /**
         * 客户端下载相关
         */
          download: {
            /**
             * 下载地址
             */
            url: string,
            /**
             * 是否允许下载
             */
            enabled: boolean,
        },
        /**
         * 是否允许用户自主注册账号
         */
        enableRegister: boolean,

        /**
         * 是否允许来宾用户体验
         */
        enableGuest: boolean,

        /**
         * 是否显示文档和帮助链接
         */
        enableDocLink: boolean,
    },
}

export { Config };
