/*
    创建者：shuxiaokai
    创建时间：2019-12-29 21:53
    模块名称：增删改查弹窗
    备注：适用于字段较少的弹窗
*/
<template>
    <el-dialog :title="title" :visible.sync="isShow" :append-to-body="true" :before-close="closeModel" :close-on-press-escape="false" :close-on-click-modal="false" :width="width">
        <div ref="curdWrap" class="curd-model">
            <!-- 新增 -->
            <div ref="leftDom" class="left-wrap">
                <slot name="left" />
            </div>
            <div ref="resizeBar" class="resize-bar" @mousedown.stop="handleResizeMousedown"></div>
            <!-- 数据展示 -->
            <div ref="rightDom" class="right-wrap">
                <slot name="right" />
            </div>
        </div>
    </el-dialog>
</template>

<script>
export default {
    props: {
        isShow: {
            type: Boolean,
            default: true,
        },
        title: {
            type: String,
            default: "",
        },
        leftWidth: {
            type: [Number, String],
            default: 300,
        },
        minLeftWidth: {
            type: Number,
            default: 300,
        },
        width: {
            type: String,
            default: "70%",
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
    mounted() {
        this.$nextTick(() => {
            this.wrapWidth = this.$refs.curdWrap.getBoundingClientRect().width;
            this.leftDom = this.$refs.leftDom;
            this.rightDom = this.$refs.rightDom;
            if (typeof this.leftDomWidth === "string") {
                this.leftDom.style.width = this.leftDomWidth;
                this.rightDom.style.width = `${100 - parseInt(this.leftDomWidth, 10)}%`;
            } else {
                this.leftDom.style.width = `${(this.leftDomWidth / this.wrapWidth) * 100}%`;
                this.rightDom.style.width = `${(1 - this.leftDomWidth / this.wrapWidth) * 100}%`;
            }
            this.resizeBarDom = this.$refs.resizeBar;
            document.documentElement.addEventListener("mouseup", () => {
                this.leftDomWidth = this.leftDom.getBoundingClientRect().width;
                document.documentElement.removeEventListener("mousemove", this.handleResizeMousemove);
            });
        });
    },
    methods: {
        /**
         * @description        关闭弹窗
         * @author             shuxiaokai
         * @updateAuthor       shuxiaokai
         * @create             2019-12-29 22:02
         * @update             2019-12-29 22:02
         */
        closeModel() {
            this.$emit("close");
        },
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
            e.preventDefault();
            const leftDomWidth = (typeof this.leftDomWidth === "string") ? ((parseInt(this.leftDomWidth, 10) / 100) * this.wrapWidth) : this.leftDomWidth;
            const moveLeft = e.clientX - this.mousedownLeft + leftDomWidth;
            if (moveLeft < this.minLeftWidth) {
                return;
            }
            this.leftDom.style.width = `${(moveLeft / this.wrapWidth) * 100}%`;
            this.rightDom.style.width = `${(1 - moveLeft / this.wrapWidth) * 100}%`;
        },
    },
};
</script>

<style lang="scss">
.curd-model {
    min-height: 300px;
    width: 100%;
    display: flex;
    .left-wrap {
        flex: 0 0 auto;
    }
    .resize-bar {
        flex: 0 0 3px;
        cursor: col-resize;
        background: $gray-300;
    }
    .right-wrap {
        flex-grow: 1;
        flex-shrink: 1;
        // flex: 1;
    }
}
</style>
