

const pm = {
    tempVariables: [], //临时变量
    environmentVariables: [], //全局变量
    urlInfo: {}, //url相关信息
    apidoc: {}, //apidoc完整信息
    variables: {
        /**
         * 是否存在当前临时变量
         */
        has(variableName) {
            const matchedData = pm.tempVariables.find(v => v.name === variableName);
            return !!matchedData;
        },
        /**
         * 根据名称获取当前变量
         */
        get(variableName) {
            const matchedData = pm.tempVariables.find(v => v.name === variableName);
            return matchedData;
        },
        /**
         * 设置一个临时变量
         */
        set(variableName, value) {
            const matchedVariable = pm.tempVariables.find(v => v.name === variableName);
            if (!matchedVariable) {
                pm.tempVariables.push({
                    name: variableName,
                    value,
                });
            }
            self.postMessage({
                type: "change-temp-variables",
                value: pm.tempVariables
            })
        },
        /**
         * 删除一个临时变量
         */
        delete(variableName) {
            const delIndex = pm.tempVariables.findIndex(v => v.name === variableName);
            if (delIndex !== -1) {
                pm.tempVariables.splice(delIndex, 1)
            }
            self.postMessage({
                type: "change-temp-variables",
                value: pm.tempVariables
            })
        },
        /**
         * 重置一个临时变量
         */
        unset(variableName) {
            pm.variables.delete(variableName);
        },
        /**
         * 更新一个变量值
         */
        update(variableName, value) {
            const matchedVariable = pm.tempVariables.find(v => v.name === variableName);
            if (matchedVariable) {
                matchedVariable.value = value;
                self.postMessage({
                    type: "change-temp-variables",
                    value: pm.tempVariables
                })
            }
        },
        /**
         * 更新一个变量值(变量不存则新增)
         */
        upsert(variableName, value) {
            const matchedVariable = pm.tempVariables.find(v => v.name === variableName);
            if (matchedVariable) {
                matchedVariable.value = value;
            } else {
                pm.tempVariables.push({
                    name: variableName,
                    value,
                });
            }
            self.postMessage({
                type: "change-temp-variables",
                value: pm.tempVariables
            })
        },
        /**
         * 以数组方式获取全部临时变量
         */
        getAll() {
            return pm.tempVariables;
        },
        /**
         * 将变量转换为对象方便存取
         */
        toObject() {
            const obj = {};
            pm.tempVariables.forEach(v => {
                obj[v.name] = v.value; 
            })
            return obj;
        }
    },
    request: {
        //=====================================请求url====================================//
         /**
         * url
         */
        get url() {
            return pm.urlInfo.url;
        },
        set url(val) {
            pm.urlInfo.url = val;
        },
        /**
         * 完整url
         */
        get fullUrl() {
            const allVariables = pm.environmentVariables.concat(pm.tempVariables);
            const replacedUrl = pm.urlInfo.fullUrl.toString().replace(/\{\{\s*([^} ]+)\s*\}\}/g, ($1, $2) => {
                const matchedData = allVariables.find(v => v.name === $2)
                if (matchedData) {
                    return matchedData.value;
                } else {
                    return $1;
                }
            });
            return replacedUrl;
        },
        set fullUrl(val) {
            pm.urlInfo.fullUrl = val;
        },
        /**
         * 原始url
         */
        get rawUrl() {
            return pm.urlInfo.fullUrl;
        },
        /**
         * 替换url
         */
         replaceUrl(url) {
            pm.urlInfo.fullUrl = url;
            self.postMessage({
                type: "change-full-url",
                value: url
            })
        },
        //=====================================请求方法====================================//
        /**
         * 请求方法
         */
        get method () {
            return pm.apidoc.item.method;
        }
        //=====================================请求头====================================//
        /**
         * 
         */
    },
};
self.addEventListener("message", (e) => {
    // 更新全局变量
    if (e.data && e.data.type === "changeEnvironmentVariables") {
        pm.environmentVariables = e.data.value;
    }
    // 改版URL信息
    if (e.data && e.data.type === "changeUrlInfo") {
        pm.urlInfo = e.data.value;
    }
    // 改变默认apidoc信息
    if (e.data && e.data.type === "changeApidoc") {
        pm.apidoc = e.data.value;
        pm.request.url = pm.urlInfo.url;
        pm.request.fullUrl = pm.urlInfo.fullUrl;
    } 
    //发送请求
    if (e.data && e.data.type === "request") {
        eval(`(function(pm) { ${e.data.value} })(pm)`);
        self.postMessage({
            type: "worker-response",
        })
    }
});
