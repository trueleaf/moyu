import type { Got } from "got"
import Request from "got/dist/source/core"
import FileType from "file-type/browser";
import FormData from "form-data"
import type { Timings, IncomingMessageWithTimings } from "@szmarczak/http-timer";
import { store } from "@/store/index"
import config from "./config"
import { apidocConvertParamsToJsonData } from "@/helper/index"
import * as utils from "./utils"
import { $t } from "@/i18n/i18n"

type RequestInfo = {
    fullUrl: string
}

let got: Got | null = null;
let gotInstance: Got | null = null;
let requestStream: Request | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ProxyAgent: any = null;
if (window.require) {
    got = window.require("got");
    ProxyAgent = window.require("proxy-agent");
}
//初始化请求
function initGot() {
    if (!got) {
        return null;
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
    //删除自动携带的请求头
    delete realHeaders["content-length"]
    delete realHeaders.host
    return realHeaders;
}
//将buffer值转换为返回参数
async function formatResponseBuffer(bufferData: Buffer, contentType: string) {
    const typeInfo = await FileType.fromBuffer(bufferData.buffer);
    const mimeType = typeInfo ? typeInfo.mime : ""
    const mime = contentType || mimeType; //优先读取contentType
    const textContentType = ["text/", "application/json", "application/javascript", "application/xml"];
    store.commit("apidoc/response/changeResponseContentType", mime);
    if (textContentType.find(type => contentType.match(type))) {
        store.commit("apidoc/response/changeResponseTextValue", bufferData.toString());
    } else {
        const blobData = new Blob([bufferData], { type: mime });
        const blobUrl = URL.createObjectURL(blobData);
        const { path } = store.state["apidoc/apidoc"].apidoc.item.url;
        const headers = store.state["apidoc/response"].header;
        const contentDisposition = headers["content-disposition"] as string;
        const headerFileName = contentDisposition ? contentDisposition.match(/filename=(.*)/) : "";
        const matchedUrlFileName = path.match(/[^/]+.[^.]$/);
        const urlName = matchedUrlFileName ? matchedUrlFileName[0] : ""
        const fileName = headerFileName || urlName;
        store.commit("apidoc/response/changeResponseFileInfo", {
            url: blobUrl,
            fileName,
            mime,
            ext: typeInfo?.ext || "",
            name: fileName,
        });
        // store.commit("apidoc/response/changeResponseFileUrl", blobUrl);
        // store.commit("apidoc/response/changeResponseFileExt", (typeInfo ? typeInfo.ext : ""));
    }
}
//electron发送请求
function electronRequest(requestInfo: RequestInfo) {
    const requestInstance = initGot();
    if (!requestInstance) {
        console.warn("当前环境无法获取Got实例")
        return
    }
    try {
        const { method, requestBody, contentType, } = store.state["apidoc/apidoc"].apidoc.item;
        const { mode } = requestBody
        const requestUrl = requestInfo.fullUrl;
        let body: string | FormData = "";
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
                // eslint-disable-next-line no-case-declarations
                const { data, headers } = utils.convertFormDataToFormDataString(requestBody.formdata);
                body = data
                Object.assign(realHeaders, headers)
                break;
            case "text/plain":
                body = requestBody.raw.data;
                break;
            case "text/html":
                body = requestBody.raw.data;
                break;
            case "application/xml":
                body = requestBody.raw.data;
                break;
            case "text/javascript":
                body = requestBody.raw.data;
                break;
            default:
                break;
            }
        }
        console.log("请求参数", requestUrl, realHeaders, body)
        if (!requestUrl) { //请求url不存在
            store.commit("apidoc/response/changeLoading", false)
            store.commit("apidoc/response/changeIsResponse", true)
            store.commit("apidoc/response/changeResponseContentType", "error");
            store.commit("apidoc/response/changeResponseTextValue", $t("请求url不能为空"));
            return;
        }
        requestStream = requestInstance(requestUrl, {
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
            // console.log("response", response)
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
            store.commit("apidoc/response/changeIsResponse", true)
        });
        //数据获取完毕
        requestStream.on("end", async () => {
            const responseContentType = store.state["apidoc/response"].contentType;
            const bufData = Buffer.concat(streamData, streamSize);
            await formatResponseBuffer(bufData, responseContentType);
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
            store.commit("apidoc/response/changeIsResponse", true)
            store.commit("apidoc/response/changeResponseContentType", "error");
            store.commit("apidoc/response/changeResponseTextValue", error.toString());
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
        store.commit("apidoc/response/changeResponseContentType", "error");
        store.commit("apidoc/response/changeIsResponse", true)
        store.commit("apidoc/response/changeResponseTextValue", (error as Error).toString());
        console.error(error);
    }
}

/*
|--------------------------------------------------------------------------
| 发送请求
|--------------------------------------------------------------------------
*/
export function sendRequest(): void {
    store.commit("apidoc/response/changeIsResponse", false)
    store.commit("apidoc/baseInfo/clearTempVariables")
    store.commit("apidoc/response/changeLoading", true)
    const urlInfo = utils.getUrlInfo(); //获取完整的url信息
    const worker = new Worker("worker.js");
    //初始化变量
    worker.postMessage(JSON.parse(JSON.stringify({
        type: "changeEnvironmentVariables",
        value: store.state["apidoc/baseInfo"].variables
    })));
    //初始化请求url
    worker.postMessage(JSON.parse(JSON.stringify({
        type: "changeUrlInfo",
        value: urlInfo
    })));
    //初始化默认apidoc信息
    worker.postMessage(JSON.parse(JSON.stringify({
        type: "changeApidoc",
        value: store.state["apidoc/apidoc"].apidoc,
    })));
    //发送请求
    worker.postMessage(JSON.parse(JSON.stringify({
        type: "request",
        value: store.state["apidoc/apidoc"].apidoc.preRequest.raw
    })));
    //错误处理
    worker.addEventListener("error", (error) => {
        store.commit("apidoc/response/changeLoading", false);
        store.commit("apidoc/response/changeResponseContentType", "error");
        store.commit("apidoc/response/changeIsResponse", true);
        store.commit("apidoc/response/changeResponseTextValue", error.message);
        console.error(error);
    });
    //信息处理
    worker.addEventListener("message", (res) => {
        if (typeof res.data !== "object") {
            return
        }
        if (res.data.type === "worker-response") { //脚本执行完
            electronRequest({
                fullUrl: urlInfo.fullUrl
            });
        }
        if (res.data.type === "change-temp-variables") { //改版临时变量
            store.commit("apidoc/baseInfo/changeTempVariables", res.data.value);
            Object.assign(urlInfo, utils.getUrlInfo());
        }
        if (res.data.type === "change-full-url") { //改变完整url
            urlInfo.fullUrl = res.data.value
        }
    })
}

export function stopRequest(): void {
    // console.log("stoprequest", requestStream)
    store.commit("apidoc/response/changeIsResponse", true)
    store.commit("apidoc/response/changeLoading", false)
    if (requestStream) {
        requestStream.destroy();
    }
}
