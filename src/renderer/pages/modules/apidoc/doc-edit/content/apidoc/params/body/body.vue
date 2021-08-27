/*
    创建者：shuxiaokai
    创建时间：2021-08-20 22:42
    模块名称：body参数
    备注：
*/
<template>
    <div class="body-params">
        <!-- <pre>{{ bodyType }}</pre> -->
        <div class="d-flex a-center mb-3">
            <!-- body类型选择 -->
            <el-radio-group v-model="bodyType" @change="handleChangeBodyType">
                <el-radio label="json">json</el-radio>
                <el-radio label="formdata">form-data</el-radio>
                <el-radio label="urlencoded">x-www-form-urlencoded</el-radio>
                <el-radio label="raw">raw</el-radio>
                <el-radio label="none">none</el-radio>
            </el-radio-group>
            <div class="operation">
                <div class="active cursor-pointer">导入参数</div>
                <el-divider direction="vertical"></el-divider>
                <div class="cursor-pointer">应用模板 </div>
                <el-divider direction="vertical"></el-divider>
                <div class="cursor-pointer">保存为模板 </div>
                <el-divider direction="vertical"></el-divider>
                <div class="cursor-pointer">预览参数 </div>
            </div>
        </div>
        <div class="params-wrap">
            <s-params-tree v-if="bodyType === 'json'" nest show-checkbox :data="jsonBodyData" @change="handleChangeJsonData"></s-params-tree>
            <s-params-tree v-if="bodyType === 'formdata'" show-checkbox :data="formData" @change="handleChangeFormData"></s-params-tree>
            <s-params-tree v-if="bodyType === 'urlencoded'" show-checkbox :data="urlencodedData" @change="handleChangeUrlencodedData"></s-params-tree>
        </div>
        <div v-if="bodyType === 'raw'" class="raw">
            <s-raw-editor ref="editor" :type="rawType" @input="handleChangeRawData"></s-raw-editor>
            <div class="raw-type">
                <el-select v-model="rawType" size="mini" class="w-100" @change="handleChangeRawType">
                    <el-option label="text" value="text/plain"></el-option>
                    <el-option label="html" value="text/html"></el-option>
                    <el-option label="xml" value="application/xml"></el-option>
                    <el-option label="javascript" value="text/javascript"></el-option>
                    <el-option label="json" value="application/json"></el-option>
                </el-select>
            </div>
            <div class="tip">raw模块中json数据仅适用与快速调试，参数无法添加备注，如果需要添加备注可以选择在json模块中录入参数</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, Ref, computed } from "vue"
import { Editor} from "brace";
import { apidocConvertParamsToJsonData } from "@/helper/index"
import { store } from "@/store/index"
import type { ApidocBodyMode, ApidocBodyRawType } from "@@/global"

const editor: Ref<null | Editor> = ref(null)

//改变传参类型
const handleChangeBodyType = (type: ApidocBodyMode) => {
    const { json, formdata, urlencoded, raw } = store.state["apidoc/apidoc"].apidoc.item.requestBody;
    const converJsonData = apidocConvertParamsToJsonData(json);
    const hasFormData = formdata.some((data) => data.key);
    const hasUrlencodedData = urlencoded.some((data) => data.key);
    const hasRawData = raw.data;
    editor.value?.setValue(raw.data);
    if (type === "raw" && hasRawData) {
        store.commit("apidoc/apidoc/changeContentType", raw.dataType || "text/plain");
    } else if (type === "raw" && !hasRawData) {
        store.commit("apidoc/apidoc/changeContentType", "");
    } else if (type === "none") {
        store.commit("apidoc/apidoc/changeContentType", "");
    } else if (type === "urlencoded" && hasUrlencodedData) {
        store.commit("apidoc/apidoc/changeContentType", "application/x-www-form-urlencoded");
    } else if (type === "urlencoded" && !hasUrlencodedData) {
        store.commit("apidoc/apidoc/changeContentType", "");
    } else if (type === "json" && converJsonData) {
        store.commit("apidoc/apidoc/changeContentType", "application/json");
    } else if (type === "json" && !converJsonData) {
        store.commit("apidoc/apidoc/changeContentType", "");
    } else if (type === "formdata" && hasFormData) {
        store.commit("apidoc/apidoc/changeContentType", "multipart/form-data");
    } else if (type === "formdata" && !hasFormData) {
        store.commit("apidoc/apidoc/changeContentType", "");
    }
}

