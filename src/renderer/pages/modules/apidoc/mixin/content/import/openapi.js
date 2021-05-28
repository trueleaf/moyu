/*
|--------------------------------------------------------------------------
| 转换swagger，openapi格式数据
|--------------------------------------------------------------------------
| jsonSchema     https://json-schema.org/
| openapi        https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
| swaggerEditor  https://editor.swagger.io/
|
*/

import { uuid } from "@/lib"
import mixin from "../../index"

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
const VALID_CONTENT_TYPE = {
    "application/json": "application/json",
    "application/x-www-form-urlencoded": "application/x-www-form-urlencoded",
    "multipart/form-data": "multipart/form-data",
}
class OpenApiTranslate {
    constructor(projectId) {
        if (!projectId) {
            throw new Error("缺少项目id");
        }
        this.projectId = projectId; //项目id
        this.openApiData = null; //openapi数据
        this.moyuProjectInfo = {}; //转换后符合规范的数据
    }

    convertToMoyuDocs(data) {
        if (!data) {
            throw new Error("缺少转换数据");
        }
        this.openApiData = data;
        const moyuDoc = {
            info: this.getProjectInfo(),
            rules: {},
            docs: this.getDocInfo(),
            hosts: this.getServers() || [],
        };
        return moyuDoc;
    }

    /**
     * @description        获取openapi版本信息
     * @author             shuxiaokai
     * @create             2021-01-05 11:13
     * @return {string}    版本信息
     */
    getVersion() {
        if (!this.openApiData.openapi) {
            console.warn("缺少Version信息");
            return null;
        }
        return this.openApiData.openapi
    }

    /**
    * @description        获取项目信息
    * @author             shuxiaokai
    * @create             2021-04-08 21:38
    * @refer              https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#infoObject
    * @return {String}    返回字符串
    *
    *   {
    *       projectName: String, //项目名称
    *       docNum: Number, //文档数量
    *   }
    */
    getProjectInfo() {
        const openApiInfo = this.openApiData.info;
        if (!openApiInfo) {
            console.warn("缺少Info字段")
        }
        return {
            projectName: openApiInfo?.title || null,
        };
    }

    /**
     * @description        获取服务器信息
     * @author             shuxiaokai
     * @create             2021-01-05 10:50
     * @refer              https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#serverObject
     * @remark
     *
     *  [{
     *     name: String, //服务器(host)名称
     *     url: String, //服务器地址
     *     remark: String, //备注信息
     *  }]
     *
     */
    getServers() {
        const openApiServers = this.openApiData.servers;
        const result = [];
        if (!openApiServers) {
            console.warn("缺少servers字段");
            return null;
        }
        if (!Array.isArray(openApiServers)) {
            console.warn("servers字段必须为数组");
            return null;
        }
        openApiServers.forEach((server, index) => {
            const variables = server.variables || {};
            const keys = Object.keys(variables);
            const varValue = keys.map((key) => ({
                key,
                value: variables[key].default,
            }))
            const url = server.url.replace(/{([^{}]+)}/g, ($1, $2) => {
                const matched = varValue.find((val) => val.key === $2);
                return matched.value || $1
            })
            result.push({
                name: `服务器${index + 1}`,
                url,
                remark: server.description,
            });
        })
        return result;
    }

