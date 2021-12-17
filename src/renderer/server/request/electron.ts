import type { Got } from "got"
import Request from "got/dist/source/core"
import FileType from "file-type/browser";
import FormData from "form-data"
import type { Timings, IncomingMessageWithTimings } from "@szmarczak/http-timer";
import { ApidocDetail } from "@@/global";
import { store } from "@/store/index"
import config from "./config"
import { $t } from "@/i18n/i18n"
import apidocConverter from "./utils"

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
function electronRequest() {
    const requestInstance = initGot();
    if (!requestInstance) {
        console.warn("当前环境无法获取Got实例")
        return
    }
    try {
        const requestUrl = apidocConverter.getUrlInfo().fullUrl;
        const method = apidocConverter.getMethod();
        let body: string | FormData = "";
        if (method === "GET") { //GET请求body为空，否则请求将被一直挂起
            body = "";
        } else {
            body = apidocConverter.getRequestBody();
        }
        const headers = apidocConverter.getHeaders();
        console.log("请求参数", requestUrl, headers)
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
            headers,
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
    store.commit("apidoc/response/changeIsResponse", false);
    store.commit("apidoc/baseInfo/clearTempVariables");
    store.commit("apidoc/response/changeLoading", true);
    const cpApidoc = JSON.parse(JSON.stringify(store.state["apidoc/apidoc"].apidoc))
    apidocConverter.setData(cpApidoc as ApidocDetail);
    electronRequest();
    const urlInfo = apidocConverter.getUrlInfo(); //获取完整的url信息
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
        value: JSON.parse(JSON.stringify(store.state["apidoc/apidoc"].apidoc)),
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
            electronRequest();
        }
        if (res.data.type === "change-temp-variables") { //改版临时变量
            store.commit("apidoc/baseInfo/changeTempVariables", res.data.value);
            Object.assign(urlInfo, apidocConverter.getUrlInfo());
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
