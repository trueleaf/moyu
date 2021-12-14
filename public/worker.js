

const pm = {
    tempVariables: [], //临时变量
    environmentVariables: [], //全局变量
    urlInfo: {}, //url相关信息
    apidoc: {}, //apidoc完整信息
    variables: {
        has(variableName) {
            const matchedData = pm.tempVariables.find(v => v.name === variableName);
            return !!matchedData;
        },
        get(variableName) {
            const matchedData = pm.tempVariables.find(v => v.name === variableName);
            return matchedData;
        },
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
        unset(variableName) {
            pm.variables.delete(variableName);
            self.postMessage({
                type: "change-temp-variables",
                value: pm.tempVariables
            })
        },
        getAll() {
            return pm.tempVariables;
        },
    },
    request: {
        /**
         * 获取url
         */
        getUrl() {
            return pm.urlInfo.url;
        },
        /**
         * 获取完整url
         */
        getFullUrl() {
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
    } 
    //发送请求
    if (e.data && e.data.type === "request") {
        eval(`(function(pm) { ${e.data.value} })(pm)`);
        self.postMessage({
            type: "worker-response",
        })
    }
});
