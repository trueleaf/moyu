/*
    创建者：shuxiaokai
    创建时间：2021-07-29 22:36
    模块名称：文字强调组件
    备注：
*/
<template>
    <span>
        <span>{{ leftStr }}</span>
        <span
            :style="{
                color: background ? '' : activeColor,
                background: isMatched && background ? activeColor : '',
            }"
        >{{ emphasizeStr }}</span>
        <span>{{ rightStr }}</span>
    </span>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        /**
         * 原始值
         */
        value: {
            type: String,
            default: "",
        },
        /**
         * 关键字
         */
        keyword: {
            type: String,
            default: "",
        },
        /**
         * 高亮颜色
         */
        activeColor: {
            type: String,
            default: "#f60",
        },
        /**
         * 开启则背景颜色高亮而非文字高亮
         */
        background: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            leftStr: "", //----------高亮字符串左侧字符串
            emphasizeStr: "", //-----高亮字符串
            rightStr: "", //---------高亮字符串右边字符串
        };
    },
    computed: {
        isMatched(): boolean {
            return !!(this.keyword && this.value.toLowerCase().match(this.keyword.toLowerCase()))
        },
    },
    watch: {
        keyword: {
            handler() {
                this.spliceStr();
            },
            immediate: true,
        },
        value: {
            handler() {
                this.spliceStr();
            },
            immediate: true,
        },
    },
    methods: {
        spliceStr() {
            const index = this.value.toLowerCase().indexOf(this.keyword.toLowerCase()); //匹配位置
            const offset = this.keyword.length; //偏移位置
            if (index === -1 || this.keyword.trim() === "") {
                this.leftStr = this.value;
                this.emphasizeStr = "";
                this.rightStr = "";
                return;
            }
            const strArr = this.value.split("");
            this.leftStr = strArr.slice(0, index).join("");
            this.emphasizeStr = strArr.slice(index, index + offset).join("");
            this.rightStr = strArr.slice(index + offset).join("");
        },
    },
})
</script>

<style lang="scss">

</style>
