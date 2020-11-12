const path = require("path");
const config = require("./src/config");
module.exports = {
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
                "@": path.resolve(__dirname, "src/renderer"),
                "~": path.resolve(__dirname, ""),
            },
        },
    },
    pluginOptions: {
        electronBuilder: {
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
            ],
            mainProcessFile: "src/main/index.js",
            rendererProcessFile: "src/renderer/main.js",
            mainProcessWatch: ["src/main/index.js"],
        },
    },

    //=====================================eslint配置====================================//
    lintOnSave: "error", //未通过eslint 禁止代码提交
    //=====================================打包上线配置====================================//
    publicPath: config.build.publicPath || "/",
    outputDir: "dist", //输出文件类型
    productionSourceMap: true, //打包时候js是否添加sourceMap
};
