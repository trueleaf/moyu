/*
    创建者：shuxiaokai
    创建时间：2021-12-08 21:12
    模块名称：前置脚本
    备注：
*/
<template>
    <div class="editor-wrap">
        <s-monaco-editor></s-monaco-editor>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    data() {
        return {
        };
    },
    methods: {
    },
})
</script>

<style lang="scss">
.editor-wrap {
    width: size(300px);
    height: calc(100vh - #{size(320)});
    border-bottom: 1px solid $gray-400;
    padding: 0;
}
</style>
