/*
    创建者：shuxiaokai
    创建时间：2021-07-28 22:11
    模块名称：左右拖动组件
    备注：
*/
<template>
    <div ref="wrapper" :style="{'userSelect': isDragging ? 'none' : 'auto'}" class="drag-wrap">
        <div ref="bar" class="bar" :class="{active: isDragging}" @mousedown="handleResizeMousedown" @dblclick="handleResetWidth"></div>
        <div v-show="isDragging" class="indicator">
            <div class="left"></div>
            <div class="ct">
                <div>{{ realTimeWidth.toFixed(0) }}px({{ $t("双击还原") }})</div>
                <!-- <div></div> -->
            </div>
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
        /**
         * bar在左侧还是右侧，默认在右侧
         */
        barLeft: {
            type: Boolean,
            default: false,
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
            const width = this.width ? `${this.width}px` : `${(this.$refs.wrapper as HTMLElement).getBoundingClientRect().width}px`;
            if (this.remember) {
                const wrapperWidth = localStorage.getItem(`dragBar/${this.name}`) || width;
                if (this.barLeft) {
                    (bar as HTMLElement).style.left = `${0}`;
                } else {
                    (bar as HTMLElement).style.left = `${wrapperWidth}`;
                }
                (wrapper as HTMLElement).style.width = `${wrapperWidth}`;
                this.realTimeWidth = parseFloat(wrapperWidth);
            } else {
                if (this.barLeft) {
                    (bar as HTMLElement).style.left = "0px";
                } else {
                    (bar as HTMLElement).style.left = `${width}`;
                }
                (wrapper as HTMLElement).style.width = width;
                this.realTimeWidth = parseFloat(width);
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
            let moveLeft = 0;
            if (this.barLeft) {
                moveLeft = this.mousedownLeft - e.clientX;
            } else {
                moveLeft = e.clientX - this.mousedownLeft;
            }
            const wrapperWidth = moveLeft + this.wrapperWidth;
            if (wrapperWidth < this.min || wrapperWidth > this.max) {
                return;
            }
            if (this.barLeft) {
                (bar as HTMLElement).style.left = `${0}px`;
            } else {
                (bar as HTMLElement).style.left = `${moveLeft + this.wrapperWidth}px`;
            }
            (wrapper as HTMLElement).style.width = `${moveLeft + this.wrapperWidth}px`;
            if (this.remember) {
                localStorage.setItem(`dragBar/${this.name}`, `${moveLeft + this.wrapperWidth}px`);
            }
            this.realTimeWidth = moveLeft + this.wrapperWidth;
        },
        //还原宽度
        handleResetWidth() {
            const { bar, wrapper } = this.$refs;
            // if (this.barLeft) {
            //     (bar as HTMLElement).style.left = `${0}px`;
            // } else {
            //     (bar as HTMLElement).style.left = `${moveLeft + this.wrapperWidth}px`;
            // }
            // (wrapper as HTMLElement).style.width = `${moveLeft + this.wrapperWidth}px`;
            // if (this.remember) {
            //     localStorage.setItem(`dragBar/${this.name}`, (moveLeft + this.wrapperWidth).toString());
            // }
            // this.realTimeWidth = moveLeft + this.wrapperWidth;
            const width = this.width ? `${this.width}px` : `${(wrapper as HTMLElement).getBoundingClientRect().width}px`;
            if (this.barLeft) {
                (bar as HTMLElement).style.left = `${0}`;
            } else {
                (bar as HTMLElement).style.left = `${width}`;
            }
            (wrapper as HTMLElement).style.width = width;
            this.realTimeWidth = parseFloat(width);
            if (this.remember) {
                localStorage.setItem(`dragBar/${this.name}`, width);
            }
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
        display: flex;
        align-items: center;
        padding: 0 size(10);
        z-index: $zIndex-drag-bar;
        .left, .right {
            border-bottom: 1px dashed $red;
            // width: 40%;
            flex: 1;
        }
        .ct {
            width: size(150);
            flex: 0 0 auto;
            text-align: center;
            color: $gray-600;
            position: relative;
        }
    }
    &>.bar {
        @include bar;
    }
}
</style>
