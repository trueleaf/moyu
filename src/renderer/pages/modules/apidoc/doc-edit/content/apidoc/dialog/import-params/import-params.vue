/*
    创建者：shuxiaokai
    创建时间：2021-08-29 10:49
    模块名称：导入参数
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" width="40%" :title="$t('导入参数')" @close="handleClose">
        <div>
            <div class="d-flex j-end">
                <el-button link type="primary" text @click="formatJSON">{{ $t("格式化JSON") }}</el-button>
            </div>
            <div class="h-300px">
                <s-raw-editor v-model="jsonParams" type="application/json" @ready="handleCodeReady"></s-raw-editor>
            </div>
        </div>
        <template #footer>
            <div class="orange">完整导入可以保留数组全部元素，导入只保留数组第一个元素</div>
            <el-button type="primary" @click="handleSubmit(true)">{{ $t("导入") }}</el-button>
            <el-button type="primary" @click="handleSubmit(false)">{{ $t("完整导入") }}</el-button>
            <el-button type="warning" @click="handleClose">{{ $t("取消") }}</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import json5 from "json5"
import { Editor } from "brace";
import { ApidocProperty } from "@@/global";

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        pickFirstItem: { //json转换时候，对于数组操作是否只转换第一个元素
            type: Boolean,
            default: false
        }
    },
    emits: ["update:modelValue", "success"],
    data() {
        return {
            editorInstance: null as null | Editor,
            jsonParams: "",
        };
    },
    methods: {
        handleCodeReady(editor: Editor) {
            this.editorInstance = editor;
            this.editorInstance.on("paste", () => {
                try {
                    setTimeout(() => {
                        this.editorInstance?.setValue(JSON.stringify(json5.parse(this.jsonParams), null, "\t"));
                    })
                } catch (e) {
                    console.error(e);
                }
            });
        },
        //格式化json
        formatJSON() {
            try {
                this.editorInstance?.setValue(JSON.stringify(json5.parse(this.jsonParams), null, "\t"));
            } catch (e) {
                console.error(e);
                this.$message.error(this.$t("无法解析该字符串"));
            }
        },
        //确定导入
        handleSubmit(pickFirstItem: boolean) {
            try {
                let convertResult: ApidocProperty[] | null = null;
                if (pickFirstItem === false) { //false代表完整导入
                    convertResult = this.$helper.apidocConvertJsonDataToParams(json5.parse(this.jsonParams), undefined, false);
                } else {
                    convertResult = this.$helper.apidocConvertJsonDataToParams(json5.parse(this.jsonParams), undefined, true);
                }
                this.$emit("success", convertResult);
                this.handleClose();
            } catch (e) {
                console.error(e);
                this.$message.error(this.$t("无法解析该字符串"));
            }
        },
        //关闭弹窗
        handleClose() {
            this.$emit("update:modelValue", false);
        },
    },
})
</script>

<style lang="scss">

</style>
