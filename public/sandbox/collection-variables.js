Object.setPrototypeOf(collectionVariables, {
    /**
     * 根据变量名称获取变量值
     */
    get(variableName) {
        return collectionVariables[variableName]
    },
    /**
     * 设置一个变量
     */
    set(variableName, value) {
        collectionVariables[variableName] = value;
    },
    /**
     * 删除一个变量
     */
    unset() {
        delete collectionVariables[variableName]
    },
    /**
     * 删除一个变量
     */
    delete() {
        delete collectionVariables[variableName]
    },
    /**
     * 更新一个变量
     */
    update(variableName, value) {
        if (collectionVariables[variableName] != null) {
            collectionVariables[variableName] = value;
        }
    },
    /**
     * 更新一个变量，如果没有则新增
     */
    upsert(variableName, value) {
        collectionVariables[variableName] = value;
    },
    /**
     * 判断当前变量是否存在
     */
    has(variableName) {
        return collectionVariables[variableName] != null
    },
    /**
     * 清空所有变量
     */
    clear() {
        Object.keys(collectionVariables).forEach(key => {
            delete collectionVariables[key]
        })
    },
    /**
     * 将变量以对象形式输出
     */
    toObject() {
        return JSON.parse(JSON.stringify(collectionVariables))
    },
})