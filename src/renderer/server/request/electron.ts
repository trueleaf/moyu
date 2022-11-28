import type { Got, NormalizedOptions, OptionsOfTextResponseBody } from "got"
import Request from "got/dist/source/core"
import FileType from "file-type/browser";
import type FormData from "form-data"
import type { Timings, IncomingMessageWithTimings } from "@szmarczak/http-timer";
import { ApidocDetail } from "@@/global";
import { store } from "@/store/index"
import { $t } from "@/i18n/i18n"
import db from "@/cache/database";
// import { apidocConvertJsonDataToParams } from "@/helper/index"
import { apidocCache } from "@/cache/apidoc";
import { router } from "@/router";
import config from "./config"
import apidocConverter from "./utils"

let got: Got | null = null;
let gotInstance: Got | null = null;
let requestStream: Request | null = null;
let worker: Worker;
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
        headers: {
            "user-agent": "https://github.com/trueleaf/moyu"
        },
        hooks: {
            beforeRequest: [(options: NormalizedOptions) => {
                const realHeaders: Record<string, string> = {
                    host: options.url.host,
                    ...options.headers,
                    connection: "close",
                };
                store.commit("apidoc/request/changeFinalRequestInfo", {
                    url: options.url.href,
                    headers: realHeaders,
                    method: options.method,
                    body: options.body,
                })
            }]
        },
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
async function formatResponseBuffer(bufferData: Buffer, contentType?: string) {
    const typeInfo = await FileType.fromBuffer(bufferData.buffer);
    const mimeType = typeInfo ? typeInfo.mime : "text/plain" //无法解析数据按照文本显示
    const mime = contentType || mimeType; //优先读取contentType
    const textContentType = ["text/", "application/json", "application/javascript", "application/xml"];
    store.commit("apidoc/response/changeResponseContentType", mime);
    if (!contentType) { //没有contentType按照文本格式解析
        store.commit("apidoc/response/changeResponseTextValue", bufferData.toString());
    } else if (textContentType.find(type => contentType.match(type))) {
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
        console.warn("当前环境无法获取Got实例");
        return
    }
    try {
        const requestUrl = apidocConverter.getUrlInfo().fullUrl;
        const method = apidocConverter.getMethod();
        let body: string | FormData = "";
        // if (method === "GET") { //GET请求body为空，否则请求将被一直挂起
        // } else {
        //     body = apidocConverter.getRequestBody() as (string | FormData);
        // }
        body = apidocConverter.getRequestBody() as (string | FormData); //允许GET请求发送body数据
        const headers = apidocConverter.getHeaders();
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
            const responseInfo = store.state["apidoc/response"];
            // console.log(responseInfo)
            worker.postMessage({
                type: "after-request-init-response",
                value: JSON.parse(JSON.stringify({
                    headers: responseInfo.header,
                    cookies: responseInfo.cookies,
                    httpVersion: responseInfo.httpVersion,
                    ip: responseInfo.ip,
                    rt: responseInfo.rt,
                    size: responseInfo.size,
                    statusCode: responseInfo.statusCode,
                    statusMessage: responseInfo.statusMessage,
                    data: responseInfo.data,
                }))
            });
            worker.postMessage(JSON.parse(JSON.stringify({
                type: "after-request-request",
                value: store.state["apidoc/apidoc"].apidoc.afterRequest.raw
            })));
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
    const cpApidoc: ApidocDetail = JSON.parse(JSON.stringify(store.state["apidoc/apidoc"].apidoc));
    const cpApidoc2: ApidocDetail = JSON.parse(JSON.stringify(store.state["apidoc/apidoc"].apidoc));
    apidocConverter.setData(cpApidoc as ApidocDetail);
    apidocConverter.replaceUrl("");
    apidocConverter.clearTempVariables()
    const currentEnv = cpApidoc.item.url.host;
    const baseInfo = JSON.parse(JSON.stringify({
        ...store.state["apidoc/baseInfo"],
        currentEnv,
    }))
    const projectId = router.currentRoute.value.query.id as string;
    const tabs = store.state["apidoc/tabs"].tabs[projectId];
    const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
    const commonHeaders = store.getters["apidoc/baseInfo/headers"](currentSelectTab?._id)
    const localEnvs = apidocCache.getApidocServer(projectId)
    const envs = store.state["apidoc/baseInfo"].hosts.concat(localEnvs);
    const { sessionState, localState, remoteState } = store.state["apidoc/workerState"];
    worker = new Worker("/sandbox/pre-request/worker.js");
    db.scriptList.toArray().then(scriptList => {
        //初始化默认apidoc信息
        worker.postMessage({
            type: "pre-request-init-apidoc",
            value: JSON.parse(JSON.stringify({
                apidocInfo: JSON.parse(JSON.stringify(cpApidoc2)),
                commonHeaders: JSON.parse(JSON.stringify(commonHeaders)),
                currentEnv,
                projectName: baseInfo.projectName,
                _id: baseInfo._id,
                projectVaribles: JSON.parse(JSON.stringify(baseInfo.variables)),
                envs,
                sessionState: JSON.parse(JSON.stringify(sessionState[projectId] || {})),
                localState: JSON.parse(JSON.stringify(localState[projectId] || {})),
                remoteState: JSON.parse(JSON.stringify(remoteState[projectId] || {})),
                packages: JSON.parse(JSON.stringify(scriptList))
            }))
        });
        //发送请求
        worker.postMessage(JSON.parse(JSON.stringify({
            type: "pre-request-request",
            value: store.state["apidoc/apidoc"].apidoc.preRequest.raw
        })));
    })
    //错误处理
    worker.addEventListener("error", (error) => {
        store.commit("apidoc/response/changeLoading", false);
        store.commit("apidoc/response/changeResponseContentType", "error");
        store.commit("apidoc/response/changeIsResponse", true);
        store.commit("apidoc/response/changeResponseTextValue", error.message);
        console.error(error);
    });
    //信息处理
    worker.addEventListener("message", async (res) => {
        if (typeof res.data !== "object") {
            return
        }
        if (res.data.type === "pre-request-send-request") { //老版本接口请求
            (got as Got)(res.data.value).then(response => {
                worker.postMessage({
                    type: "pre-request-request-success",
                    value: JSON.parse(JSON.stringify({
                        headers: JSON.parse(JSON.stringify(response.headers)),
                        status: response.statusMessage,
                        code: response.statusCode,
                        responseTime: response.timings.phases.total,
                        body: response.body,
                    }))
                });
            }).catch(err => {
                worker.postMessage({
                    type: "pre-request-request-error",
                    value: err
                });
            })
        }
        if (res.data.type === "pre-request-http") { //接口请求
            const { url, body, headers, method, params } = res.data.value;
            if (!got) {
                worker.postMessage({
                    type: "pre-request-http-error",
                    value: {}
                });
                console.warn("got实例不存在")
            } else {
                const requestBody = method.toLowerCase() === "get" ? undefined : JSON.stringify(body);
                const options: OptionsOfTextResponseBody = {
                    method,
                    body: requestBody,
                    headers
                }
                let realUrl = url;
                const stringParams = url.split("?")[1] || "";
                const urlSearchParams = new URLSearchParams(stringParams);
                const queryParams = Object.fromEntries(urlSearchParams.entries())
                if (Object.keys(queryParams).length > 0) {
                    options.searchParams = Object.assign(queryParams, params);
                    realUrl = realUrl.replace(/\?.*/, "")
                }
                got(realUrl, options).then(data => {
                    let jsonBody = {};
                    try {
                        jsonBody = JSON.parse(data.body);
                    } catch (err) {
                        console.log("error")
                        worker.postMessage({
                            type: "pre-request-http-error",
                            value: err
                        });
                    }
                    worker.postMessage({
                        type: "pre-request-http-success",
                        value: JSON.parse(JSON.stringify({
                            headers: data.headers,
                            body: jsonBody,
                            rawBody: data.rawBody,
                            statusCode: data.statusCode,
                        }))
                    });
                }).catch(err => {
                    worker.postMessage({
                        type: "pre-request-http-error",
                        value: err
                    });
                })
            }
        }
        if (res.data.type === "pre-request-send-request-by-id") { //根据文档id发送请求
            apidocConverter.getDocRequestInfo(projectId, res.data.value.id)
        }
        if (res.data.type === "pre-request-finish") { //前置脚本执行完
            console.log("pre script finish")
            electronRequest();
        }
        if (res.data.type === "after-request-finish") { //后置脚本执行完
            console.log("after script finish")
        }
        if (res.data.type === "change-temp-variables") { //改版临时变量
            apidocConverter.changeTempVariables(res.data.value);
        }
        if (res.data.type === "pre-request-change-variables") { //改版集合内变量
            apidocConverter.changeCollectionVariables(res.data.value);
        }
        if (res.data.type === "pre-request-change-url") { //改变完整url
            apidocConverter.replaceUrl(res.data.value);
        }
        if (res.data.type === "pre-request-change-headers") { //改变请求头
            apidocConverter.changeHeaders(res.data.value);
        }
        if (res.data.type === "pre-request-change-query-params") { //改变 queryparams
            apidocConverter.changeQueryParams(res.data.value);
        }
        if (res.data.type === "pre-request-change-path-params") { //改变 pathparams
            apidocConverter.changePathParams(res.data.value);
        }
        if (res.data.type === "pre-request-change-json-params") { //改变请求body
            apidocConverter.changeJsonBody(res.data.value);
        }
        if (res.data.type === "pre-request-change-formdata") { //改变请求formdata body
            apidocConverter.changeFormdataBody(res.data.value);
        }
        if (res.data.type === "pre-request-change-urlencoded") { //改变请求urlencoded body
            apidocConverter.changeUrlencodedBody(res.data.value);
        }
        if (res.data.type === "pre-request-change-raw-params") { //改变raw body
            apidocConverter.changeRawBody(res.data.value);
        }
        if (res.data.type === "pre-request-change-sessionState") { //改变worker的sessionState
            store.commit("apidoc/workerState/changeSessionState", {
                projectId,
                value: res.data.value
            });
        }
        if (res.data.type === "pre-request-change-localState") { //改变worker的localState
            apidocCache.setApidocWorkerLocalState(projectId, res.data.value)
            store.commit("apidoc/workerState/changeLocalState", {
                projectId,
                value: res.data.value
            });
        }
        if (res.data.type === "pre-request-error" || res.data.type === "after-request-error") { //预请求错误捕获
            store.commit("apidoc/response/changeLoading", false);
            store.commit("apidoc/response/changeResponseContentType", "error");
            store.commit("apidoc/response/changeIsResponse", true);
            if (res.data.type === "pre-request-error") {
                store.commit("apidoc/response/changeResponseTextValue", `前置脚本：${res.data.value.message}`);
            } else {
                store.commit("apidoc/response/changeResponseTextValue", `后置脚本：${res.data.value.message}`);
            }
            console.error(res.data.value);
        }
    })
}

export function stopRequest(): void {
    store.commit("apidoc/response/changeIsResponse", true)
    store.commit("apidoc/response/changeLoading", false)
    if (requestStream) {
        requestStream.destroy();
    }
}
