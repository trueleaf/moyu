/**
 * @description        HTTP请求封装---基于got  https://www.npmjs.com/package/got
 * @author              shuxiaokai
 * @create             2020-12-07 19:02
 */
import FileType from "file-type/browser";
import FormData from "form-data/lib/form_data"

let got = null;
let ProxyAgent = null;
if (window.require) {
    got = window.require("got");
    ProxyAgent = window.require("proxy-agent")
}
const INVALID_HEADER_KEYS = ["content-type", "Content-type", "content-Type", "ContentType", "contentType", "host", "HOST", "Host", "user-agent", "userAgent", "UserAgent"];

const HttpClient = (() => {
    let singleton = null; //单例
    class _HttpClient {
        constructor(config = {}) {
            if (!singleton) {
                singleton = this;
            }
            this.instance = null; //当前请求实例
            this.method = null; //请求方式
            this.url = null; //请求地址
            this.headers = null; //请求头
            this.params = null; //请求参数
            this.responseData = null; //返回值
            this.events = [];
            this.initInstance(config);
            return singleton;
        }

        initInstance(config) {
            const { timeout, proxy } = config;
            const agent = {
                http: ProxyAgent ? new ProxyAgent(proxy) : "",
            };
            this.gotInstance = got?.extend({
                timeout: timeout || 60000, //超时时间
                retry: 0,
                throwHttpErrors: false,
                followRedirect: true,
                allowGetBody: true,
                headers: {
                    "user-agent": "moyu(https://github.com/trueleaf/moyu)",
                },
                agent: process.env.NODE_ENV === "development" ? agent : null,
            });
        }

        on(name, handler) {
            const matchedEvent = this.events.find((val) => val.name === name);
            if (!matchedEvent) {
                this.events.push({
                    name,
                    handlers: [handler],
                });
            } else {
                matchedEvent.handlers.push(handler);
            }
        }

        once(name, handler) {
            const matchedEvent = this.events.find((val) => val.name === name);
            if (!matchedEvent) {
                this.events.push({
                    name,
                    handlers: [handler],
                });
            } else {
                matchedEvent.handlers[0] = handler;
            }
        }

        emit(name, payload) {
            const matchedEvent = this.events.find((val) => val.name === name);
            if (matchedEvent) {
                matchedEvent.handlers.forEach((handler) => {
                    handler(payload);
                });
            }
        }

        /**
         * @description                 发送请求
         * @author                      shuxiaokai
         * @create                      2020-12-11 14:59
         * @param {url}                 url - 请求url
         * @param {string}              method - 请求方法
         * @param {string}              contentType - 参数类型
         * @param {Array<Property>}     paths - 路径参数
         * @param {Array<Property>}     queryParams - 请求参数
         * @param {Array<Property>}     requestBody - 请求body
         * @param {Array<Property>}     headers - 请求头
         */
        request(options) {
            this.url = options.url.host + options.url.path;
            this.method = options.method.toLowerCase();
            this.contentType = options.contentType;
            this.paths = options.paths;
            this.queryParams = options.queryParams;
            this.requestBody = options.requestBody;
            this.headers = options.headers;
            //删除默认请求头
            INVALID_HEADER_KEYS.forEach((key) => {
                delete this.headers[key];
            })
            this.headers["content-type"] = this.contentType; //赋值contentType
            console.log("发送请求", options);
            if (!options.url.host) {
                this.emit("error", {
                    message: "服务器地址不能为空，请在Tab导航下方选择",
                    rt: 0,
                });
                return;
            }
            try {
                let body = "";
                const searchParams = new URLSearchParams(this.queryParams).toString();
                const requestUrl = searchParams ? `${this.url}?${searchParams}` : this.url;
                if (this.method === "get") { //GET请求body为空，否则请求将被一直挂起
                    body = "";
                } else {
                    const formData = new FormData();
                    // eslint-disable-next-line default-case
                    switch (this.contentType) {
                    case "application/json":
                        body = JSON.stringify(this.requestBody);
                        break;
                    case "multipart/form-data":
                        Object.keys(this.requestBody).forEach((key) => {
                            console.log(this.requestBody[key], 99)
                            const arrayBuffer = this.requestBody[key] || new ArrayBuffer();
                            formData.append(key, Buffer.from(arrayBuffer));
                        })
                        Object.assign(this.headers, formData.getHeaders())
                        body = formData;
                        break;
                    case "application/x-www-form-urlencode":
                        body = new URLSearchParams(this.requestBody).toString();
                        break;
                    }
                }
                this.instance = this.gotInstance(requestUrl, {
                    isStream: true,
                    method: this.method,
                    headers: this.headers,
                    body,
                });
                const streamData = [];
                let streamSize = 0;
                //=====================================事件顺序很重要====================================//
                //收到返回
                this.instance.on("response", (response) => {
                    this.responseData = response;
                    const result = _HttpClient.formatResponse(response);
                    this.emit("response", result);
                });
                //数据获取完毕
                this.instance.on("end", async () => {
                    const buf = Buffer.concat(streamData, streamSize);
                    const result = await this.formatData(buf);
                    const rt = this.responseData.timings.phases.total;
                    this.emit("end", {
                        ...result,
                        size: streamSize,
                        rt,
                        headers: this.responseData.headers,
                    });
                });
                //获取流数据
                this.instance.on("data", (chunk) => {
                    streamData.push(Buffer.from(chunk));
                    streamSize += chunk.length;
                    this.emit("data", streamData);
                });
                //错误处理
                this.instance.on("error", (error) => {
                    this.emit("error", error);
                });
                //重定向
                this.instance.on("redirect", () => {
                    console.log("重定向");
                });
                //下载进度
                this.instance.on("downloadProgress", (process) => {
                    this.emit("process", process);
                });
            } catch (error) {
                this.emit("error", error);
            }
        }

        /**
         * @description        处理返回值
         * @author              shuxiaokai
         * @create             2020-12-11 15:19
         * @param {res}        responseData - 返回值
         * @return {formatResponse}    返回格式化后数据
         * interface FormatResponse {
         *      headers: Headers,
         * }
         */
        //=========================================================================//
        /*
            可识别的contentType类型  MDN(https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
            1. 无contentType头部，则当作无类型数据
            2. text/*，以文本类型进行显示，超出以下四种的则当作无类型数据
               -text/plain  //纯文本展示
               -text/html   //纯文本展示
               -text/css    //纯文本展示
               -text/javascript  //纯文本展示
            3. image/*      //以图片类型进行展示
               -image/gif
               -image/png
               -image/jpeg
               -image/bmp
               -image/webp
               -image/svg+xml
            4. audio/*    //音频类型展示播放界面
               -audio/midi
               -audio/mpeg
               -audio/webm
               -audio/ogg
               -audio/wav
            5. video/*    //视频类型展示播放界面
               -video/webm
               -video/ogg
            6. application/*
               -application/octet-stream   //强制下载类型
               -application/json           //纯文本展示
               -application/javascript     //纯文本展示
               -application/xml            //纯文本展示
               -application/pdf            //以pdf形式展示
               -application/vnd.ms-excel   //低版本excel
               -application/vnd.openxmlformats-officedocument.spreadsheetml.sheet    //高版本excel
               -application/vnd.openxmlformats-officedocument.wordprocessingml.document //word
               -application/msword         //word
            7. unknown  //未知类型
        */

        //格式化返回参数
        static formatResponse(responseData) {
            const { headers, httpVersion, ip, statusCode } = responseData;
            const result = {
                headers,
                contentType: headers["content-type"],
                httpVersion,
                ip,
                statusCode,
            };
            return result;
        }

        //格式化数据
        async formatData(body) {
            const typeInfo = await FileType.fromBuffer(body.buffer);
            const mime = typeInfo ? typeInfo.mime : this.responseData.headers["content-type"];
            // console.log("mime", typeInfo, mime, body)
            const data = {
                mime,
                value: "",
            };
            if (mime.includes("text/") || mime.includes("application/json") || mime.includes("application/javascript") || mime.includes("application/xml")) { //文本
                data.value = body.toString();
            } else if (mime.includes("image/svg+xml")) { //svg转换为文本
                data.value = body.toString();
            } else {
                const blobData = new Blob([body], { type: mime });
                const blobUrl = URL.createObjectURL(blobData);
                data.value = blobUrl;
            }
            return data;
        }

        //取消请求
        cancel() {
            this.instance.destroy();
        }
    }
    return _HttpClient;
})();

export default HttpClient;