    /**
     * @description        获取接口详情信息
     * @author             shuxiaokai
     * @create             2021-01-05 10:50
     * @refer              https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathItemObject
     * @remark
     * @return
     */
    getDocInfo() {
        const openApiDocInfo = this.openApiData.paths;
        const docsArr = [];
        const allTags = new Set();
        if (!openApiDocInfo) {
            console.warn("缺少paths字段");
            return docsArr;
        }
        Object.keys(openApiDocInfo).forEach((reqUrl) => {
            const element = openApiDocInfo[reqUrl];
            const pid = "";
            Object.keys(element).forEach((method) => {
                const moyuDoc = this.generateDoc();
                const openApiDoc = element[method];
                const { tags } = openApiDoc;
                if (tags && tags.length > 0) {
                    allTags.add(tags[0]);
                    moyuDoc.info.tag = {
                        name: tags[0],
                    };
                }
                moyuDoc.pid = pid;
                moyuDoc.sort = Date.now(); //排序
                moyuDoc.info.name = openApiDoc.summary || "未命名"; //文档名称
                moyuDoc.info.description = openApiDoc.description; //文档备注
                moyuDoc.info.type = "api";
                moyuDoc.item.method = method;
                moyuDoc.item.url.host = this.getServers() ? this.getServers()[0]?.url : "";
                moyuDoc.item.url.path = reqUrl;
                //解析parameters
                // eslint-disable-next-line no-unused-vars
                const parameterInfo = this.convertParameters(openApiDoc.parameters);
                if (parameterInfo?.paths?.length > 0) moyuDoc.item.paths = parameterInfo.paths;
                if (parameterInfo?.queryParams?.length > 0) moyuDoc.item.queryParams = parameterInfo.queryParams;
                if (parameterInfo?.headers?.length > 0) moyuDoc.item.headers = parameterInfo.headers;
                if (parameterInfo?.body?.length > 0) { //较老版本
                    moyuDoc.item.requestBody = parameterInfo?.body;
                    moyuDoc.item.contentType = "application/json";
                }
                //解析body数据
                // eslint-disable-next-line no-unused-vars
                const requestBody = this.convertContent(openApiDoc.requestBody?.content);
                if (requestBody && requestBody.values) {
                    moyuDoc.item.requestBody = requestBody.values;
                    moyuDoc.item.contentType = requestBody.contentType;
                }
                // 解析response
                const responseParams = this.convertResponse(openApiDoc.responses);
                if (responseParams) {
                    moyuDoc.item.responseParams = responseParams;
                }
                docsArr.push(moyuDoc);
            });
        })
        // const folderDocs = docsArr.filter((v) => v.isFolder);
        const tags = Array.from(allTags);
        tags.forEach((tag) => {
            const pid = uuid();
            const folderDoc = this.generateDoc();
            folderDoc._id = pid; //目录id
            folderDoc.isFolder = true; //是目录
            folderDoc.sort = Date.now(); //排序
            folderDoc.item = {}; //目录item数据为空
            folderDoc.info.type = "folder";
            folderDoc.info.name = tag;

            docsArr.forEach((docInfo) => {
                const docTag = docInfo.info.tag?.name;
                if (docTag === tag) {
                    docInfo.pid = pid;
                }
            })
            docsArr.push(folderDoc);
        })
        return docsArr;
    }

    /**
     * @description        转换parameters
     * @author             shuxiaokai
     * @refer              https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#parameterObject
     * @create             2021-04-08 22:45
     * @return {String}    返回字符串
     */
    // eslint-disable-next-line class-methods-use-this
    convertParameters(parameters) {
        if (!parameters) {
            return null;
        }
        if (!Array.isArray(parameters)) {
            console.error("parameters不为数组格式");
            return null;
        }
        const pathParams = parameters.filter((p) => p.in === "path");
        const queryParams = parameters.filter((p) => p.in === "query");
        const headerParams = parameters.filter((p) => p.in === "header");
        const cookieParams = parameters.filter((p) => p.in === "cookie");
        const bodyParams = parameters.filter((p) => p.in === "body"); //兼容
        const pathResult = this.convertSchemaToParams(pathParams);
        const queryResult = this.convertSchemaToParams(queryParams);
        const headerResult = this.convertSchemaToParams(headerParams);
        const cookieResult = this.convertSchemaToParams(cookieParams);
        const bodyResult = this.convertSchemaToParams(bodyParams);
        const result = {
            paths: pathResult,
            queryParams: queryResult,
            headers: headerResult,
            cookie: cookieResult,
            body: bodyResult,
        };
        return result;
    }

