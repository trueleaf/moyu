
import type { Got } from "got"
import FormData from "form-data"
import { store } from "@/store/index"
import config from "./config"
import { apidocConvertParamsToJsonData } from "@/helper/index"
import ProxyAgent from "proxy-agent"
import * as utils from "./utils"


let got: Got | null = null;
let gotInstance: Got | null = null;
if (window.require) {
    got = window.require("got");
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
    gotInstance = got.extend({
        timeout: config.timeout || 60000, //超时时间
        retry: 0,
        throwHttpErrors: false,
        followRedirect: true,
        allowGetBody: true,
        decompress: false,
        agent: {
            http: new ProxyAgent("http://127.0.0.1:8866")
        },
    });
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
        // console.log(contentType)
        const realHeaders = getRealHeaders();
        console.log(realHeaders)
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
                body = utils.convertFormDataToFormDataString(requestBody.formdata);
                console.log(body)
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
        const gotStream = gotInstance(requestUrl, {
            isStream: true,
            method,
            body,
            headers: realHeaders,
        });
        //=====================================数据处理====================================//
        // const streamData = [];
        // let streamSize = 0;
        //收到返回
        gotStream.on("response", (response) => {
            store.commit("apidoc/response/changeResponseHeader", response.headers);
            store.commit("apidoc/response/changeResponseBaseInfo", {
                httpVersion: response.httpVersion,
                ip: response.ip,
                statusCode: response.statusCode,
                statusMessage: response.statusMessage,
            });
            console.log("response", response)
        });
        //数据获取完毕
        gotStream.on("end", async () => {
            store.commit("apidoc/response/changeLoading", false)
            console.log("end")
        });
        //获取流数据
        gotStream.on("data", (chunk) => {
            console.log("data", chunk)
        });
        //错误处理
        gotStream.on("error", (error) => {
            store.commit("apidoc/response/changeLoading", false)
            console.error(error);
        });
        //重定向
        gotStream.on("redirect", () => {
            console.log("重定向");
        });
        //下载进度
        gotStream.on("downloadProgress", (process) => {
            console.log("process", process);
        });
        console.log(requestUrl, body, pathMap)
    } catch (error) {
        store.commit("apidoc/response/changeLoading", false)
        console.error(error);
    }
}
