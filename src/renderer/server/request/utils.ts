import type { ApidocContentType, ApidocDetail, ApidocHttpRequestMethod, ApidocProperty } from "@@/global"
import type IFromData from "form-data"
import { apidocGenerateApidoc, apidocConvertParamsToJsonData, apidocGenerateProperty } from "@/helper/index"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let FormData: any = null;
// eslint-disable-next-line prefer-destructuring
FormData = window.FormData;
if (window.require) {
    // eslint-disable-next-line prefer-destructuring
    FormData = window.require("form-data");
}
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
    private apidoc: ApidocDetail = apidocGenerateApidoc(); //apidoc文档详情

    private tempVariables: Record<string, unknown> = {}; //临时变量

    private collectionVariables: Record<string, unknown> = {}; //集合内变量

    private replacedUrl = ""; //替换后url

    private multipartHeaders = ""; //multipart格式请求头

    /*
    |--------------------------------------------------------------------------
    | 变量相关
    |--------------------------------------------------------------------------
    */
    /**
    * 改变临时变量值
    */
    changeTempVariables(variables: Record<string, unknown>) {
        this.tempVariables = variables;
    }

    /**
    * 获取所有临时变量值
    */
    getTempVariables() {
        return this.tempVariables;
    }

    /**
     * 删除所有临时变量
     */
    clearTempVariables() {
        Object.keys(this.tempVariables).forEach(key => {
            delete this.tempVariables[key];
        })
    }

    /**
     * 改变全局变量值
     */
    changeCollectionVariables(variables: Record<string, unknown>) {
        this.collectionVariables = variables;
    }

    /**
     * 获取所有全局变量
     */
    getCollectionVariables() {
        return this.collectionVariables;
    }

    private convertPlaceholder(value: string) {
        const matchdVariable = value.toString().match(/\{\{\s*([^} ]+)\s*\}\}/);
        const allVariables = {
            ...JSON.parse(JSON.stringify(this.collectionVariables)),
            ...JSON.parse(JSON.stringify(this.tempVariables)),
        };
        let convertValue = value;
        if (matchdVariable) {
            const realValue = allVariables[matchdVariable[1]];
            if (realValue != null) {
                convertValue = realValue
            }
        }
        return convertValue;
    }

    /*
    |--------------------------------------------------------------------------
    | 内部转换方法
    |--------------------------------------------------------------------------
    */
    /**
     * 将queryParams转换成字符串查询字符串
     */
    private convertQueryParamsToQueryString(queryParams: ApidocProperty<"string">[]): string {
        let queryString = "";
        queryParams.forEach((v) => {
            if (v.key && v.select) {
                queryString += `${v.key}=${this.convertPlaceholder(v.value)}&`
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
    private convertFormDataToFormDataString(bodyFormData: ApidocProperty<"string" | "file">[]): { data: FormData, headers: IFromData.Headers } {
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
                formData.append(item.key, this.convertPlaceholder(item.value));
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
                result += `${v.key}=${this.convertPlaceholder(v.value)}&`
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
                pathMap[v.key] = this.convertPlaceholder(v.value);
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
            fullUrl: this.replacedUrl ? this.replacedUrl : fullUrl,
        }
    }

    /**
     * 替换url
     */
    replaceUrl(url: string) {
        this.replacedUrl = url;
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
        const { headers, requestBody, contentType } = this.apidoc.item;
        const { mode } = requestBody;
        headers.forEach((item) => {
            const itemKey = item.key.toLocaleLowerCase();
            if (item.select && itemKey) {
                realHeaders[itemKey] = this.convertPlaceholder(item.value);
            }
        })
        if (mode === "formdata") {
            realHeaders["content-type"] = this.multipartHeaders;
        } else {
            realHeaders["content-type"] = contentType
        }
        if (!contentType) {
            delete realHeaders["content-type"]
        }
        return realHeaders;
    }

    /**
     * 改变请求头
     */
    changeHeaders(headers: Record<string, string>) {
        const result: ApidocProperty<"string">[] = [];
        Object.keys(headers).forEach(key => {
            if (key.toLocaleLowerCase() === "content-type" || key.toLocaleLowerCase() === "contenttype") {
                this.apidoc.item.contentType = headers[key] as ApidocContentType
            }
            const property = apidocGenerateProperty();
            property.key = key;
            property.value = headers[key];
            result.push(property);
        })
        this.apidoc.item.headers = result;
    }

    /**
     * 改变json body信息
     */
    changeJsonBody(jsonData: ApidocProperty[]) {
        const { requestBody } = this.apidoc.item
        const { mode } = requestBody;
        const matchedContentTypeHeader = this.apidoc.item.headers.find(v => v.key.toLocaleLowerCase() === "content-type" || v.key.toLocaleLowerCase() === "contenttype")
        if (mode === "json") {
            this.apidoc.item.contentType = "application/json";
            if (!matchedContentTypeHeader) {
                const property = apidocGenerateProperty();
                property.key = "content-type";
                property.value = "application/json";
                this.apidoc.item.headers.push(property)
            }
        }
        this.apidoc.item.requestBody.json = jsonData;
    }

    /**
     * 改变formdata body信息
     */
    changeFormdataBody(objFormdata: Record<string, string>) {
        const fileData = this.apidoc.item.requestBody.formdata.filter(v => v.type === "file");
        const stringData: ApidocProperty<"string">[] = [];
        Object.keys(objFormdata).forEach((key) => {
            if (!fileData.find(v => v.key === key)) {
                const property = apidocGenerateProperty();
                property.key = key;
                property.value = objFormdata[key];
                stringData.push(property);
            }
        })
        this.apidoc.item.requestBody.formdata = fileData.concat(stringData)
    }

    /**
     * 改变urlencoded
     */
    changeUrlencodedBody(objUrlencoded: Record<string, string>) {
        const result: ApidocProperty<"string">[] = [];
        Object.keys(objUrlencoded).forEach((key) => {
            const property = apidocGenerateProperty();
            property.key = key;
            property.value = objUrlencoded[key];
            result.push(property);
        })
        this.apidoc.item.requestBody.urlencoded = result
    }

    /**
     * 改变raw body信息
     */
    changeRawBody(rawData: string) {
        this.apidoc.item.requestBody.raw.data = rawData
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
            body = mode === "raw" ? requestBody.raw.data : JSON.stringify(apidocConvertParamsToJsonData(requestBody.json, true));
            break;
        case "application/x-www-form-urlencoded":
            body = this.convertUrlencodedToBodyString(requestBody.urlencoded);
            break;
        case "multipart/form-data":
            // eslint-disable-next-line no-case-declarations
            const { data, headers } = this.convertFormDataToFormDataString(requestBody.formdata);
            this.multipartHeaders = headers["content-type"];
            body = data
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
