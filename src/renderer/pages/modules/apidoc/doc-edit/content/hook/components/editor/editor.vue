/*
    创建者：shuxiaokai
    创建时间：2021-12-12 12:27
    模块名称：monaco-editor
    备注：
*/
<template>
    <div ref="editor" class="editor"></div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, onBeforeUnmount, watch } from "vue"
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useCompletionItem } from "./registerCompletionItem"
import { useHoverProvider } from "./registerHoverProvider"
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution"

const props = defineProps({
    modelValue: {
        type: String,
        default: ""
    },
});
const emits = defineEmits(["update:modelValue", "change"])

const editor: Ref<HTMLElement | null> = ref(null);
let monacoInstance: monaco.editor.IStandaloneCodeEditor | null = null;
let monacoCompletionItem: monaco.IDisposable | null = null;
let monacoHoverProvider: monaco.IDisposable | null = null;

watch(() => props.modelValue, (newValue) => {
    const value = monacoInstance?.getValue();
    if (newValue !== value) {
        monacoInstance?.setValue(props.modelValue)
    }
})
onMounted(() => {
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noLib: true, allowNonTsExtensions: true });
    monacoInstance = monaco.editor.create(editor.value as HTMLElement, {
        value: props.modelValue,
        language: "javascript",
        automaticLayout: true,
        parameterHints: {
            enabled: true
        },
        minimap: {
            enabled: false,
        },
        wrappingStrategy: "advanced",
        scrollBeyondLastLine: false,
        overviewRulerLanes: 0,
        hover: {
            enabled: true,
            above: false,
        },
        renderLineHighlight: "none",
    })
    monacoCompletionItem = useCompletionItem();
    monacoHoverProvider = useHoverProvider();
    monacoInstance.onDidChangeModelContent(() => {
        emits("update:modelValue", monacoInstance?.getValue())
        emits("change", monacoInstance?.getValue())
    })
})

onBeforeUnmount(() => {
    monacoInstance?.dispose();
    monacoCompletionItem?.dispose()
    monacoHoverProvider?.dispose()
})

</script>

<style lang="scss" scoped>
.editor {
    width: 100%;
    height: 100%;
}
</style>
