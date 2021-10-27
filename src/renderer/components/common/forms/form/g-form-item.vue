/*
    创建者：shuxiaokai
    创建时间：2021-06-15 22:49
    模块名称：表单数据项
    备注：
*/
<template>
    <!-- 普通输入框 -->
    <s-col v-if="type === 'input'" v-bind="$attrs">
        <el-form-item :label="realLabel" :prop="prop">
            <s-input v-model:value="formInfo[prop]" :placeholder="realPlaceholder"></s-input>
        </el-form-item>
    </s-col>
    <!-- 下拉搜索框 -->
    <s-col v-if="type === 'select'" v-bind="$attrs">
        <el-form-item :label="realLabel" :prop="prop">
            <s-select v-model:value="formInfo[prop]" v-bind="$attrs" :placeholder="realPlaceholder"></s-select>
        </el-form-item>
    </s-col>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue"

export default defineComponent({
    name: "FormItem",
    props: {
        /**
         * 表单组件类型 input select date daterange text
         */
        type: {
            type: String,
            default: "input",
        },
        /**
         * 文案
         */
        label: {
            type: String,
            default: ""
        },
        /**
         * placeholder
         */
        placeholder: {
            type: String,
            default: "",
        },
        /**
         * 绑定参数的字段名称
         */
        prop: {
            type: [String],
            default: "",
        },
        //=====================================快捷规则====================================//
        /**
         * 必填校验
         */
        required: {
            type: Boolean,
            default: false,
        },
        /**
         * 最大长度
         */
        maxLength: {
            type: Number,
            default: null,
        },
        /**
         * 最小长度
         */
        minLength: {
            type: Number,
            default: null,
        },
        /**
         * 长度恰好等于
         */
        length: {
            type: Number,
            default: null,
        },
        /**
         * 手机号校验
         */
        phone: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const formInfo = inject<Record<string, unknown>>("formInfo", {})
        return {
            formInfo,
        }
    },
    data() {
        return {};
    },
    computed: {
        realLabel(): string { //实际label值，自动拼接
            if (this.label.endsWith("：")) {
                return this.label;
            } if (this.label.endsWith(":")) {
                return this.label.replace(":", "：");
            }
            return `${this.label}：`;
        },
        realPlaceholder(): string { //实际placeholder值
            return this.placeholder ? this.placeholder : `请输入${this.label}`;
        },
    },
})
</script>

<style lang="scss">

</style>
