/*
    创建者：shuxiaokai
    创建时间：2021-12-12 12:27
    模块名称：monaco-editor
    备注：
*/
<template>
    <div ref="monacoDom" class="s-monaco-editor"></div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted } from "vue"
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution"

const monacoDom: Ref<HTMLElement | null> = ref(null);
const monacoInstance: Ref<monaco.editor.IStandaloneCodeEditor | null> = ref(null)
onMounted(() => {
    monacoInstance.value = monaco.editor.create(monacoDom.value as HTMLElement, {
        value: `console.log("hello,world")`,
        language: "javascript",
        automaticLayout: true,
        minimap: {
            enabled: false,
        },
    })
})

</script>

<style lang="scss">
.s-monaco-editor {
    width: 100%;
    height: 100%;
    position: relative;
}
</style>
