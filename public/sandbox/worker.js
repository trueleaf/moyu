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
const environment = {}; //环境信息
let currentEnvironment = ""; //当前环境信息
const url = {}; //url相关信息
const headers = {}; //headers相关信息
const queryParamsValidator = {
    get(target, key) {
        if (typeof target[key] === "object") {
            throw Error(`query参数不支持嵌套`);
        } else {
            return target[key];
        }
    },
    set(obj, prop, value) {
        if (typeof value !== "string") {
            throw TypeError(`给 ${prop} 赋值时出错，query参数类型只能为字符串`);
        }
        obj[prop] = value;
        self.postMessage({
            type: "change-query-params",
            value: JSON.parse(JSON.stringify(queryParams))
        })
        return true;
    },
    deleteProperty(target, prop) {
        delete target[prop];
        self.postMessage({
            type: "change-query-params",
            value: JSON.parse(JSON.stringify(queryParams))
        })
    },
}
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
    },
    deleteProperty(target, prop) {
        delete target[prop];
        self.postMessage({
            type: "change-json-body",
            value: JSON.parse(JSON.stringify(jsonBody))
        })
    },
}
const arrJsonBodyValidator = {
    get(target, key, description) {
        if (typeof target[key] === "object" && target[key] !== null) {
            return new Proxy(target[key], arrJsonBodyValidator)
        } else {
            return target[key];
        }
    },
    set(obj, prop, value) {
        if (prop !== "length") {
            obj.push(value);
        }
        self.postMessage({
            type: "change-json-body",
            value: JSON.parse(JSON.stringify(arrJsonBody))
        })
        return true;
    },
    deleteProperty(target, prop) {
        delete target[prop];
        self.postMessage({
            type: "change-json-body",
            value: JSON.parse(JSON.stringify(arrJsonBody))
        })
    },
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
    },
    deleteProperty(target, prop) {
        delete target[prop];
        self.postMessage({
            type: "change-formdata-body",
            value: JSON.parse(JSON.stringify(formdataBody))
        })
    },
}
const urlencodedValidator = {
    get(target, key) {
        if (typeof target[key] === "object") {
            throw Error(`urlencoded数据不支持嵌套`);
        } else {
            return target[key];
        }
    },
    set(obj, prop, value) {
        if (typeof value !== "string") {
            throw TypeError(`给 ${prop} 赋值时出错，urlencoded数据值类型只能为字符串`);
        }
        obj[prop] = value;
        self.postMessage({
            type: "change-urlencoded-body",
            value: JSON.parse(JSON.stringify(urlencodedBody))
        })
        return true;
    },
    deleteProperty(target, prop) {
        delete target[prop];
        self.postMessage({
            type: "change-urlencoded-body",
            value: JSON.parse(JSON.stringify(urlencodedBody))
        })
    },
}
const queryParams = new Proxy({}, queryParamsValidator)
const jsonBody = new Proxy({}, jsonBodyValidator); //json类型的body参数
const arrJsonBody = new Proxy([], arrJsonBodyValidator); //json类型的body参数
const formdataBody = new Proxy({}, formdataBodyValidator); //formdata类型body参数
const urlencodedBody = new Proxy({}, urlencodedValidator); //urlencoded类型body参数
// const rawBody = new Proxy({}, rawValidator)
const body = new Proxy({}, {
    get(obj, prop) {
        if (prop === "json") {
            return jsonBody
        }
        if (prop === "formdata") {
            return formdataBody
        }
        if (prop === "urlencoded") {
            return urlencodedBody;
        }
        if (prop === "raw") {
            return apidocInfo.getRaw();
        }
    },
    set(obj, prop, value) {
        if (prop === "raw") {
            obj[prop] = value;
            self.postMessage({
                type: "change-raw-body",
                value
            })
        }
        return true;
    }
});
//发送请求
let isSendRequest = false;
let requestCb = null;
const sendRequest = (url, cb) => {
    isSendRequest = true;
    requestCb = cb;
    self.postMessage({
        type: "send-request",
        value: url
    })
}
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
        if (prop === "environment") {
            return environment;
        }
        if (prop === "currentEnv") {
            return currentEnvironment;
        }
        if (prop === "currentEnvironment") {
            return currentEnvironment;
        }
        if (prop === "env") {
            return environment;
        }
        if (prop === "body") {
            return body;
        }
        if (prop === "queryParams") {
            return queryParams;
        }
    }
});
importScripts("./json5.js")
importScripts("./variables.js")
importScripts("./utils.js")
importScripts("./collection-variables.js")
importScripts("./apidoc-info.js")
importScripts("./url.js")
importScripts("./headers.js")

//pm对象
const pm = new Proxy({}, {
    get(obj, prop) {
        if (prop === "variables") { //局部变量
            return tempVariables;
        }
        if (prop === "collectionVariables") { //项目内全局变量
            return collectionVariables;
        }
        if (prop === "request") { //request对象
            return request;
        }
        if (prop === "sendRequest") {
            return sendRequest;
        }
    },
})

self.addEventListener("message", (e) => {
    // 初始化所有请求信息
    if (e.data && e.data.type === "init-apidoc") {
        Object.assign(apidocInfo, e.data.value);
        apidocInfo.initHeaders();
        apidocInfo.initBody();
        apidocInfo.initParams();
        replacedUrl = "";
    } 
    // 初始化基础信息
    if (e.data && e.data.type === "init-baseInfo") {
        const { variables, hosts, currentEnv } = e.data.value;
        const objVariable = {};
        for(let i = 0; i < variables.length; i += 1) {
            const item = variables[i];
            if (item.type === "string") {
                objVariable[item.name] = item.value.toString();
            } else if (item.type === "number") {
                objVariable[item.name] = Number(item.value);
            } else if (item.type === "boolean" && item.value === "true") {
                objVariable[item.name] = true;
            } else if (item.type === "boolean" && item.value === "false") {
                objVariable[item.name] = false;
            } else if (item.type === "boolean") {
                objVariable[item.name] = !!item.value;
            }  else {
                console.warn(`无法解析的变量数据类型${item.type}`)
            }
        }
        for(let i = 0; i < hosts.length; i += 1) {
            const item = hosts[i];
            environment[item.name] = item.url;
        }
        currentEnvironment = currentEnv;
        Object.assign(collectionVariables, objVariable); //初始化变量信息
    }
    // 请求成功
    if (e.data && e.data.type === "request-success") {
        requestCb(null, e.data.value);
        self.postMessage({
            type: "worker-response",
        })
    } 
    // 请求失败
    if (e.data && e.data.type === "request-error") {
        requestCb(e.data.value, null);
        self.postMessage({
            type: "worker-response",
        })
    } 
    //发送请求
    if (e.data && e.data.type === "request") {
        eval(`(function(pm) { 
            ${e.data.value}
        })(pm)`);
        if (!isSendRequest) { //如果为发送请求，则不回复response
            self.postMessage({
                type: "worker-response",
            })
        }
    }
});
