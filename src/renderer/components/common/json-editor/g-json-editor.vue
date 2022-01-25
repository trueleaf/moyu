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
});
const emits = defineEmits(["update:modelValue"])

const monacoDom: Ref<HTMLElement | null> = ref(null);
let monacoInstance: monaco.editor.IStandaloneCodeEditor | null = null;
let model: monaco.editor.ITextModel | null = null;

watch(() => props.modelValue, (newValue) => {
    const value = monacoInstance?.getValue();
    if (newValue !== value) {
        monacoInstance?.setValue(props.modelValue)
    }
})
onMounted(() => {
    const modelUri = monaco.Uri.parse("json://demo");
    model = monaco.editor.createModel(props.modelValue, "json", modelUri)
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        allowComments: true,
        validate: true,
        trailingCommas: "ignore",
        schemas: [{
            uri: "json",
            fileMatch: [modelUri.toString()],
            schema: {
                type: "object",
                properties: {
                    p1: {
                        enum: ["v1", "v2"],
                    },
                    p2: {
                        type: "string",
                    },
                },
                required: ["p1", "p2"],
            },
        }]
    })
    monacoInstance = monaco.editor.create(monacoDom.value as HTMLElement, {
        model,
        language: "json",
        automaticLayout: true,
        parameterHints: {
            enabled: true
        },
        minimap: {
            enabled: false,
        },
        hover: {
            enabled: true,
            above: false,
        },
    })
    // monacoCompletionItem = useCompletionItem();
    // monacoHoverProvider = useHoverProvider();
    monacoInstance.onDidChangeModelContent(() => {
        emits("update:modelValue", monacoInstance?.getValue())
    })
})
onBeforeUnmount(() => {
    monacoInstance?.dispose();
    model?.dispose();
    // monacoCompletionItem?.dispose()
    // monacoHoverProvider?.dispose()
})

</script>

<style lang="scss">
.s-json-editor {
    width: 100%;
    height: 100%;
}
</style>