//body类型
const bodyType = computed<ApidocBodyMode>({
    get() {
        return store.state["apidoc/apidoc"].apidoc.item.requestBody.mode;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeBodyMode", val);
    },
});
/*
|--------------------------------------------------------------------------
| json类型操作
|--------------------------------------------------------------------------
*/
//json格式body参数
const jsonBodyData = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item.requestBody.json;
})
const handleChangeJsonData = () => {
    const { json } = store.state["apidoc/apidoc"].apidoc.item.requestBody;
    const hasJsonData = apidocConvertParamsToJsonData(json);
    if (hasJsonData) {
        store.commit("apidoc/apidoc/changeContentType", "application/json");
    } else  {
        store.commit("apidoc/apidoc/changeContentType", "");
    }
}

/*
|--------------------------------------------------------------------------
| x-www-form-urlencoded类型操作
|--------------------------------------------------------------------------
*/
const urlencodedData = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item.requestBody.urlencoded;
})
const handleChangeUrlencodedData = () => {
    const { urlencoded } = store.state["apidoc/apidoc"].apidoc.item.requestBody;
    const hasUrlencodedData = urlencoded.some((data) => data.key)
    if (hasUrlencodedData) {
        store.commit("apidoc/apidoc/changeContentType", "application/x-www-form-urlencoded");
    } else  {
        store.commit("apidoc/apidoc/changeContentType", "");
    }
}
/*
|--------------------------------------------------------------------------
| raw类型数据处理
|--------------------------------------------------------------------------
*/
//raw类型数据
const rawType = computed<ApidocBodyRawType>({
    get() {
        return store.state["apidoc/apidoc"].apidoc.item.requestBody.raw.dataType;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeBodyRawType", val);
    },
})
//切换参数类型
const handleChangeRawType = () => {
    const { raw } = store.state["apidoc/apidoc"].apidoc.item.requestBody;
    if (!raw.data) {
        store.commit("apidoc/apidoc/changeContentType", "");
        return
    }
    if (rawType.value === "text/plain") {
        store.commit("apidoc/apidoc/changeContentType", "text/plain");
    } else if (rawType.value === "text/html") {
        store.commit("apidoc/apidoc/changeContentType", "text/html");
    } else if (rawType.value === "application/xml") {
        store.commit("apidoc/apidoc/changeContentType", "application/xml");
    } else if (rawType.value === "text/javascript") {
        store.commit("apidoc/apidoc/changeContentType", "text/javascript");
    } else if (rawType.value === "application/json") {
        store.commit("apidoc/apidoc/changeContentType", "application/json");
    } else {
        console.warn("未知请求类型");
    }
}
//改变raw数据值
const handleChangeRawData = (value: string) => {
    store.commit("apidoc/apidoc/changeBodyRawValue", value);
    const { raw } = store.state["apidoc/apidoc"].apidoc.item.requestBody;
    if (raw.data) {
        store.commit("apidoc/apidoc/changeContentType", raw.dataType || "text/plain");
    } else  {
        store.commit("apidoc/apidoc/changeContentType", "");
    }
}
/*
|--------------------------------------------------------------------------
| formdata数据处理
|--------------------------------------------------------------------------
*/
//formData格式body参数
const formData = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item.requestBody.formdata;
})
const handleChangeFormData = () => {
    const { formdata } = store.state["apidoc/apidoc"].apidoc.item.requestBody;
    const hasFormData = formdata.some((data) => data.key)
    if (hasFormData) {
        store.commit("apidoc/apidoc/changeContentType", "multipart/form-data");
    } else {
        store.commit("apidoc/apidoc/changeContentType", "");
    }
}

</script>

<style lang="scss">
.body-params {
    .operation {
        margin-top: size(-3);
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
    .raw {
        height: size(300);
        position: relative;
        .raw-type {
            position: absolute;
            right: size(0);
            bottom: size(31);
            width: size(200);
        }
        .tip {
            width: calc(100% - #{size(240)});
            height: size(20);
            display: flex;
            align-items: center;
            position: absolute;
            bottom: size(30);
            left: size(40);
            background: lighten($orange, 10%);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: $white;
            z-index: $zIndex-contextmenu;
        }
    }
    .params-wrap {
        border-top: 1px dashed $gray-400;
    }
}
</style>
