
import type { Got } from "got"
import FormData from "form-data"
import { store } from "@/store/index"
import config from "./config"
import { apidocConvertParamsToJsonData } from "@/helper/index"
import type { ApidocProperty } from "@@/global"


let got: Got | null = null;
let gotInstance: Got | null = null;
if (window.require) {
    got = window.require("got");
}
// const INVALID_HEADER_KEYS = ["content-type", "Content-type", "content-Type", "ContentType", "contentType", "host", "HOST", "Host", "user-agent", "userAgent", "UserAgent"];

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
        headers: {
            "user-agent": "moyu(https://github.com/trueleaf/moyu)",
        },
    });
    return gotInstance;
}

/**
 * 将queryParams转换成字符串查询字符串
 */
function convertQueryParamsToQueryString(queryParams: ApidocProperty<"string">[]): string {
    let queryString = "";
    queryParams.forEach((v) => {
        if (v.key && v.select) {
            queryString += `${v.key}=${v.value}&`
        }
    })
    queryString = queryString.replace(/\&$/, "");
    if (queryString) {
        queryString = "?" + queryString;
    }
    return queryString;
}
/**
 * 将urlencoded参数转换为字符串
 */
function convertUrlencodedToBodyString(urlencoded: ApidocProperty<"string">[]): string {
    let result = "";
    urlencoded.forEach((v) => {
        if (v.key && v.select) {
            result += `${v.key}=${v.value}&`
        }
    })
    result = result.replace(/\&$/, "");
    return result;
}

/**
 * 将pathParams转换为字符串
 */
function getPathParamsMap(pathParams: ApidocProperty<"string">[]) {
    const pathMap: Record<string, string> = {};
    pathParams.forEach((v) => {
        if (v.key) {
            pathMap[v.key] = v.value;
        }
    })
    return pathMap;
}
/**
 * 将formData转换为formData字符串
 */
function convertFormDataToFormDataString(bodyFormData: ApidocProperty<"string">[]) {
    const formData = new FormData();
    bodyFormData.forEach((data) => {
        if (data.select && data.key) {
            formData.append(data.key, data.value);
        }
    })
    return formData
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
        const { url, method, requestBody, queryParams, paths, contentType } = store.state["apidoc/apidoc"].apidoc.item;
        const queryString = convertQueryParamsToQueryString(queryParams);
        const pathMap = getPathParamsMap(paths)
        const validPath = url.path.replace(/\{([^\}]+)\}/g, ($1, $2) => {
            return pathMap[$2] || $2
        })
        const requestUrl = url.host + validPath + queryString;
        let body: string | FormData  = "";
        if (method === "GET") { //GET请求body为空，否则请求将被一直挂起
            body = "";
        } else {
            switch (contentType) {
            case "application/json":
                body = JSON.stringify(apidocConvertParamsToJsonData(requestBody.json));
                break;
            case "application/x-www-form-urlencoded":
                body = convertUrlencodedToBodyString(requestBody.urlencoded);
                break;
            case "multipart/form-data":
                body = convertFormDataToFormDataString(requestBody.formdata);
                break;
            default:
                break;
            }
        }
        const gotStream = gotInstance(requestUrl, {
            isStream: true,
            method,
            body,
        });
        //=====================================数据处理====================================//
        // const streamData = [];
        // let streamSize = 0;
        //收到返回
        gotStream.on("response", (response) => {
            console.log("response", response)
        });
        //数据获取完毕
        gotStream.on("end", async () => {
            console.log("end")
        });
        //获取流数据
        gotStream.on("data", (chunk) => {
            console.log("data", chunk)
        });
        //错误处理
        gotStream.on("error", (error) => {
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
        console.error(error);
    }
}
