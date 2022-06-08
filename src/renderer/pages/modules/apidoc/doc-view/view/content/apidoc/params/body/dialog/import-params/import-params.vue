/*
    创建者：shuxiaokai
    创建时间：2021-08-29 10:49
    模块名称：导入参数
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" width="40%" title="导入参数" @close="handleClose">
        <div>
            <div class="d-flex j-end">
                <el-button link type="primary" text @click="formatJSON">格式化JSON</el-button>
            </div>
            <div class="h-300px">
                <s-raw-editor v-model="jsonParams" type="application/json" @ready="handleCodeReady"></s-raw-editor>
            </div>
        </div>
        <template #footer>
            <el-button type="primary" @click="handleSubmit">确认导入</el-button>
            <el-button type="warning" @click="handleClose">取消</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { Editor } from "brace";
import json5 from "json5"
import { apidocConvertJsonDataToParams } from "@/helper/index"

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
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
                        if (this.editorInstance) {
                            this.editorInstance.setValue(JSON.stringify(json5.parse(this.jsonParams), null, "\t"));
                        }
                    })
                } catch (e) {
                    console.error(e);
                }
            });
        },
        //格式化json
        formatJSON() {
            try {
                if (this.editorInstance) {
                    this.editorInstance.setValue(JSON.stringify(json5.parse(this.jsonParams), null, "\t"));
                }
            } catch (e) {
                console.error(e);
                this.$message.error("无法解析该字符串");
            }
        },
        //确定导入
        handleSubmit() {
            try {
                const convertResult = apidocConvertJsonDataToParams(json5.parse(this.jsonParams));
                this.$emit("success", convertResult);
                this.handleClose();
            } catch (e) {
                console.error(e);
                this.$message.error("无法解析该字符串");
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
