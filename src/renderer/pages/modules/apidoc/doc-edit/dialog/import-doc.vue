/*
    创建者：shuxiaokai
    创建时间：2020-07-20 11:21"
    模块名称：导入第三方文档
    备注：xxxx
*/
<template>
    <s-dialog title="导入第三方文档" :is-show="visible" class="import-doc" @close="handleClose">
        <div class="mb-5">
            <span>文档类型：</span>
            <el-radio-group v-model="formInfo.type">
                <el-radio label="moyu">摸鱼文档</el-radio>
                <el-radio label="postman">postman 2.1</el-radio>
            </el-radio-group>
        </div>
        <div class="mb-5">
            <span>导入方式：</span>
            <el-radio-group v-model="formInfo.cover" size="mini">
                <el-radio-button :label="false">追加方式</el-radio-button>
                <el-radio-button :label="true">覆盖方式</el-radio-button>
            </el-radio-group>
        </div>
        <div class="mb-5">
            <span>导入文档类型：</span>
            <span class="orange">{{ importType }}</span>
        </div>
        <el-upload
            class="w-100"
            :limit="1"
            drag
            action=""
            :before-upload="handleBeforeUpload"
            :http-request="requestHook"
        >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
        <div slot="footer">
            <el-button :loading="loading" size="mini" type="primary" @click="handleSubmit">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </div>
    </s-dialog>
</template>

<script>
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数

export default {
    mixins: [mixin],
    props: {
        visible: { //弹窗是否显示
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            formInfo: {
                type: "moyu",
                cover: false,
            }, //-------项目信息
            importType: "",
            loading: false, //-----导入第三方加载效果
            jsonText: "",
        };
    },
    created() {},
    methods: {
        //=====================================图片上传====================================//
        handleBeforeUpload(file) {
            const isJson = file.type === "application/json";
            const isLt10M = file.size / 1024 < 1024 * 10;
            if (!isJson) {
                this.$message.error("只能上传json文件");
            }
            if (!isLt10M) {
                this.$message.error("文件大小不超过1M");
            }
            return isJson && isLt10M;
        },
        requestHook(e) {
            e.file.text().then((jsonText) => {
                this.jsonText = jsonText;
                this.checkImportType(JSON.parse(this.jsonText));
            });
        },
        //=====================================原始数据转换====================================//
        //=====================================组件间交互====================================//
        handleSubmit() {
            this.loading = true;
            let moyuData = null;
            try {
                if (!this.jsonText) {
                    throw new Error("导入数据不能为空");
                }
                if (this.formInfo.type === "postman") {
                    moyuData = this.convertPostmanData(JSON.parse(this.jsonText));
                } else if (this.formInfo.type === "moyu") {
                    moyuData = this.convertMoyuData(JSON.parse(this.jsonText));
                }
                const params = {
                    projectId: this.$route.query.id,
                    cover: this.formInfo.cover,
                    moyuData,
                };
                this.axios.post("/api/project/import/moyu", params).then(() => {
                    this.$emit("success");
                    this.handleClose();
                }).catch((err) => {
                    this.$errorThrow(err, this);
                }).finally(() => {
                    this.loading = false;
                });
            } catch (error) {
                this.$message.warning(error.message);
                this.loading = false;
            }
        },
        //检查导入数据类型
        checkImportType(data) {
            if (data.type === "moyu") {
                this.importType = "moyu";
                this.formInfo.type = "moyu";
            } else if (data.info._postman_id) {
                this.importType = "postman";
                this.formInfo.type = "postman";
            } else {
                this.importType = "未知类型";
            }
        },
        //转换moyu文档
        convertMoyuData(moyuData) {
            if (moyuData.type !== "moyu") {
                throw new Error("导入文档格式不正确，请选择正确的文档类型进行导入");
            }
            return moyuData;
        },
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
                        const id = this.$helper.uuid();
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
                        const id = this.$helper.uuid();
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
                                    doc.item.requestBody = this.convertTreeDataToPlainParams(JSON.parse(request.body.raw));
                                } else {
                                    console.warn(`暂时无法解析${language}`);
                                    continue;
                                }
                                doc.item.contentType = "application/json";
                            } else if (request.body && request.body.mode === "formdata") {
                                doc.item.requestBody = request.body.formdata.map((val) => {
                                    const singleProperty = this.generateProperty();
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
                                const singleProperty = this.generateProperty();
                                delete singleProperty._id;
                                singleProperty.key = val.key;
                                singleProperty.value = val.value;
                                singleProperty.description = val.description;
                                return singleProperty;
                            });
                        }
                        if (header && header.length > 0) { //header参数
                            doc.item.headers = query.map((val) => {
                                const singleProperty = this.generateProperty();
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
            console.log(moyuDoc)
            return moyuDoc;
        },
        //生成一个文档
        generateDoc() {
            return {
                info: {
                    description: "",
                    name: "",
                    type: "folder",
                },
                item: {
                    url: { host: "", path: "" },
                    method: "get",
                    contentType: "application/json",
                    paths: [],
                    queryParams: [],
                    requestBody: [],
                    responseParams: [
                        {
                            title: "返回参数",
                            statusCode: 200,
                            values: [],
                        },
                    ],
                    headers: [],
                },
                pid: "",
                sort: Date.now(),
                enabled: true,
                projectId: this.$route.query.id,
                isFolder: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        },
        //=====================================其他操作=====================================//
        handleClose() {
            this.$emit("update:visible", false);
        },
    },
};
</script>

<style lang="scss">
.import-doc {
    .el-upload {
        width: 100%;
    }
    .el-upload-dragger {
        width: 100%;
    }
}
</style>
