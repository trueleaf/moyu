/** 
 * @description        HTTP请求封装---基于got  https://www.npmjs.com/package/got
 * @author              shuxiaokai
 * @create             2020-12-07 19:02
 */






let got = null;
if (window.require) {
    got = window.require("electron").remote.require("got")
}
class HttpClient {
    constructor(config = {}) {
        this.instance = null; //当前请求实例
        this.timeout = config.timeout || 60000; //超时时间
        this.method = null; //请求方式
        this.url = null; //请求地址
        this.headers = null; //请求头
        this.params = null; //请求参数
    }
    request(url, options) {
        this.method = options.method.toLowerCase();
        this.url = url;
        this.params = options.data;
        this.headers = options.headers;
        return new Promise((resolve, reject) => {
            /*eslint-disable indent*/ 
            switch (this.method) {
                case "get":
                    this.sendGetRequest().then((res) => {
                        resolve(res);
                    }).catch(err => {
                        reject(err);
                    });
                    break;
                default: //默认发送get请求
                    this.sendGetRequest().then((res) => {
                        resolve(res);
                    }).catch(err => {
                        reject(err);
                    });
                    break;
            }
        });
    }
    /** 
     * @description        发送GET请求
     * @author              shuxiaokai
     * @create             2020-12-07 15:14
     * @return {String}    返回字符串
     */
    sendGetRequest() {
        return new Promise((resolve, reject) => {
            console.log("in")
            const instance = got.stream(this.url, {});
            let streamData = Buffer.alloc(0);
            
            //获取流数据
            instance.on("data", (chunk) => {
                console.log("data", chunk)
                streamData = Buffer.concat([chunk]);
            });
            //数据获取完毕
            instance.on("end", () => {
                console.log("end", streamData)
                resolve({});
            });
            //错误处理
            instance.on("error", error => {
                reject(error);
            });
            //收到返回
            instance.on("response", () => {
                // console.log(response)
            });
            //重定向
            instance.on("redirect", () => {
                console.log("重定向")
            });
            //下载进度
            instance.on("downloadProgress", () => {
                // console.log("progress", progress)
            });
            

            // .then((res) => {
            //     const result = this.formatResponse(res);
            //     resolve(result);
            // }).catch(err => {
            //     console.error(err);
            //     reject(err);
            // });
        })
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
     * 
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
    //=========================================================================//
    //格式化返回参数
    formatResponse(responseData) {
        const headers = responseData.headers;
        const httpVersion = responseData.httpVersion;
        const ip = responseData.ip;
        const body = responseData.body;
        const statusCode = responseData.statusCode;
        const timings = responseData.timings;
        const rt = timings.end - timings.start;
        return {
            headers,
            contentType: headers["content-type"],
            httpVersion, 
            body, 
            ip, 
            statusCode,
            rt,
            responseData
        };
    }
}



export default HttpClient