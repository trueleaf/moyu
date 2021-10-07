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
import { apidocGenerateProperty, apidocGenerateApidoc } from "@/helper/index"
import type { OpenAPIV3 } from "openapi-types";
import type { ApidocProperty, ApidocDetail, ApidocPropertyType, ApidocHttpRequestMethod, ApidocBodyRawType } from "@@/global" 

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
//=====================================解析parameter返回格式====================================//
type ConvertParams = {
    paths: ApidocProperty[],
    query: ApidocProperty[],
    headers: ApidocProperty[],
    cookies: ApidocProperty[],
}
//=====================================解析requestBody返回值====================================//
type ConvertRequestBody = {
    /**
     * json类型参数
    */
    json: ApidocProperty[],
    /**
     * formData类型参数
     */
    formdata: ApidocProperty[],
    /**
     * urlencoded类型参数
     */
    urlencoded: ApidocProperty[],
    /**
     * raw类型参数
     */
    raw: {
        data: string,
        dataType: ApidocBodyRawType
    },
}
//=========================================================================//
// const TYPE_ENUM = { //参数类型映射
//     integer: "number",
//     long: "number",
//     float: "number",
//     double: "number",
//     number: "number",
//     string: "string",
//     byte: "string",
//     binary: "string",
//     boolean: "boolean",
//     date: "string",
//     dateTime: "string",
//     object: "object",
//     array: "array",
// };


const HTTP_METHOD = ["get", "put", "post", "delete", "options", "head", "patch", "trace"]
// const VALID_CONTENT_TYPE: ApidocContentType[] = ["application/json", "application/x-www-form-urlencoded", "text/javascript", "multipart/form-data", "text/plain", "application/xml", "text/html"]




