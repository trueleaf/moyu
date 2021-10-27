/*
    创建者：shuxiaokai
    创建时间：2021-06-23 19:03
    模块名称：加载框
    备注：
*/
<template>
    <div v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.9)" class="s-loading">
        <slot />
        <div v-show="loading" class="loading-text">{{ loadingText }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { randomTip } from "@/helper/index"

export default defineComponent({
    props: {
        /**
         * 加载中状态
         */
        loading: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            loadingText: "",
        };
    },
    watch: {
        loading: {
            handler(val) {
                if (val) {
                    this.loadingText = randomTip();
                }
            },
            immediate: true,
        },
    },
})
</script>

<style lang="scss">
.s-loading {
    .loading-text {
        position: absolute;
        top: 60%;
        z-index: $zIndex-loading-text;
        font-size: fz(16);
        color: $theme-color;
        width: 100%;
        padding: 0 1em;
        text-align: center;
    }
}
</style>
