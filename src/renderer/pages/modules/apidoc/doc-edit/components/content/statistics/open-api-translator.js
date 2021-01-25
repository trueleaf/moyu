/**
 * 参考：https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
 * 解析以下字段：
 * Version
 */

import { uuid } from "@/lib"

class OpenApiTranslate {
    constructor(projectId) {
        this.projectId = projectId; //项目id
        this.openApiData = null; //openapi数据
        this.moyuProjectInfo = {}; //转换后符合规范的数据
    }

    convertToMoyuDocs(data) {
        if (!data) {
            throw new Error("缺少转换数据");
        }
        this.openApiData = data;
        const moyuDocs = [];
        const simplifyRequests = this.getSimplifyRequests();
        //生成目录信息
        simplifyRequests.forEach((simplifyRequest) => {
            const moyuDoc = this.generateDoc();
            const id = uuid();
            moyuDoc.uuid = id;
            simplifyRequest.uuid = id;
            moyuDoc.docName = simplifyRequest.description || "未命名文档";
            moyuDoc.isFolder = true;
            moyuDoc.sort = Date.now();
            moyuDocs.push(moyuDoc)
        })
        //生成文档
        simplifyRequests.forEach((simplifyRequest) => {
            const moyuDoc = this.generateDoc();
            moyuDoc.pid = simplifyRequest.uuid;
            moyuDoc.docName = simplifyRequest.description || "未命名文档";
            moyuDoc.sort = Date.now();
            moyuDoc.id = simplifyRequest.folderName;
            moyuDoc.item.methods = simplifyRequest.method;
            moyuDoc.item.requestType = simplifyRequest.method === "get" ? "params" : "json"
            moyuDoc.item.requestParams = simplifyRequest.method === "get" ? simplifyRequest.parameters : simplifyRequest.requestBody.values
            moyuDoc.item.responseParams = simplifyRequest.responses[0] ? simplifyRequest.responses[0].values : []
            moyuDocs.push(moyuDoc)
        })
        // console.log(simplifyRequests)
        // {
        //     pid: "", //父元素id用于判断是否是目录
        //     docName: "", //文档名称
        //     isFolder: false, //是否是文件夹
        //     sort: 0, //排序，js时间戳保留到毫秒
        //     projectId: this.projectId, //项目id
        //     enabled: true, //使能
        //     publish: false, //是否发布
        //     item: {
        //         methods: "get", //---------------请求方式
        //         requestType: "params", //
        //         url: {
        //             host: "", //-----------------主机(服务器)地址
        //             path: "", //-----------------接口路径
        //         }, //----------------------------请求地址信息
        //         requestParams: [],
        //         responseParams: [],
        //         header: [], //-------------------请求头信息
        //         description: "", //--------------请求描述
        //     },
        // }
        // console.log(moyuDocs)
        return moyuDocs;
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
     * @create             2021-01-05 10:50
     * @refer              https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#infoObject
     * @remark
     * 解析  title字段  description字段   version字段
     * @return
     *   - title: String,
     *   - description: String,
     *   - version: String
     */
    getProjectInfo() {
        const openApiInfo = this.openApiData.info;
        if (!openApiInfo) {
            console.warn("缺少Info字段")
        }
        return {
            title: openApiInfo?.title || null,
            description: openApiInfo?.description || null,
            version: openApiInfo?.version || null,
        };
    }

    /**
     * @description        获取服务器信息
     * @author             shuxiaokai
     * @create             2021-01-05 10:50
     * @refer              https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#serverObject
     * @remark
     * 解析  url字段  description字段   variables字段
     * @return
     *   [{
     *     url: String,
     *     description: String,
     *   }]
     */
    getServers() {
        const openApiServers = this.openApiData.servers;
        const result = [];
        if (!openApiServers) {
            console.warn("缺少servers字段");
            return result;
        }
        if (!Array.isArray(openApiServers)) {
            console.warn("servers字段必须为数组");
            return result;
        }
        openApiServers.forEach((server) => {
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
                url,
                description: server.description,
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
        const result = [];
        if (!openApiDocInfo) {
            console.warn("缺少paths字段");
            return result;
        }
        Object.keys(openApiDocInfo).forEach((reqUrl) => {
            const element = openApiDocInfo[reqUrl];
            const pid = uuid();
            const folder = this.generateDoc();
            folder.id = pid; //目录id
            folder.isFolder = true; //是目录
            folder.sort = Date.now(); //排序
            folder.item = {}; //目录item数据为空
            Object.keys(element).forEach((method) => {
                const moyuDoc = this.generateDoc();
                const doc = element[method];
                moyuDoc.docName = doc.summary; //文档名称
                moyuDoc.description = doc.description; //文档备注
                moyuDoc.sort = Date.now(); //排序
                //解析parameters
                // eslint-disable-next-line no-unused-vars
                const parameters = this.convertParameters(doc.parameters);
                //解析body数据
                // eslint-disable-next-line no-unused-vars
                const requestBody = this.convertRequestBody(doc.requestBody);
                // console.log(method, parameters, requestBody)
            });
        })
        return result;
    }

    /**
     * @description        简化请求格式(处理paths字段，将起转换为易操作数据)
     * @author             shuxiaokai
     * @create             2021-01-08 17:30
     * @return
     * 返回数据格式
        [{
            folderName: "",
            url: "/pet",
            method: "get",
            description: "描述",
            requestBody: {}, //请求body参数
            parameters: {}, //查询字符串
            responses: {}, //返回参数
        }]
     */
    getSimplifyRequests() {
        const requestResult = [];
        const { paths } = this.openApiData;
        if (!paths) {
            console.warn("缺少paths字段");
            return requestResult;
        }
        //=========================================================================//
        //生成简化版请求参数骨架
        const generateRequestItem = () => ({
            folderName: "", //文件夹名称
            url: "", //请求url
            method: "get", //请求方法
            description: "", //请求描述
            requestBody: {}, //请求body参数
            parameters: {}, //查询字符串
            responses: {}, //返回参数
        });
        //简化requestBody
        const simplifyRequestBody = (requestBody) => {
            let contentValue = null;
            if (!requestBody) {
                return contentValue;
            }
            const contents = requestBody.content;
            Object.keys(contents).forEach((contentType) => {
                if (contentType === "application/json") {
                    contentValue = {
                        contentType: "application/json",
                        values: OpenApiTranslate.generateParams(contents[contentType]),
                    };
                } else if (contentType === "application/x-www-form-urlencoded") {
                    contentValue = {
                        contentType: "application/x-www-form-urlencoded",
                        values: OpenApiTranslate.generateParams(contents[contentType]),
                    };
                } else if (contentType === "multipart/form-data") {
                    contentValue = {
                        contentType: "multipart/form-data",
                        values: OpenApiTranslate.generateParams(contents[contentType]),
                    };
                } else if (contentType === "*/*") {
                    contentValue = {
                        contentType: "*/*",
                        values: OpenApiTranslate.generateParams(contents[contentType]),
                    };
                } else {
                    console.warn(`requestBody 未知contentType类型${contentType}`)
                }
            });
            return contentValue
        }
        //简化parameters
        const simplifyParameters = (parameters) => {
            const result = [];
            if (!parameters) {
                return {};
            }
            if (!Array.isArray(parameters)) {
                console.warn("parameters 字段必须为数组");
                return {};
            }
            //解析规则参考：https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#parameterObject
            parameters.forEach((parameter) => {
                const params = this.generateParams();
                const inValue = parameter.in; //共四种可能， header，query，path，cookie
                const { name, schema } = parameter;
                params.description = parameter.description; //描述是所有参数都具有的属性
                parameter.required ? (params.required = true) : (params.required = false) //必填是所有参数都具有的属性
                if (inValue === "path") { //如果为path则替换url中的{参数}
                    //仅解析integer和string, 不考虑其他条件
                    if (schema.type === "integer") {
                        params.key = name;
                        params.value = 1;
                        params.type = "number";
                    } else if (schema.type === "string") {
                        params.key = name;
                        params.value = "string";
                        params.type = "string";
                    } else { //其他情况按照字符串处理
                        params.key = name;
                        params.value = "string";
                        params.type = "string";
                        console.warn(`存在其他type类型：${schema.type}`);
                    }
                    params._in = "path";
                    result.push(params)
                } else if (inValue === "query") { //查询字符串
                    //所有数据均按照字符串处理
                    if (schema.type === "string") {
                        params.key = name;
                        params.value = "string";
                        params.type = "string";
                    } else if (schema.type === "array") {
                        params.key = name;
                        params.value = "string";
                        params.type = "string";
                    } else {
                        params.key = name;
                        params.value = "string";
                        params.type = "string";
                        console.warn(`存在其他type类型：${schema.type}`);
                    }
                    params._in = "query";
                    result.push(params)
                } else if (inValue === "header") { //headers参数
                    //仅解析integer和string, 不考虑其他条件
                    if (schema.type === "integer") {
                        params.key = name;
                        params.value = 1;
                        params.type = "number";
                    } else if (schema.type === "string") {
                        params.key = name;
                        params.value = "string";
                        params.type = "string";
                    } else { //其他情况按照字符串处理
                        params.key = name;
                        params.value = "string";
                        params.type = "string";
                        console.warn(`存在其他type类型：${schema.type}`);
                    }
                    params._in = "header";
                    result.push(params)
                } else {
                    console.warn(`暂时无法支持的in类型${inValue}`);
                }
            })
            return result;
        }
        //简化返回值
        const simplifyResponse = (responses) => {
            const responseValue = [];
            if (!responses) {
                return responseValue;
            }
            Object.keys(responses).forEach((status) => {
                const res = responses[status];
                responseValue.push({
                    status,
                    values: simplifyRequestBody(res),
                })
            });
            return responseValue
        }
        //=========================================================================//
        Object.keys(paths).forEach((reqUrl) => {
            const requestCollections = paths[reqUrl];
            Object.keys(requestCollections).forEach((method) => {
                const requestItem = generateRequestItem();
                requestItem.url = reqUrl;
                requestItem.folderName = reqUrl;
                const requestCollection = requestCollections[method];
                const cpRequestBody = JSON.parse(JSON.stringify(requestCollection.requestBody || ""))
                requestItem.method = method;
                requestItem.description = requestCollection.summary;
                requestItem.requestBody = simplifyRequestBody(cpRequestBody) || [];
                requestItem.parameters = simplifyParameters(requestCollection.parameters) || [];
                requestItem.responses = simplifyResponse(requestCollection.responses) || [];
                requestResult.push(requestItem);
            })
        });
        return requestResult;
    }

    //处理schema
    schemaHandle(contentValue) {
        const schemaValue = contentValue.schema;
        const result = [];
        // eslint-disable-next-line no-shadow
        const foo = (schemaValue, result, field) => {
            const { $ref, type, properties } = schemaValue;
            const moyuDoc = this.generateParams();
            moyuDoc.key = field || ""
            if (type === "string") {
                if (schemaValue.format === "binary") { //文件类型
                    schemaValue.type = "file"
                } else { //其余情况全部处理为字符串
                    moyuDoc.type = "string";
                    moyuDoc.value = schemaValue.example || ""
                }
                result.push(moyuDoc);
            } else if (type === "integer" || type === "number") {
                moyuDoc.type = "number";
                result.push(moyuDoc);
            } else if (type === "boolean") {
                moyuDoc.type = "boolean";
                result.push(moyuDoc);
            } else if (type === "object") {
                moyuDoc.type = "object"
                Object.keys(properties).forEach((key) => {
                    const property = properties[key];
                    foo(property, moyuDoc.children, key);
                })
                result.push(moyuDoc);
            } else if (type === "array") { //array必须在ref前面进行解析
                moyuDoc.type = "array";
                foo(schemaValue.items, moyuDoc.children);
                result.push(moyuDoc);
            } else if ($ref) {
                let ref = $ref;
                if (!ref.startsWith("#")) {
                    console.warn("只能解析当前文件的引用");
                } else {
                    ref = ref.replace("#/", "").split("/");
                    let referSchema = JSON.parse(JSON.stringify(this.openApiData));
                    ref.forEach((val) => {
                        referSchema = referSchema[val];
                    })
                    foo(referSchema, result);
                }
            } else {
                console.warn(`未知数据类型${JSON.stringify(schemaValue)}`)
            }
        }
        foo(schemaValue, result, "");
        return result
    }

    //生成参数骨架
    static generateParams() {
        return {
            key: "",
            description: "",
            type: "",
            value: "",
            required: true,
            children: [],
            _select: true,
            _in: "", //1.path  2.query  3.header  4.body
        }
    }

    //生成文档骨架
    static generateDoc() {
        return {
            pid: "", //父元素id用于判断是否是目录
            docName: "", //文档名称
            isFolder: false, //是否是文件夹
            sort: 0, //排序，js时间戳保留到毫秒
            projectId: this.projectId, //项目id
            enabled: true, //使能
            publish: false, //是否发布
            item: {
                methods: "get", //---------------请求方式
                requestType: "params", //
                url: {
                    host: "", //-----------------主机(服务器)地址
                    path: "", //-----------------接口路径
                }, //----------------------------请求地址信息
                requestParams: [],
                responseParams: [],
                header: [], //-------------------请求头信息
                description: "", //--------------请求描述
            },
        }
    }
}
export default OpenApiTranslate;
