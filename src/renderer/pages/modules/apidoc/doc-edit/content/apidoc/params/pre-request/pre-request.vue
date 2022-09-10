/*
    创建者：shuxiaokai
    创建时间：2021-12-08 21:12
    模块名称：前置脚本
    备注：
*/
<template>
    <div class="editor-wrap">
        <pre-editor ref="editorWrap" v-model="preRequest"></pre-editor>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { store } from "@/store/index"
import preEditor from "./editor/pre-editor.vue"

const preRequest = computed<string>({
    get() {
        return store.state["apidoc/apidoc"].apidoc?.preRequest.raw;
    },
    set(val) {
        store.commit("apidoc/apidoc/changePreRequest", val);
    },
})

</script>

<style lang="scss">
.editor-wrap {
    position: relative;
    width: 100%;
    height: calc(100vh - #{size(320)});
}
</style>
