/*
    创建者：shuxiaokai
    创建时间：2021-08-27 21:17
    模块名称：raw类型数据编辑器
    备注：
*/
<template>
    <pre id="editor"></pre>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import ace, { Editor} from "brace";
import "brace/mode/json";
import "brace/mode/javascript";
import "brace/mode/html";
import "brace/mode/xml";
import "brace/mode/text";
import "brace/theme/github";
import type { ApidocBodyRawType } from "@@/global"

const TYPE_MAP = {
    "text/plain": "text",
    "text/html": "html",
    "application/xml": "xml",
    "application/json": "json",
    "text/javascript": "javascript"
}

export default defineComponent({
    props: {
        type: {
            type: String as PropType<ApidocBodyRawType>,
            default: "javascript",
        },
        modelValue: {
            type: String,
            default: "",
        },
    },
    emits: ["change", "ready", "update:modelValue"],
    data() {
        return {
            editorInstance: null as null | Editor,
        };
    },
    watch: {
        type: {
            handler(type: ApidocBodyRawType) {
                if (this.editorInstance) {
                    this.editorInstance.getSession().setMode(`ace/mode/${TYPE_MAP[type]}`);
                }
            },
            immediate: true,
        },
        modelValue: {
            handler(value: string) {
                this.setValue(value);
            },
            immediate: true,
        },
    },
    mounted() {
        this.initEditor();
    },
    methods: {
        initEditor() {
            this.editorInstance = ace.edit(this.$el);
            this.editorInstance.getSession().setMode(`ace/mode/${TYPE_MAP[this.type] || "text"}`);
            this.editorInstance.setTheme("ace/theme/github");
            this.editorInstance.setOptions({
                // enableBasicAutocompletion: true,
                // enableSnippets: true,
                // enableLiveAutocompletion: false
            });
            this.editorInstance.on("change", () => {
                const content = this.editorInstance?.getValue();
                this.$emit("update:modelValue", content);
                this.$emit("change", content);
            });
            this.$emit("ready", this.editorInstance);
        },
        setValue(value: string) {
            this.editorInstance?.setValue(value);
            this.editorInstance?.clearSelection();
        },
    },
})
</script>

<style lang="scss">
#editor {
    width: 100%;
    height: 90%;
}
</style>
