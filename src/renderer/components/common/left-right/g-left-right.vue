/*
    创建者：shuxiaokai
    创建时间：2021-06-30 22:48
    模块名称：可拖拽左右组件
    备注：
*/
<template>
    <div ref="leftRight" class="left-right">
        <!-- 左侧 -->
        <div ref="leftDom" class="left-wrap">
            <slot name="left" />
        </div>
        <div ref="resizeBar" class="resize-bar" @mousedown="handleResizeMousedown"></div>
        <!-- 右侧 -->
        <div ref="rightDom" class="right-wrap">
            <slot name="right" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        leftWidth: {
            type: Number,
            default: 350
        },
        minLeftWidth: {
            type: Number,
            default: 150,
        },
    },
    data() {
        return {
            //=====================================dom元素====================================//
            resizeBarDom: null as HTMLElement | null,
            leftDom: null as HTMLElement | null,
            rightDom: null as HTMLElement | null,
            //=====================================拖拽相关参数====================================//
            wrapWidth: 0,
            leftDomWidth: this.leftWidth,
            mousedownLeft: 0,
            mousedownTop: 0,
        };
    },
    mounted() {
        this.init();
    },
    beforeUnmount() {
        document.documentElement.removeEventListener("mouseup", this.handleMouseup); //清除事件
        document.documentElement.removeEventListener("mousemove", this.handleResizeMousemove); //清除事件
    },
    methods: {
        //初始化
        init() {
            this.leftDom = this.$refs.leftDom as HTMLElement;
            this.rightDom = this.$refs.rightDom as HTMLElement;
            this.leftDom.style.width = `${this.leftDomWidth}px`;
            this.resizeBarDom = this.$refs.resizeBar as HTMLElement;
            document.documentElement.addEventListener("mouseup", this.handleMouseup)
        },
        //处理全局鼠标松开
        handleMouseup(e: MouseEvent) {
            e.stopPropagation()
            this.leftDomWidth = this.leftDom?.getBoundingClientRect().width || this.minLeftWidth;
            document.documentElement.removeEventListener("mousemove", this.handleResizeMousemove);
        },
        //处理鼠标按下事件
        handleResizeMousedown(e: MouseEvent) {
            this.mousedownLeft = e.clientX;
            this.mousedownTop = e.clientY;
            document.documentElement.addEventListener("mousemove", this.handleResizeMousemove);
        },
        //处理鼠标移动事件
        handleResizeMousemove(e: MouseEvent) {
            e.preventDefault();
            e.stopPropagation();
            let moveLeft = 0;
            moveLeft = e.clientX - this.mousedownLeft + this.leftDomWidth;
            if (moveLeft < this.minLeftWidth) {
                return;
            }
            if (this.leftDom) {
                this.leftDom.style.width = `${moveLeft}px`
            }
        },
    },
})
</script>

<style lang="scss">
.left-right {
    height: 100%;
    width: 100%;
    display: flex;
    .left-wrap {
        flex: 0 0 auto;
        padding: 0 size(10);
    }
    .resize-bar {
        flex: 0 0 3px;
        padding: 0 4px;
        cursor: col-resize;
        background: $gray-300;
    }
    .right-wrap {
        flex-grow: 1;
        flex-shrink: 1;
        padding: 0 size(10);
    }
}
</style>
