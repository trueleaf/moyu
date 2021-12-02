/*
    创建者：shuxiaokai
    创建时间：2021-08-30 21:39
    模块名称：返回参数
    备注：
*/
<template>
    <div class="response-params">
        <s-collapse-card v-for="(item, index) in responseData" :key="index" :fold="index !== 0">
            <!-- 操作区域 -->
            <template #head>
                <div class="info-wrap">
                    <div class="label">
                        <div class="d-flex a-center">
                            <span class="flex0">{{ $t("名称") }}：</span>
                            <span v-if="!currentEditNode" class="edit-title">{{ item.title }}</span>
                            <input
                                v-if="currentEditNode && currentEditNode.index === index"
                                :ref="bindRef"
                                v-model="currentEditNode._title"
                                class="edit-input"
                                :class="{error: currentEditNode._title.length === 0}"
                                type="text"
                                :placeholder="$t('不能为空')"
                                @click.stop="() => {}"
                                @keydown.enter="handleConfirmTitle(item, index)"
                            >
                            <span v-if="currentEditNode && currentEditNode.title === item.title" class="ml-1 cursor-pointer theme-color" @click.stop="handleConfirmTitle(item, index)">{{ $t("确定") }}</span>
                            <span v-if="currentEditNode && currentEditNode.title === item.title" class="ml-1 cursor-pointer theme-color" @click.stop="handleCancelEdit">{{ $t("取消") }}</span>
                            <span v-if="!currentEditNode" :title="$t('修改名称')" class="edit-icon el-icon-edit" @click.stop="handleChangeEditNode(item, index)"></span>
                        </div>
                    </div>
                    <!-- 状态码 -->
                    <el-divider direction="vertical"></el-divider>
                    <div class="status-code">
                        <div class="d-flex a-center j-center">
                            <span class="flex0">{{ $t("状态码") }}：</span>
                            <el-popover v-model:visible="statusVisible" width="500px" placement="bottom" trigger="manual">
                                <template #reference>
                                    <span class="cursor-pointer" @click.stop="statusVisible = !statusVisible">
                                        <span v-if="item.statusCode >= 100 && item.statusCode < 200" class="green">{{ item.statusCode }}</span>
                                        <span v-else-if="item.statusCode >= 200 && item.statusCode < 300" class="green">{{ item.statusCode }}</span>
                                        <span v-else-if="item.statusCode >= 300 && item.statusCode < 400" class="orange">{{ item.statusCode }}</span>
                                        <span v-else-if="item.statusCode >= 400 && item.statusCode < 500" class="red">{{ item.statusCode }}</span>
                                        <span v-else class="red">{{ item.statusCode }}</span>
                                        <i class="el-icon-arrow-down el-icon--right"></i>
                                    </span>
                                </template>
                                <s-status @close="statusVisible = false;" @select="handleSelectStatusCode($event, index)"></s-status>
                            </el-popover>
                        </div>
                    </div>
                    <!-- content-type -->
                    <el-divider direction="vertical"></el-divider>
                    <div class="content-type">
                        <div class="d-flex a-center j-center">
                            <span class="flex0">{{ $t("返回格式") }}：</span>
                            <el-popover v-model:visible="mimeVisible" width="500px" placement="bottom" trigger="manual">
                                <template #reference>
                                    <span class="d-flex a-center cursor-pointer" @click.stop="mimeVisible = !mimeVisible">
                                        <el-tooltip :show-after="500" :content="item.value.dataType" placement="top" :effect="Effect.LIGHT">
                                            <span class="type-text text-ellipsis">{{ item.value.dataType }}</span>
                                        </el-tooltip>
                                        <i class="el-icon-arrow-down el-icon--right"></i>
                                    </span>
                                </template>
                                <s-mime @close="mimeVisible = false;" @select="handleSelectContentType($event, index)"></s-mime>
                            </el-popover>
                        </div>
                    </div>
                </div>
            </template>
            <template #tail>
                <div class="d-flex">
                    <div v-if="item.value.dataType === 'application/json'" class="cursor-pointer mr-2" @click="handleOpenImportParams(index)">{{ $t("导入参数") }}</div>
                    <div v-if="index === 0" class="green cursor-pointer mr-2" @click="handleAddResponse">{{ $t("新增") }}</div>
                    <div v-if="responseData.length > 1" class="red cursor-pointer" @click="handleDeleteResponse(index)">{{ $t("删除") }}</div>
                </div>
            </template>
            <!-- 内容展示 -->
            <s-params-tree v-if="checkDisplayType(item.value.dataType) === 'json'" nest :mind-params="mindResponseParams" :data="item.value.json"></s-params-tree>
            <!-- 文本类型 -->
            <div v-else-if="checkDisplayType(item.value.dataType) === 'text'" class="editor-wrap" :class="{ vertical: layout === 'vertical' }">
                <s-raw-editor
                    :model-value="item.value.text"
                    :type="item.value.dataType"
                    class="editor"
                    @update:modelValue="handleChangeTextValeu($event, index)"
                >
                </s-raw-editor>
            </div>
            <!-- <input type="file" :accept="item.value.dataType"> -->
        </s-collapse-card>
        <import-params v-model="importParamsdialogVisible" @success="handleConvertSuccess"></import-params>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, Ref, onMounted, onUnmounted } from "vue"
