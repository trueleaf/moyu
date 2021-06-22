/*
    创建者：shuxiaokai
    创建时间：2021-06-21 23:48
    模块名称：
    备注：
*/
<template>
    <el-input
        v-bind="$attrs"
        :model-value="value"
        :placeholder="placeholder"
        :maxlength="255"
        :size="config.renderConfig.layout.size"
        :class="className"
        clearable
        @update:modelValue="handleInput"
    >
    </el-input>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import config from "@/../config/config"

export default defineComponent({
    props: {
        value: { //v-model绑定的值
            type: [String, Number, Boolean, Array],
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
    emits: ["update:value"],
    data() {
        return {
            config, //全局配置
        };
    },
    methods: {
        handleInput(value: string) {
            this.$emit("update:value", value);
        },
    },
})
</script>

<style lang="scss">

</style>
