/*
    创建者：shuxiaokai
    创建时间：2020-04-29 22:44
    模块名称：
    备注：xxxx
*/
<template>
    <div class="monaco-wrap">
        <div ref="monaco" class="monaco"></div>
    </div>
</template>

<script>
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js"; //基础api
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js" //语言类型
// import "monaco-editor/esm/vs/basic-languages/json/json.contribution.js" //语言类型


export default {
    data() {
        return {
            editorInstance: null, //编辑器实例
            tips: "",
        };
    },
    mounted() {
        this.initEditor();
    },
    methods: {
        //=====================================初始化====================================//
        initEditor() {
            this.editorInstance = monaco.editor.create(
                this.$refs["monaco"],
                {
                    acceptSuggestionOnEnter: "on",
                    language: "javascript",
                    theme: "vs-dark"
                }
            );
            this.editorInstance.onDidChangeModelContent(() => {
                const newValue = this.editorInstance.getValue();
                console.log(newValue)
            })
        },
        //=====================================前后端交互====================================//
        //=====================================组件间交互====================================//  
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">
.e {
    width: 800px;
    height: calc(100vh - #{size(160)});
    .monaco {
        width: 100%;
        height: 100%;
    }
}
</style>
