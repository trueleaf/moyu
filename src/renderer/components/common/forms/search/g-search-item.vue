/*
    创建者：shuxiaokai
    创建时间：2021-06-15 22:49
    模块名称：搜索数据项
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
import { defineComponent } from "vue"

export default defineComponent({
    name: "SearchItem",
    inject: ["formInfo"],
    props: {
        type: { //表单组件类型 input select date daterange text
            type: String,
            default: "input",
        },
        label: { //文案
            type: String,
            default: ""
        },
        placeholder: { //placeholder
            type: String,
            default: "",
        },
        prop: { //绑定参数的字段名称
            type: [String, Number, Boolean, Array],
            default: "",
        },
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
    methods: {
    },
})
</script>

<style lang="scss">

</style>
