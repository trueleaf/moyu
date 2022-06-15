/*
    创建者：shuxiaokai
    创建时间：2022-02-02 10:49
    模块名称：新增脚本信息
    备注：
*/
<template>
    <div class="hook-add-wrap d-flex">
        <s-fieldset title="代码编写" class="w-50">
            <s-editor v-model="code" class="editor" @change="handleChangeCode"></s-editor>
            <div class="operation">
                <el-button type="primary" class="mb-2" @click="executeCode">执行代码</el-button>
                <el-button type="primary" class="mb-2" @click="dialogVisible = true">保存代码</el-button>
                <el-button @click="handleResetCode">重置代码</el-button>
            </div>
        </s-fieldset>
        <s-fieldset title="结果值" class="w-50">
            <div class="json-view-wrap">
                <s-json-editor :model-value="result" read-only></s-json-editor>
            </div>
        </s-fieldset>
        <s-dialog v-model="dialogVisible" title="保存代码">
            <s-form ref="form">
                <s-form-item label="脚本名称" prop="codeName" one-line required></s-form-item>
                <s-form-item label="备注" prop="remark" one-line></s-form-item>
            </s-form>
            <template #footer>
                <div>
                    <el-button :loading="loading" type="primary" @click="handleSaveCode">确定</el-button>
                    <el-button type="warning" @click="dialogVisible = false">取消</el-button>
                </div>
            </template>
        </s-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted } from "vue"
import { ElMessage } from "element-plus";
import { store } from "@/store";
import {
    apidocFormatUrl,
    apidocFormatQueryParams,
    apidocFormatPathParams,
    apidocFormatJsonBodyParams,
    apidocFormatFormdataParams,
    apidocFormatUrlencodedParams,
    apidocFormatHeaderParams,
    apidocFormatResponseParams,
} from "@/helper";
// import type { ApidocCodeInfo } from "@@/global"
import { axios } from "@/api/api";
import { router } from "@/router";
import { apidocCache } from "@/cache/apidoc";
import sEditor from "../editor/editor.vue"

type CodeInfo = {
    codeName: string,
    remark: string
}

const worker = new Worker("/sandbox/hook/worker.js");
const projectId = router.currentRoute.value.query.id as string; //项目id
const defaultCode = `/**
 * 请勿修改函数名,返回值即为处理后结果值
 * 编辑器支持智能提示
 */
function codeHook(docInfo) {
    return docInfo
}
`
const code = ref(defaultCode);
const result = ref("");
//错误处理
worker.addEventListener("error", (error) => {
    result.value = error.message;
    console.error(error);
});
//代码更新缓存带啊吗
const handleChangeCode = () => {
    apidocCache.setHookCode(projectId, code.value);
}
//执行代码
const executeCode = () => {
    const { apidoc } = store.state["apidoc/apidoc"]
    worker.postMessage({
        type: "init",
        value: {
            raw: JSON.parse(JSON.stringify(store.state["apidoc/apidoc"].apidoc)),
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
        value: code.value
    });
    worker.addEventListener("message", (e) => {
        if (typeof e.data !== "object") {
            return;
        }
        if (e.data.type === "success") {
            result.value = e.data.value;
        }
    })
}
//重置代码
const handleResetCode = () => {
    code.value = defaultCode;
    apidocCache.setHookCode(projectId, defaultCode);
}
//保存代码
const dialogVisible = ref(false);
const loading = ref(false);
const form: Ref<null | { formInfo: CodeInfo }> = ref(null);
const handleSaveCode = () => {
    loading.value = true;
    const params = {
        projectId,
        codeName: form.value?.formInfo.codeName,
        remark: form.value?.formInfo.remark,
        code: code.value
    };
    axios.post("/api/apidoc/project/code", params).then(() => {
        ElMessage.success("保存成功");
        dialogVisible.value = false;
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        loading.value = false;
    });
}

//初始化
onMounted(() => {
    //处理编辑逻辑
    const cacheCode = apidocCache.getHookCodeById(projectId);
    code.value = cacheCode || defaultCode;
})

</script>

<style lang="scss">
.hook-add-wrap {
    .s-fieldset > .content {
        overflow-y: visible;
    }
    .editor {
        height: calc(100vh - #{size(240)});
    }
    .operation {
        position: absolute;
        right: 0;
        top: 50%;
        display: flex;
        flex-direction: column;
        .el-button+.el-button {
            margin-left: 0;
        }
    }
    .json-view-wrap {
        height: calc(100vh - #{size(240)});
        // overflow-y: auto;
    }
}
</style>
