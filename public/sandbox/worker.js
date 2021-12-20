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
    }
});

importScripts("./variables.js")
importScripts("./collection-variables.js")

//pm对象
const pm = new Proxy({}, {
    get(obj, prop) {
        if (prop === "variables") { //局部变量
            return tempVariables;
        }
        if (prop === "collectionVariables") { //项目内全局变量
            return tempVariables;
        }
    },
})

self.addEventListener("message", (e) => {
    // 初始化所有请求信息
    if (e.data && e.data.type === "init") {
        Object.assign(apidocInfo, e.data.value);
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
