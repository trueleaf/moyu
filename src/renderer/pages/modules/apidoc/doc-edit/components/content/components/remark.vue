/*
    创建者：shuxiaokai
    创建时间：2020-10-13 13:26
    模块名称：备注编辑
    备注：xxxx
*/
<template>
    <div class="edit-remark" contenteditable @input="handleChangeTitle($event)" @blur="handleTitleBlur($event)" @focus="handleTitleFocus">{{ copyDescription }}</div>
</template>

<script>
export default {
    props: {
        value: {
            type: String,
            default: ""
        },
    },
    watch: {
        value: {
            handler() {
                if (this.description === "") {
                    this.description = this.value || "请输入接口描述";
                    this.copyDescription = this.value || "请输入接口描述";
                }
            },
            immediate: true
        },
        
    },
    data() {
        return {
            description: "", //-----------------------------描述
            copyDescription: "", //-------------------------请求描述拷贝
        };
    },
    created() {

    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        //改变title
        handleChangeTitle(e) {
            // this.request.description = e.target.innerText
            this.$emit("input", e.target.innerText);
        },
        //改变blur
        handleTitleBlur(e) {
            if (this.value.trim() === "") {
                this.description = this.copyDescription
                e.target.innerText = this.copyDescription;
                this.$emit("input", this.copyDescription);
            } else {
                this.description = e.target.innerText;
                this.copyDescription = e.target.innerText;
                this.$emit("input", e.target.innerText);
            }
        },
        //focus 全选title
        handleTitleFocus(e) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            const range = document.createRange();
            range.selectNodeContents(e.target);
            selection.addRange(range);
        },
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">
    .edit-remark {
        width: 100%;
        font-size: fz(16);
        padding: 0 size(10);
        height: size(38);
        border: 1px solid transparent;
        height: size(40);
        line-height: size(40);
        margin-bottom: size(10);
        &:hover {
            border: 1px dashed $gray-500;
        }        
    }
</style>
