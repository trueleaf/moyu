/**
 * @description        electron默认打包配置
 * @author             shuxiaokai
 */
const path = require("path");
const config = require("../src/config");

module.exports = {
    pages: {
        index: {
            entry: "src/renderer/main.js", //添加了entry则不需要rendererProcessFile
            template: "public/index.html",
        },
    },
    //=====================================devserver====================================//
    devServer: {
        port: 9999,
    },
    //=====================================css相关配置====================================//
    css: {
        loaderOptions: {
            css: {
                // 这里的选项会传递给 css-loader
            },
            sass: {
                prependData: `@import "@/scss/index.scss";`,
            },
        },
        sourceMap: false,
    },
    //=====================================扩展webpack配置====================================//
    configureWebpack: {
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "../src/renderer"),
                "~": path.resolve(__dirname, "../"),
            },
        },
    },
    pluginOptions: {
        electronBuilder: {
            extends: null,
            externals: [
                "vue",
                "axios",
                "vue-electron",
                "vue-router",
                "vuex",
                "vuex-electron",
                "element-ui",
                "js-cookie",
                "mockjs",
                "nprogress",
                "monaco-editor",
                "vuedraggable",
                "ali-oss",
                "json5",
                "echarts",
                "brace",
                "urllib",
                "cookie-parser",
                "got",
                "form-data",
                "proxy-agent",
                "shelljs",
                "ssh2",
                "koa",
            ],
            mainProcessFile: "src/main/index.js",
            mainProcessWatch: ["src/main/index.js"],
            builderOptions: {
                productName: config.renderConfig.layout.title,
                appId: "com.example.yourapp",
                publish: [
                    {
                        provider: "generic",
                        url: "",
                    },
                ],
                nsis: {
                    oneClick: false, // 是否一键安装
                    allowToChangeInstallationDirectory: true, // 允许修改安装目录
                },
                mac: {
                    icon: "build/icons/icon.icns",
                },
                win: {
                    icon: "build/icons/icon.ico",
                },
                linux: {
                    icon: "build/icons",
                },
            },
        },
    },
    //=====================================eslint配置====================================//
    lintOnSave: "error", //未通过eslint 禁止代码提交
    //=====================================打包上线配置====================================//
    publicPath: config.build.publicPath || "/",
    outputDir: "dist", //输出文件类型
    productionSourceMap: true, //打包时候js是否添加sourceMap
};