class OpenApiTranslator {
    public projectId: string;
    public openApiData: OpenAPIV3.Document;
    public config: Config = {
        folderNamedType: "none"
    };
    constructor(projectId: string, data: OpenAPIV3.Document) {
        this.projectId = projectId; //项目id
        this.openApiData = data; //openapi数据
    }
    /**
     * 获取openapi版本信息
     */
    getVersion(): string {
        if (!this.openApiData.openapi) {
            console.warn("缺少Version信息");
            return "";
        }
        return this.openApiData.openapi
    }
    /**
     * 获取项目信息 https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#infoObject
     */
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
    /**
     * 获取服务器信息 https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#serverObject
     */
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
    /**
     * 获取文档信息 https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathItemObject
     */
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
                    this.convertParameters(pathItemObject.parameters);
                    this.convertRequestBody(pathItemObject.requestBody);
                    // console.log(parameterInfo)
                } else {
                    console.warn(`
                        paths参数中应该存在"get" | "post" | "put" | "delete" | "options" | "head" | "patch" | "trace"
                        $ref： ${pathObjectInfo.$ref}
                        summary： ${pathObjectInfo.summary};
                        description： ${pathObjectInfo.description};
                        servers： ${pathObjectInfo.servers}
                        parameters： ${pathObjectInfo.parameters}
                    `)
                }


                //解析parameters
                // const parameterInfo = this.convertParameters(pathItemObject.parameters);
                // if (parameterInfo?.paths?.length > 0) moyuDoc.item.paths = parameterInfo.paths;
                // if (parameterInfo?.queryParams?.length > 0) moyuDoc.item.queryParams = parameterInfo.queryParams;
                // if (parameterInfo?.headers?.length > 0) moyuDoc.item.headers = parameterInfo.headers;
                // if (parameterInfo?.body?.length > 0) { //较老版本
                //     moyuDoc.item.requestBody = parameterInfo?.body;
                //     moyuDoc.item.contentType = "application/json";
                // }
                // //解析body数据
                // const requestBody = this.convertContent(pathItemObject.requestBody?.content);
                // if (requestBody && requestBody.values) {
                //     moyuDoc.item.requestBody = requestBody.values;
                //     moyuDoc.item.contentType = requestBody.contentType;
                // }
                // // 解析response
                // const responseParams = this.convertResponse(pathItemObject.responses);
                // if (responseParams) {
                //     moyuDoc.item.responseParams = responseParams;
                // }
                // docsResult.push(moyuDoc);
            });
        })
        //默认为按照tag为文件名
        // if (!folderNamedType || folderNamedType === "tag") {
        //     const tags = Array.from(allTags);
        //     tags.sort().forEach((tag) => {
        //         const pid = uuid();
        //         const folderDoc = apidocGenerateApidoc();
        //         folderDoc._id = pid; //目录id
        //         folderDoc.isFolder = true; //是目录
        //         folderDoc.sort = Date.now(); //排序
        //         folderDoc.item = {}; //目录item数据为空
        //         folderDoc.info.type = "folder";
        //         folderDoc.info.name = tag;

        //         docsResult.forEach((docInfo) => {
        //             const docTag = docInfo.info.tag?.name;
        //             if (docTag === tag) {
        //                 docInfo.pid = pid;
        //             }
        //         })
        //         docsResult.push(folderDoc);
        //     })
        // } else if (folderNamedType === "none") {
        //     return docsResult;
        // }
        return docsResult;
    }
    /**
     * 解析parameter参数
     */
    convertParameters(parameters: OpenAPIV3.PathItemObject["parameters"]): ConvertParams {
        const result = {
            paths: [],
            query: [],
            cookies: [],
            headers: [],
        } as ConvertParams
        if (!parameters) {
            return result;
        }
        for(let i = 0; i < parameters.length; i ++) {
            const apidocProperty = apidocGenerateProperty<ApidocPropertyType>();
            const parameter = parameters[i];
            // const ref = (parameter as OpenAPIV3.ReferenceObject).$ref;
            // const { schema } = (parameter as OpenAPIV3.ParameterObject);
            const paramsPosition = (parameter as OpenAPIV3.ParameterObject).in;
            const { name, description, required } = (parameter as OpenAPIV3.ParameterObject);
            apidocProperty.key = name;
            apidocProperty.description = description || "";
            apidocProperty.required = required || true;
            //=========================================================================//
            if (paramsPosition === "query") {
                result.query.push(apidocProperty);
            } else if (paramsPosition === "path") {
                result.paths.push(apidocProperty);
            } else if (paramsPosition === "header") {
                result.headers.push(apidocProperty);
            } else if (paramsPosition === "cookies") {
                result.cookies.push(apidocProperty);
            } else {
                console.warn(`无法解析的参数位置in${paramsPosition}, Parameter的in字段仅允许query、path、header、cookie`);
            }
        }
        // console.log(parameters, result)
        return result;
    }

    /**
     * 解析requestBody
     */
    convertRequestBody(requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject | undefined): ConvertRequestBody | null {
        const result = {
            json: [],
            formdata: [],
            urlencoded: [],
            raw: {
                data: "",
                dataType: "text/plain"
            },
        } as ConvertRequestBody;
        if (!requestBody) {
            return result;
        }
        const apidocProperty = apidocGenerateProperty<ApidocPropertyType>();
        // const ref = (requestBody as OpenAPIV3.ReferenceObject).$ref;
        const { description, required, content } = (requestBody as OpenAPIV3.RequestBodyObject);
        apidocProperty.description = description || "";
        apidocProperty.required = required || true;
        
        // if (ref) { //参数为引用
        //     const schemaObject = this.getRefSchema(ref);
        //     if (schemaObject) {
        //     }
        // }
        Object.keys(content).forEach(contentType => {
            const bodyData = content[contentType]
            if (!bodyData.schema) {
                console.warn(`${contentType}下无数据`)
                return;
            }
            if (contentType.toLocaleLowerCase().startsWith("application/json")) {
                result.json = [this.convertSchemaObjectToParams(bodyData.schema)];
            }
            if (contentType.toLocaleLowerCase().startsWith("application/x-www-form-urlencoded")) {
                result.urlencoded = this.convertSchemaObjectToParams(bodyData.schema).children
            }
            if (contentType.toLocaleLowerCase().startsWith("multipart/form-data")) {
                result.formdata = this.convertSchemaObjectToParams(bodyData.schema).children
            }
            if (contentType.toLocaleLowerCase().startsWith("*/*")) { //这种情况按照json格式解析
                console.warn(`*/*按照json格式解析`);
                result.json = [this.convertSchemaObjectToParams(bodyData.schema)];
            }
            if (contentType.toLocaleLowerCase().startsWith("application/xml")) { //xml解析
                result.raw.dataType = "application/xml";
                // console.log(22, this.convertSchemaObjectToParams(bodyData.schema))
                result.raw.data = "";
            }
            
        });
        console.log(result.raw, 9)
        return null;
    }

    /**
     * 解析schemaObject
     */
    convertSchemaObjectToParams(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): ApidocProperty {
        const apidocProperty = apidocGenerateProperty<ApidocPropertyType>();
        if ((schema as OpenAPIV3.ReferenceObject).$ref) { //引用
            const schemaObject = this.getRefSchema((schema as OpenAPIV3.ReferenceObject).$ref);
            if (schemaObject) {
                return this.convertSchemaObjectToParams(schemaObject);
            }
        } else if ((schema as OpenAPIV3.SchemaObject).type === "array") { //数组类型
            const schemaInfo = (schema as OpenAPIV3.ArraySchemaObject);
            apidocProperty.type = "array";
            apidocProperty.description = schemaInfo.description || "";
            apidocProperty.children = [this.convertSchemaObjectToParams(schemaInfo.items)];
        } else if ((schema as OpenAPIV3.SchemaObject).type === "boolean") { //布尔类型
            const schemaInfo = (schema as OpenAPIV3.SchemaObject);
            apidocProperty.type = "boolean";
            apidocProperty.value = schemaInfo.default ? schemaInfo.default.toString() : "";
            apidocProperty.description = schemaInfo.description || "";
        } else if ((schema as OpenAPIV3.SchemaObject).type === "number") { //数字类型
            const schemaInfo = (schema as OpenAPIV3.SchemaObject);
            apidocProperty.type = "number";
            apidocProperty.value = schemaInfo.default ? schemaInfo.default.toString() : "";
            apidocProperty.description = schemaInfo.description || "";
        } else if ((schema as OpenAPIV3.SchemaObject).type === "integer") { //数字类型
            const schemaInfo = (schema as OpenAPIV3.SchemaObject);
            apidocProperty.type = "number";
            apidocProperty.value = schemaInfo.default ? schemaInfo.default.toString() : "";
            apidocProperty.description = schemaInfo.description || "";
        } else if ((schema as OpenAPIV3.SchemaObject).type === "object") { //对象类型
            const schemaInfo = (schema as OpenAPIV3.SchemaObject);
            apidocProperty.type = "object";
            apidocProperty.description = schemaInfo.description || "";
            if (schemaInfo.properties) {
                Object.keys(schemaInfo.properties).forEach((property) => {
                    if (schemaInfo.properties) {
                        apidocProperty.children.push(this.convertSchemaObjectToParams(schemaInfo.properties[property]));
                    }
                })
            }
        } else if ((schema as OpenAPIV3.SchemaObject).type === "string") { //字符串类型
            const schemaInfo = (schema as OpenAPIV3.SchemaObject);
            if (schemaInfo.format === "byte" || schemaInfo.format === "binary") { //二进制
                apidocProperty.type = "file"
            } else {
                apidocProperty.type = "string";
            }
            apidocProperty.value = schemaInfo.default ? schemaInfo.default.toString() : "";
            apidocProperty.description = schemaInfo.description || "";
        } else if ((schema as OpenAPIV3.SchemaObject).type == null && (schema as OpenAPIV3.SchemaObject).properties) { //不存在type但是存在property
            const schemaInfo = (schema as OpenAPIV3.SchemaObject);
            apidocProperty.type = "object";
            apidocProperty.description = schemaInfo.description || "";
            if (schemaInfo.properties) {
                Object.keys(schemaInfo.properties).forEach((property) => {
                    if (schemaInfo.properties) {
                        apidocProperty.children.push(this.convertSchemaObjectToParams(schemaInfo.properties[property]));
                    }
                })
            }
        }
        return apidocProperty;
    }
    /**
     * 获取ref对应的Schema
     */
    getRefSchema(ref: string): OpenAPIV3.SchemaObject | null  {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let copiedOpenApiData: any = JSON.parse(JSON.stringify(this.openApiData));
        if (!ref.startsWith("#")) {
            console.warn(`当前ref路径为${ref}, 路径应该以#开头`);
            return null;
        } else {
            const refPath = ref.replace("#/", "").split("/");
            let schemaResult: OpenAPIV3.SchemaObject | null = null;
            for(let i = 0; i < refPath.length; i ++) {
                if (!copiedOpenApiData[refPath[i]]) {
                    console.warn(`无法找到${ref}对应的schema`)
                    return null;
                }
                copiedOpenApiData = copiedOpenApiData[refPath[i]]
            }
            schemaResult = copiedOpenApiData;
            return schemaResult;
        }
    }
}

export default OpenApiTranslator;