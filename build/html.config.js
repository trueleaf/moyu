/**
 * @description        打包为单个文件
 * @author             shuxiaokai
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");

module.exports = {
    pages: {
        index: {
            entry: "src/renderer/pages/modules/apidoc/doc-view/main.ts",
            template: "public/index.html",
        },
    },
    devServer: {
        port: 9999,
    },
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
                "@": path.resolve(__dirname, "../src/renderer"),
                "~": path.resolve(__dirname, "../"),
            },
        },
        optimization: {
            splitChunks: false, // makes there only be 1 js file - leftover from earlier attempts but doesn't hurt
        },
        plugins: [
            new HtmlWebpackPlugin({
                templateParameters: {
                    BASE_URL: "/",
                },
                filename: "index.html", // the output file name that will be created
                template: "public/index.html", // this is important - a template file to use for insertion
                inlineSource: ".(js|css|png|jpg|woff|woff2|ttf)$", // embed all javascript and css inline
            }),
            new HtmlWebpackInlineSourcePlugin(),
        ],
    },
    chainWebpack: (webpackConfig) => {
        const fontsRule = webpackConfig.module.rule("fonts");
        // clear all existing loaders.
        // if you don't do this, the loader below will be appended to
        // existing loaders of the rule.
        fontsRule.uses.clear();
        webpackConfig.module
            .rule("fonts")
            .test(/\.(ttf|otf|eot|woff|woff2)$/)
            .use("base64-inline-loader")
            .loader("base64-inline-loader")
            .end();
    },
    //=====================================eslint配置====================================//
    lintOnSave: "error", //未通过eslint 禁止代码提交
    //=====================================打包上线配置====================================//
    productionSourceMap: true, //打包时候js是否添加sourceMap
    publicPath: "/",
};