import { Effect } from "element-plus";
import type { ApidocResponseParams, ApidocProperty, ApidocPropertyType, ApidocResponseContentType } from "@@/global"
import { store } from "@/store/index"
import importParams from "../../dialog/import-params/import-params.vue"
import sStatus from "./children/status.vue"
import sMime from "./children/mime.vue"
import { forEachForest } from "@/helper";

/*
|--------------------------------------------------------------------------
| 编辑操作
|--------------------------------------------------------------------------
|
*/
//当前编辑的节点
const currentEditNode: Ref<null | { title: string, _title: string, index: number }> = ref(null);
//所有输入框
const inputRefs: unknown[] = [];

//ref绑定
const bindRef = (el: unknown) => {
    if (el) {
        inputRefs.push(el);
    }
}
//确定修改title
const handleConfirmTitle = (item: ApidocResponseParams, index: number) => {
    if (currentEditNode.value && currentEditNode.value._title) {
        store.commit("apidoc/apidoc/changeResponseParamsTitleByIndex", {
            index,
            title: currentEditNode.value._title,
        });
        currentEditNode.value = null;
    }
}
//取消编辑
const handleCancelEdit = () => {
    currentEditNode.value = null;
}
//改变当前编辑的节点
const handleChangeEditNode = (item: ApidocResponseParams, index: number) => {
    const value = {
        index,
        title: item.title,
        _title: item.title,
    };
    currentEditNode.value = value;
    setTimeout(() => {
        if (inputRefs[index]) {
            (inputRefs[index] as HTMLInputElement).focus();
        }
    })
}
//改变正在编辑的文本值
const handleChangeTextValeu = (value: string, index: number) => {
    store.commit("apidoc/apidoc/changeResponseParamsTextValueByIndex", {
        index,
        value,
    });
}
/*
|--------------------------------------------------------------------------
| 状态修改、contentType修改、新增response、删除response
|--------------------------------------------------------------------------
|
*/
//新增一个response
const handleAddResponse = () => {
    store.commit("apidoc/apidoc/addResponseParam");
}
//删除一个response
const handleDeleteResponse = (index: number) => {
    store.commit("apidoc/apidoc/deleteResponseByIndex", index);
}
//response参数值
const responseData = computed(() => store.state["apidoc/apidoc"].apidoc.item.responseParams);
//body参数联想值
const mindResponseParams = computed(() => store.state["apidoc/baseInfo"].mindParams.filter(v => v.paramsPosition === "responseParams"))
//布局
const layout = computed(() => store.state["apidoc/baseInfo"].layout);
/*
|--------------------------------------------------------------------------
| 导入参数
|--------------------------------------------------------------------------
*/
const importParamsdialogVisible = ref(false); //导入参数弹窗
const currentEditResponseIndex = ref(0);
//打开导入参数弹窗
const handleOpenImportParams = (index: number) => {
    currentEditResponseIndex.value = index;
    importParamsdialogVisible.value = true;
}
//处理导入成功回调
const handleConvertSuccess = (result: ApidocProperty<ApidocPropertyType>[]) => {
    const responseMindParams = store.state["apidoc/baseInfo"].mindParams.filter(v => v.paramsPosition === "responseParams")
    forEachForest(result, (data) => {
        const matchedData = responseMindParams.find(v => v.key === data.key);
        const isSimple = data.type === "string" || data.type === "boolean" || data.type === "number"
        if (matchedData && isSimple && (data.value == null || data.value === "")) {
            data.value = matchedData.value;
        }
        if (matchedData && (data.description == null || data.description === "")) {
            data.description = matchedData.description;
        }
    })
    store.commit("apidoc/apidoc/changeResponseByIndex", {
        index: currentEditResponseIndex.value,
        value: result,
    });
}
/*
|--------------------------------------------------------------------------
| 状态码和返回类型相关
|--------------------------------------------------------------------------
*/
//是否显示状态码弹窗
const statusVisible = ref(false);
const mimeVisible = ref(false);
const closeStatusPopover = () => {
    statusVisible.value = false;
}
const closeMimePopover = () => {
    mimeVisible.value = false;
}
//选择一个statusCode
const handleSelectStatusCode = (code: number, index: number) => {
    store.commit("apidoc/apidoc/changeResponseParamsCodeByIndex", {
        index,
        code,
    });
}
//选择一个contentType
const handleSelectContentType = (type: string, index: number) => {
    store.commit("apidoc/apidoc/changeResponseParamsDataTypeByIndex", {
        index,
        type,
    });
}
onMounted(() => {
    document.documentElement.addEventListener("click", closeStatusPopover)
    document.documentElement.addEventListener("click", closeMimePopover)
})
onUnmounted(() => {
    document.documentElement.removeEventListener("click", closeStatusPopover)
    document.documentElement.removeEventListener("click", closeMimePopover)
})

