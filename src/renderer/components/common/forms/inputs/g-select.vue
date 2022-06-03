/*
    创建者：shuxiaokai
    创建时间：2021-06-22 21:25
    模块名称：下拉框
    备注：
*/
<template>
    <el-select
        :model-value="value"
        v-bind="$attrs"
        :placeholder="placeholder"
        :multiple="multi"
        filterable
        :size="config.renderConfig.layout.size"
        :class="className"
        clearable
        :visible-change="getSelectEnum"
        @change="handleChange"
    >
        <el-option v-for="(item, index) in realSelectEnum" :key="index" :label="item[selectProps.name]" :value="item[selectProps.id]"></el-option>
    </el-select>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import config from "@/../config/config"

export default defineComponent({
    props: {
        /**
         * 参数值
         */
        value: {
            type: [String, Number],
            default: ""
        },
        /**
         * 是否多选
         */
        multi: {
            type: Boolean,
            default: false,
        },
        /**
         * 下拉菜单值
         */
        selectEnum: {
            type: Array,
            default: () => []
        },
        /**
         * 下拉菜单props   用于id 和 name 映射
         */
        selectProps: {
            type: Object,
            default: () => ({
                id: "id",
                name: "name"
            })
        },
        /**
         * 用于通过url直接在组件内部获取枚举值
         */
        url: {
            type: String,
            default: null
        },
        /**
         * 是否返回原始数据
         */
        rawResult: {
            type: Boolean,
            default: false
        },
        /**
         * 自定义className
         */
        className: {
            type: String,
            default: "w-100"
        },
        /**
         * 自定义placeholder
         */
        placeholder: {
            type: String,
            default: "",
        },
    },
    emits: ["change", "update:value"],
    data() {
        return {
            realSelectEnum: [] as Record<string, string | number | undefined>[],
            config,
        };
    },
    watch: {
        selectEnum: {
            handler(val: undefined | Record<string, string | number | undefined>[]) {
                if (val && val.length > 0) {
                    this.realSelectEnum = val;
                }
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        //获取下拉菜单枚举值
        getSelectEnum() {
            this.axios.get(this.url).then((res) => {
                this.realSelectEnum = res.data;
            }).catch((err) => {
                console.error(err);
            });
        },
        //数据改变
        handleChange(val: unknown) {
            if (this.rawResult && this.multi) { //多选返回原始数据
                this.$emit("change", val);
                this.$emit("update:value", val);
            } else if (!this.multi) { //单选
                if (val === "") { //如果是空字符，则返回null
                    this.$emit("change", null);
                    this.$emit("update:value", null);
                } else {
                    this.$emit("change", val);
                    this.$emit("update:value", val);
                }
            }
        },
    },
})
</script>

<style lang="scss">

</style>
