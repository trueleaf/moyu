/** 
 * @description        electron net模块封装
 * @author             shuxiaokai
 * @create             2020-09-31 11:20
 */

import qs from "qs"
const buffer = require("buffer")
const Buffer = buffer.Buffer;
// import { Buffer } from "buffer"
let net = null;
if (window.require){
    net = window.require("electron").remote.net
}

class HttpClient {
    constructor(config = {}) {
        this.instance = null; //当前请求实例
        this.timeout = config.timeout || 60000; //超时时间
        this.timer = null; //计时器
        this.eventObj = {

        };
    }
    on(eventName, cb) {
        if (!this.eventObj[eventName]) {
            this.eventObj[eventName] = [];
        }
        this.eventObj[eventName][0] = cb //只允许绑定一个事件
    }
    emit(eventName) {
        const events = this.eventObj[eventName];
        const args = Array.from(arguments).slice(1, arguments.length)
        if (events) {
            events.forEach(cb => {
                cb.apply(this, args)
            })
        }
    }
    request(url, options) {
        this.stopReqeust();
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
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            reject(new Error(`请求超时，${this.timeout}ms`));
            this.stopReqeust(); //超时取消发送
        }, this.timeout);
        this.instance.on("response", (response) => {
            // console.log(Buffer, 999)
            let data = null;
            const status = response.statusCode;
            const statusMessage = response.statusMessage;
            const httpVersion = response.httpVersion;
            const headers = response.headers;
            const contentType = response.headers["content-type"];
            const size = response.headers["content-length"];   
            
            this.emit("response", {
                status,
                statusMessage,
                httpVersion,
                headers,
                contentType,
                size,
            });
            //数据获取完毕   fix: end事件必须在data前面 https://github.com/electron/electron/issues/12545
            response.on("end", () => {
                const rt = Date.now() - startTime;
                const responseData = this.formatResponseData(response, data);
                this.emit("end", {
                    rt,
                    data: responseData,
                    size: data.length
                });
                clearTimeout(this.timer);
            });
            //获取数据
            let oldTime = null;
            let startChunkSize = 0;
            let i = 0;
            response.on("data", (chunk) => {
                // console.log("chunk", buffer, data, chunk)
                if (!oldTime) {
                    oldTime = Date.now()
                }
                i++;
                if (data) {
                    data = Buffer.concat([Buffer(chunk), data]);
                } else {
                    data = Buffer.concat([Buffer(chunk)]);
                }
                
                if (i % 20 === 0) {
                    const newTime = Date.now();
                    const usedTime = (newTime - oldTime) / 1000;
                    const chunkSize = (data.length - startChunkSize);
                    const speed = (chunkSize  / usedTime).toFixed(2);
                    this.emit("loading", speed, data.length)
                    oldTime = Date.now();
                    startChunkSize = data.length;
                }
            });
        });
        //取消请求
        this.instance.on("abort", () => {
            console.log("abort")
            clearTimeout(this.timer);
        });
        //请求错误
        this.instance.on("error", (error) => {
            this.emit("error", error);
            clearTimeout(this.timer);
        });
        //完成数据请求
        this.instance.on("finish", () => {
            console.log("finish")
        });
        
        if (requestData.constructor.name === "FormData") {
            // console.log(this.instance, 9)
            this.instance.writable = true;
            requestData.pipe(this.instance);
            // this.instance.write(requestData);
        } else {
            this.instance.write(JSON.stringify(requestData));
        }
        this.instance.end();
    }
    //格式化返回参数
    formatResponseData(response, data) {
        let result = null;
        const contentType = response.headers["content-type"] || "";
        const contentDisposition = response.headers["content-disposition"];
        const fileInfo = contentDisposition ? contentDisposition.match(/filename=([^=]+)/) : null;
        const fileName = fileInfo ? fileInfo[1] : "";
        if (contentType.includes("application/json")) { //常规json格式
            try {
                result = JSON.parse(data.toString());
            } catch(error) {
                result = {
                    error: error,
                    data: data.toString()
                };
            }
        } else if (contentType.includes("text/")) { //纯文本
            result = data.toString();
        } else if (contentType.includes("image/svg+xml")) { //svg格式，一般为验证码
            result = data.toString();
        } else if (contentType.includes("image/")) { //其他图片格式
            result = {
                fileName,
                ...this._convertBufferToBlobUrl(data, contentType)
            }
        } else if (contentType.includes("application/pdf")) { //pdf格式
            result = {
                fileName,
                ...this._convertBufferToBlobUrl(data, "application/pdf")
            };
        } else if (contentType.includes("application/vnd.ms-excel")) { //xls  低版本Excel
            result = {
                fileName,
                ...this._convertBufferToBlobUrl(data, "application/vnd.ms-excel")
            };
        } else if (contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) { //xlsx
            result = {
                fileName,
                ...this._convertBufferToBlobUrl(data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            };
        } else if (contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) { //docx, word
            result = {
                fileName,
                ...this._convertBufferToBlobUrl(data, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
            };
        } else if (contentType.includes("application/msword")) { //doc, 低版本word
            result = {
                fileName,
                ...this._convertBufferToBlobUrl(data, "application/msword")
            };
        } else { //不识别格式直接下载
            result = {
                fileName,
                ...this._convertBufferToBlobUrl(data, "application/msword")
            };
        }
        return result;
    }
    //将buffer数据转换为url
    _convertBufferToBlobUrl(bufferData, type = "application/octet-stream") {
        const ab = new ArrayBuffer(bufferData.length);
        const view = new Uint8Array(ab);
        for (var i = 0; i < bufferData.length; ++i) {
            view[i] = bufferData[i];
        }
        const blobData = new Blob([view], {
            type
        });
        const blobUrl = URL.createObjectURL(blobData);
        return {
            blobUrl,
        };
    }
    //停止请求
    stopReqeust () {
        if (this.instance) {
            this.instance.abort();
        }
    }
}


export default HttpClient





