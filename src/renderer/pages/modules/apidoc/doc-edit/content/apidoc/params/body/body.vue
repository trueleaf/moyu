/*
    创建者：shuxiaokai
    创建时间：2021-08-20 22:42
    模块名称：body参数
    备注：
*/
<template>
    <div class="body-params">
        <pre>{{ bodyType }}</pre>
        <div class="d-flex a-center">
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
        <s-params-tree v-if="bodyType === 'json'" nest show-checkbox :data="jsonBodyData"></s-params-tree>
        <s-params-tree v-if="bodyType === 'formdata'" show-checkbox :data="formData" @change="handleChangeFormData"></s-params-tree>
        <s-params-tree v-if="bodyType === 'urlencoded'" show-checkbox :data="urlencodedData"></s-params-tree>
        <div v-if="bodyType === 'raw'" class="raw">
            <!-- <s-code-editor ref="editor" :type="rawType" @input="handleRawInput"></s-code-editor> -->
            <div class="raw-type">
                <el-select v-model="rawType" size="mini" @change="handleChangeRawType">
                    <el-option label="text" value="text/plain"></el-option>
                    <el-option label="html" value="text/html"></el-option>
                    <el-option label="xml" value="application/xml"></el-option>
                </el-select>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { apidocConvertParamsToJsonData } from "@/helper/index"
import { store } from "@/store/index"
import type { ApidocBodyMode, ApidocBodyRawType } from "@@/global"


/*
|--------------------------------------------------------------------------
| json类型的body参数
|--------------------------------------------------------------------------
*/
//json格式body参数
const jsonBodyData = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item.requestBody.json;
})
//formData格式body参数
const formData = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item.requestBody.formdata;
})
//x-www-form-urlencoded参数
const urlencodedData = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item.requestBody.urlencoded;
})
//body类型
const bodyType = computed<ApidocBodyMode>({
    get() {
        return store.state["apidoc/apidoc"].apidoc.item.requestBody.mode;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeBodyMode", val);
    },
});
//raw类型数据
const rawType = computed<ApidocBodyRawType>({
    get() {
        return store.state["apidoc/apidoc"].apidoc.item.requestBody.raw.dataType;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeBodyRawType", val);
    },
})
//改变传参类型
const handleChangeBodyType = (type: ApidocBodyMode) => {
    //, formdata, urlencoded, raw, file
    const { json, formdata } = store.state["apidoc/apidoc"].apidoc.item.requestBody;
    const converJsonData = apidocConvertParamsToJsonData(json);
    const hasFormData = formdata.some((data) => data.key)
    if (type === "raw") {
        store.commit("apidoc/apidoc/changeContentType", "text/plain");
    } else if (type === "none") {
        store.commit("apidoc/apidoc/changeContentType", "");
    } else if (type === "urlencoded") {
        store.commit("apidoc/apidoc/changeContentType", "application/x-www-form-urlencoded");
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
//切换参数类型
const handleChangeRawType = () => {
    if (rawType.value === "text/plain") {
        store.commit("apidoc/apidoc/changeContentType", "text/plain");
    } else if (rawType.value === "text/html") {
        store.commit("apidoc/apidoc/changeContentType", "text/html");
    } else if (rawType.value === "application/xml") {
        store.commit("apidoc/apidoc/changeContentType", "application/xml");
    }
}
/*
|--------------------------------------------------------------------------
| formdata数据处理
|--------------------------------------------------------------------------
|
*/
const handleChangeFormData = () => {
    const { formdata } = store.state["apidoc/apidoc"].apidoc.item.requestBody;
    console.log(formdata)
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
            right: size(5);
            bottom: size(35);
        }
    }
}
</style>
