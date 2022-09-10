/*
    创建者：shuxiaokai
    创建时间：2021-12-12 12:27
    模块名称：monaco-editor
    备注：
*/
<template>
    <div ref="preEditor" class="s-monaco-editor"></div>
    <div class="operation-btn">
        <el-button type="primary" text class="format-btn" @click="handleFormat">格式化</el-button>
        <el-button type="primary" text class="format-btn" @click="handleOpenLocalScript">本地包</el-button>
    </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, onBeforeUnmount, watch } from "vue"
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import beautify from "js-beautify"
import { event } from "@/helper/index"
import { store } from "@/store";
import { router } from "@/router";
import { useCompletionItem } from "./registerCompletionItem"
import { useHoverProvider } from "./registerHoverProvider"
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution"

const props = defineProps({
    modelValue: {
        type: String,
        default: ""
    },
});
const emits = defineEmits(["update:modelValue"])

const preEditor: Ref<HTMLElement | null> = ref(null);
const projectId = router.currentRoute.value.query.id as string;
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
    event.emit("apidoc/editor/removeAfterEditor");
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noLib: true, allowNonTsExtensions: true })
    monacoInstance = monaco.editor.create(preEditor.value as HTMLElement, {
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
    })
})
event.on("apidoc/editor/removeAfterEditor", () => {
    monacoCompletionItem?.dispose()
    monacoHoverProvider?.dispose()
});
onBeforeUnmount(() => {
    monacoInstance?.dispose();
    monacoCompletionItem?.dispose()
    monacoHoverProvider?.dispose()
})
//格式化数据
const handleFormat = () => {
    const formatStr = beautify(props.modelValue, { indent_size: 4 });
    monacoInstance?.setValue(formatStr)
}
//打开本地安装包
const handleOpenLocalScript = () => {
    store.commit("apidoc/tabs/addTab", {
        _id: "package",
        projectId,
        tabType: "package",
        label: `本地安装包`,
        saved: true,
        fixed: true,
        selected: true,
        head: {
            icon: "",
        },
    })
}
</script>

<style lang="scss" scoped>
.s-monaco-editor {
    width: 100%;
    height: 100%;
    border: 1px solid $gray-300;
}
.operation-btn {
    position: absolute;
    right: size(20);
    top: size(0);
    .el-button+.el-button {
        margin-left: 0;
    }
}
</style>
