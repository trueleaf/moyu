Object.setPrototypeOf(tempVariables, {
    /**
     * 根据变量名称获取变量值
     */
    get(variableName) {
        return tempVariables[variableName]
    },
    /**
     * 设置一个变量
     */
    set(variableName, value) {
        tempVariables[variableName] = value;
    },
    /**
     * 删除一个变量
     */
    unset() {
        delete tempVariables[variableName]
    },
    /**
     * 删除一个变量
     */
    delete() {
        delete tempVariables[variableName]
    },
    /**
     * 更新一个变量
     */
    update(variableName, value) {
        if (tempVariables[variableName] != null) {
            tempVariables[variableName] = value;
        }
    },
    /**
     * 更新一个变量，如果没有则新增
     */
    upsert(variableName, value) {
        tempVariables[variableName] = value;
    },
    /**
     * 判断当前变量是否存在
     */
    has(variableName) {
        return tempVariables[variableName] != null
    },
    /**
     * 清空所有变量
     */
    clear() {
        Object.keys(tempVariables).forEach(key => {
            delete tempVariables[key]
        })
    },
    /**
     * 将变量以对象形式输出
     */
    toObject() {
        return JSON.parse(JSON.stringify(tempVariables))
    },
})