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
import { defineComponent, PropType, WatchStopHandle } from "vue"
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
        readonly: {
            type: Boolean,
            default: false,
        }
    },
    emits: ["change", "ready", "update:modelValue"],
    data() {
        return {
            editorInstance: null as null | Editor,
            watchStoper: null as null | WatchStopHandle,
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
    },
    mounted() {
        this.initEditor();
        this.watchStoper = this.$watch("modelValue", (value: string) => {
            this.setValue(value)
        }, {
            immediate: true
        })
    },
    methods: {
        initEditor() {
            this.editorInstance = ace.edit(this.$el);
            this.editorInstance.$blockScrolling = Infinity;
            this.editorInstance.getSession().setMode(`ace/mode/${TYPE_MAP[this.type] || "text"}`);
            this.editorInstance.setTheme("ace/theme/github");
            this.editorInstance.setOptions({
                // enableBasicAutocompletion: true,
                // enableSnippets: true,
                // enableLiveAutocompletion: false
            });
            if (this.readonly) {
                this.editorInstance.setReadOnly(true);
            }
            this.editorInstance.on("change", () => {
                if (this.watchStoper) {
                    this.watchStoper();
                }
                const content = this.editorInstance?.getValue();
                this.$emit("update:modelValue", content);
                // this.$emit("change", content);
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
    height: 100%;
}
</style>
