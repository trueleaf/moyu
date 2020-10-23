/** 
 * @description        electron net模块封装
 * @author             shuxiaokai
 * @create             2020-09-31 11:20
 */

import qs from "qs"
let net = null;
if (window.require){
    net = window.require("electron").remote.net
}

class HttpClient {
    constructor(config = {}) {
        this.instance = null;
        this.timeout = config.timeout || 30000; //超时时间
        this.timer = null;
    }
    request(url, options) {
        const requestData = options.data;
        if (typeof url !== "string") {
            throw new Error("请求url必须为字符串");
        }
        if (options.method === "get") {
            url = url + "?" + qs.stringify(options.data);
        }
        
        const requestOptions = {
            url: url,
            method: options.method,
        };
        const startTime = Date.now();
        this.instance = net.request(requestOptions);
        //=====================================请求头====================================//
        const headers = options.headers;
        // this.instance.setHeader("content-type", "application/json; charset=utf-8"); //所有请求默认以json格式传输
        for(let i in headers) {
            if (i.toLowerCase() === "host") {
                continue;
            }
            this.instance.setHeader(i, headers[i]);
        }
        console.log("请求参数", headers, url, options, requestOptions)
        
        //=====================================超时定时器====================================//
        return new Promise((resolve, reject) => {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                reject(new Error(`请求超时，${this.timeout}ms`));
                this.stopReqeust(); //超时取消发送
            }, this.timeout);
            this.instance.on("response", (response) => {
                response.on("data", (data) => {
                    const status = response.statusCode;
                    const statusMessag = response.statusMessage;
                    const httpVersion = response.httpVersion;
                    const rt = Date.now() - startTime;
                    const headers = response.headers;
                    const contentType = response.headers["content-type"];
                    const size = data.length;
                    const responseData = this.formatResponseData(response, data);
                    resolve({
                        data: responseData,
                        status,
                        statusMessag,
                        httpVersion,
                        rt,
                        headers,
                        contentType,
                        size,
                    });
                });
                clearTimeout(this.timer);
            });
            this.instance.on("abort", () => {
                console.log("abort")
                clearTimeout(this.timer);
            });
            this.instance.on("error", (error) => {
                reject(error);
                clearTimeout(this.timer);
            });
            this.instance.on("finish", () => {
                console.log("finish")
            });
            this.instance.write(JSON.stringify(requestData));
            this.instance.end();
        })
    }
    //格式化返回参数
    formatResponseData(response, data) {
        let result = null;
        const contentType = response.headers["content-type"]
        if (contentType.includes("application/json")) { //常规json格式
            result = JSON.parse(data.toString());
        } else if (contentType.includes("text/")) { //纯文本
            result = data.toString();
        } else if (contentType.includes("image/svg+xml")) { //svg格式，一般为验证码
            result = data.toString();
        } else if (contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            const contentDisposition = response.headers["content-disposition"];
            const fileInfo = contentDisposition ? contentDisposition.match(/filename=([^=]+)/) : null;
            const fileName = fileInfo ? fileInfo[1] : "";
            const arrayData = data
            const ab = new ArrayBuffer(arrayData.length);
            const view = new Uint8Array(ab);
            for (var i = 0; i < arrayData.length; ++i) {
                view[i] = arrayData[i];
            }
            blobData = new Blob([view], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            result = {
                blobData,
                fileName 
            }
        } else {
            result = data.toString();
        }
        return result;
    }
    stopReqeust () {
        if (this.instance) {
            this.instance.abort();
        }
    }
}


export default HttpClient





