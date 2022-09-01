//老版本调用方式
let isSendRequest = false;
const sendRequest = (url, cb) => {
    let realUrl = url;
    if (!url.toString().match(/^https?:\/\//)) {
        realUrl = `http://${url}`
    }
    isSendRequest = true;
    requestCb = cb;
    self.postMessage({
        type: "pre-request-send-request",
        value: realUrl
    })
}

const request = (method, url = "", options = {}) => {
    isSendRequest = true;
    return new Promise((resolve, reject) => {
        const { headers = {}, params = {}, body = {} } = options;
        let realUrl = url;
        if (!url.toString().match(/^https?:\/\//)) {
            realUrl = `http://${url}`
        }
        //发送请求
        self.postMessage({
            type: "pre-request-http",
            value: {
                method,
                url: realUrl,
                params,
                headers,
                body,
            }
        })
        //接受请求
        self.addEventListener("message", (e) => {
            if (e.data && e.data.type === "pre-request-http-success") {
                resolve(e.data.value);
                self.postMessage({
                    type: "pre-request-finish",
                })
                isSendRequest = false;
            }
            if (e.data && e.data.type === "pre-request-http-error") {
                reject(e.data.value);
                self.postMessage({
                    type: "pre-request-finish",
                })
                isSendRequest = false;
            }
        })
    })
}

const http = {
    get(url, options) {
        return request("GET", url, options);
    },
    post(url, options) {
        return request("POST", url, options);
    },
    put(url, options) {
        return request("PUT", url, options);
    },
    delete(url, options) {
        return request("DELETE", url, options);
    },
}

const sendRequestById = (id) => {
    isSendRequest = true;
    return new Promise((resolve, reject) => {
        self.postMessage({
            type: "pre-request-send-request-by-id",
            value: {
                id,
            }
        })
    })
}