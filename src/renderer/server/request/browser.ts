import Axios, { Method } from "axios"
import type FormData from "form-data"
import { axios as axios2 } from "@/api/api"
import { store as shareStore } from "@/pages/modules/apidoc/doc-view/store/index"
import { store as onlineStore } from "@/store/index"
import config from "./config"
import apidocConverter from "./utils"

const buildShareOrHtml = process.env.VUE_APP_BUILD_SHARE || process.env.VUE_APP_BUILD_HTML

//初始化请求
const axiosInstance = Axios.create({
    timeout: config.timeout || 60000, //超时时间
});
const { CancelToken } = Axios;
const source = CancelToken.source();

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
    const store = buildShareOrHtml ? shareStore : onlineStore;
    console.warn("当前为浏览器环境发送请求、不支持跨域请求、Cookie,user-agent,connect等请求头受浏览器限制!")
    try {
        const useProxy = store.state["apidoc/baseInfo"].webProxy;
        store.commit("apidoc/response/changeLoading", true)
        const requestUrl = apidocConverter.getUrlInfo().fullUrl;
        const method = apidocConverter.getMethod();
        let body: string | FormData = "";
        const headers = apidocConverter.getHeaders();
        if (method === "GET") { //GET请求body为空，否则请求将被一直挂起
            body = "";
        } else {
            body = apidocConverter.getRequestBody() as (string | FormData);
        }
        //=====================================代理发送请求====================================//
        if (useProxy) {
            const params = {
                headers,
                url: requestUrl,
                body,
            };
            axios2.post("/api/proxy/proxyWebApi", params).then(async (res) => {
                const response = res.data;
                if (response.code === 4200) {
                    store.commit("apidoc/response/changeResponseContentType", "error");
                    store.commit("apidoc/response/changeResponseTextValue", response.msg);
                    return
                }
                store.commit("apidoc/response/changeResponseHeader", response.data.headers);
                store.commit("apidoc/response/changeResponseCookies", response.data.headers["set-cookie"] || []);
                store.commit("apidoc/response/changeResponseBaseInfo", {
                    httpVersion: response.data.httpVersion,
                    ip: response.data.ip,
                    statusCode: response.data.statusCode,
                    statusMessage: response.data.statusMessage,
                    contentType: response.data.headers["content-type"],
                });
                store.commit("apidoc/response/changeResponseTime", response.data.rt);
                store.commit("apidoc/response/changeLoading", false);
                const textContentType = ["text/", "application/json", "application/javascript", "application/xml"];

                store.commit("apidoc/response/changeResponseContentType", response.data.contentType);
                if (textContentType.find(type => response.data.contentType.match(type))) {
                    const blobData = new Blob([new Uint8Array(response.data.data.data)], { type: response.data.contentType });
                    store.commit("apidoc/response/changeResponseTextValue", await blobData.text());
                } else {
                    const blobData = new Blob([new Uint8Array(response.data.data.data)], { type: response.data.contentType });
                    const blobUrl = URL.createObjectURL(blobData);
                    store.commit("apidoc/response/changeResponseFileUrl", blobUrl);
                }
            }).catch((err) => {
                console.error(err);
                store.commit("apidoc/response/changeResponseContentType", "error");
                store.commit("apidoc/response/changeResponseTextValue", err.message);
            }).finally(() => {
                store.commit("apidoc/response/changeLoading", false)
            })
            return;
        }
        //=========================================================================//
        delete headers["user-agent"]
        delete headers["accept-encoding"]
        delete headers.connection
        delete headers.cookie
        const startTime = Date.now();
        axiosInstance.request({
            url: requestUrl,
            method: method as Method,
            data: body,
            responseType: "blob",
            headers,
            cancelToken: source.token
        }).then(async response => {
            const resContentType = response.headers["content-type"];
            store.commit("apidoc/response/changeResponseHeader", response.headers);
            store.commit("apidoc/response/changeResponseBaseInfo", {
                httpVersion: "",
                ip: "",
                statusCode: response.status,
                statusMessage: response.statusText,
                contentType: response.headers["content-type"],
            });
            store.commit("apidoc/response/changeResponseTime", Date.now() - startTime);
            store.commit("apidoc/response/changeLoading", false);
            const mime = response.data.type;
            const textContentType = ["text/", "application/json", "application/javascript", "application/xml"];
            store.commit("apidoc/response/changeResponseContentType", mime);
            // console.log(textContentType, resContentType, response)
            if (textContentType.find(type => resContentType.match(type))) {
                store.commit("apidoc/response/changeResponseTextValue", await response.data.text());
            } else {
                const blobData = new Blob([response.data], { type: mime });
                const blobUrl = URL.createObjectURL(blobData);
                store.commit("apidoc/response/changeResponseFileUrl", blobUrl);
            }
        }).catch(error => {
            console.error(error)
            store.commit("apidoc/response/changeLoading", false)
            store.commit("apidoc/response/changeResponseContentType", "error");
            store.commit("apidoc/response/changeResponseTextValue", error.toString());
        });
        return
    } catch (error) {
        store.commit("apidoc/response/changeLoading", false)
        store.commit("apidoc/response/changeResponseContentType", "error");
        store.commit("apidoc/response/changeIsResponse", true);
        store.commit("apidoc/response/changeResponseTextValue", (error as Error).toString());
        console.error(error);
    }
}

export function stopRequest(): void {
    const store = buildShareOrHtml ? shareStore : onlineStore;
    source.cancel("取消请求")
    store.commit("apidoc/response/changeIsResponse", true)
    store.commit("apidoc/response/changeLoading", false)
}
