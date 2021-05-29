/*
    创建者：shuxiaokai
    创建时间：2021-04-09 22:48
    模块名称：
    备注：
*/
<template>
    <div class="doc-import">
        <!-- 文件选择 -->
        <s-fieldset title="支持：Yapi、Postman、摸鱼文档、Swagger/OpenApi 3.0">
            <el-upload
                class="w-100"
                drag
                action=""
                :show-file-list="false"
                :before-upload="handleBeforeUpload"
                :http-request="requestHook"
            >
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
        <!-- 导入数据预览 -->
        <s-fieldset title="导入数据预览">
            <div>
                <s-label-value label="文档数：" label-width="auto" class="mr-4">{{ formInfo.moyuData.docs.filter((v) => !v.isFolder).length }}</s-label-value>
                <s-label-value label="文件夹数：" label-width="auto">{{ formInfo.moyuData.docs.filter((v) => v.isFolder).length }}</s-label-value>
            </div>
            <el-tree
                ref="docTree"
                :data="previewNavTreeData"
                node-key="_id"
                :expand-on-click-node="true"
            >
                <template slot-scope="scope">
                    <div
                        slot="reference"
                        class="custom-tree-node"
                        tabindex="0"
                    >
                        <!-- 文件夹渲染 -->
                        <template v-if="scope.data.isFolder">
                            <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px" />
                            <span :title="scope.data.info.name" class="node-name text-ellipsis ml-1">{{ scope.data.info.name }}</span>
                        </template>
                        <!-- file渲染 -->
                        <template v-if="!scope.data.isFolder">
                            <template v-for="(req) in validRequestMethods">
                                <span v-if="scope.data.item.method === req.value.toLowerCase()" :key="req.name" class="label" :style="{color: req.iconColor}">{{ req.name.toLowerCase() }}</span>
                            </template>
                            <span>{{ scope.data.info.name }}</span>
                        </template>
                    </div>
                </template>
            </el-tree>
        </s-fieldset>
        <!-- 额外配置信息 -->
        <s-fieldset title="额外配置">
            <div>
                <s-config
                    v-if="formInfo.type === 'openapi' || formInfo.type === 'swagger'"
                    :has-check="false"
                    label="文件夹命名方式"
                    description="none代表不存在文件夹，所有节点扁平放置"
                >
                    <el-radio-group v-model="openapiFolderNamedType" size="mini" @change="handleChangeNamedType">
                        <el-radio label="tag">Tag</el-radio>
                        <el-radio label="url">Url</el-radio>
                        <el-radio label="none">none</el-radio>
                    </el-radio-group>
                </s-config>
                <s-config :has-check="false" label="导入方式" description="请谨慎选择导入方式">
                    <el-radio-group v-model="formInfo.cover" size="mini" @change="handleChangeIsCover">
                        <el-radio :label="false">追加方式</el-radio>
                        <el-radio :label="true">覆盖方式</el-radio>
                    </el-radio-group>
                </s-config>
                <s-config label="目标目录" description="选择需要挂载的节点，不选择则默认挂载到根目录" @change="handleToggleTargetFolder">
                    <template slot-scope="prop">
                        <s-loading :loading="loading2">
                            <div v-show="prop.enabled" class="doc-nav">
                                <el-tree
                                    ref="docTree"
                                    :data="navTreeData"
                                    node-key="_id"
                                    show-checkbox
                                    :expand-on-click-node="true"
                                    :check-strictly="true"
                                    @check="handleCheckChange"
                                >
                                    <template slot-scope="scope">
                                        <div
                                            slot="reference"
                                            class="custom-tree-node"
                                            tabindex="0"
                                        >
                                            <!-- 文件夹渲染 -->
                                            <template>
                                                <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px" />
                                                <span :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
                                            </template>
                                        </div>
                                    </template>
                                </el-tree>
                            </div>
                        </s-loading>
                    </template>
                </s-config>
            </div>
            <div class="d-flex j-center mt-2">
                <el-button :loading="loading" size="mini" type="primary" @click="handleSubmit">确定导入</el-button>
            </div>
        </s-fieldset>
    </div>
</template>

<script>
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数
import jsyaml from "js-yaml"
import OpenApiTranslator from "./openapi"
import PostmanTranslator from "./postman"
import YAPITranslator from "./yapi"

