/*
|--------------------------------------------------------------------------
| 转换swagger，openapi格式数据
|--------------------------------------------------------------------------
| jsonSchema     https://json-schema.org/
| openapi        https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
| swaggerEditor  https://editor.swagger.io/
|
*/

import { uuid } from "@/helper/index"
import { apidocGenerateProperty, apidocGenerateApidoc, ApidocHttpRequestMethod } from "@/helper/index"
import type { OpenAPIV3 } from "openapi-types";
import type { ApidocProperty, ApidocDetail } from "@@/global" 

//=====================================openapi导入配置信息====================================//
type Config = {
    folderNamedType: "tag" | "url" | "none"
};
//=====================================项目信息====================================//
type ProjectInfo = {
    projectName: string,
    version: string,
};
//=====================================服务器地址信息====================================//
type ServerInfo = {
    name: string,
    url: string,
    remark: string
}
//=====================================请求方法====================================//
type HttpMethod = "get" | "post" | "put" | "delete" | "options" | "head" | "patch" | "trace"


const TYPE_ENUM = { //参数类型映射
    integer: "number",
    long: "number",
    float: "number",
    double: "number",
    number: "number",
    string: "string",
    byte: "string",
    binary: "string",
    boolean: "boolean",
    date: "string",
    dateTime: "string",
    object: "object",
    array: "array",
};
// const HTTP_METHOD: ([method in OpenAPIV3.HttpMethods])[] = ["get", "put", "post", "delete", "options", "head", "patch", "trace"]

//[keyof typeof OpenAPIV3.HttpMethods]

const HTTP_METHOD = ["get", "put", "post", "delete", "options", "head", "patch", "trace"]
// const VALID_CONTENT_TYPE = { //能够解析的contentType类型
//     "application/json": "application/json",
//     "application/x-www-form-urlencoded": "application/x-www-form-urlencoded",
//     "multipart/form-data": "multipart/form-data",
// }





