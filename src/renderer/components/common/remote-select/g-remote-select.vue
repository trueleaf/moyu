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
            <div v-if="dataLoading" class="loading">{{ $t("加载中") }}...</div>
            <div v-if="!dataLoading && !$slots.default" class="empty">{{ $t("暂无数据") }}</div>
            <slot v-if="!dataLoading && $slots.default" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import { $t } from "@/i18n/i18n"

type DebounceFn = (query: string) => void;

export default defineComponent({
    props: {
        /**
         * placeholder
         */
        placeholder: {
            type: String,
            default: `${$t("请输入")}...`,
        },
        /**
         * 远程搜索方法
         */
        remoteMethods: {
            type: Function as PropType<(query: string) => void>,
            default: null,
        },
        /**
         * 数据加载状态
         */
        loading: {
            type: Boolean,
            default: false,
        },
        /**
         * 用于处理v-model
         */
        modelValue: {
            type: String,
            default: "",
        },
    },
    emits: ["update:modelValue"],
    data() {
        return {
            query: "", //-------------------------------输入值
            selectData: [], //--------------------------搜索项目
            debounceFn: null as null | DebounceFn, //---节流函数
            dataLoading: false, //----------------------加载效果
        };
    },
    watch: {
        query(val) {
            if (val != null || val === "") {
                this.dataLoading = true;
                if (!this.debounceFn) {
                    this.debounceFn = this.$helper.debounce<DebounceFn>((query) => {
                        this.getData(query);
                    });
                }
                this.debounceFn(val);
            }
        },
        loading(val) {
            this.dataLoading = val;
        },
        modelValue(val) {
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
        //处理搜索
        handleInput() {
            this.$emit("update:modelValue", this.query);
        },
    },
})
</script>

<style lang="scss">
.remote-select {
    width: 100%;
    position: relative;
    .remote-select-inner {
        width: 100%;
        outline: 0;
        padding: 0 size(15);
        height: size(28);
        border: 1px solid $gray-300;
        border-radius: $border-radius-sm;
        color: $gray-700;
        font-size: fz(12);
        &::-webkit-input-placeholder {
            color: $gray-500;
        }
    }
    .select-panel {
        position: absolute;
        left: 0;
        top: size(36);
        z-index: $zIndex-panel;
        overflow-y: scroll;
        // padding: size(10) size(20);
        width: 100%;
        max-height: size(200);
        background: $white;
        border: 1px solid $gray-300;
        border-radius: $border-radius-base;
        line-height: normal;
        box-shadow: $box-shadow-sm;
        .empty,.loading {
            font-size: fz(12);
            color: $gray-500;
            padding: size(10) size(20);
        }
    }
}
</style>
