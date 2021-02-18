/* eslint-disable import/no-unresolved */
const config = require("./config.default");

let localConfig = null;
try {
    // eslint-disable-next-line global-require
    localConfig = require("./config.local2.js")
} catch (error) {
    console.error(error)
}
console.log(localConfig)
module.exports = config;
