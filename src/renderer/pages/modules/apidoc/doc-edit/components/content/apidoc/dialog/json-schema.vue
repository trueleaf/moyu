/*
    创建者：shuxiaokai
    创建时间：2019-11-25 14:26"
    模块名称：xxxx
    备注：xxxx
*/
<template>
    <s-dialog title="数据转换" :isShow="visible" @close="closeModel">
        <el-radio-group v-model="convertType">
            <el-radio label="append">追加</el-radio>
            <el-radio label="override">替换</el-radio>
        </el-radio-group>
        <div class="d-flex j-end">
            <el-button type="text" @click="formatJSON">格式化JSON</el-button>
        </div>
        <div class="coder-wrap">
            <s-code-editor v-model="jsonParams" type="json" @ready="handleCodeReady"></s-code-editor>
        </div>
        <span slot="footer">
            <el-button type="primary" size="mini" @click="addNewParams">确认添加</el-button>
            <el-button type="danger" size="mini" @click="closeModel">取消</el-button>
        </span>
    </s-dialog>
</template>

<script>
import json5 from "json5"
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数

export default {
    mixins: [mixin],
    props: {
        visible: { //是否显示弹窗
            type: Boolean,
            default: false,
        },
        mindParams: { //联想参数
            type: [Object, Array],
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            convertType: "append", //转换方式，追加还是替换
            jsonParams: "", //json参数
            editorInstance: null, //编辑器实例
        };
    },
    mounted() {},
    methods: {
        handleCodeReady(editor) {
            this.editorInstance = editor;
            this.editorInstance.on("paste", () => {
                try {
                    setTimeout(() => {
                        this.editorInstance.setValue(JSON.stringify(json5.parse(this.jsonParams), null, "\t"));
                    })
                } catch (e) {
                    console.error(e);
                }
            });
        },
        formatJSON() {
            try {
                this.editorInstance.setValue(JSON.stringify(json5.parse(this.jsonParams), null, "\t"));
            } catch (e) {
                console.error(e);
                this.$message.error("无法解析该字符串");
            }
        },
        // 新增数据参数转换
        addNewParams() {
            try {
                const convertResult = this.convertTreeDataToPlainParams(json5.parse(this.jsonParams), this.mindParams);
                if (this.convertType === "override") {
                    convertResult.push(this.generateProperty()); //粘贴json默认多追加一行参数
                }
                this.$emit("success", convertResult, this.convertType);
                this.closeModel();
            } catch (e) {
                console.error(e);
                this.$message.error("无法解析该字符串");
            }
        },
        //=========================================================================//
        //关闭弹窗
        closeModel() {
            this.$emit("update:visible", false);
        },
    },
};
</script>

<style lang="scss">
    .coder-wrap {
        height: 300px;
        overflow-y: auto;
    }
</style>
