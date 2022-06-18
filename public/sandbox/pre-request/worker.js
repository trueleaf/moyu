importScripts("./global/global.js"); //暴露 GlobalData(全局数据)   
importScripts("./helper/helper.js"); //helper在global后面引入，因为helper会使用到global里面数据
importScripts("./request/headers.js")
const pm = {
    request: {
        headers
    },
};

self.addEventListener("message", (e) => {
    //初始化所有请求信息
    if (e.data && e.data.type === "prerequest-init-apidoc") {
        const data = e.data.value; 
        console.log("data", data)
        GlobalData.apidocInfo = data.apidocInfo;
        GlobalData.commonHeaders = data.commonHeaders;
        GlobalData.currentEnv = data.currentEnv;
        GlobalData.projectName = data.projectName;
        GlobalData._id = data._id;
        GlobalData.projectVaribles = data.projectVaribles;
        //header转换
        const objHeaders = {};
        data.apidocInfo.item.headers.concat(data.commonHeaders).forEach(headerInfo => {
            if (headerInfo.key) {
                objHeaders[headerInfo.key] = headerInfo.value;
            }
        })
        Object.assign(_headers, objHeaders)
    } 
    //发送请求
    if (e.data && e.data.type === "prerequest-request") {
        eval(`(function(pm) { 
            ${e.data.value}
        })(pm)`);
        self.postMessage({
            type: "prerequest-finish",
        })
    }
});
