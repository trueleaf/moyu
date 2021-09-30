/*
    创建者：shuxiaokai
    创建时间：2021-09-28 22:00
    模块名称：导入文档
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
                <template #tip>
                    <div class="mt-2">
                        <div v-if="importTypeInfo.name" class="orange">
                            <span>文档类型：</span>
                            <span>{{ importTypeInfo.name }}</span>
                            <span v-if="importTypeInfo.version">({{ importTypeInfo.version }})</span>
                        </div>
                    </div>
                </template>
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
                <template #default="scope">
                    <div
                        class="custom-tree-node"
                        tabindex="0"
                    >
                        <!-- file渲染 -->
                        <template v-if="!scope.data.isFolder">
                            <template v-for="(req) in projectInfo.rules.requestMethods">
                                <span v-if="scope.data.method.toLowerCase() === req.value.toLowerCase()" :key="req.name" class="file-icon" :style="{color: req.iconColor}">{{ req.name }}</span>
                            </template>
                            <div class="node-label-wrap">
                                <s-emphasize class="node-top" :title="scope.data.name" :value="scope.data.name"></s-emphasize>
                            </div>
                        </template>
                        <!-- 文件夹渲染 -->
                        <template v-if="scope.data.isFolder">
                            <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
                            <div class="node-label-wrap">
                                <s-emphasize class="node-top" :title="scope.data.name" :value="scope.data.name"></s-emphasize>
                            </div>
                        </template>
                    </div>
                </template>
            </el-tree>
        </s-fieldset>
        <!-- 额外配置信息 -->
        <s-fieldset v-if="!importAsProject" title="额外配置">
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
                    <template #default="prop">
                        <s-loading :loading="loading2">
                            <div v-show="prop.enabled" class="doc-nav">
                                <el-tree
                                    ref="docTree2"
                                    :data="navTreeData"
                                    node-key="_id"
                                    show-checkbox
                                    :expand-on-click-node="true"
                                    :check-strictly="true"
                                    @check="handleCheckChange"
                                >
                                    <template #default="scope">
                                        <div
                                            class="custom-tree-node"
                                            tabindex="0"
                                        >
                                            <!-- 文件夹渲染 -->
                                            <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px" />
                                            <span :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
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
        <!-- <template v-if="importAsProject">
            <el-form ref="form" :model="formInfo" label-width="80px" class="mt-3">
                <el-form-item label="项目名称">
                    <el-input v-model="projectName" name="name" size="mini" placeholder="请输入项目名称" class="w-100" maxlength="100" clearable></el-input>
                </el-form-item>
            </el-form>
            <div class="d-flex j-center mt-2">
                <el-button :loading="loading" size="mini" type="primary" @click="handleSubmitAsProject">确定导入</el-button>
            </div>
        </template> -->
    </div>
</template>

<script lang="ts" setup>
import { ref, Ref, computed } from "vue"
import jsyaml from "js-yaml"
import { ElMessage, ElMessageBox } from "element-plus";
import { TreeNodeOptions } from "element-plus/packages/components/tree/src/tree.type"
import OpenApiTranslator from "./openapi";
import config from "@/../config/config"
import { store } from "@/store/index";
import { router } from "@/router/index"
import { axios } from "@/api/api"
import type { OpenAPIV3 } from "openapi-types";
import type { ApidocBanner } from "@@/global"
// import type Node from "element-plus/packages/components/tree/src/model/node"
type FormInfo = {
    moyuData: {
        docs: ApidocBanner[]
    },
    type: string,
    cover: boolean
}

/*
|--------------------------------------------------------------------------
| 基本数据信息
|--------------------------------------------------------------------------
|
*/
defineProps({
    //是否直接导出为项目
    importAsProject: {
        type: Boolean,
        default: false,
    }
})
const projectId = router.currentRoute.value.query.id as string;
//目标树
const docTree2: Ref<TreeNodeOptions["store"] | null> = ref(null);
//按钮加载效果
const loading = ref(false);
//目标节点菜单
const loading2 = ref(false);
//项目基本信息
const projectInfo = computed(() => {
    return store.state["apidoc/baseInfo"];
});
//openapi文件夹格式
const openapiFolderNamedType: Ref<"tag" | "url" | "none"> = ref("tag");
const formInfo: Ref<FormInfo> = ref({
    moyuData: {
        docs: [],
    },
    type: "",
    cover: false,
});
const importTypeInfo = ref({
    name: "",
    version: "",
});
const jsonText: Ref<OpenAPIV3.Document | string> = ref("");
const fileType = ref("");
const navTreeData = ref([]);
const currentMountedNode: Ref<ApidocBanner | null> = ref(null);
/*
|--------------------------------------------------------------------------
| 文件选择
|--------------------------------------------------------------------------
|
*/
//检查文件格式和文件大小
const handleBeforeUpload = (file: File) => {
    const standerFileType = file.type; //标准类型
    const matchSuffix = file.name.match(/(?<=\.)[^.]+$/); //根据后缀获取类型
    const suffixFileType = matchSuffix ? matchSuffix[0] : "";
    fileType.value = standerFileType || suffixFileType;
    if (!standerFileType && !suffixFileType) {
        ElMessage.error("未知的文件格式，无法解析");
        return false;
    }
    if (fileType.value !== "application/json" && fileType.value !== "yaml" && fileType.value !== "application/x-yaml") {
        ElMessage.error("仅支持JSON格式或者YAML格式文件");
        return false;
    }
    if (file.size > config.renderConfig.import.size) {
        ElMessage.error(`文件大小不超过${config.renderConfig.import.size / 1024 / 1024}M`);
        return false;
    }
    return true;
}
//上传成功读取文件内容
const requestHook = (e: { file: File }) => {
    e.file.text().then((fileStr) => {
        if (fileType.value === "yaml" || fileType.value === "application/x-yaml") {
            jsonText.value = jsyaml.load(fileStr) as OpenAPIV3.Document;
        } else {
            jsonText.value = JSON.parse(fileStr)
        }
        getImportFileInfo();
    }).catch((err) => {
        console.error(err);
    });
}
//获取导入文件信息
const getImportFileInfo = () => {
    const openApiTranslatorInstance = new OpenApiTranslator(projectId, jsonText.value as OpenAPIV3.Document);
    console.log(openApiTranslatorInstance.getDocsInfo())
    // this.postmanTranslatorInstance = new PostmanTranslator(this.$route.query.id);
    // this.yapiTranslatorInstance = new YAPITranslator(this.$route.query.id);
    // const isArray = Array.isArray(this.jsonText);
    // const firstEl = isArray ? this.jsonText[0] : null;
    // const isYapi = firstEl && firstEl.add_time && firstEl.up_time;
    // if (this.jsonText.type === "moyu") {
    //     this.importTypeInfo.name = "moyu";
    //     this.formInfo.type = "moyu";
    //     this.formInfo.moyuData = this.jsonText;
    // } else if (this.jsonText.info?._postman_id) {
    //     this.importTypeInfo.name = "postman";
    //     this.importTypeInfo.version = "postman";
    //     this.formInfo.type = "postman";
    //     this.formInfo.moyuData = this.postmanTranslatorInstance.convertPostmanData(this.jsonText);
    // } else if (this.jsonText.openapi) {
    //     this.importTypeInfo.name = "openapi";
    //     this.importTypeInfo.version = this.jsonText.openapi;
    //     this.formInfo.type = "openapi";
    //     this.formInfo.moyuData = this.openApiTranslatorInstance.convertToMoyuDocs(this.jsonText, { folderNamedType: this.openapiFolderNamedType });
    // } else if (this.jsonText.swagger) {
    //     this.importTypeInfo.name = "swagger";
    //     this.importTypeInfo.version = this.jsonText.swagger;
    //     this.formInfo.type = "swagger";
    //     this.formInfo.moyuData = this.openApiTranslatorInstance.convertToMoyuDocs(this.jsonText, { folderNamedType: this.openapiFolderNamedType });
    // } else if (isYapi) {
    //     this.importTypeInfo.name = "yapi";
    //     this.formInfo.type = "yapi";
    //     this.formInfo.moyuData = this.yapiTranslatorInstance.convertYapiData(this.jsonText);
    // } else {
    //     this.importTypeInfo.name = "未知类型";
    // }
    // this.projectName = this.formInfo.moyuData?.info?.projectName;
}
//导入数据预览
const previewNavTreeData = computed(() => {
    const docs = formInfo.value.moyuData.docs || [];
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
})
/*
|--------------------------------------------------------------------------
| 额外配置信息
|--------------------------------------------------------------------------
|
*/
//改变导入方式，如果为覆盖类型提醒用户
const handleChangeIsCover = (val: boolean) => {
    if (val) {
        ElMessageBox.confirm("覆盖后的数据很难还原", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        }).catch((err) => {
            if (err === "cancel" || err === "close") {
                formInfo.value.cover = false;
                return;
            }
            console.error(err)
        });
    }
}
//节点选中状态改变时候
const handleCheckChange = (data: ApidocBanner, { checkedKeys } : { checkedKeys: ApidocBanner[] }) => {
    docTree2.value?.setCheckedKeys([]);
    if (checkedKeys.length > 0) {
        docTree2.value?.setCheckedKeys([data._id]);
    }
    currentMountedNode.value = data;
}
//改变命名方式
const handleChangeNamedType = () => {
    console.log(2)
    // formInfo.moyuData = openApiTranslatorInstance.convertToMoyuDocs(jsonText, {
    //     folderNamedType: openapiFolderNamedType,
    // });
}
//是否导入到特定文件夹
const handleToggleTargetFolder = (val: boolean) => {
    currentMountedNode.value = null;
    if (val) {
        loading2.value = true;
        const params = {
            projectId,
        };
        axios.get("/api/project/doc_tree_folder_node", { params }).then((res) => {
            navTreeData.value = res.data;
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            loading2.value = false;
        });
    }
}
/*
|--------------------------------------------------------------------------
| 确定导入
|--------------------------------------------------------------------------
|
*/
const handleSubmit = () => {
    console.log(333)
}
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
        display: flex;
        align-items: center;
        width: 100%;
        overflow: hidden;
        height: size(30);
        &:hover {
            .more {
                display: block;
            }
        }
        .file-icon {
            font-size: fz(14);
            margin-right: size(5);
        }
        .folder-icon {
            color: $yellow;
            flex: 0 0 auto;
            width: size(16);
            height: size(16);
            margin-right: size(5);
        }
        .node-label-wrap {
            display: flex;
            flex-direction: column;
            flex: 1;
            overflow: hidden;
            .node-top {
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .node-bottom {
                color: $gray-500;
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
    .el-tree-node__content {
        height: size(30);
        display: flex;
        align-items: center;
    }
    .el-tree-node__content>.el-tree-node__expand-icon {
        transition: none; //去除所有动画
        padding-top: 0;
        padding-bottom: 0;
        margin-top: -1px;
    }
}
</style>
