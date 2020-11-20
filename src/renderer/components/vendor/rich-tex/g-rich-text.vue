/*
    创建者：shuxiaokai
    创建时间：2020-11-20 13:46
    模块名称：
    备注：xxxx
*/
<template>
    <div id="editor">

    </div>
</template>

<script>
import E from "wangeditor"
import hljs from "highlight.js"
export default {
    props: {
        value: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            editorInstance: null,
            config: {
                heigth: 300,
                placeholder: "在这里可以添加一些描述信息",
                showFullScreen: false,
                menus: [
                    "head",
                    "bold",
                    "fontSize",
                    "italic",
                    "underline",
                    "strikeThrough",
                    "indent",
                    "foreColor",
                    "backColor",
                    "link",
                    "list",
                    "justify",
                    "quote",
                    "image",
                    "table",
                    "code",
                    "splitLine",
                    "undo",
                    "redo",
                ]
            },
        };
    },
    mounted() {
        this.initEditor();
        
    },
    methods: {
        initEditor() {
            this.editorInstance = new E("#editor");
            this.editorInstance.highlight = hljs
            this.editorInstance.config.height = this.config.heigth;
            this.editorInstance.config.placeholder = this.config.placeholder;
            this.editorInstance.config.menus = this.config.menus;
            this.editorInstance.config.showFullScreen = this.config.showFullScreen;
            this.editorInstance.config.onchange = (value) => {
                this.$emit("input", value);
            }
            this.initUploadFile();
            this.editorInstance.txt.html(this.value)
            this.editorInstance.create();
        },
        initUploadFile() {
            this.editorInstance.config.customUploadImg = function (resultFiles, insertImgFn) {
                console.log(resultFiles)
                insertImgFn("")
            }
        },
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
