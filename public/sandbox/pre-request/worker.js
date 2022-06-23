importScripts("../common/json5.js"); 
importScripts("./global/global.js"); //暴露 GlobalData(全局数据)   
importScripts("./helper/helper.js"); //helper在global后面引入，因为helper会使用到global里面数据
importScripts("./request/headers.js")
importScripts("./request/query.js")
importScripts("./request/path.js")
importScripts("./request/formdata.js")
importScripts("./request/urlencoded.js")
importScripts("./request/json.js")
importScripts("./global/import-script.js")
const pm = {
    request: {
        headers,
        queryParams,
        pathParams,
        body: {
            formdata,
            urlencoded,
            json,
        },
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
        //=====================================header转换====================================//
        const objHeaders = {};
        data.apidocInfo.item.headers.concat(data.commonHeaders).forEach(v => {
            if (v.key) {
                objHeaders[v.key] = v.value;
            }
        })
        Object.assign(_headers, objHeaders);
        //=====================================query参数转换====================================//
        const objQueryParams = {};
        data.apidocInfo.item.queryParams.forEach(v => {
            if (v.key) {
                objQueryParams[v.key] = v.value;
            }
        })
        Object.assign(_queryParams, objQueryParams);
        //=====================================path参数转换====================================//
        const objPathParams = {};
        data.apidocInfo.item.paths.forEach(v => {
            if (v.key) {
                objPathParams[v.key] = v.value;
            }
         })
         Object.assign(_pathParams, objPathParams);
        //=====================================formdata参数====================================//
        const objFormdataParams = {};
        data.apidocInfo.item.requestBody.formdata.forEach(v => {
            if (v.key) {
                objFormdataParams[v.key] = v.value;
            }
        })
        Object.assign(_formdata, objFormdataParams);
        //=====================================urlencoded参数====================================//
        const objUrlencodedParams = {};
        data.apidocInfo.item.requestBody.urlencoded.forEach(v => {
            if (v.key) {
                objUrlencodedParams[v.key] = v.value;
            }
        })
        Object.assign(_urlencoded, objUrlencodedParams);
        //=====================================json参数====================================//
        const parsedJson = JSON5.parse(data.apidocInfo.item.requestBody.rawJson);
        Object.assign(json, parsedJson);
        //=====================================请求url、环境等====================================//
        const { host, path } = data.apidocInfo.item.url;
        pm.request.url = {
            prefix: host,
            path: path,
            url: `${host}${path}`
        }
        pm.request.currentEnv = data.currentEnv;
        pm.request.envs = data.envs;
        //=====================================替换url====================================//
        pm.request.replaceUrl = (url) => {
            self.postMessage({
                type: "prerequest-change-url",
                value: url,
            });
        }
    } 
    //发送请求
    if (e.data && e.data.type === "prerequest-request") {
        eval(`(async function(pm) { 
            ${e.data.value}
        })(pm)`);
        self.postMessage({
            type: "prerequest-finish",
        })
    }
});
