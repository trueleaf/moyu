
import type { Got } from "got"
import Request from "got/dist/source/core"
import FileType from "file-type/browser";
import FormData from "form-data"
import { store } from "@/store/index"
import config from "./config"
import { apidocConvertParamsToJsonData } from "@/helper/index"
import * as utils from "./utils"
import type { Timings, IncomingMessageWithTimings } from "@szmarczak/http-timer";


let got: Got | null = null;
let gotInstance: Got | null = null;
let requestStream: Request | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ProxyAgent: any = null;
if (window.require) {
    got = window.require("got");
    ProxyAgent = window.require("proxy-agent");
}
// const INVALID_HEADER_KEYS = ["content-type", "Content-type", "content-Type", "ContentType", "contentType", "host", "HOST", "Host", "user-agent", "userAgent", "UserAgent"];
//初始化请求
function initGot() {
    if (!got) {
        return;
    }
    if (gotInstance) {
        return gotInstance;
    }
    const enabledProxy = store.state["apidoc/baseInfo"].proxy.enabled;
    const proxyPath = store.state["apidoc/baseInfo"].proxy.path;
    const initGotConfig = {
        timeout: config.timeout || 60000, //超时时间
        retry: 0,
        throwHttpErrors: false,
        followRedirect: true,
        allowGetBody: true,
        agent: {},
    }
    if (enabledProxy) {
        initGotConfig.agent = {
            http: new ProxyAgent(proxyPath),
            https: new ProxyAgent(proxyPath),
        }
    }
    gotInstance = got.extend(initGotConfig);
    return gotInstance;
}
//获取完整headers
function getRealHeaders() {
    const realHeaders: Record<string, string | undefined> = {};
    const { defaultHeaders } = store.state["apidoc/apidoc"];
    const { headers } = store.state["apidoc/apidoc"].apidoc.item; 
    defaultHeaders.concat(headers).forEach((item) => {
        const itemKey = item.key.toLocaleLowerCase();
        if (item.select && itemKey) {
            if (itemKey === "user-agent") {
                realHeaders[itemKey] = "moyu(https://github.com/trueleaf/moyu)";
            } else if (itemKey === "accept-encoding") {
                realHeaders[itemKey] = "gzip, deflate, br";
            } else if (itemKey === "connection") {
                realHeaders[itemKey] = "keep-alive";
            } else {
                realHeaders[itemKey] = item.value;
            }
        }
    })
    // if (contentType) {
    //     realHeaders["content-type"] = contentType;
    // }
    //删除自动携带的请求头
    delete realHeaders["content-length"]
    delete realHeaders["host"]
    return realHeaders;
}
//将buffer值转换为返回参数
async function formatResponseBuffer(bufferData: Buffer, contentType: string) {
    const typeInfo = await FileType.fromBuffer(bufferData.buffer);
    const mime = contentType ? contentType : (typeInfo ? typeInfo.mime : ""); //优先读取contentType
    const textContentType = ["text/", "application/json", "application/javascript", "application/xml"];
    store.commit("apidoc/response/changeResponseMime", mime);
    if (textContentType.find(type => contentType.match(type))) {
        store.commit("apidoc/response/changeResponseTextValue", bufferData.toString());
    } else {
        const blobData = new Blob([bufferData], { type: mime });
        const blobUrl = URL.createObjectURL(blobData);
        store.commit("apidoc/response/changeResponseFileUrl", blobUrl);
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
export function sendRequest(): void {
    const gotInstance = initGot();
    if (!gotInstance) {
        console.warn("当前环境无法获取Got实例")
        return
    }
    try {
        store.commit("apidoc/response/changeLoading", true)
        const { url, method, requestBody, queryParams, paths, contentType, } = store.state["apidoc/apidoc"].apidoc.item;
        const queryString = utils.convertQueryParamsToQueryString(queryParams);
        const pathMap = utils.getPathParamsMap(paths)
        const { mode } = requestBody
        const validPath = url.path.replace(/\{([^\}]+)\}/g, ($1, $2) => {
            return pathMap[$2] || $2
        })
        const requestUrl = url.host + validPath + queryString;
        let body: string | FormData  = "";
        const realHeaders = getRealHeaders();
        if (method === "GET") { //GET请求body为空，否则请求将被一直挂起
            body = "";
        } else {
            switch (contentType) {
            case "application/json":
                body = mode === "raw" ? requestBody.raw.data : JSON.stringify(apidocConvertParamsToJsonData(requestBody.json));
                break;
            case "application/x-www-form-urlencoded":
                body = utils.convertUrlencodedToBodyString(requestBody.urlencoded);
                break;
            case "multipart/form-data":
                const { data, headers } = utils.convertFormDataToFormDataString(requestBody.formdata);
                body = data
                realHeaders["Content-Type"] = headers["content-type"]
                break;
            case "text/plain":
                body = requestBody.raw.data;
            case "text/html":
                body = requestBody.raw.data;
                break;
            case "application/xml":
                body = requestBody.raw.data;
            case "text/javascript":
                body = requestBody.raw.data;
                break;
            default:
                break;
            }
        }
        console.log(realHeaders, requestUrl, body)
        requestStream = gotInstance(requestUrl, {
            isStream: true,
            method,
            body,
            headers: realHeaders,
        });
        //=====================================数据处理====================================//
        const streamData: Buffer[] = [];
        let responseData: IncomingMessageWithTimings | null = null;
        let streamSize = 0;
        //收到返回
        requestStream.on("response", (response: IncomingMessageWithTimings & { ip: string }) => {
            console.log("response", response)
            responseData = response;
            store.commit("apidoc/response/changeResponseHeader", response.headers);
            store.commit("apidoc/response/changeResponseCookies", response.headers["set-cookie"] || []);
            store.commit("apidoc/response/changeResponseBaseInfo", {
                httpVersion: response.httpVersion,
                ip: response.ip,
                statusCode: response.statusCode,
                statusMessage: response.statusMessage,
                contentType: response.headers["content-type"],
            });
        });
        //数据获取完毕
        requestStream.on("end", async () => {
            const { contentType } = store.state["apidoc/response"];
            const bufData = Buffer.concat(streamData, streamSize);
            await formatResponseBuffer(bufData, contentType);
            const rt = (responseData?.timings as Timings).phases.total;
            store.commit("apidoc/response/changeResponseTime", rt);
            store.commit("apidoc/response/changeResponseSize", streamSize);
            store.commit("apidoc/response/changeLoading", false);
        });
        //获取流数据
        requestStream.on("data", (chunk) => {
            streamData.push(Buffer.from(chunk));
            streamSize += chunk.length;
        });
        //错误处理
        requestStream.on("error", (error) => {
            store.commit("apidoc/response/changeLoading", false)
            store.commit("apidoc/response/changeResponseMime", "error");
            store.commit("apidoc/response/changeResponseTextValue",error.toString());
            console.error(error);
        });
        //重定向
        requestStream.on("redirect", () => {
            console.log("重定向");
        });
        //下载进度
        requestStream.on("downloadProgress", (process) => {
            store.commit("apidoc/response/changeResponseProgress", process)
        });
    } catch (error) {
        store.commit("apidoc/response/changeLoading", false)
        store.commit("apidoc/response/changeResponseMime", "error");
        store.commit("apidoc/response/changeResponseTextValue",error.toString());
        console.error(error);
    }
}

export function stopRequest(): void {
    // console.log("stoprequest", requestStream)
    store.commit("apidoc/response/changeLoading", false)
    if (requestStream) {
        requestStream.destroy();
    }
}