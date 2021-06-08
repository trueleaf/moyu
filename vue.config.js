const minimist = require("minimist");
const config = require("./src/config");
const defaultBuildConfig = require("./build/default.build");
const singleBuildConfig = require("./build/single.build");

process.env.VUE_APP_TITLE = config.renderConfig.layout.title;
process.env.VUE_APP_BUILD_TIME = new Date().toLocaleString();

const rawArgv = process.argv.slice(2);
const argv = minimist(rawArgv);
const buildWebPage = argv.web; //在线连接和生成静态HTML页面
const buildSingleWebPage = argv.offline; //仅生成单个文件

let vueConfig = {};
if (buildSingleWebPage) {
    vueConfig = singleBuildConfig;
} else if (buildWebPage) {
    delete defaultBuildConfig.pages;
    vueConfig = defaultBuildConfig;
} else {
    vueConfig = defaultBuildConfig
}

module.exports = vueConfig;