/*
|--------------------------------------------------------------------------
| 不同类型数据展示
|--------------------------------------------------------------------------
*/
const checkDisplayType = (mimeType: ApidocResponseContentType): "text" | "json" | "audio" | "video" | "image" | "pdf" | "download" | "unknown" => {
    // 文本展示
    if (mimeType === "text/csv" || mimeType === "text/plain" || mimeType === "text/html" || mimeType === "application/xml" || mimeType === "text/css" || mimeType === "text/javascript") {
        return "text";
    }
    // 图片展示
    if (mimeType === "image/gif" || mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/svg+xml") {
        return "image";
    }
    // 音频文件
    if (mimeType === "audio/webm" || mimeType === "audio/ogg") {
        return "audio";
    }
    // 视频文件
    if (mimeType === "video/webm" || mimeType === "video/ogg" || mimeType === "application/ogg") {
        return "video";
    }
    // 下载类型
    if (mimeType === "application/octet-stream" || mimeType === "application/msword" || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || mimeType === "application/vnd.ms-excel" || mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        return "download";
    }
    //=====================================特殊格式====================================//
    // PDF文件
    if (mimeType === "application/pdf") {
        return "pdf";
    }
    //json格式
    if (mimeType === "application/json") {
        return "json";
    }
    return "unknown"
}

</script>

<style lang="scss" scoped>
.response-params {
    .info-wrap {
        display: flex;
        height: 100%;
        align-items: center;
        .label {
            width: size(230);
        }
        .status-code {
            width: size(140);
        }
        .content-type {
            max-width: size(300);
            .type-text {
                max-width: size(200);
                // overflow: hidden;
                // white-space: nowrap;
                // text-emphasis: ellipsis;
            }
        }
        .edit-title {
            border: 1px solid transparent;
        }
        .edit-input {
            border: 1px solid $gray-600;
            font-size: fz(14);
            height: size(20);
            line-height: size(20);
            width: size(120);
            &.error {
                border: 1px solid $red;
            }
        }
    }
    .edit-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        cursor: pointer;
        width: size(40);
        margin-top: size(2);
        &:hover {
            color: $theme-color;
        }
    }
    .editor-wrap {
        height: size(350);
        &.vertical {
            height: size(250);
        }
        .editor {
            height: size(350);
        }
    }

}
</style>
