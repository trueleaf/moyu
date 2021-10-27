/*
    创建者：shuxiaokai
    创建时间：2021-07-30 22:39
    模块名称：contextmenu
    备注：
*/
<template>
    <div ref="contextmenu" class="s-contextmenu" :style="{width: width, left: left + 'px', top: realTop + 'px'}">
        <slot></slot>
    </div>
    <!-- <div class="contextmenu-shadow"></div> -->
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        /**
         * 默认宽度
         */
        width: {
            type: String,
            default: "200px",
        },
        /**
         * 左侧距离
         */
        left: {
            type: Number,
            default: 0
        },
        /**
         * 顶部距离
         */
        top: {
            type: Number,
            default: 0
        },
    },
    data() {
        return {
            realTop: 0,
        };
    },
    watch: {
        top: {
            handler(topVal: number) {
                setTimeout(() => { //保证dom加载完毕
                    const contextmenuDom = this.$refs.contextmenu as HTMLElement;
                    const { innerHeight } = window;
                    const { height } = contextmenuDom.getBoundingClientRect();
                    const contextPosition = height + topVal > innerHeight ? "top" : "bottom";
                    if (contextPosition === "top" && height > topVal) { //显示在上面但是contextmenu高度小于上面可用空间高度
                        contextmenuDom.style.height = `${topVal}px`;
                        contextmenuDom.style.overflowY = "auto";
                    } else if (contextPosition === "top") {
                        this.realTop = topVal - height;
                    } else {
                        this.realTop = topVal;
                    }
                }, 0)
            },
            immediate: true,
        },
    },
    methods: {
    },
})
</script>

<style lang="scss">
.s-contextmenu {
    position: fixed;
    background: $white;
    box-shadow: rgb(0 0 0 / 10%) 0px 2px 8px 0px; //墨刀弹窗样式
    z-index: $zIndex-contextmenu;
    animation: ctx-fade .2s;
    &::-webkit-scrollbar {
        width: size(5);
    }
    &::-webkit-scrollbar-thumb {
        background: $gray-400;
    }
    @keyframes ctx-fade {
        from {
            // transform: scale(0.8);
            opacity: 0;
        }
        to {
            // transform: scale(1);
            opacity: 1;
        }
    }
}
// .contextmenu-shadow {
//     position: fixed;
//     left: 0;
//     top: 0;
//     right: 0;
//     bottom: 0;
//     background: rgba(0, 0, 0, 0);
//     z-index: $zIndex-contextmenu - 1;
// }
</style>
