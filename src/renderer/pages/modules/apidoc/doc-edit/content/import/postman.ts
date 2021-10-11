/*
|--------------------------------------------------------------------------
| 转换postman格式数据
|--------------------------------------------------------------------------
*/
import { uuid } from "@/helper/index"
import { apidocGenerateProperty, apidocGenerateApidoc } from "@/helper/index"

class PostmanTranslator {
    public projectId: string;
    public variables: { key: string, value: string }[];
    public postmanData: any;
    constructor(projectId: string, data) {
        this.projectId = projectId; //项目id
        this.variables = [];
        this.postmanData = data; //openapi数据
    }

    //转换变量
    convertVariable(val: string): string {
        if (val == null) {
            return "";
        }
        const matchedData = val.toString().match(/{{\s*(\w+)\s*}}/);
        if (val && matchedData) {
            const varInfo = this.variables.find((v) => v.key === matchedData[1]);
            console.log(varInfo, this.variables, matchedData[1])
            if (varInfo) {
                return val.replace(/{{\s*(\w+)\s*}}/, varInfo.value);
            }
            return val;
        }
        return val;
    }

    //转换postman
    convertPostmanData(postmanData) {
        this.getVariables(postmanData);
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
                const { request, response } = element;
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
                    const host = request.url.host ? request.url.host[0] : ""; //只取第一个
                    doc._id = id;
                    doc.isFolder = false;
                    doc.info.name = element.name;
                    doc.info.type = "api";
                    doc.pid = pid;
                    doc.item.method = request.method.toLowerCase();
                    doc.item.url.host = this.convertVariable(host);
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
                    // if (response && response.length > 0) { //返回参数
                    //     doc.item.responseParams = response.map((val) => {
                    //         const singleProperty = mixin.methods.generateProperty();
                    //         delete singleProperty._id;
                    //         singleProperty.key = val.key;
                    //         singleProperty.value = val.value;
                    //         singleProperty.description = val.description;
                    //         return {
                    //             title: val.name,
                    //             values: [],
                    //         };
                    //     });
                    // }
                    console.log(response)
                    moyuDoc.docs.push(doc);
                }
            }
        }
        foo(postmanData.item);
        return moyuDoc;
    }

    //获取所有变量信息
    getVariables(postmanData) {
        const { variable } = postmanData;
        variable?.forEach((v) => {
            this.variables.push({
                ...v,
            })
        })
    }
}

export default PostmanTranslator;
