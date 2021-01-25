/*
    创建者：shuxiaokai
    创建时间：2020-02-17 16:59
    模块名称：搜索项目
    备注：xxxx
*/
<template>

    <!-- 普通输入框 -->
    <s-input v-if="type !== 'custom' && type === 'input'" v-model="formInfo[vModel]" v-bind="$attrs" :label="label" @input="handleChange" v-on="$listeners"></s-input>
    <!-- 选择框 -->
    <s-select v-else-if="type !== 'custom' && type === 'select'" v-model="formInfo[vModel]" v-bind="$attrs" :label="label" @change="handleChange" v-on="$listeners"></s-select>
    <!-- 级联选择 -->
    <!-- <s-cascader2
            v-else-if="type !== 'custom' && type === 'cascader'"
            :vModels="vModels"
            :value="cascaderData"
            v-bind="$attrs"
            :label="label"
            @change="handleChange"
            v-on="$listeners"
    >
    </s-cascader2> -->
    <s-cascader2 
            v-else-if="type !== 'custom' && type === 'cascader'"
            :options="cascaderOptions"
            v-bind="$attrs"
            :label="label"
            @input="handleChange"
            v-on="$listeners"
    >
    </s-cascader2>
    <!-- 单日期 -->
    <s-date v-else-if="type !== 'custom' && type === 'date'" v-model="formInfo[vModel]" v-bind="$attrs" :label="label" @change="handleChange" v-on="$listeners"></s-date>
    <!-- 多日期 -->
    <s-daterange v-else-if="type !== 'custom' && type === 'daterange'" :vModel.sync="formInfo[vModel]" :vModel2.sync="formInfo[vModel2]" v-bind="$attrs" :label="label" @change="handleChange" v-on="$listeners"></s-daterange>
    <div v-else>
        <slot />
    </div>
</template>

<script>
import { debounce } from "@/lib"
export default {
    name: "SSearchItem",
    props: {
        label: { //文案
            type: String,
            default: ""
        },
        vModel: { //v-model绑定值
            type: String,
            default: ""
        },
        vModel2: { //第二个v-model值，用于日期范围选择
            type: String,
            default: ""
        },
        type: { //搜索框类型  input select date daterange
            type: String,
            default: "input"
        },
        vModels: { //级联选择多个vmodel
            type: Array,
            default() {
                return [];
            }
        }, 
        cascaderOptions: { //级联选择器配置
            type: Array,
            default() {
                return [];
            }
        },
    },
    data() {
        return {
            //=========================================================================//
            debounceFn: null, //节流函数
        };
    },
    computed: {
        dateOptions() {
            /*eslint-disable indent*/
            switch (this.dateLimit) {
                case "gt":
                    return this.pickerOptions
                case "gte":
                    return this.pickerOptions2
                case "lt":
                    return this.pickerOptions3
                case "lte":
                    return this.pickerOptions4    
                default:
                    return {};
            } 
        },
        realLabel() {
            if (this.label.endsWith("：")) {
                return this.label;
            } else if (this.label.endsWith(":")) {
                return this.label.replace(":", "：")
            } else {
                return this.label + "："
            }
        },
        placeholder() {
            if (this.type === "input") {
                return "请输入" + this.label;
            } else {
                return "请选择" + this.label;
            }
        },
    },
    watch: {
        formInfo: {
            handler(formInfo) {
                if (this.type === "cascader") { //级联选择器处理
                    this.cascaderOptions.forEach((val, index) => {
                        const key = val.vModel;
                        this.$set(this.cascaderOptions[index], "value", formInfo[key])
                    })
                }
            },
            deep: true
        },
    },
    inject: ["formInfo"],
    created() {
       
    },
    methods: {
        //搜索框数据发生改变
        handleChange(value) {
            if (this.type === "cascader") {
                for (const i in value) {
                    this.formInfo[i] = value[i]
                }
            }
            if (!this.getAncestorComponent("SSearch").autoRequest) {
                return;
            }
            if (!this.debounceFn) {
                this.debounceFn = debounce((args) => {
                    this.dispatch("SSearch", "_change", args); //hack change会触发栈溢出，不知道为什么
                }, 500);
            } 
            this.debounceFn(value);
        },
    },
};
</script>



<style lang="scss" scoped>
.el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100%!important;
}
</style>
