/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * @description        electron默认打包配置
 * @author             shuxiaokai
 */
const path = require("path");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
    pages: {
        index: {
            entry: "src/renderer/main.ts",
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
                "@@": path.resolve(__dirname, "../src"),
                "~": path.resolve(__dirname, "../"),
            },
        },
        target: "web",
        plugins: [new MonacoWebpackPlugin()],
    },
    pluginOptions: {
        electronBuilder: {
            // contextIsolation: false,
            nodeIntegration: true, //参考https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html
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
                "got",
                "@koa/cors",
                "form-data",
                "proxy-agent",
                "shelljs",
                "ssh2",
                "koa",
                "fs-extra",
                "ip",
            ],
            mainProcessFile: "src/main/background.ts",
            mainProcessWatch: ["src/main/background.ts"],
            builderOptions: {
                productName: "moyu",
                appId: "com.example.yourapp",
                extraResources: ["./public/**"],
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
                    icon: "public/icons/icon.icns",
                },
                win: {
                    icon: "public/icons/icon.ico",
                },
                linux: {
                    icon: "public/icons",
                },
            },
            //参考 https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/1432
            chainWebpackMainProcess: (config) => {
                config.module
                    .rule("babel")
                    .before("ts")
                    .use("babel")
                    .loader("babel-loader")
                    .options({
                        presets: [
                            [
                                "@babel/preset-env",
                                { modules: false, targets: { electron: "6" } },
                            ],
                        ],
                        plugins: ["@babel/plugin-proposal-class-properties"],
                    });
            },
        },
    },
    //=====================================eslint配置====================================//
    lintOnSave: "error", //未通过eslint 禁止代码提交
    //=====================================打包上线配置====================================//
    publicPath: "/",
    outputDir: "dist", //输出文件类型
    productionSourceMap: false, //打包时候js是否添加sourceMap
};
