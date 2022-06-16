importScripts("./helper/helper.js");
importScripts("./global/global.js"); //暴露 GlobalData(全局数据)   


self.addEventListener("message", (e) => {
    // 初始化所有请求信息
    if (e.data && e.data.type === "init-apidoc") {
        const data = e.data.value; 
        console.log(22, data)
        GlobalData.apidocInfo = data.apidocInfo;
        GlobalData.commonHeaders = data.commonHeaders;
        GlobalData.currentEnv = data.currentEnv;
        GlobalData.projectName = data.projectName;
        GlobalData._id = data._id;
        GlobalData.projectVaribles = data.projectVaribles;
        // Object.assign(apidocInfo, e.data.value);
        // apidocInfo.initHeaders();
        // apidocInfo.initBody();
        // apidocInfo.initParams();
        // replacedUrl = "";
    } 
    // // 初始化基础信息
    // if (e.data && e.data.type === "init-baseInfo") {
    //     const { variables, hosts, currentEnv } = e.data.value;
    //     const objVariable = {};
    //     for(let i = 0; i < variables.length; i += 1) {
    //         const item = variables[i];
    //         if (item.type === "string") {
    //             objVariable[item.name] = item.value.toString();
    //         } else if (item.type === "number") {
    //             objVariable[item.name] = Number(item.value);
    //         } else if (item.type === "boolean" && item.value === "true") {
    //             objVariable[item.name] = true;
    //         } else if (item.type === "boolean" && item.value === "false") {
    //             objVariable[item.name] = false;
    //         } else if (item.type === "boolean") {
    //             objVariable[item.name] = !!item.value;
    //         }  else {
    //             console.warn(`无法解析的变量数据类型${item.type}`)
    //         }
    //     }
    //     for(let i = 0; i < hosts.length; i += 1) {
    //         const item = hosts[i];
    //         environment[item.name] = item.url;
    //     }
    //     currentEnvironment = currentEnv;
    //     Object.assign(collectionVariables, objVariable); //初始化变量信息
    // }
    // // 请求成功
    // if (e.data && e.data.type === "request-success") {
    //     requestCb(null, e.data.value);
    //     self.postMessage({
    //         type: "worker-response",
    //     })
    // } 
    // // 请求失败
    // if (e.data && e.data.type === "request-error") {
    //     requestCb(e.data.value, null);
    //     self.postMessage({
    //         type: "worker-response",
    //     })
    // } 
    // //发送请求
    // if (e.data && e.data.type === "request") {
    //     eval(`(function(pm) { 
    //         ${e.data.value}
    //     })(pm)`);
    //     if (!isSendRequest) { //如果为发送请求，则不回复response
    //         self.postMessage({
    //             type: "worker-response",
    //         })
    //     }
    // }
});