    /**
     * @description        转换RequestBody
     * @author             shuxiaokai
     * @refer              https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#parameterObject
     * @create             2021-04-08 22:45
     * @return {String}    返回字符串
     */
    // eslint-disable-next-line class-methods-use-this
    convertContent(content) {
        let result = null;
        if (!content) {
            return null;
        }
        // const { content } = requestBody;
        let priorContentType = null; // application/json, application/x-www-form-urlencoded, multipart/form-data
        let mediaTypeObject = null;
        const mediaTypeObjects = Object.keys(content);
        if (mediaTypeObjects.length === 0) {
            return null;
        }
        if (mediaTypeObjects.length > 0) {
            console.warn(`无法解析多种请求body，仅会生效一个匹配到的contentType ${JSON.stringify(mediaTypeObjects)}`);
        }

        const firstMediaType = VALID_CONTENT_TYPE[mediaTypeObjects[0]];
        if (!firstMediaType) {
            priorContentType = mediaTypeObjects.find((ct) => ct === VALID_CONTENT_TYPE[ct])
            if (!priorContentType) {
                console.warn(`无法解析 ${mediaTypeObjects[0]} 类型请求参数 仅支持${JSON.stringify(Object.keys(VALID_CONTENT_TYPE))}`);
                return null;
            }
        } else {
            priorContentType = firstMediaType;
        }
        mediaTypeObject = content[priorContentType];

        const { schema } = mediaTypeObject;
        const refPath = schema.$ref;
        if (refPath) { //使用引用
            const refObj = this.getRefsData(refPath);
            if (refObj) {
                result = this.convertSchema(refObj);
            }
        } else {
            result = this.convertSchema(schema);
        }
        return {
            contentType: priorContentType,
            values: result,
        }
    }

    /**
     * @description        转换response参数
     * @author             shuxiaokai
     * @create             2021-05-10 22:41
     * @return {String}    返回字符串
     */
    // eslint-disable-next-line class-methods-use-this
    convertResponse(response) {
        const result = [];
        Object.keys(response).forEach((status) => {
            const content = response[status]?.content;
            const convertContent = this.convertContent(content);
            result.push({
                title: status,
                statusCode: status,
                values: convertContent ? convertContent.values : [],
            });
        })
        return result;
    }

    /**
     * @description        获取引用参数
     * @author             shuxiaokai
     * @create             2021-04-09 19:32
     * @return {String}    返回字符串
     */
    getRefsData(path) {
        let refPath = path;
        let referSchema = JSON.parse(JSON.stringify(this.openApiData));
        if (!refPath.startsWith("#")) {
            console.warn("只能解析当前文件的引用");
            referSchema = null;
        } else {
            refPath = refPath.replace("#/", "").split("/");
            refPath.forEach((val) => {
                referSchema = referSchema[val];
            })
        }
        return referSchema;
    }

