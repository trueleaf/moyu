/*
    创建者：shuxiaokai
    模块名称：自定义mock返回值
    备注：
*/
<template>
    <div class="mock-response">
        <!-- 返回数据类型 -->
        <s-label-value label="类型：" label-width="50px" class="mb-1" one-line>
            <el-radio-group v-model="responseType">
                <el-radio label="json" size="small">JSON</el-radio>
                <el-radio label="image" size="small">图片</el-radio>
                <el-radio label="file" size="small">文件</el-radio>
                <el-radio label="text" size="small">Text</el-radio>
            </el-radio-group>
        </s-label-value>
        <div class="editor-wrap">
            <s-json-editor></s-json-editor>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { store } from "@/store";

/*
|--------------------------------------------------------------------------
| 返回数据类型
|--------------------------------------------------------------------------
*/
const responseType = computed({
    get() {
        return store.state["apidoc/mock"].responseType;
    },
    set(val) {
        store.commit("apidoc/mock/changeResponseType", val)
    },
})
</script>

<style lang="scss" scoped>
.mock-response {
    .editor-wrap {
        height: calc(100vh - #{size(620)});
        min-height: size(200);
        border: 1px solid $gray-500;
    }
}
</style>
