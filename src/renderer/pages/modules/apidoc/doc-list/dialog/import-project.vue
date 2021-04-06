/*
    创建者：shuxiaokai
    创建时间：2021-04-05 21:21"
    模块名称：导入项目
    备注：xxxx
*/
<template>
    <s-dialog title="导入生成项目" :isShow="visible" class="import-doc" @close="handleClose">
        <el-form ref="form" :model="formInfo" :rules="rules" label-width="100px">
            <el-form-item label="支持类型：">
                <span>摸鱼文档</span>
                <el-divider direction="vertical"></el-divider>
                <span>postman 2.1</span>
            </el-form-item>
            <el-form-item label="文档导入：">
                <el-upload
                        class="w-100"
                        :limit="1"
                        drag
                        action=""
                        :before-upload="handleBeforeUpload"
                        :http-request="requestHook">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                </el-upload>
            </el-form-item>
            <el-form-item label="项目名称：" prop="projectName">
                <el-input v-model="formInfo.projectName" size="mini" placeholder="请输入项目名称"></el-input>
            </el-form-item>
            <el-form-item label="导入类型：">
                <span class="orange">{{ importType }}</span>
            </el-form-item>
        </el-form>
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
                projectName: "", //项目名称
                type: "moyu", //文档类型
            }, //-------项目信息
            importType: "等待导入",
            loading: false, //-----导入第三方加载效果
            jsonText: "",
            rules: {
                projectName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
            },
        };
    },
    created() {},
    methods: {
        //=====================================图片上传====================================//
        handleBeforeUpload(file) {
            const isJson = file.type === "application/json";
            const isLt10M = file.size / 1024 < 1024 * 5;
            if (!isJson) {
                this.$message.error("只能上传json文件");
            }
            if (!isLt10M) {
                this.$message.error("文件大小不超过5M");
            }
            return isJson && isLt10M;
        },
        requestHook(e) {
            e.file.text().then((jsonText) => {
                try {
                    this.jsonText = JSON.parse(jsonText);
                    this.checkImportType(this.jsonText);
                    console.log(this.jsonText)
                    this.formInfo.projectName = this.jsonText.info.projectName;
                } catch (error) {
                    console.error(error);
                    this.importType = "未知类型，无法解析";
                }
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
                    moyuData = this.convertPostmanData(this.jsonText);
                } else if (this.formInfo.type === "moyu") {
                    moyuData = this.convertMoyuData(this.jsonText);
                }
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        const params = {
                            moyuData,
                            projectName: this.formInfo.projectName,
                        };
                        this.axios.post("/api/project/import", params).then((res) => {
                            this.$emit("success", {
                                id: res.data.id,
                                name: res.data.name,
                            });
                            this.handleClose();
                        }).catch((err) => {
                            this.$errorThrow(err, this);
                        }).finally(() => {
                            this.loading = false;
                        });
                    } else {
                        this.$nextTick(() => document.querySelector(".el-form-item.is-error input")?.focus());
                        this.$message.warning("请完善必填信息");
                        this.loading = false;
                    }
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
                this.importType = "未知类型，无法解析";
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