export default {
    mixins: [mixin],
    data() {
        return {
            //=====================================业务参数====================================//
            formInfo: {
                moyuData: {
                    docs: [],
                },
                type: "",
                cover: false,
            }, //-------项目信息
            importTypeInfo: {
                name: "",
                version: "",
            },
            jsonText: "", //-------读取文件的json数据
            fileType: "", //-------文件类型
            navTreeData: [], //文档树数据
            currentMountedNode: null, //当前选中挂载节点
            //openapi
            openapiFolderNamedType: "tag", //tag、url、none
            //=====================================其他参数====================================//
            loading: false, //-----确认按钮
            loading2: false, //----目标节点菜单
        };
    },
    computed: {
        validRequestMethods() {
            return this.$store.state.apidocRules.requestMethods.filter((val) => val.enabled);
        },
        previewNavTreeData() { //导入数据预览
            const docs = this.formInfo.moyuData?.docs || [];
            const result = [];
            for (let i = 0; i < docs.length; i += 1) {
                const docInfo = docs[i];
                if (!docInfo.pid) { //根元素
                    docInfo.children = [];
                    result.push(docInfo);
                }
                const id = docInfo._id.toString();
                for (let j = 0; j < docs.length; j += 1) {
                    if (id === docs[j].pid) { //项目中新增的数据使用标准id
                        if (docInfo.children == null) {
                            docInfo.children = [];
                        }
                        docInfo.children.push(docs[j]);
                    }
                }
            }
            return result;
        },
    },
    created() {
    },
    methods: {
        //=====================================文件上传====================================//
        //检查文件格式
        handleBeforeUpload(file) {
            const standerFileType = file.type;
            const suffixFileType = file.name.match(/(?<=\.)[^.]+$/) ? file.name.match(/(?<=\.)[^.]+$/)[0] : "";
            this.fileType = standerFileType || suffixFileType;
            // console.log("文件类型", this.fileType, standerFileType, suffixFileType)
            if (!standerFileType && !suffixFileType) {
                this.$message.error("未知的文件格式，无法解析");
                return false;
            }
            if (this.fileType !== "application/json" && this.fileType !== "yaml" && this.fileType !== "application/x-yaml") {
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
            e.file.text().then((fileStr) => {
                if (this.fileType === "yaml" || this.fileType === "application/x-yaml") {
                    this.jsonText = jsyaml.load(fileStr);
                } else {
                    this.jsonText = JSON.parse(fileStr)
                }
                this.getImportFileInfo();
            }).catch((err) => {
                console.error(err);
            });
        },
        //检查导入数据类型
        getImportFileInfo() {
            this.openApiTranslatorInstance = new OpenApiTranslator(this.$route.query.id);
            this.postmanTranslatorInstance = new PostmanTranslator(this.$route.query.id);
            this.yapiTranslatorInstance = new YAPITranslator(this.$route.query.id);
            const isArray = Array.isArray(this.jsonText);
            const firstEl = isArray ? this.jsonText[0] : null;
            const isYapi = firstEl && firstEl.add_time && firstEl.up_time;
            if (this.jsonText.type === "moyu") {
                this.importTypeInfo.name = "moyu";
                this.formInfo.type = "moyu";
                this.formInfo.moyuData = this.jsonText;
            } else if (this.jsonText.info?._postman_id) {
                this.importTypeInfo.name = "postman";
                this.importTypeInfo.version = "postman";
                this.formInfo.type = "postman";
                this.formInfo.moyuData = this.postmanTranslatorInstance.convertPostmanData(this.jsonText);
            } else if (this.jsonText.openapi) {
                this.importTypeInfo.name = "openapi";
                this.importTypeInfo.version = this.jsonText.openapi;
                this.formInfo.type = "openapi";
                this.formInfo.moyuData = this.openApiTranslatorInstance.convertToMoyuDocs(this.jsonText, { folderNamedType: this.openapiFolderNamedType });
            } else if (this.jsonText.swagger) {
                this.importTypeInfo.name = "swagger";
                this.importTypeInfo.version = this.jsonText.swagger;
                this.formInfo.type = "swagger";
                this.formInfo.moyuData = this.openApiTranslatorInstance.convertToMoyuDocs(this.jsonText, { folderNamedType: this.openapiFolderNamedType });
            } else if (isYapi) {
                this.importTypeInfo.name = "yapi";
                this.formInfo.type = "yapi";
                this.formInfo.moyuData = this.yapiTranslatorInstance.convertYapiData(this.jsonText);
            } else {
                this.importTypeInfo.name = "未知类型";
            }
        },
        //=====================================组件间交互====================================//
        //确定导入
        handleSubmit() {
            try {
                this.loading = true;
                if (!this.formInfo.moyuData.docs) {
                    this.$message.warning("请选择需要导入的文件");
                    return;
                }
                const mountedId = this.currentMountedNode?._id;
                const docs = this.formInfo.moyuData.docs.map((val) => ({
                    ...val,
                    pid: val.pid || mountedId,
                }))
                const params = {
                    projectId: this.$route.query.id,
                    cover: this.formInfo.cover,
                    moyuData: {
                        ...this.formInfo.moyuData,
                        docs,
                    },
                };
                // console.log(params, JSON.parse(JSON.stringify(this.formInfo.moyuData)))
                this.axios.post("/api/project/import/moyu", params).then(() => {
                    this.$event.emit("apidoc/importDocSuccess");
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
        //是否导入到特定文件夹
        handleToggleTargetFolder(val) {
            this.currentMountedNode = null;
            if (val) {
                this.loading2 = true;
                const params = {
                    projectId: this.$route.query.id,
                };
                this.axios.get("/api/project/doc_tree_folder_node", { params }).then((res) => {
                    this.navTreeData = res.data;
                }).catch((err) => {
                    console.error(err);
                }).finally(() => {
                    this.loading2 = false;
                });
            }
        },
        //=======================================其他操作==================================//
        //改变导入方式，如果为覆盖类型提醒用户
        handleChangeIsCover(val) {
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
            // console.log(val)
        },
        //节点选中状态改变时候
        handleCheckChange(data, checkNode) {
            this.$refs.docTree.setCheckedKeys([]);
            if (checkNode.checkedKeys.length > 0) {
                this.$refs.docTree.setCheckedKeys([data._id]);
            }
            this.currentMountedNode = data;
        },
        //改变命名方式
        handleChangeNamedType() {
            this.formInfo.moyuData = this.openApiTranslatorInstance.convertToMoyuDocs(this.jsonText, {
                folderNamedType: this.openapiFolderNamedType,
            });
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
    .custom-tree-node {
        @include custom-tree-node;
    }
}
</style>
