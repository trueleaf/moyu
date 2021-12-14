/*
    创建者：shuxiaokai
    创建时间：2021-12-08 21:12
    模块名称：前置脚本
    备注：
*/
<template>
    <div class="editor-wrap">
        <s-monaco-editor v-model="preRequest"></s-monaco-editor>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { store } from "@/store/index"

const preRequest = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.preRequest.raw;
    },
    set(val) {
        store.commit("apidoc/apidoc/changePreRequest", val);
    },
})
// const tempVariables = computed(() => store.state["apidoc/baseInfo"].tempVariables)

</script>

<style lang="scss">
.editor-wrap {
    width: size(300px);
    height: calc(100vh - #{size(320)});
    border-bottom: 1px solid $gray-400;
    padding: 0;
}
</style>
