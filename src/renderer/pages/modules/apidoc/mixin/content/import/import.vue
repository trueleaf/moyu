/*
    创建者：shuxiaokai
    创建时间：2021-04-09 22:48
    模块名称：
    备注：
*/
<template>
    <div class="doc-import">
        <s-fieldset title="支持：Postman、摸鱼文档、Swagger/OpenApi 3.0">
            <el-upload
                    class="w-100"
                    drag
                    action=""
                    :show-file-list="false"
                    :before-upload="handleBeforeUpload"
                    :http-request="requestHook">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div slot="tip" class="mt-2">
                    <div v-if="importTypeInfo.name" class="orange">
                        <span>文档类型：</span>
                        <span>{{ importTypeInfo.name }}</span>
                        <span v-if="importTypeInfo.version">({{ importTypeInfo.version }})</span>
                    </div>
                </div>
            </el-upload>
        </s-fieldset>
        <s-fieldset title="额外配置">
            <div>
                <s-config :has-check="false" label="导入方式" description="请谨慎选择导入方式">
                    <el-radio-group v-model="formInfo.cover" size="mini" @change="handleChangeImportType">
                        <el-radio :label="false">追加方式</el-radio>
                        <el-radio :label="true">覆盖方式</el-radio>
                    </el-radio-group>
                </s-config>
                <s-config label="目标目录" description="不选择目标目录则默认为根目录">
                    <template slot-scope="scope">
                        <div v-show="scope.enabled" class="doc-nav">
                            <el-tree
                                    ref="docTree"
                                    :data="navTreeData"
                                    node-key="_id"
                                    show-checkbox
                                    @check-change="handleCheckChange"
                                    :expand-on-click-node="true"
                            >
                                <template slot-scope="scope">
                                    <div
                                            class="custom-tree-node"
                                            tabindex="0"
                                            slot="reference"
                                            @keydown.stop="handleKeydown($event, scope.data)"
                                            @keyup.stop="handleKeyUp($event, scope.data)"
                                    >
                                        <!-- file渲染 -->
                                        <template v-if="!scope.data.isFolder">
                                            <template v-for="(req) in validRequestMethods">
                                                <span v-if="scope.data.method === req.value.toLowerCase()" :key="req.name" class="label" :style="{color: req.iconColor}">{{ req.name.toLowerCase() }}</span>
                                            </template>
                                            <span class="node-name ml-1">{{ scope.data.name }}</span>
                                        </template>
                                        <!-- 文件夹渲染 -->
                                        <template v-if="scope.data.isFolder">
                                            <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px"/>
                                            <span :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
                                        </template>
                                    </div>
                                </template>
                            </el-tree>
                        </div>
                    </template>
                </s-config>
            </div>
        </s-fieldset>
    </div>
</template>

<script>
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数
import jsyaml from "js-yaml"
import OpenApiTranslator from "./open-api-translator"
import yamlJsonData from "./data"

export default {
    mixins: [mixin],
    data() {
        return {
            //=====================================业务参数====================================//
            formInfo: {
                type: "",
                cover: false,
            }, //-------项目信息
            importTypeInfo: {
                name: "",
                version: "",
            },
            jsonText: "",
            fileType: "", //-------文件类型
            //=====================================其他参数====================================//
            loading: false, //-----确认按钮
        };
    },
    computed: {
        navTreeData() { //-------树形导航数据
            return this.$store.state.apidoc.banner;
        },
        validRequestMethods() {
            return this.$store.state.apidocRules.requestMethods.filter((val) => val.enabled);
        },
    },
    created() {},
    methods: {
        //=====================================文件上传====================================//
        //检查文件格式
        handleBeforeUpload(file) {
            const standerFileType = file.type;
            const suffixFileType = file.name.match(/(?<=\.)[^.]+$/) ? file.name.match(/(?<=\.)[^.]+$/)[0] : "";
            this.fileType = standerFileType || suffixFileType;
            if (!standerFileType && !suffixFileType) {
                this.$message.error("未知的文件格式，无法解析");
                return false;
            }
            if (this.fileType !== "application/json" && this.fileType !== "yaml") {
                this.$message.error("仅支持JSON格式或者YAML格式文件");
                return false;
            }
            if (file.size > this.config.renderConfig.import.size) {
                this.$message.error(`文件大小不超过${this.config.renderConfig.import.size / 1024 / 1024}M`);
                return false;
            }
            return true;
        },
        //自定义上传成功操作
        requestHook(e) {
            this.openApiTranslatorInstance = new OpenApiTranslator(this.$route.query.id);
            e.file.text().then((fileStr) => {
                if (this.fileType === "yaml") {
                    this.jsonText = jsyaml.load(fileStr);
                    const docs = this.openApiTranslatorInstance.convertToMoyuDocs(yamlJsonData);
                    console.log(docs)
                } else {
                    this.jsonText = JSON.parse(fileStr)
                }
                this.getImportFileTypeInfo();
            }).catch((err) => {
                console.error(err);
            });
        },
        //检查导入数据类型
        getImportFileTypeInfo() {
            if (this.jsonText.type === "moyu") {
                this.importTypeInfo.name = "moyu";
                this.formInfo.type = "moyu";
            } else if (this.jsonText.info._postman_id) {
                this.importTypeInfo.name = "postman";
                this.importTypeInfo.version = "postman";
                this.formInfo.type = "postman";
            } else if (this.jsonText.openapi) {
                this.importTypeInfo.name = "openapi";
                this.importTypeInfo.version = this.jsonText.openapi;
                this.formInfo.type = "openapi";
            } else if (this.jsonText.swagger) {
                this.importTypeInfo.name = "swagger";
                this.importTypeInfo.version = this.jsonText.swagger;
                this.formInfo.type = "swagger";
            } else {
                this.importTypeInfo.name = "未知类型";
            }
        },
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
        //=========================================================================//
        handleChangeImportType(val) {
            if (val) {
                this.$confirm("覆盖后的数据很难还原", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                }).catch((err) => {
                    if (err === "cancel" || err === "close") {
                        this.formInfo.cover = false;
                        return;
                    }
                    this.$errorThrow(err, this);
                });
            }
            console.log(val)
        },
        //节点选中状态改变时候
        handleCheckChange() {
            const checkedNodes = this.$refs.docTree.getCheckedNodes();
            const halfCheckedNodes = this.$refs.docTree.getHalfCheckedNodes();
            this.allCheckedNodes = checkedNodes.concat(halfCheckedNodes);
        },
        test() {
            this.openApiTranslatorInstance = new OpenApiTranslator(this.$route.query.id);
            const docs = this.openApiTranslatorInstance.convertToMoyuDocs(yamlJsonData);
            console.log(docs)
        },
    },
};
</script>

<style lang="scss">
.doc-import {
    overflow-y: auto;
    height: calc(100vh - #{size(120)});
    width: 70%;
    min-width: size(768);
    margin: 0 auto;
    .el-upload {
        width: 100%;
    }
    .el-upload-dragger {
        width: 100%;
    }
    .doc-nav {
        .custom-tree-node {
            @include custom-tree-node;
        }
    }
}
</style>