class OpenApiTranslate {
    public projectId: string;
    public openApiData: OpenAPIV3.Document;
    public config: Config = {
        folderNamedType: "none"
    };
    constructor(projectId: string, data: OpenAPIV3.Document) {
        this.projectId = projectId; //项目id
        this.openApiData = data; //openapi数据
    }
    //获取openapi版本信息
    getVersion(): string {
        if (!this.openApiData.openapi) {
            console.warn("缺少Version信息");
            return "";
        }
        return this.openApiData.openapi
    }
    //获取项目信息 https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#infoObject
    getProjectInfo(): ProjectInfo {
        const openApiInfo = this.openApiData.info;
        if (!openApiInfo) {
            console.warn("缺少Info字段")
        }
        return {
            projectName: openApiInfo?.title || "",
            version: openApiInfo?.version || "",
        };
    }
    //获取服务器信息 https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#serverObject
    getServersInfo(): ServerInfo[] {
        const openApiServers = this.openApiData.servers;
        const result: ServerInfo[] = [];
        if (!openApiServers) {
            console.warn("缺少servers字段");
            return result;
        }
        if (!Array.isArray(openApiServers)) {
            console.warn("servers字段必须为数组");
            return result;
        }
        openApiServers.forEach((server, index) => {
            const variables = server.variables || {};
            const keys = Object.keys(variables);
            const varValue = keys.map((key) => {
                if (variables[key].enum) {
                    console.warn("server对象中存在多个变量枚举值，但接口工具仅解析默认值");
                }
                return {
                    key,
                    value: variables[key].default,
                }
            })
            const url = server.url.replace(/{([^{}]+)}/g, ($1, $2) => {
                const matched = varValue.find((val) => val.key === $2);
                return matched?.value || $1
            })
            result.push({
                name: `服务器${index + 1}`,
                url,
                remark: server.description || "",
            });
        })
        return result;
    }
    //获取文档信息 https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathItemObject
    getDocsInfo(): ApidocDetail[] {
        const { folderNamedType } = this.config;
        const serversInfo = this.getServersInfo();
        const openApiDocInfo = this.openApiData.paths;
        const docsResult: ApidocDetail[] = [];
        const allTags: Set<string> = new Set();
        if (!openApiDocInfo) {
            console.warn("缺少paths字段");
            return docsResult;
        }
        Object.keys(openApiDocInfo).forEach((reqUrl) => {
            const pathObjectInfo = openApiDocInfo[reqUrl];
            let pid = "";
            if (folderNamedType === "url") {
                pid = uuid();
                const folderDoc = apidocGenerateApidoc();
                folderDoc._id = pid; //目录id
                folderDoc.isFolder = true; //是目录
                folderDoc.sort = Date.now(); //排序
                folderDoc.info.type = "folder";
                folderDoc.info.name = reqUrl;
                folderDoc.info.name = reqUrl;
                folderDoc.item = {} as ApidocDetail["item"]; //folder的item属性为空
                docsResult.push(folderDoc);
            }
            if (pathObjectInfo == null) {
                console.warn(`路径${reqUrl}相关属性为空`);
                return
            }
            Object.keys(pathObjectInfo).forEach((pathKey) => {
                const moyuDoc = apidocGenerateApidoc();
                const matchedMethodKey = HTTP_METHOD.find(v => v === pathKey); //属性是否为http请求方法
                if (matchedMethodKey) { 
                    const pathItemObject = pathObjectInfo[matchedMethodKey as HttpMethod];
                    if (!pathItemObject) {
                        console.warn(`paths参数中存在方法${matchedMethodKey}但是所匹配数据为空`);
                        return
                    }
                    const tags = pathItemObject?.tags;
                    if (tags && tags.length > 0) {
                        allTags.add(tags[0]);
                        moyuDoc.info.tag = {
                            _id: "",
                            color: "",
                            name: tags[0],
                        };
                    }
                    moyuDoc.pid = pid;
                    moyuDoc.sort = Date.now(); //排序
                    moyuDoc.info.name = pathItemObject.summary || "未命名"; //文档名称
                    moyuDoc.info.description = pathItemObject.description || ""; //文档备注
                    moyuDoc.info.type = "api";
                    moyuDoc.item.method = matchedMethodKey as ApidocHttpRequestMethod;
                    moyuDoc.item.url.host = serversInfo[0] ? serversInfo[0].url : "";
                    moyuDoc.item.url.path = reqUrl;
                }



                //解析parameters
                // eslint-disable-next-line no-unused-vars
                const parameterInfo = this.convertParameters(pathItemObject.parameters);
                if (parameterInfo?.paths?.length > 0) moyuDoc.item.paths = parameterInfo.paths;
                if (parameterInfo?.queryParams?.length > 0) moyuDoc.item.queryParams = parameterInfo.queryParams;
                if (parameterInfo?.headers?.length > 0) moyuDoc.item.headers = parameterInfo.headers;
                if (parameterInfo?.body?.length > 0) { //较老版本
                    moyuDoc.item.requestBody = parameterInfo?.body;
                    moyuDoc.item.contentType = "application/json";
                }
                //解析body数据
                // eslint-disable-next-line no-unused-vars
                const requestBody = this.convertContent(pathItemObject.requestBody?.content);
                if (requestBody && requestBody.values) {
                    moyuDoc.item.requestBody = requestBody.values;
                    moyuDoc.item.contentType = requestBody.contentType;
                }
                // 解析response
                const responseParams = this.convertResponse(pathItemObject.responses);
                if (responseParams) {
                    moyuDoc.item.responseParams = responseParams;
                }
                docsResult.push(moyuDoc);
            });
        })
        //默认为按照tag为文件名
        if (!folderNamedType || folderNamedType === "tag") {
            const tags = Array.from(allTags);
            tags.sort().forEach((tag) => {
                const pid = uuid();
                const folderDoc = apidocGenerateApidoc();
                folderDoc._id = pid; //目录id
                folderDoc.isFolder = true; //是目录
                folderDoc.sort = Date.now(); //排序
                folderDoc.item = {}; //目录item数据为空
                folderDoc.info.type = "folder";
                folderDoc.info.name = tag;

                docsResult.forEach((docInfo) => {
                    const docTag = docInfo.info.tag?.name;
                    if (docTag === tag) {
                        docInfo.pid = pid;
                    }
                })
                docsResult.push(folderDoc);
            })
        } else if (folderNamedType === "none") {
            return docsResult;
        }
        return docsResult;
    }

}

export default OpenApiTranslate;