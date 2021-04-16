/*
    创建者：shuxiaokai
    创建时间：2019-05-06 22:03
    模块名称：编辑器(ace.js)
    备注：xxxx
*/
<template>
    <pre id="editor"></pre>
</template>

<script>
import ace from "brace";
import "brace/mode/json";
import "brace/mode/javascript";
import "brace/mode/html";
import "brace/mode/xml";
import "brace/mode/text";
import "brace/theme/github";

export default {
    props: {
        type: {
            type: String,
            default: "javascript",
        },
        value: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            editorInstance: null,
        };
    },
    watch: {
        type: {
            handler() {
                if (this.editorInstance) {
                    this.editorInstance.getSession().setMode(`ace/mode/${this.type}`);
                }
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
            this.editorInstance.getSession().setMode(`ace/mode/${this.type}`);
            this.editorInstance.setTheme("ace/theme/github");
            this.editorInstance.setOptions({
                // enableBasicAutocompletion: true,
                // enableSnippets: true,
                // enableLiveAutocompletion: false
            });
            this.editorInstance.on("change", () => {
                const content = this.editorInstance.getValue();
                this.$emit("input", content);
            });
            this.$emit("ready", this.editorInstance);
        },
        setValue(value) {
            this.editorInstance?.setValue(value);
            this.editorInstance?.clearSelection();
        },
    },
};
</script>

<style lang="scss">
    #editor {
        width: 100%;
        height: 90%;
    }
</style>