    /**
     * @description        转换schema
     * @author             shuxiaokai
     * @create             2021-04-09 10:20
     * @return {String}    返回字符串
     */
    // eslint-disable-next-line class-methods-use-this
    convertSchema(globalSchema) {
        const result = [];
        const foo = (schema, currentResult, schemaKey) => {
            const { $ref, type, properties, format, allOf, anyOf, oneOf } = schema;
            if ($ref) { //使用引用
                const refPath = $ref;
                const refObj = this.getRefsData(refPath);
                if (refObj) {
                    foo(refObj, currentResult, schemaKey);
                }
            } else if (allOf || anyOf || oneOf) {
                const item = allOf || anyOf || oneOf;
                for (let i = 0; i < item.length; i += 1) {
                    const property = item[i];
                    this.convertSchema(property).forEach((val) => {
                        currentResult.push(val);
                    })
                }
            } else if (!type) { //没有type值直接取property
                const allPropertyKeys = Object.keys(properties);
                for (let i = 0; i < allPropertyKeys.length; i += 1) {
                    const property = allPropertyKeys[i];
                    const propertyValue = properties[property];
                    foo(propertyValue, currentResult, property);
                }
            } else if (type) { //存在type进行解析
                let convertType = TYPE_ENUM[type];
                const params = mixin.methods.generateProperty();
                if (convertType === "string") {
                    if (format === "binary") { //文件类型
                        convertType = "file"
                    }
                    params.key = schemaKey;
                    params.type = convertType;
                    params.value = schema.example || schema.default || "";
                    params.description = schema.description;
                    params.required = schema.required;
                    currentResult.push(params);
                } else if (convertType === "number") {
                    params.key = schemaKey;
                    params.type = convertType;
                    params.value = schema.example || schema.default;
                    params.description = schema.description;
                    params.required = schema.required;
                    currentResult.push(params);
                } else if (convertType === "boolean") {
                    params.key = schemaKey;
                    params.type = convertType;
                    params.value = schema.example || schema.default;
                    params.description = schema.description;
                    params.required = schema.required;
                    currentResult.push(params);
                } else if (convertType === "object") {
                    params.type = convertType;
                    params.description = schema.description;
                    currentResult.push(params);
                    Object.keys(schema.properties).forEach((property) => {
                        foo(schema.properties[property], params.children, property);
                    })
                } else if (convertType === "array") {
                    params.type = convertType;
                    params.description = schema.description;
                    params.key = schemaKey;
                    currentResult.push(params);
                    const { items } = schema;
                    const itemsType = TYPE_ENUM[items.type]
                    if (itemsType === "string" || itemsType === "number" || itemsType === "boolean") {
                        params.children = [mixin.methods.generateProperty(itemsType)]
                    } else {
                        foo(items, params.children);
                    }
                }
            } else {
                console.warn(`schema解析错误 ${JSON.stringify(schema)}`);
            }
        }
        foo(globalSchema, result);
        return result;
    }

    //schema转换为参数
    // eslint-disable-next-line class-methods-use-this
    convertSchemaToParams(params) {
        let result = [];
        if (params.length > 0) {
            // console.log(params)
            params.forEach((p) => {
                const property = mixin.methods.generateProperty();
                const { schema, type } = p;
                const refPath = schema?.$ref;
                if (!schema) { //直接描述值
                    const convertType = TYPE_ENUM[type];
                    property.key = p.name;
                    property.type = (convertType === "string" || convertType === "number") ? convertType : "string"; //无法举例的类型都当做string处理
                    property.description = p.description;
                    property.required = !!p.required;
                    result.push(property)
                } else if (refPath) { //使用引用
                    const refObj = this.getRefsData(refPath);
                    if (refObj) {
                        const convertProperty = this.convertSchema(refObj);
                        result = convertProperty;
                    }
                } else { //内部嵌套
                    const convertType = TYPE_ENUM[schema.type];
                    if (convertType !== "string" && convertType !== "number") {
                        console.warn(`parameter存在无法解析的类型${schema.type}  ${p.name}  ${p.description}`);
                    }
                    property.key = p.name;
                    property.type = (convertType === "string" || convertType === "number") ? convertType : "string"; //无法举例的类型都当做string处理
                    property.description = p.description;
                    property.required = !!p.required;
                    result.push(property)
                }
            });
        }
        return result;
    }

    //生成文档骨架
    generateDoc() {
        return {
            _id: uuid(),
            pid: "", //父元素id用于判断是否是目录
            projectId: this.projectId, //项目id
            isFolder: false, //是否是文件夹
            sort: 0, //排序，js时间戳保留到毫秒
            enabled: true, //使能
            info: { //文档基本信息
                name: "", //文档名称
                description: "", //文档描述
                version: "", //文档版本信息
                type: "", //文档类型
                tag: "", //标签信息
            },
            item: {
                method: "get", //---------------请求方式
                contentType: "application/json", //
                url: {
                    host: "", //-----------------主机(服务器)地址
                    path: "", //-----------------接口路径
                }, //----------------------------请求地址信息
                paths: [],
                queryParams: [],
                requestBody: [],
                responseParams: [],
                headers: [], //-------------------请求头信息
            },
        }
    }
}
export default OpenApiTranslate;
