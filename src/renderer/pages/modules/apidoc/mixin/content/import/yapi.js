/*
|--------------------------------------------------------------------------
| 转换Yapi格式数据
|--------------------------------------------------------------------------
*/
import { uuid } from "@/lib"
import mixin from "../../index"

const TYPE_ENUM = { //参数类型映射
    integer: "number",
    long: "number",
    float: "number",
    number: "number",
    double: "number",
    string: "string",
    byte: "string",
    binary: "string",
    boolean: "boolean",
    date: "string",
    dateTime: "string",
    object: "object",
    array: "array",
};

class YapiTranslator {
    constructor(projectId) {
        if (!projectId) {
            throw new Error("缺少项目id");
        }
        this.projectId = projectId; //项目id
    }

    //转换Yapi
    // eslint-disable-next-line class-methods-use-this
    convertYapiData(data) {
        const moyuDoc = {
            info: {},
            rules: {},
            docs: [],
            hosts: [],
        };
        data.forEach((folderInfo) => { //yapi不支持嵌套，第一层为文件夹
            const folder = this.generateDoc();
            const id = uuid();
            folder._id = id;
            delete folder.item;
            folder.isFolder = true;
            folder.info.name = folderInfo.name;
            folder.info.description = folderInfo.desc;
            folder.info.type = "folder";
            moyuDoc.docs.push(folder);
            folderInfo.list.forEach((docInfo) => {
                const doc = this.generateDoc();
                doc._id = uuid();
                doc.pid = id;
                doc.sort = Date.now();
                doc.info.name = docInfo.title;
                doc.info.type = "api";
                doc.info.description = docInfo.desc;
                doc.item.method = docInfo.method.toLowerCase();
                //=====================================参数转换====================================//
                //query参数
                docInfo.req_query.forEach((queryParams) => {
                    const property = mixin.methods.generateProperty();
                    property.key = queryParams.name;
                    property.description = queryParams.desc;
                    property.value = queryParams.example;
                    doc.item.queryParams.push(property);
                })
                if (docInfo.req_body_type === "json") { //json参数
                    doc.item.contentType = "application/json";
                    doc.item.requestBody = this.convertSchema(JSON.parse(docInfo.req_body_other));
                } else if (docInfo.req_body_type === "form") { //form表单参数
                    doc.item.contentType = "application/x-www-form-urlencoded";
                    docInfo.req_body_form.forEach((requestBody) => {
                        const property = mixin.methods.generateProperty();
                        property.key = requestBody.name;
                        property.description = requestBody.desc;
                        property.value = requestBody.example;
                        doc.item.requestBody.push(property);
                    })
                } else if (docInfo.req_body_type === "file") { //file
                    doc.item.contentType = "text/plain";
                    const property = mixin.methods.generateProperty();
                    property.value = docInfo.req_body_other
                    doc.item.responseParams = [property];
                } else if (docInfo.req_body_type === "raw") { //raw
                    doc.item.contentType = "text/plain";
                    const property = mixin.methods.generateProperty();
                    property.value = docInfo.req_body_other
                    doc.item.responseParams = [property];
                }
                //返回参数
                if (docInfo.res_body_type === "json" && docInfo.res_body) {
                    doc.item.responseParams = [{
                        title: "成功返回",
                        statusCode: "200",
                        values: this.convertSchema(JSON.parse(docInfo.res_body)),
                    }];
                }
                //请求头
                docInfo.req_headers.forEach((header) => {
                    const property = mixin.methods.generateProperty();
                    property.key = header.name;
                    property.description = header.desc;
                    property.value = header.example;
                    doc.item.headers.push(property);
                })
                moyuDoc.docs.push(doc);
            });
        })
        return moyuDoc;
    }

    /**
     * @description        转换schema
     * @author             shuxiaokai
     * @create             2021-04-09 10:20
     * @return {String}    返回字符串
     */
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
                    params.value = schema.example || schema.default;
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

    //生成一个文档
    generateDoc() {
        return {
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
                tag: {}, //标签信息
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

export default YapiTranslator;
