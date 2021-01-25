/*
    创建者：shuxiaokai
    创建时间：2020-02-28 17:34
    模块名称：左右块，中间存在分隔线
    备注：xxxx
*/
<template>
    <div ref="leftRight" class="left-right">
        <!-- 新增 -->
        <div ref="leftDom" class="left-wrap">
            <slot name="left" />
        </div>
        <div ref="resizeBar" class="resize-bar" @mousedown="handleResizeMousedown"></div>
        <!-- 数据展示 -->
        <div ref="rightDom" class="right-wrap">
            <slot name="right" />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        leftWidth: {
            type: [Number, String],
            default: 350
        },
        minLeftWidth: {
            type: [Number, String],
            default: 350,
        },
    },
    data() {
        return {
            //=====================================dom元素====================================//
            resizeBarDom: null,
            leftDom: null,
            rightDom: null,
            //=====================================拖拽相关参数====================================//
            wrapWidth: 0,
            leftDomWidth: this.leftWidth,
            mousedownLeft: 0,
            mousedownTop: 0,
        };
    },
    watch: {
        leftWidth() {
            // this.leftDomWidth = this.leftDomWidth;
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.wrapWidth = this.$refs["leftRight"].getBoundingClientRect()["width"];
            this.leftDom = this.$refs["leftDom"];
            this.rightDom = this.$refs["rightDom"];
            if (typeof this.leftDomWidth === "number") {
                this.leftDom.style.width = this.leftDomWidth / this.wrapWidth * 100 + "%";
                this.rightDom.style.width = (1 - this.leftDomWidth / this.wrapWidth) * 100 + "%";
            } else {
                this.leftDom.style.width = this.leftDomWidth;
                this.rightDom.style.width = (100 - parseFloat(this.leftDomWidth)) + "%";
            }
            this.resizeBarDom = this.$refs["resizeBar"];
            document.documentElement.addEventListener("mouseup", (e) => {
                e.stopPropagation()
                this.leftDomWidth = this.leftDom.getBoundingClientRect()["width"]
                document.documentElement.removeEventListener("mousemove", this.handleResizeMousemove);
            })
        })
    },
    methods: {
        /** 
         * @description        处理鼠标按下事件
         * @author             shuxiaokai
         * @updateAuthor       shuxiaokai
         * @create             2019-12-30 09:02
         * @update             2019-12-30 09:02
         */
        handleResizeMousedown(e) {
            this.mousedownLeft = e.clientX;
            this.mousedownTop = e.clientY;
            document.documentElement.addEventListener("mousemove", this.handleResizeMousemove);
        },
        /** 
         * @description        处理鼠标移动事件
         * @author             shuxiaokai
         * @updateAuthor       shuxiaokai
         * @create             2019-12-30 09:02
         * @update             2019-12-30 09:02
         */
        handleResizeMousemove(e) {
            e.stopPropagation();
            let moveLeft = 0;
            if (typeof this.leftDomWidth === "number") {
                moveLeft = e.clientX - this.mousedownLeft + this.leftDomWidth;
            } else {
                const percent = 100 - parseFloat(this.leftDomWidth);
                moveLeft = e.clientX - this.mousedownLeft + percent / 100 * this.wrapWidth;
            }
            

            if (moveLeft < this.minLeftWidth) {
                return;
            }
            // console.log(this.leftDomWidth / this.wrapWidth)
            this.leftDom.style.width = moveLeft / this.wrapWidth * 100 + "%";
            this.rightDom.style.width = (1 - moveLeft / this.wrapWidth) * 100 + "%";
        },
    }
};
</script>



<style lang="scss">
.left-right {
    min-height: 300px;
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
        // flex: 1;
    }
}
</style>
