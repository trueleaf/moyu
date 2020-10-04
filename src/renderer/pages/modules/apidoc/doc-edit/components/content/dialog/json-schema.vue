/*
    创建者：shuxiaokai
    创建时间：2019-11-25 14:26"
    模块名称：xxxx
    备注：xxxx
*/
<template>
    <s-dialog title="数据转换" :isShow="visible" @close="closeModel">
        <el-divider content-position="left">支持标准json,json5</el-divider>
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
import uuid from "uuid/v4"
export default {
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        plain: { //为true代表不解析嵌套数据，适用于get请求
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            jsonParams: "",
            editorInstance: null,
        };
    },
    mounted() {
       
    },
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
                const convertResult = this.convertObjectToParams(json5.parse(this.jsonParams));
                convertResult.push(this.generateParams()); //粘贴json默认多追加一行参数
                this.$emit("success", convertResult);
                this.closeModel();
            } catch (e) {
                console.error(e);
                this.$message.error("无法解析该字符串");
            }
        },
        /** 
         * @description        将对象转换为后台接受的请求参数
         * @author             shuxiaokai
         * @updateAuthor       shuxiaokai
         * @create             2019-11-25 15:14
         * @update             2019-11-25 15:14
         * @param {Object}     obj - 标准对象       
         * @return {Object}    符合后台接受规范的数据
         * 
         * @example 返回值  
         *  description: "项目类型名称"
         *  key: "code"
         *  required: true
         *  type: "string"
         *  value: "0"
         *  id: "xxx",
         *  children
         * 
         * 
         */
        convertObjectToParams(obj) {
            const result = [];
            const foo = (treeData, result) => {
                const treeDataType = this.getType(treeData)
                if (treeDataType !== "object" && treeDataType !== "array") {
                    result.push(Object.assign(this.generateParams(treeDataType), { value: treeData }))
                } else {
                    for (const i in treeData) {
                        if (Array.isArray(treeData[i])) {
                            const firstEle = treeData[i][0];
                            const data = Object.assign(this.generateParams("array"), { key: i });
                            if (this.plain) {
                                data.type = "string"
                            }
                            if (this.getType(firstEle) === "object") {
                                result.push(data)
                                if (!this.plain) {
                                    data.children[0] = this.generateParams("object");
                                    foo(treeData[i][0], data.children[0].children);   
                                }
                            } else {
                                result.push(data)
                                if (!this.plain) {
                                    foo(treeData[i][0], data.children);     
                                }
                            }
                        } else if (typeof treeData[i] === "object") {
                            const data = Object.assign(this.generateParams("object"), { key: i })
                            if (this.plain) {
                                data.type = "string"
                            }
                            result.push(data)
                            const childData = data.children;
                            if (!this.plain) {
                                foo(treeData[i], childData);   
                            }
                        } else {
                            const data = Object.assign(this.generateParams("object"), { key: i, type: this.getType(treeData[i]), value: treeData[i] })
                            if (this.plain) {
                                data.type = "string"
                            }
                            result.push(data)
                        }
                    }                    
                }
            }
            foo(obj, result);
            return result;
        },

        generateParams(type = "string") {
            return {
                id: uuid(),
                key: "", //--------------参数键
                value: "", //------------参数值
                type, //-----------------参数值类型
                description: "", //------描述
                required: true, //-------是否必填
                children: [], //---------子参数
                _select: true
            };
        },
        //获取参数类型
        getType(value) {
            if (typeof value === "string") {
                return "string"
            } else if (typeof value === "number") { //NaN
                return "number"
            } else if (typeof value === "boolean") {
                return "boolean"
            } else if (Array.isArray(value)) {
                return "array"
            } else if (typeof value === "object" && value !== null) {
                return "object"
            } else { // null undefined ...
                return "string"
            }
        },
        //=========================================================================//
        /* 
            @description  关闭弹窗
            @author        shuxiaokai
            @create       2019-10-19 22:39"
            @params       null
            @return       null
        */
        closeModel() {
            this.$emit("update:visible", false);
        },
    }
};
</script>



<style lang="scss">
    .coder-wrap {
        height: 300px;
        overflow-y: auto;
    }
</style>
