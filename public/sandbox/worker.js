//api文档详情
const apidocInfo = {};
 //临时变量
const tempVariables = new Proxy({}, {
    set(obj, prop, value) {
        obj[prop] = value;
        self.postMessage({
            type: "change-temp-variables",
            value: obj
        })
    }
});
//项目内全局变量
const collectionVariables = new Proxy({}, {
    set(obj, prop, value) {
        obj[prop] = value;
        self.postMessage({
            type: "change-collection-variables",
            value: obj
        })
        return true
    }
});
/*
|--------------------------------------------------------------------------
| 请求参数request
|--------------------------------------------------------------------------
|
*/
const url = {}; //url相关信息
const headers = {}; //headers相关信息
const jsonBodyValidator = {
    get(target, key) {
        if (typeof target[key] === "object" && target[key] !== null) {
            return new Proxy(target[key], jsonBodyValidator)
        } else {
            return target[key];
        }
    },
    set(obj, prop, value) {
        obj[prop] = value;
        self.postMessage({
            type: "change-json-body",
            value: JSON.parse(JSON.stringify(jsonBody))
        })
        return true;
    }
}
const formdataBodyValidator = {
    get(target, key) {
        if (typeof target[key] === "object") {
            throw Error(`formdata数据不支持嵌套`);
        } else {
            return target[key];
        }
    },
    set(obj, prop, value) {
        if (typeof value !== "string") {
            throw TypeError(`给 ${prop} 赋值时出错，formdata数据值类型只能为字符串`);
        }
        obj[prop] = value;
        self.postMessage({
            type: "change-formdata-body",
            value: JSON.parse(JSON.stringify(formdataBody))
        })
        return true;
    }
}
const jsonBody = new Proxy({}, jsonBodyValidator); //json类型的body参数
const formdataBody = new Proxy({}, formdataBodyValidator); //formdata类型body参数
const body = new Proxy({}, {
    get(obj, prop) {
        if (prop === "json") {
            return jsonBody
        }
        if (prop === "formdata") {
            return formdataBody
        }
    },
});
//request参数
let replacedUrl = "";
const request = new Proxy({}, {
    get(obj, prop) {
        if (prop === "url") {
            const urlInfo = apidocInfo.getUrlInfo();
            return urlInfo.url;
        }
        if (prop === "fullUrl") {
            const urlInfo = apidocInfo.getUrlInfo();
            return urlInfo.fullUrl;
        }
        if (prop === "host") {
            const urlInfo = apidocInfo.getUrlInfo();
            return urlInfo.host;
        }
        if (prop === "path") {
            const urlInfo = apidocInfo.getUrlInfo();
            return urlInfo.path;
        }
        if (prop === "replaceUrl") {
            return (val) => {
                replacedUrl = val;
                self.postMessage({
                    type: "replace-url",
                    value: val,
                })
            }
        }
        if (prop === "method") {
            return apidocInfo.getMethod();
        }
        if (prop === "headers") {
            return headers;
        }
        if (prop === "body") {
            return body;
        }
    }
});

importScripts("./variables.js")
importScripts("./utils.js")
importScripts("./collection-variables.js")
importScripts("./apidoc-info.js")
importScripts("./url.js")
importScripts("./headers.js")
importScripts("./json-body.js")

//pm对象
const pm = new Proxy({}, {
    get(obj, prop) {
        if (prop === "variables") { //局部变量
            return tempVariables;
        }
        if (prop === "collectionVariables") { //项目内全局变量
            return tempVariables;
        }
        if (prop === "request") { //request对象
            return request;
        }
    },
})

self.addEventListener("message", (e) => {
    // 初始化所有请求信息
    if (e.data && e.data.type === "init") {
        Object.assign(apidocInfo, e.data.value);
        apidocInfo.initHeaders();
        apidocInfo.initBody();
        replacedUrl = "";
    } 
    //发送请求
    if (e.data && e.data.type === "request") {
        eval(`(function(pm) { 
            ${e.data.value}
        })(pm)`);
        self.postMessage({
            type: "worker-response",
        })
    }
});
