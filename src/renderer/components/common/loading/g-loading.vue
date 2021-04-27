/*
    创建者：shuxiaokai
    创建时间：2021-01-13 16:47
    模块名称：loading效果
    备注：
*/
<template>
    <div v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.9)" class="s-loading">
        <slot />
        <div v-show="loading" class="loading-text">{{ loadingText }}</div>
    </div>
</template>

<script>
export default {
    props: {
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
                    this.loadingText = this.randomTip()
                }
            },
            immediate: true,
        },
    },
    created() {

    },
    methods: {
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//

        //=====================================其他操作=====================================//

    },
};
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
