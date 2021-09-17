/*
    创建者：shuxiaokai
    创建时间：2021-06-23 21:14
    模块名称：弹窗组件
    备注：
*/
<template>
    <el-dialog
        :model-value="modelValue"
        :title="title"
        v-bind="$attrs"
        :before-close="closeModel"
        :close-on-press-escape="easyClose"
        :close-on-click-modal="easyClose"
    >
        <slot />
        <template #footer>
            <span>
                <slot name="footer" />
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        /**
         * 是否显示dialog
         */
        modelValue: {
            type: Boolean,
            default: false,
        },
        /**
         * 标题
         */
        title: {
            type: String,
            default: "",
        },
        /**
         * 是否可以通过escape和点击model关闭
         */
        easyClose: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:modelValue", "close"],
    methods: {
        //关闭弹窗
        closeModel() {
            this.$emit("update:modelValue", false);
            this.$emit("close", false);
        },
    },
})
</script>

<style lang="scss">

</style>
