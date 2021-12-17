import type { ApidocDetail, ApidocHttpRequestMethod, ApidocProperty } from "@@/global"
import FormData from "form-data"
import { apidocConvertValue, apidocGenerateApidoc, apidocConvertParamsToJsonData, apidocGenerateProperty } from "@/helper/index"

/**
 * 获取url信息
 */
type UrlInfo = {
    host: string,
    path: string,
    url: string,
    fullUrl: string
}

class ApidocConverter {
    /**
     * apidoc文档详情
     */
    private apidoc: ApidocDetail = apidocGenerateApidoc();

    /**
     * 将queryParams转换成字符串查询字符串
     */
    private convertQueryParamsToQueryString(queryParams: ApidocProperty<"string">[]): string {
        let queryString = "";
        queryParams.forEach((v) => {
            if (v.key && v.select) {
                queryString += `${v.key}=${apidocConvertValue(v.value)}&`
            }
        })
        queryString = queryString.replace(/&$/, "");
        if (queryString) {
            queryString = `?${queryString}`;
        }
        return queryString;
    }

    /**
     * 将formData转换为formData字符串
     */
    private convertFormDataToFormDataString(bodyFormData: ApidocProperty<"string" | "file">[]): { data: FormData, headers: FormData.Headers } {
        const formData = new FormData();
        let fs = null;
        if (window.require) {
            // eslint-disable-next-line prefer-destructuring
            fs = window.require("fs-extra");
        } else {
            console.error("web端无法发送文件");
        }
        for (let i = 0; i < bodyFormData.length; i += 1) {
            const item = bodyFormData[i];
            if (!item.select || !item.key) {
                continue;
            }
            if (item.type === "string") { //字符串类型
                formData.append(item.key, apidocConvertValue(item.value));
            } else if (item.type === "file") { //文件处理
                try {
                    fs.accessSync(item.value);
                    formData.append(item.key, fs.createReadStream(item.value));
                } catch (error) {
                    console.error(error);
                    console.log("文件不存在");
                }
            }
        }
        return {
            data: formData,
            headers: formData.getHeaders(),
        }
    }

    /**
     * 将urlencoded参数转换为字符串
     */
    private convertUrlencodedToBodyString(urlencoded: ApidocProperty<"string">[]): string {
        let result = "";
        urlencoded.forEach((v) => {
            if (v.key && v.select) {
                result += `${v.key}=${apidocConvertValue(v.value)}&`
            }
        })
        result = result.replace(/&$/, "");
        return result;
    }

    /**
     * 将pathParams转换为字符串
     */
    private getPathParamsMap(pathParams: ApidocProperty<"string">[]): Record<string, string> {
        const pathMap: Record<string, string> = {};
        pathParams.forEach((v) => {
            if (v.key) {
                pathMap[v.key] = apidocConvertValue(v.value);
            }
        })
        return pathMap;
    }

    /**
     * 挂载数据
     */
    setData(apidoc: ApidocDetail) {
        this.apidoc = apidoc;
    }

    /**
     * 获取URL信息
     */
    getUrlInfo(): UrlInfo {
        const { url, queryParams, paths, } = this.apidoc.item;
        const queryString = this.convertQueryParamsToQueryString(queryParams);
        const pathMap = this.getPathParamsMap(paths)
        const validPath = url.path.replace(/\{([^\\}]+)\}/g, ($1, $2) => pathMap[$2] || $2);
        const fullUrl = url.host + validPath + queryString;
        return {
            host: url.host,
            path: url.path,
            url: url.host + validPath,
            fullUrl,
        }
    }

    /**
     * 获取请求method
     */
    getMethod() {
        return this.apidoc.item.method;
    }

    /**
     * 设置请求方法
     */
    setMethod(method: ApidocHttpRequestMethod) {
        this.apidoc.item.method = method;
    }

    /**
     * 获取请求头
     */
    getHeaders() {
        const realHeaders: Record<string, string | undefined> = {};
        const { headers } = this.apidoc.item;
        headers.forEach((item) => {
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
        console.log("headers", realHeaders)
        return realHeaders;
    }

    /**
     * upsert请求头
     */
    upsertHeader(key: string, value: string) {
        const property = apidocGenerateProperty();
        property.key = key;
        property.value = value;
        const matchedHeaderItem = this.apidoc.item.headers.find(v => v.key === key);
        if (matchedHeaderItem) {
            matchedHeaderItem.value = value;
        } else {
            this.apidoc.item.headers.push(property)
        }
    }

    /**
     * 获取body信息
     */
    getRequestBody() {
        const { contentType, requestBody } = this.apidoc.item
        const { mode } = requestBody;
        let body: string | FormData = "";
        switch (contentType) {
        case "application/json":
            body = mode === "raw" ? requestBody.raw.data : JSON.stringify(apidocConvertParamsToJsonData(requestBody.json));
            break;
        case "application/x-www-form-urlencoded":
            body = this.convertUrlencodedToBodyString(requestBody.urlencoded);
            break;
        case "multipart/form-data":
            // eslint-disable-next-line no-case-declarations
            const { data, headers } = this.convertFormDataToFormDataString(requestBody.formdata);
            body = data
            this.upsertHeader("content-type", headers["content-type"]);
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
            console.warn(`未知的mime类型${contentType}`)
            body = requestBody.raw.data;
            break;
        }
        return body;
    }
}

const apidocConverter = new ApidocConverter()
export default apidocConverter
