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
import createDependencyProposals from "./proposale"
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution"

const monacoDom: Ref<HTMLElement | null> = ref(null);
let monacoInstance: monaco.editor.IStandaloneCodeEditor | null = null
onMounted(() => {
    monacoInstance = monaco.editor.create(monacoDom.value as HTMLElement, {
        value: "",
        language: "javascript",
        automaticLayout: true,
        minimap: {
            enabled: false,
        },
    })
    monaco.languages.registerCompletionItemProvider("javascript", {
        provideCompletionItems(model, position) {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };
            return {
                suggestions: createDependencyProposals(range)
            };
        }
    })
    console.log(monacoInstance)
    // monacoInstance.onDidChangeModelContent(() => {
    //     console.log(monacoInstance?.getValue())
    // })
})

</script>

<style lang="scss">
.s-monaco-editor {
    width: 100%;
    height: 100%;
    position: relative;
}
</style>
