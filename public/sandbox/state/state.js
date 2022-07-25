/*
|--------------------------------------------------------------------------
| session全局状态
|--------------------------------------------------------------------------
*/
const _sessionState = {};
const sessionStateValidator = {
    get(target, key) {
        if (typeof target[key] === "object" && target[key] !== null) {
            return new Proxy(target[key], sessionStateValidator);
        } else {
            return target[key];
        }
    },
    set(obj, prop, value) {
        if (typeof value === "object" && value !== null) {
            obj[prop] = new Proxy(value, sessionStateValidator);
        } else {
            obj[prop] = value;
        }
        self.postMessage({
            type: "pre-request-change-sessionState",
            value: JSON.parse(JSON.stringify(sessionState)),
        });
        return true;
    },
    deleteProperty(target, prop) {
        delete target[prop];
        self.postMessage({
            type: "pre-request-change-sessionState",
            value: JSON.parse(JSON.stringify(sessionState)),
        });
    },
};
const sessionState = new Proxy(_sessionState, sessionStateValidator);
/*
|--------------------------------------------------------------------------
| local全局状态
|--------------------------------------------------------------------------
*/
const _localState = {};
const localStateValidator = {
    get(target, key) {
        if (typeof target[key] === "object" && target[key] !== null) {
            return new Proxy(target[key], localStateValidator);
        } else {
            return target[key];
        }
    },
    set(obj, prop, value) {
        if (typeof value === "object" && value !== null) {
            obj[prop] = new Proxy(value, localStateValidator);
        } else {
            obj[prop] = value;
        }
        self.postMessage({
            type: "pre-request-change-localState",
            value: JSON.parse(JSON.stringify(localState)),
        });
        return true;
    },
    deleteProperty(target, prop) {
        delete target[prop];
        self.postMessage({
            type: "pre-request-change-localState",
            value: JSON.parse(JSON.stringify(localState)),
        });
    },
};
const localState = new Proxy(_localState, localStateValidator);

/*
|--------------------------------------------------------------------------
| 远程全局状态
|--------------------------------------------------------------------------
*/
const _remoteState = {};
const remoteStateValidator = {
    get(target, key) {
        if (typeof target[key] === "object" && target[key] !== null) {
            return new Proxy(target[key], remoteStateValidator);
        } else {
            return target[key];
        }
    },
    set(obj, prop, value) {
        if (typeof value === "object" && value !== null) {
            obj[prop] = new Proxy(value, remoteStateValidator);
        } else {
            obj[prop] = value;
        }
        self.postMessage({
            type: "pre-request-change-remoteState",
            value: JSON.parse(JSON.stringify(remoteState)),
        });
        return true;
    },
    deleteProperty(target, prop) {
        delete target[prop];
        self.postMessage({
            type: "pre-request-change-remoteState",
            value: JSON.parse(JSON.stringify(remoteState)),
        });
    },
};
const remoteState = new Proxy(_remoteState, remoteStateValidator);