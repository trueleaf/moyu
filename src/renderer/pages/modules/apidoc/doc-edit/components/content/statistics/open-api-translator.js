
/**
 * 参考：https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
 * 解析以下字段：
 * Version
 * 
 * 
 */



import data from "./data"
import { uuid } from "@/lib"

class OpenApiTranslate {
    constructor(projectId) {
        this.projectId = projectId; //项目id
        this.openApiData = data; //openapi数据
        this.moyuProjectInfo = {}; //转换后符合规范的数据
    }
    init() {
        // console.log("openApi", this.openApiData);
        // console.log("info", this.getProjectInfo());
        // console.log("servers", this.getServers());
        // console.log("docs", this.getDocInfo());
        // this.getDocInfo()
        console.log(this.getSimplifyRequest())

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
        openApiServers.forEach(server => {
            const variables = server.variables || {};
            const keys = Object.keys(variables);
            const varValue = keys.map(key => {
                return {
                    key,
                    value: variables[key].default
                }
            })
            const url = server.url.replace(/{([^{}]+)}/g, ($1, $2) => {
                const matched = varValue.find(val => val.key === $2) 
                return matched.value || $1
            })
            result.push({
                url,
                description: server.description
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
     *   
     */
    getDocInfo() {
        const openApiDocInfo = this.openApiData.paths;
        const result = [];
        if (!openApiDocInfo) {
            console.warn("缺少paths字段");
            return result;
        }
        for(let reqUrl in openApiDocInfo) {
            const element = openApiDocInfo[reqUrl];
            const pid = uuid();
            const folder = this.generateDoc();
            folder.id = pid; //目录id
            folder.isFolder = true; //是目录
            folder.sort = Date.now(); //排序
            folder.item = {}; //目录item数据为空
            for(let method in element) {
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
            }
        }
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
     * 
     */
    getSimplifyRequest() {
        const result = [];
        const paths = this.openApiData.paths;
        if (!paths) {
            console.warn("缺少paths字段");
            return result;
        }
        const generateRequestItem = () => {
            return {
                folderName: "", //文件夹名称
                url: "", //请求url
                method: "get", //请求方法
                description: "", //请求描述
                requestBody: {}, //请求body参数
                parameters: {}, //查询字符串
                responses: {}, //返回参数
            }
        }
        /**
          [{

          }] 
        */ 
        const simplifyRequestBody = (requestBody) => {
            const result = [];
            if (!requestBody) {
                return result;
            }
            const contents = requestBody.content;
            console.log(contents)

        }


        for(let reqUrl in paths) {
            const requestCollections = paths[reqUrl];
            const requestItem = generateRequestItem();
            requestItem.url = reqUrl;
            requestItem.folderName = reqUrl;
            for(let method in requestCollections) {
                const requestCollection = requestCollections[method]
                requestItem.method = method;
                requestItem.description = requestCollection.summary;
                requestItem.requestBody = simplifyRequestBody(requestCollection.requestBody) || [];
                requestItem.parameters = requestCollection.parameters || [];
                requestItem.responses = requestCollection.responses || [];
            }
            result.push(requestItem);
        }
        return result;
    }



    /** 
     * @description        解析Parameters
     * @author             shuxiaokai
     * @create             2021-01-07 13:32
     * @remark
     * 仅解析  path query header
     */
    convertParameters(parameters) {
        const result = [];
        if (!parameters) {
            return {};
        }
        if (!Array.isArray(parameters)) {
            console.warn("parameters 字段必须为数组");
            return {};
        }
        /** 
         * 解析规则参考：https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#parameterObject
         * 解析字段
         * name 
         * in
         * description
         * required
         */
        parameters.forEach(parameter => {
            
            const params = this.generateParams();
            const inValue = parameter.in; //共四种可能， header，query，path，cookie
            const name = parameter.name;
            const schema = parameter.schema; //body解析schema

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
    /** 
     * @description        解析requestBody
     * @author              shuxiaokai
     * @create             2021-01-07 17:15
     * @remark
     * 能够解析requestType  
     * - application/x-www-form-urlencoded
     * - application/json
     * - multipart/form-data   
     * , 
     */
    convertRequestBody(requestBody) {
        /** 
         * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#mediaTypeObject
         * 直解析非常准确的contentType, 不解析mediaTypeRange(eg: text/*) 
         * 只存在三个字段
         * required, description，content<MediaXType>
         * 
         */
        let bodyResult = [];
        if (!requestBody) {
            return [];
        }
        const params = this.generateParams();
        const content = requestBody.content;
        const jsonContent = content["application/json"];
        const formContent = content["application/x-www-form-urlencoded"];
        const formDataContent = content["multipart/form-data"];
        const rangeContent = content["*/*"];
        params.description = requestBody.description || ""; //描述是所有参数都具有的属性
        requestBody.required ? (params.required = true) : (params.required = false) //必填是所有参数都具有的属性

        if (jsonContent) { //json格式优先解析，多种格式只解析一个
            const schema = jsonContent.schema;
            bodyResult = this.convertRequestBodySchema(schema);
        } else if (formContent) {
            const schema = formContent.schema;
            bodyResult = this.convertRequestBodySchema(schema);
        } else if (formDataContent) {
            const schema = formDataContent.schema;
            bodyResult = this.convertRequestBodySchema(schema);
        } else if (formDataContent) {
            const schema = formDataContent.schema;
            bodyResult = this.convertRequestBodySchema(schema);
        } else if (rangeContent) { //范围数据处理为json
            const schema = rangeContent.schema;
            bodyResult = this.convertRequestBodySchema(schema);
        }else { //统一处理为application/json
            console.warn(`无法处理的请求类型${JSON.stringify(content)}`)
        }
        return bodyResult
    }
    //将requestBodyschema转换为muyu参数
    convertRequestBodySchema(schema) {
        const result = [];
        const foo = (properties, result) => {
            for(let key in properties) {
                const moyuDoc = this.generateParams();
                result.push(moyuDoc)
                const param = properties[key];
                moyuDoc.key = key;
                if (param.type === "integer" || param.type === "number") { //统一处理为number
                    moyuDoc.type = "number";
                } else if (param.type === "string") { //string类型存在多种format
                    if (param.format === "binary") { //文件类型 
                        param.type = "file"
                    } else { //其余情况全部处理为字符串
                        moyuDoc.type = "string";
                        moyuDoc.value = param.example || ""
                    }
                } else if (param.type === "boolean") { //布尔值
                    param.type = "boolean"
                } else if (param.type === "object") { //对象
                    param.type = "object"
                    foo(param.properties, moyuDoc.children);
                } else if (param.type === "array") { //数组
                    moyuDoc.type = "array";
                    const items = param.items;
                    if (items.type === "string") {
                        const childDoc = this.generateParams();
                        childDoc.type = "string";
                        moyuDoc.children[0] = childDoc
                    } else if (items.type === "integer" || items.type === "number") {
                        const childDoc = this.generateParams();
                        childDoc.type = "number";
                        moyuDoc.children[0] = childDoc
                    } else if (items.type === "boolean") {
                        const childDoc = this.generateParams();
                        childDoc.type = "boolean";
                        moyuDoc.children[0] = childDoc
                    } else if (items.type === "object") {
                        const childDoc = this.generateParams();
                        childDoc.type = "object"
                        moyuDoc.children[0] = childDoc;
                        foo(items.properties,moyuDoc.children[0]);
                    } else if (items.$ref) {
                        let ref = items.$ref;
                        if (!ref.startsWith("#")) {
                            console.warn("只能解析当前文件的引用");
                        } else {
                            ref = ref.replace("#/", "").split("/");
                            let referSchema = JSON.parse(JSON.stringify(this.openApiData));
                            ref.forEach(val => {
                                referSchema = referSchema[val];
                            })
                            moyuDoc.type = referSchema.type;
                            foo(referSchema.properties, moyuDoc.children);
                        }
                    }
                    foo(param.properties, moyuDoc.children);
                } else if (param.$ref) {
                    let ref = param.$ref;
                    if (!ref.startsWith("#")) {
                        console.warn("只能解析当前文件的引用");
                    } else {
                        ref = ref.replace("#/", "").split("/");
                        let referSchema = JSON.parse(JSON.stringify(this.openApiData));
                        ref.forEach(val => {
                            referSchema = referSchema[val];
                        })
                        moyuDoc.type = referSchema.type;
                        foo(referSchema.properties, moyuDoc.children);
                    }
                } else {
                    console.warn(`无法转换的schema type 类型${JSON.stringify(param)}`)
                }
            }
        }
        if (schema.$ref) { //引用
            let ref = schema.$ref;
            if (!ref.startsWith("#")) {
                console.warn("只能解析当前文件的引用");
            } else {
                ref = ref.replace("#/", "").split("/");
                let referSchema = JSON.parse(JSON.stringify(this.openApiData));
                ref.forEach(val => {
                    referSchema = referSchema[val];
                })
                foo(referSchema.properties, result);
            }
        } else if (schema.type === "array") {
            console.warn("array");
            // const items = schema.items;
            // if (items.type === "string") {
              
            // } else if (items.type === "integer" || items.type === "number") {
               
            // } else if (items.type === "boolean") {
                
            // } else if (items.type === "object") {
                
            // } else if (items.$ref) {
                
            // }
        } else if (schema.type === "object" || schema.properties) {
            foo(schema.properties, result);
        } else {
            console.warn(`未知schema类型${JSON.stringify(schema)}`)
        }
        console.log("result", result, schema)
        return result;
    }
    //申请参数骨架
    generateParams() {
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
    generateDoc() {
        return {
            pid: "", //父元素id用于判断是否是目录
            docName: "", //文档名称
            docType: "", //文档类型 1.文件夹 2.普通文档 3.markdown文档
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