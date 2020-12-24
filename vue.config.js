const path = require("path");
const config = require("./src/config");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");

const isShareDoc = process.argv.find((val) => val === "--single");

let vueConfig = {};
if (isShareDoc) {
    vueConfig = {
        //=====================================css相关配置====================================//
        css: {
            loaderOptions: {
                sass: {
                    prependData: `@import "@/scss/index.scss";`,
                },
            },
            extract: false,
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
            optimization: {
                splitChunks: false, // makes there only be 1 js file - leftover from earlier attempts but doesn't hurt
            },
            plugins: [
                new HtmlWebpackPlugin({
                    templateParameters: {
                        BASE_URL: config.build.publicPath || "/",
                    },
                    filename: "index.html", // the output file name that will be created
                    template: "public/index.html", // this is important - a template file to use for insertion
                    inlineSource: ".(js|css|png|jpg|woff|ttf)$", // embed all javascript and css inline
                }),
                new HtmlWebpackInlineSourcePlugin(),
            ],
        },
        chainWebpack: (config) => {
            const fontsRule = config.module.rule("fonts");
            // clear all existing loaders.
            // if you don't do this, the loader below will be appended to
            // existing loaders of the rule.
            fontsRule.uses.clear();
            config.module
                .rule("fonts")
                .test(/\.(ttf|otf|eot|woff|woff2)$/)
                .use("base64-inline-loader")
                .loader("base64-inline-loader")
                .end();
        },
        //=====================================eslint配置====================================//
        lintOnSave: "error", //未通过eslint 禁止代码提交
        //=====================================打包上线配置====================================//
        publicPath: config.build.publicPath || "/",
        // outputDir: "dist", //输出文件类型
    };
} else {
    vueConfig = {
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
                    "got"
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
}

module.exports = vueConfig;
