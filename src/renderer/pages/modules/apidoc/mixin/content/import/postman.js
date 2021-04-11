/*
|--------------------------------------------------------------------------
| 转换postman格式数据
|--------------------------------------------------------------------------
*/
import { uuid } from "@/lib"
import mixin from "../../index"

class PostmanTranslator {
    constructor(projectId) {
        if (!projectId) {
            throw new Error("缺少项目id");
        }
        this.projectId = projectId; //项目id
    }

    //转换postman
    convertPostmanData(postmanData) {
        const moyuDoc = {
            info: {
                projectName: postmanData.info.name,
            },
            rules: {},
            docs: [],
            hosts: [],
        };
        const foo = (data, pid = "") => {
            for (let i = 0; i < data.length; i += 1) {
                const element = data[i];
                const { request } = element;
                if (element.item && element.item.length > 0) { //文件夹
                    const doc = this.generateDoc();
                    const id = uuid();
                    doc._id = id;
                    delete doc.item;
                    doc.isFolder = true;
                    doc.info.name = element.name;
                    doc.info.type = "folder";
                    doc.pid = pid;
                    moyuDoc.docs.push(doc);
                    foo(element.item, id);
                } else { //文档
                    const doc = this.generateDoc();
                    const id = uuid();
                    const query = request.url.query || [];
                    const header = request.header || [];
                    doc._id = id;
                    doc.isFolder = false;
                    doc.info.name = element.name;
                    doc.info.type = "api";
                    doc.pid = pid;
                    doc.item.method = request.method.toLowerCase();
                    doc.item.url.host = request.url.host ? request.url.host[0] : "";
                    doc.item.url.path = request?.url?.path?.join("/");
                    if (request.method.toLowerCase() !== "get") { //get请求不存在body
                        if (request.body && request.body.mode === "raw") {
                            const language = request.body?.options?.raw?.language;
                            if (language === "json") {
                                doc.item.requestBody = mixin.methods.convertTreeDataToPlainParams(JSON.parse(request.body.raw));
                            } else {
                                console.warn(`暂时无法解析${language}`);
                                continue;
                            }
                            doc.item.contentType = "application/json";
                        } else if (request.body && request.body.mode === "formdata") {
                            doc.item.requestBody = request.body.formdata.map((val) => {
                                const singleProperty = mixin.methods.generateProperty();
                                delete singleProperty._id;
                                singleProperty.key = val.key;
                                singleProperty.type = val.type === "text" ? "string" : "file";
                                singleProperty.value = val.value;
                                return singleProperty;
                            });
                            doc.item.contentType = "multipart/form-data";
                        }
                    }
                    if (query && query.length > 0) { //query参数
                        doc.item.queryParams = query.map((val) => {
                            const singleProperty = mixin.methods.generateProperty();
                            delete singleProperty._id;
                            singleProperty.key = val.key;
                            singleProperty.value = val.value;
                            singleProperty.description = val.description;
                            return singleProperty;
                        });
                    }
                    if (header && header.length > 0) { //header参数
                        doc.item.headers = query.map((val) => {
                            const singleProperty = mixin.methods.generateProperty();
                            delete singleProperty._id;
                            singleProperty.key = val.key;
                            singleProperty.value = val.value;
                            singleProperty.description = val.description;
                            return singleProperty;
                        });
                    }
                    moyuDoc.docs.push(doc);
                }
            }
        }
        foo(postmanData.item);
        return moyuDoc;
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

export default PostmanTranslator;
