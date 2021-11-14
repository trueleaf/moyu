/* eslint-disable @typescript-eslint/no-var-requires */
const htmlBuildConfig = require("./build/html.config");
const defaultBuildConfig = require("./build/default.config");
const shareBuildConfig = require("./build/share.config");

const buildShare = process.argv.find(val => val === "--share");
const buildHtml = process.argv.find((val) => val === "--html");
process.env.VUE_APP_BUILD_TIME = new Date().toLocaleString();
process.env.VUE_APP_BUILD_SHARE = buildShare || "";
process.env.VUE_APP_BUILD_HTML = buildHtml || "";

let vueConfig = null;

if (buildHtml) {
    vueConfig = htmlBuildConfig
} else if (buildShare) {
    vueConfig = shareBuildConfig;
} else {
    vueConfig = defaultBuildConfig
}

module.exports = vueConfig;
