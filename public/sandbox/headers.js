Object.setPrototypeOf(headers, {
    /**
     * 获取请求header
     */
    getHeaders() {
        const result = {};
        Object.keys(headers).forEach((key) => {
            result[key] = convertPlaceholder(headers[key]);
        });
        return result;
    },
    /**
     * 新增一个请求头
     */
    add(key, value) {
        headers[key] = value;
    },
    /**
     * 删除header
     */
    delete() {
        delete headers[key];
    },
    /**
     * 删除header
     */
    remove() {
        delete headers[key];
    },
    /**
     * 更新一个请求头
     */
    update(key, value) {
        if (headers[key] == null) {
            headers[key] = value;
        }
    },
    /**
     * 更新一个请求头，如果没有就新增
     */
    upsert(key, value) {
        headers[key] = value;
    },
});
