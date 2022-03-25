/*
    创建者：shuxiaokai
    创建时间：2021-12-08 21:12
    模块名称：前置脚本
    备注：
*/
<template>
    <div class="editor-wrap">
        <after-editor v-model="afterRequest"></after-editor>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { store } from "@/store/index"
import afterEditor from "./editor/after-editor.vue"

const afterRequest = computed<string>({
    get() {
        return store.state["apidoc/apidoc"].apidoc?.afterRequest.raw;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeAfterRequest", val);
    },
})

</script>

<style lang="scss">
.editor-wrap {
    position: relative;
    width: 100%;
    height: calc(100vh - #{size(320)});
    border-bottom: 1px solid $gray-400;
    padding: 0;
}
</style>
