/*
    创建者：shuxiaokai
    创建时间：2021-12-12 12:27
    模块名称：json-editor
    备注：
*/
<template>
    <div ref="monacoDom" class="s-json-editor"></div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, onBeforeUnmount, watch } from "vue"
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const props = defineProps({
    modelValue: {
        type: String,
        default: ""
    },
    readOnly: {
        type: Boolean,
        default: true
    }
});
const emits = defineEmits(["update:modelValue", "change"])

const monacoDom: Ref<HTMLElement | null> = ref(null);
let monacoInstance: monaco.editor.IStandaloneCodeEditor | null = null;

watch(() => props.modelValue, (newValue) => {
    const value = monacoInstance?.getValue();
    if (newValue !== value) {
        monacoInstance?.setValue(props.modelValue)
    }
})
onMounted(() => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        allowComments: true,
        validate: true,
        trailingCommas: "ignore",
    })
    monacoInstance = monaco.editor.create(monacoDom.value as HTMLElement, {
        value: props.modelValue,
        language: "json",
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
        fontSize: 13,
        readOnly: props.readOnly,
    })
    const container = document.querySelector(".s-json-editor")
    const updateHeight = () => {
        const contentHeight = monacoInstance?.getContentHeight() || 300;
        const containerWidth = container?.getBoundingClientRect().width || 1000;
        (container as HTMLElement).style.height = `${contentHeight}px`;
        monacoInstance?.layout({ width: containerWidth, height: contentHeight });
    };
    monacoInstance.onDidContentSizeChange(updateHeight);
    updateHeight()
    monacoInstance.onDidChangeModelContent(() => {
        emits("update:modelValue", monacoInstance?.getValue())
        emits("change", monacoInstance?.getValue())
    })
})
onBeforeUnmount(() => {
    monacoInstance?.dispose();
    // model?.dispose();
    // monacoCompletionItem?.dispose()
    // monacoHoverProvider?.dispose()
})

</script>

<style lang="scss">
</style>
