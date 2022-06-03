/*
    创建者：shuxiaokai
    创建时间：2021-06-21 23:48
    模块名称：
    备注：
*/
<template>
    <el-input
        ref="ipt"
        v-bind="$attrs"
        :model-value="value"
        :placeholder="placeholder"
        :maxlength="9999"
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
        /**
         * v-model绑定的值
         */
        value: {
            type: [String, Number],
            default: "",
        },
        /**
         * 自定义class值
         */
        className: {
            type: String,
            default: "w-100",
        },
        /**
         * placeholder(翻译为占位符)
         */
        placeholder: {
            type: String,
            default: "",
        },
        /**
         * 是否默认focus
         */
        focus: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:value"],
    data() {
        return {
            config, //全局配置
        };
    },
    watch: {
        focus: {
            handler() {
                setTimeout(() => {
                    (this.$refs.ipt as HTMLInputElement).focus();
                })
            },
            immediate: true,
        },
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
