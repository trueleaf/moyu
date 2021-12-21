
// apidoc相关操作
Object.setPrototypeOf(apidocInfo, {
    /**
     * 获取url信息
     */
    getUrlInfo() {
        const { url, queryParams, paths, } = apidocInfo.item;
        const queryString = convertQueryParamsToQueryString(queryParams);
        const pathMap = getPathParamsMap(paths)
        const validPath = url.path.replace(/\{([^\\}]+)\}/g, ($1, $2) => pathMap[$2] || $2);
        const fullUrl = url.host + validPath + queryString;
        return {
            host: url.host,
            path: url.path,
            url: url.host + validPath,
            fullUrl: replacedUrl ? replacedUrl : fullUrl,
        }
    },
    /**
     * 获取请求方法
     */
    getMethod() {
        return apidocInfo.item.method;
    },
    /**
     * 初始化请求头
     */
    initHeaders() {
        const rawHeaders = apidocInfo.item.headers;
        rawHeaders.forEach((item) => {
            const itemKey = item.key.toLocaleLowerCase();
            if (item.select && itemKey) {
                if (itemKey === "user-agent") {
                    headers[itemKey] = "moyu(https://github.com/trueleaf/moyu)";
                } else if (itemKey === "accept-encoding") {
                    headers[itemKey] = "gzip, deflate, br";
                } else if (itemKey === "connection") {
                    headers[itemKey] = "keep-alive";
                } else {
                    headers[itemKey] = convertPlaceholder(item.value);
                }
            }
        })

    },
})