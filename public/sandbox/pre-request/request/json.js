/**
 * json参数
 */
const _json = {}; //为了初始化的时候不执行赋值操作
const jsonValidator = {
    get(target, key) {
        if (typeof target[key] === "object" && target[key] !== null) {
            return new Proxy(target[key], jsonValidator)
        } else {
            return target[key];
        }
    },
    set(obj, prop, value) {
        if (typeof value === "object" && value !== null) {
            obj[prop] = new Proxy(value, jsonValidator);
        } else {
            obj[prop] = value;
        }
        self.postMessage({
            type: "pre-request-change-json-params",
            value: JSON.stringify(json),
        });
        return true;
    },
    deleteProperty(target, prop) {
        delete target[prop];
        self.postMessage({
            type: "pre-request-change-json-params",
            value: JSON.stringify(json),
        });
    },
}
const json = new Proxy(_json, jsonValidator);
