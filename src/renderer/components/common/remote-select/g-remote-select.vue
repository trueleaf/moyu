/*
    创建者：shuxiaokai
    创建时间：2021-07-13 21:28
    模块名称：
    备注：
*/
<template>
    <div class="remote-select">
        <input v-model="query" class="remote-select-inner" type="text" :placeholder="placeholder" @input="handleInput">
        <div v-if="query" class="select-panel">
            <div v-if="realLoading" class="loading">加载中...</div>
            <div v-if="!realLoading && !$slots.default" class="empty">暂无数据</div>
            <slot v-if="!realLoading && $slots.default" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
// import {  }

export default defineComponent({
    props: {
        placeholder: { //placeholder
            type: String,
            default: "请输入...",
        },
        remoteMethods: { //远程搜索方法
            type: Function,
            default: null,
        },
        loading: { //数据加载状态
            type: Boolean,
            default: false,
        },
        value: { //用于处理v-model
            type: String,
            default: "",
        },
    },
    emits: ["update:modelValue"],
    data() {
        return {
            query: "", //----------输入值
            selectData: [], //-----搜索项目
            debounceFn: null, //---节流函数
            realLoading: false, //-加载效果
        };
    },
    watch: {
        // query(val) {
        //     if (val != null || val === "") {
        //         this.realLoading = true;
        //         if (!this.debounceFn) {
        //             this.debounceFn = this.$helper.debounce((query) => {
        //                 this.getData(query);
        //             });
        //         }
        //         this.debounceFn(val);
        //     }
        // },
        loading(val) {
            this.realLoading = val;
        },
        value(val) {
            this.query = val;
        },
    },
    methods: {
        //获取远程数据
        getData(query: string) {
            if (this.remoteMethods) {
                this.remoteMethods(query);
            }
        },
        handleInput() {
            this.$emit("update:modelValue", this.query);
        },
    },
})
</script>

<style lang="scss">

</style>
