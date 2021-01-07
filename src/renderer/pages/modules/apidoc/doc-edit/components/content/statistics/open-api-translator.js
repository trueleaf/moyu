
/*
* 参考：https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
*/ 



import data from "./data"
import { uuid } from "@/lib"

class OpenApiTranslate {

    constructor(projectId) {
        this.projectId = projectId;
        this.openApiData = data;
    }

    init() {
        console.log("openApi", this.openApiData);
        console.log("info", this.getInfo());
        console.log("servers", this.getServers());
        console.log("docs", this.getDocInfo());
    }
    /** 
     * @description        解析变量信息
     * @author              shuxiaokai
     * @create             2021-01-05 11:13
     * @param {Variable}   变量信息
     * @return             解析后变量信息   
     */
    getVariables() {

    }


    /** 
     * @description        获取接口文档元数据信息
     * @author             shuxiaokai
     * @create             2021-01-05 10:50
     * @refer              https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#infoObject
     * @remark
     * 解析  title字段  description字段   version字段
     * @return  
     *   {
     *     title: String,
     *     description: String,
     *     version: String
     *   }
     */
    getInfo() {
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
     * 
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
                const parameters = this.convertParameters(doc.parameters);
                //解析body数据
                const requestBody = this.convertRequestBody(doc.requestBody, openApiDocInfo);
                console.log(method, parameters, requestBody)
            }
        }

        // openApiDocInfo.forEach(server => {
        //     const variables = server.variables || {};
        //     const keys = Object.keys(variables);
        //     const varValue = keys.map(key => {
        //         return {
        //             key,
        //             value: variables[key].default
        //         }
        //     })
        //     const url = server.url.replace(/{([^{}]+)}/g, ($1, $2) => {
        //         const matched = varValue.find(val => val.key === $2) 
        //         return matched.value || $1
        //     })
        //     result.push({
        //         url,
        //         description: server.description
        //     });
        // })
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
     * 
     */
    convertRequestBody(requestBody, openApiDocInfo) {
        /** 
         * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#mediaTypeObject
         * 只存在三个字段
         * required, description，content<MediaXType>
         * 
         */
        if (!requestBody) {
            return [];
        }
        const params = this.generateParams();
        const content = requestBody.content;
        const jsonContent = content["application/json"];
        const formContent = content["application/x-www-form-urlencoded"];
        const formDataContent = content["multipart/form-data"];
        params.description = requestBody.description || ""; //描述是所有参数都具有的属性
        requestBody.required ? (params.required = true) : (params.required = false) //必填是所有参数都具有的属性
        if (jsonContent) { //json格式优先解析，多种格式只解析一个
            const schema = jsonContent.schema;
            let ref = schema.$ref; //注意：ref可能存在多种引用，只解析当前文件的引用(eg: #/components/schemas/Pet)
            if (!ref.startsWith("#")) {
                console.warn("只能解析当前文件的引用");
            } else {
                let referSchema = null;
                ref = ref.replace("#/").split("/");
                ref.forEach(val => {
                    referSchema = openApiDocInfo[val];
                })
                console.log(referSchema)
            }
        } else if (formContent) {
            const schema = formContent.schema;
            let ref = schema.$ref; //注意：ref可能存在多种引用，只解析当前文件的引用(eg: #/components/schemas/Pet)
            if (!ref.startsWith("#")) {
                console.warn("只能解析当前文件的引用");
            } else {
                let referSchema = null;
                ref = ref.replace("#/").split("/");
                ref.forEach(val => {
                    referSchema = openApiDocInfo[val];
                })
                console.log(referSchema)
            }
        } else if (formDataContent) {
            const schema = formDataContent.schema;
            let ref = schema.$ref; //注意：ref可能存在多种引用，只解析当前文件的引用(eg: #/components/schemas/Pet)
            if (!ref.startsWith("#")) {
                console.warn("只能解析当前文件的引用");
            } else {
                let referSchema = null;
                ref = ref.replace("#/").split("/");
                ref.forEach(val => {
                    referSchema = openApiDocInfo[val];
                })
                console.log(referSchema)
            }
        } else { //统一处理为application/json
            console.warn(`无法处理的请求类型${content}`)
        }
        console.log("schema", requestBody, openApiDocInfo)
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