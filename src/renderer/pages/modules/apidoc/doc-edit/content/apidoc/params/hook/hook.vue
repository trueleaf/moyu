/*
    创建者：shuxiaokai
    创建时间：2022-2-1 22:02
    模块名称：代码生成popover
    备注：
*/
<template>
    <s-loading :loading="loading">
        <div class="hook-popover">
            <div class="header">
                <el-button link type="primary" text @click="handleJumpToHook">管理</el-button>
                <el-button link type="primary" text @click="emit('close')">关闭</el-button>
            </div>
            <div v-for="(item, index) in codeList" :key="index" class="item" @click="handleSelectCode(item)">
                <div>{{ item.codeName }}</div>
                <div>{{ item.creator }}</div>
            </div>
            <div v-if="codeList.length === 0" class="d-flex a-center j-center gray-400 mt-2">暂无数据</div>
        </div>
    </s-loading>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref } from "vue";
import {
    apidocFormatUrl,
    apidocFormatQueryParams,
    apidocFormatPathParams,
    apidocFormatJsonBodyParams,
    apidocFormatFormdataParams,
    apidocFormatUrlencodedParams,
    apidocFormatHeaderParams,
    apidocFormatResponseParams,
    copy,
} from "@/helper";
import { axios } from "@/api/api";
// import { Close } from "@element-plus/icons-vue"
import { router } from "@/router";
import type { ApidocCodeInfo, Response } from "@@/global"
import { store } from "@/store";
import { ElMessage } from "element-plus";
import { $t } from "@/i18n/i18n";

type CodeInfo = Omit<ApidocCodeInfo, "updatedAt">;
const emit = defineEmits(["close"]);
const projectId = router.currentRoute.value.query.id as string; //项目id
const loading = ref(false); //加载效果
const codeList: Ref<CodeInfo[]> = ref([]); //代码列表
const worker = new Worker("/sandbox/hook/worker.js");

//选择代码模板
const handleSelectCode = (codeInfo: CodeInfo) => {
    const apidoc = JSON.parse(JSON.stringify(store.state["apidoc/apidoc"].apidoc))
    worker.postMessage({
        type: "init",
        value: {
            raw: apidoc,
            url: apidocFormatUrl(apidoc),
            queryParams: apidocFormatQueryParams(apidoc),
            pathParams: apidocFormatPathParams(apidoc),
            jsonParams: apidocFormatJsonBodyParams(apidoc),
            formdataParams: apidocFormatFormdataParams(apidoc),
            urlencodedParams: apidocFormatUrlencodedParams(apidoc),
            headers: apidocFormatHeaderParams(apidoc),
            method: apidoc.item.method,
            response: apidocFormatResponseParams(apidoc),
        },
    });
    worker.postMessage({
        type: "generate-code",
        value: codeInfo.code
    });
    worker.addEventListener("message", (e) => {
        if (typeof e.data !== "object") {
            return;
        }
        if (e.data.type === "success") {
            console.log(e.data.value)
            copy(e.data.value);
            ElMessage.success("代码已复制到剪切板！");
        }
    })
    emit("close");
}
//跳转到代码管理界面
const handleJumpToHook = () => {
    store.commit("apidoc/tabs/addTab", {
        _id: "hook",
        projectId,
        tabType: "hook",
        label: $t("生成代码"),
        head: {
            icon: "",
            color: ""
        },
        saved: true,
        fixed: true,
        selected: true,
    });
}
onMounted(() => {
    loading.value = true;
    const params = {
        projectId,
    };
    axios.get<Response<CodeInfo[]>, Response<CodeInfo[]>>("/api/apidoc/project/code_enum", { params }).then((res) => {
        codeList.value = res.data;
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        loading.value = false;
    });
})

</script>

<style lang="scss">
.hook-popover {
    position: relative;
    .header {
        display: flex;
        justify-content: flex-end;
        border-bottom: 1px dashed $gray-400;
        margin-top: size(-10);
        // .close {
        //     @include rt-close;
        //     top: size(-5);
        //     right: size(-5);
        // }
    }
    .item {
        padding: size(5) size(5);
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        &:hover {
            color: $white;
            background-color: $theme-color;
        }
    }
}
</style>
