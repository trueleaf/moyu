/*
    创建者：shuxiaokai
    创建时间：2021-06-21 23:48
    模块名称：
    备注：
*/
<template>
    <el-input
        v-bind="$attrs"
        :value="value"
        :placeholder="realPlaceholder"
        :maxlength="255"
        :size="config.renderConfig.layout.size"
        :class="className"
        clearable
        @input="handleInput"
    >
    </el-input>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import config from "@/../config/config"

export default defineComponent({
    props: {
        label: { //文案
            type: String,
            default: "",
        },
        value: { //v-model绑定的值
            type: [String, Number, Boolean, Array],
            default: "",
        },
        prop: { //表单验证prop值
            type: String,
            default: "",
        },
        className: { //自定义class值
            type: String,
            default: "w-100",
        },
        placeholder: {
            type: String,
            default: "",
        },
    },
    emits: ["input"],
    data() {
        return {
            config, //全局配置
        };
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
        realPlaceholder(): string { //实际placeholder
            return this.placeholder ? this.placeholder : `请输入${this.label}`;
        },
    },
    methods: {
        handleInput() {
            this.$emit("input", this.value);
        },
    },
})
</script>

<style lang="scss">

</style>
