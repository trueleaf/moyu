/*
    创建者：shuxiaokai
    创建时间：2021-07-28 22:11
    模块名称：左右拖动组件
    备注：
*/
<template>
    <div ref="wrapper" :style="{'userSelect': isDragging ? 'none' : 'auto'}" class="drag-wrap">
        <div ref="bar" class="bar" :class="{active: isDragging}" @mousedown="handleResizeMousedown"></div>
        <div v-if="isDragging" class="indicator">
            <div class="left"></div>
            <div class="ct">{{ realTimeWidth }}px</div>
            <div class="right"></div>
        </div>
        <slot />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        /**
         * 初始宽度
         */
        width: {
            type: Number,
            default: null,
        },
        /**
         * 最小宽度
         */
        min: {
            type: Number,
            default: 100,
        },
        /**
         * 最大宽度
         */
        max: {
            type: Number,
            default: 400,
        },
        /**
         * 是否记忆上次位置信息
         */
        remember: {
            type: Boolean,
            default: true,
        },
        /**
         * 组件名称(必填，用于localstorage存储)
         */
        name: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            realTimeWidth: 0, //---------------实时宽度
            mousedownLeft: 0, //---------------鼠标点击距离
            wrapperWidth: 0, //----------------拖拽dom元素宽度
            isDragging: false, //--------------是否正在拖拽
        };
    },
    mounted() {
        this.initDrag();
    },
    unmounted() {
        document.documentElement.removeEventListener("mousemove", this.handleResizeMousemove);
        document.documentElement.removeEventListener("mouseup", this.handleResizeMouseup)
    },
    methods: {
        //初始化拖拽相关事件
        initDrag() {
            document.documentElement.addEventListener("mouseup", this.handleResizeMouseup);
            const { wrapper, bar } = this.$refs;
            if (this.remember) {
                const wrapperWidth = localStorage.getItem(`apidoc/${this.name}`) || 300;
                (bar as HTMLElement).style.left = `${wrapperWidth}px`;
                (wrapper as HTMLElement).style.width = `${wrapperWidth}px`;
                this.realTimeWidth = Number(wrapperWidth);
            } else {
                const width = this.width ? `${this.width}px` : `${(this.$refs.wrapper as HTMLElement).getBoundingClientRect().width}px`;
                (bar as HTMLElement).style.left = width;
                (wrapper as HTMLElement).style.width = width;
                this.realTimeWidth = Number(width);
            }
        },
        //处理鼠标弹起事件
        handleResizeMouseup() {
            this.isDragging = false;
            document.documentElement.removeEventListener("mousemove", this.handleResizeMousemove);
        },
        //处理鼠标按下事件
        handleResizeMousedown(e: MouseEvent) {
            this.mousedownLeft = e.clientX;
            this.wrapperWidth = (this.$refs.wrapper as HTMLElement).getBoundingClientRect().width;
            this.isDragging = true;
            document.documentElement.addEventListener("mousemove", this.handleResizeMousemove);
        },
        //处理鼠标移动事件
        handleResizeMousemove(e: MouseEvent) {
            const { bar, wrapper } = this.$refs;
            const moveLeft = e.clientX - this.mousedownLeft;
            const wrapperWidth = moveLeft + this.wrapperWidth;
            if (wrapperWidth < this.min || wrapperWidth > this.max) {
                return;
            }
            (bar as HTMLElement).style.left = `${moveLeft + this.wrapperWidth}px`;
            (wrapper as HTMLElement).style.width = `${moveLeft + this.wrapperWidth}px`;
            if (this.remember) {
                localStorage.setItem(`apidoc/${this.name}`, (moveLeft + this.wrapperWidth).toString());
            }
            this.realTimeWidth = moveLeft + this.wrapperWidth;
        },
    },
})
</script>

<style lang="scss">
.drag-wrap {
    position: relative;
    .indicator {
        width: 100%;
        position: absolute;
        top: 1px;
        z-index: 1;
        display: flex;
        align-items: center;
        padding: 0 size(10);
        .left, .right {
            border-bottom: 1px dashed $red;
            width: 40%;
        }
        .ct {
            flex: 1;
            text-align: center;
            color: $gray-600;
        }
    }
    &>.bar {
        @include bar;
    }
}
</style>
