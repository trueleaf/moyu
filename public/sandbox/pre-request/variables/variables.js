/**
 * 全局变量
 */
const _variables = {}; //为了初始化的时候不执行赋值操作
const variablesValidator = {
    get(target, key) {
        if (typeof target[key] === "object" && target[key] !== null) {
            return new Proxy(target[key], variablesValidator)
        } else {
            return target[key];
        }
    },
    set(obj, prop, value) {
        if (typeof value === "object" && value !== null) {
            obj[prop] = new Proxy(value, variablesValidator);
        } else {
            obj[prop] = value;
        }
        self.postMessage({
            type: "pre-request-change-variables",
            value: JSON.parse(JSON.stringify(variables)),
        });
        return true;
    },
    deleteProperty(target, prop) {
        delete target[prop];
        self.postMessage({
            type: "pre-request-change-variables",
            value: JSON.parse(JSON.stringify(variables)),
        });
    },
}
const variables = new Proxy(_variables, variablesValidator);
