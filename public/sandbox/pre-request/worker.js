importScripts("../common/json5.js"); 
importScripts("./global/global.js"); //暴露 GlobalData(全局数据)   
importScripts("./helper/helper.js"); //helper在global后面引入，因为helper会使用到global里面数据
importScripts("./variables/variables.js")
importScripts("./request/headers.js")
importScripts("./request/query.js")
importScripts("./request/path.js")
importScripts("./request/formdata.js")
importScripts("./request/urlencoded.js")
importScripts("./request/json.js")
importScripts("./request/raw.js")
importScripts("./request/send-request.js")
importScripts("./global/import-script.js")

const bodyData = new Proxy({}, {
    get(target, key) {
        if (key === "formdata") {
            return formdata
        } else if (key === "urlencoded") {
            return urlencoded
        } else if (key === "json") {
            return json
        } else if (key === "raw") {
            return raw
        }
    },
    set(obj, prop, value) {
        if (prop === "raw") {
            rawData.value = value;
            return true;
        }
    }
})

const pm = {
    request: {
        headers,
        queryParams,
        pathParams,
        body: bodyData,
    },
    variables,
    sendRequest,
};

self.addEventListener("message", async (e) => {
    try {
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
            //=====================================raw参数====================================//
            rawData.value = data.apidocInfo.item.requestBody.raw.data;
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
            //=====================================全局变量====================================//
            const objVariable = {};
            data.projectVaribles.forEach(v => {
                if (v.name) {
                    objVariable[v.name] = v.value;
                }
            })
            Object.assign(variables, objVariable);
        } 
        //发送请求
        if (e.data && e.data.type === "prerequest-request") {
            const replacedCode = `(async function(pm) { 
                ${e.data.value}
            })(pm)`.replace(/((?<!https+:)\/\/[^\n]*)|(\/\*(\s|.)*\*\/)/g, "");
            const importScriptList = replacedCode.match(/importScript\([^)]+\)/g);
            const requestUrls = [];
            let remoteScriptStr = ""
            importScriptList?.forEach(scriptStr => {
                const matchedStr = scriptStr.match(/(?<=")[^"]+(?=")/g);
                if (matchedStr) {
                    requestUrls.push(matchedStr[0])
                }
            })
            for(let i = 0; i < requestUrls.length; i ++) {
                const result = await importScript(requestUrls[i]);
                remoteScriptStr = remoteScriptStr + result + ";"
            }
            const evalPromise = eval(`
                ${remoteScriptStr}
                ${replacedCode}
            `);
            evalPromise.then(() => {
                self.postMessage({
                    type: "prerequest-finish",
                })
            }).catch(error => {
                self.postMessage({
                    type: "prerequest-error",
                    value: error,
                });
            })
        }
    } catch (error) {
        self.postMessage({
            type: "prerequest-error",
            value: error,
        });
    }
});
