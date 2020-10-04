/*
    创建者：shuxiaokai
    创建时间：2019-10-15 15:16
    模块名称：拖拽框
    备注：
*/
<template>
    <div ref="resize" class="s-resize">
        {{ options }}
        <!-- <div>
            <div>
                lock: {{ lockAction }}
                mh: {{ config.cropMaxHeight }}
                mw: {{ config.cropMaxWidth }}
            </div>
            <div>
                left:{{ left }}
                top:{{ top }}
            </div>
            <div>
                width{{ width }}
                height{{ height }}
            </div>
        </div> -->
        <div class="s-resize-content">
            <div class="resize" @mousedown.stop="handleDragStart">
                <div v-if="freeCrop" class="dot l" @mousedown.stop="resizeDOM($event, 'left')"></div>
                <div v-if="freeCrop" class="dot r" @mousedown.stop="resizeDOM($event, 'right')"></div>
                <div v-if="freeCrop" class="dot t" @mousedown.stop="resizeDOM($event, 'top')"></div>
                <div v-if="freeCrop" class="dot b" @mousedown.stop="resizeDOM($event, 'bottom')"></div>
                <div class="dot lt" @mousedown.stop="resizeDOM($event, 'leftTop')"></div>
                <div class="dot lb" @mousedown.stop="resizeDOM($event, 'leftBottom')"></div>
                <div class="dot rt" @mousedown.stop="resizeDOM($event, 'rightTop')"></div>
                <div class="dot rb" @mousedown.stop="resizeDOM($event, 'rightBottom')"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        config: {
            type: Object,
            default() {
                return {
                    left: 0,
                    top: 0,
                    width: 200,
                    height: 100,
                    minLeft: 0,
                    minTop: 0,
                    cropMinWidth: 150,
                    cropMaxWidth: 300,
                    cropMinHeight: 150,
                    cropMaxHeight: 150,
                    aspectRatio: 2,
                }
            }
        },
        freeCrop: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            options: {
                left: 0,
                top: 0,
                width: 100,
                height: 100,
                minLeft: 0,
                minTop: 0,
                cropMinWidth: 100,
                cropMaxWidth: 100,
                cropMinHeight: 100,
                cropMaxHeight: 100,
                aspectRatio: 1,
            },
            //=====================================卡片基础信息====================================//
            realHeight: null, //处理后的高度
            realWidth: null, //处理后的宽度
            realLeft: 0, //处理后左边距离
            realTop: 0, //处理后顶部距离
            width: 0, //实时宽度
            left: 0, //实时左侧距离
            top: 0, //实时顶部距离
            height: 0, //实时高度
            lockAction: false, //是否锁定当前状态
            lockLT: false, //锁定左右位置
            lockWH: false, //锁定宽高缩放
            //=====================================鼠标点击事件====================================//
            clientX: 0, //鼠标点击位置
            clientY: 0, //鼠标点击位置
            //=====================================其他参数====================================//
        };
    },
    watch: {
        config: { //根据传入值动态改变宽高
            handler() {
                this.$nextTick(() => {
                    Object.assign(this.options, this.config)
                    this.$refs["resize"].style.width = this.options.width + "px"
                    this.$refs["resize"].style.left = this.options.left + "px"
                    this.$refs["resize"].style.height = this.options.width / this.options.aspectRatio + "px";
                    this.$refs["resize"].style.top = this.options.top + "px"    
                    this.realWidth = parseFloat(this.$refs["resize"].style.width || 0); //结束后赋值宽度和高度
                    this.realHeight = parseFloat(this.$refs["resize"].style.height || 0); //结束后赋值宽度和高度
                    this.realLeft = parseFloat(this.$refs["resize"].style.left || 0); //结束后赋值左边距离和右边距离
                    this.realTop = parseFloat(this.$refs["resize"].style.top || 0); //结束后赋值左边距离和右边距离  
                    this.width = this.realWidth;
                    this.height = this.realHeight;
                    this.left = this.realLeft;
                    this.top = this.realTop;
                    this.$emit("change", {
                        width: this.width,
                        height: this.height,
                        left: this.left,
                        top: this.top,
                    });
                })
            },
            deep: true,
            immediate: true

        },
    },
    beforeDestroy() {
        document.documentElement.removeEventListener("mouseup", this.initDragMouseMove);
    },
    mounted() {
        document.documentElement.addEventListener("mouseup", this.initDragMouseMove);
    },
    methods: {
        //=====================================初始化卡片信息====================================//
        //=====================================缩放卡片====================================//
        // 处理缩放
        resizeDOM(e, dir) {
            this.startX = e.clientX;
            this.startY = e.clientY;
            /*eslint-disable indent*/ 
            switch (dir) {
                case "left":
                    document.documentElement.addEventListener("mousemove", this.resizeLeft);
                    break;
                case "right":
                    document.documentElement.addEventListener("mousemove", this.resizeRight);
                    break;
                case "top":
                    document.documentElement.addEventListener("mousemove", this.resizeTop);
                    break;
                case "bottom":
                    document.documentElement.addEventListener("mousemove", this.resizeBottom);
                    break;
                case "leftTop":
                    document.documentElement.addEventListener("mousemove", this.resizeLeftTop);
                    break;
                case "leftBottom":
                    document.documentElement.addEventListener("mousemove", this.resizeLeftBottom);
                    break;
                case "rightTop":
                    document.documentElement.addEventListener("mousemove", this.resizeRightTop);
                    break;
                case "rightBottom":
                    document.documentElement.addEventListener("mousemove", this.resizeRightBottom);
                    break;
                default:
                    break;
            }
            document.documentElement.addEventListener("mouseup", (e) => {
                e.stopPropagation();
                e.preventDefault();

                this.realWidth = parseFloat(this.$refs["resize"].style.width || 0); //结束后赋值宽度和高度
                this.realHeight = parseFloat(this.$refs["resize"].style.height || 0); //结束后赋值宽度和高度
                this.realLeft = parseFloat(this.$refs["resize"].style.left || 0); //结束后赋值左边距离和右边距离
                this.realTop = parseFloat(this.$refs["resize"].style.top || 0); //结束后赋值左边距离和右边距离

                this.$refs["resize"].style.height = this.realHeight + "px";
                this.$refs["resize"].style.width = this.realWidth + "px";
                this.$refs["resize"].style.left = this.realLeft + "px";
                this.$refs["resize"].style.top = this.realTop + "px";

                this.oldLeft = null;
                this.oldTop = null;
                this.oldWidth = null;
                this.oldHeight = null;

                document.documentElement.removeEventListener("mousemove", this.resizeLeft);
                document.documentElement.removeEventListener("mousemove", this.resizeRight);
                document.documentElement.removeEventListener("mousemove", this.resizeTop);
                document.documentElement.removeEventListener("mousemove", this.resizeBottom);
                document.documentElement.removeEventListener("mousemove", this.resizeLeftTop);
                document.documentElement.removeEventListener("mousemove", this.resizeRightTop);
                document.documentElement.removeEventListener("mousemove", this.resizeLeftBottom);
                document.documentElement.removeEventListener("mousemove", this.resizeRightBottom);
                this.lockAction = false;
                this.lockWH = false;
                this.lockLT = false;
            });
        },
        // 拖动左侧
        resizeLeft(e) {
            e.stopPropagation();
            e.preventDefault();
            this.moveX = e.clientX - this.clientX; //鼠标移动的距离
            // const moveVW = this.moveX; //将距离换算为vw
            const width = this.realWidth - this.moveX; //改变后实际宽度
            const left = this.realLeft + this.moveX; //改变后实际lefe值
            this.$refs["resize"].style.left = left + "px";
            this.$refs["resize"].style.width = width + "px";
        },
        // 拖动右侧
        resizeRight(e) {
            e.stopPropagation();
            e.preventDefault();
            this.$emit("resize");
            this.moveX = e.clientX - this.clientX; //鼠标移动的距离
            const moveVW = this.moveX; //将距离换算为vw
            const width = this.realWidth + moveVW; //改变后实际宽度
            this.$refs["resize"].style.width = width + "px";
        },
        // 拖拽上面
        resizeTop(e) {
            e.stopPropagation();
            e.preventDefault();
            this.$emit("resize");
            this.moveY = e.clientY - this.clientY; //鼠标移动的距离
            const moveVH = this.moveY; //将距离换算为vw
            const height = this.realHeight - moveVH; //改变后实际宽度
            const top = this.realTop + moveVH; //改变后实际top值
            this.$refs["resize"].style.height = height + "px";
            this.$refs["resize"].style.top = top + "px";
        },
        // 拖拽下面
        resizeBottom(e) {
            e.stopPropagation();
            e.preventDefault();
            this.$emit("resize");
            this.moveY = e.clientY - this.clientY; //鼠标移动的距离
            const moveVH = this.moveY; //将距离换算为vw
            const height = this.realHeight + moveVH; //改变后实际宽度
            this.$refs["resize"].style.height = height + "px";
        },
        // 拖拽左上角
        resizeLeftTop(e) {
            e.stopPropagation();
            e.preventDefault();
            const mouseMoveLeft = this.startX - e.clientX; //鼠标移动的距离,往左为正数
            const resizeWidth = this.realWidth + mouseMoveLeft; //拖动过程中的宽度
            const resizeHeight = this.realHeight + mouseMoveLeft / this.options.aspectRatio; //拖动过程中的高度
            const resizeLeft = this.realLeft - mouseMoveLeft; //拖动过程中的left值
            const resizeTop = this.realTop - mouseMoveLeft / this.options.aspectRatio; //拖动过程中的top值
            //=========================================================================//
            if (!this.lockLT) {
                this.left = this.realLeft - mouseMoveLeft;                
                this.top = this.realTop - mouseMoveLeft / this.options.aspectRatio;                
            }
            if (!this.lockWH) {
                this.height = this.realHeight + mouseMoveLeft / this.options.aspectRatio;  
                this.width = this.realWidth + mouseMoveLeft;
            }
            //=========================================================================//
            if (resizeLeft < this.options.minLeft) { //超过左侧边界
                if (this.lockAction) {
                    return;
                }
                const overLeft = this.options.minLeft - this.left; //正数
                this.left = this.options.minLeft;
                this.top = this.top + overLeft / this.options.aspectRatio;
                this.width = this.width - overLeft;
                this.height = this.height - overLeft / this.options.aspectRatio;
                this.$refs["resize"].style.top = this.top + "px";  
                this.$refs["resize"].style.left = this.left + "px";
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.lockWH = true;
                this.lockLT = true;
                this.lockAction = true;
            } else if (resizeTop < this.options.minTop) { //超过顶部边界
                const overTop = this.options.minTop - this.top; //正数
                this.top = this.options.minTop;
                this.left = this.left + overTop * this.options.aspectRatio;
                this.width = this.width - overTop * this.options.aspectRatio;
                this.height = this.height - overTop;
                this.$refs["resize"].style.top = this.top + "px";  
                this.$refs["resize"].style.left = this.left + "px";
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.lockWH = true;
                this.lockLT = true;
                this.lockAction = true;
            } else if (resizeWidth < this.options.cropMinWidth) { //小于最小宽度
                const overWidth = this.options.cropMinWidth - this.width; //正数
                this.top = this.top - overWidth / this.options.aspectRatio;
                this.left = this.left - overWidth;
                this.width = this.options.cropMinWidth;
                this.height = this.height + overWidth / this.options.aspectRatio;
                this.$refs["resize"].style.top = this.top + "px";  
                this.$refs["resize"].style.left = this.left + "px";
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.lockWH = true;
                this.lockLT = true;
                this.lockAction = true;
            } else if (resizeHeight < this.options.cropMinHeight) { //小于最小高度
                const overHeight = this.options.cropMinHeight - resizeHeight; //正数
                this.top = this.top - overHeight;
                this.left = this.left - overHeight * this.options.aspectRatio;
                this.width = this.width + overHeight * this.options.aspectRatio;
                this.height = this.options.cropMinHeight;
                this.$refs["resize"].style.top = this.top + "px";  
                this.$refs["resize"].style.left = this.left + "px";
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.lockWH = true;
                this.lockLT = true;
                this.lockAction = true;
            } else {
                this.lockWH = false;
                this.lockLT = false;
                this.lockAction = false;
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.$refs["resize"].style.left = this.left + "px";
                this.$refs["resize"].style.top = this.top + "px";                
            }
        },
        // 拖拽右上角
        resizeRightTop(e) {
            e.stopPropagation();
            e.preventDefault();
            //=========================================================================//
            const mouseMoveLeft = e.clientX - this.startX; //鼠标移动的距离, 往右为正数
            const resizeTop = this.realTop - mouseMoveLeft / this.options.aspectRatio; //拖动过程中的top值
            const resizeWidth = this.realWidth + mouseMoveLeft; //拖动过程中的宽度
            const resizeHeight = this.realHeight + mouseMoveLeft / this.options.aspectRatio; //拖动过程中的高度
            //=========================================================================//
            if (!this.lockLT) {
                this.top = this.realTop - mouseMoveLeft / this.options.aspectRatio;                
            }
            if (!this.lockWH) {
                this.height = this.realHeight + mouseMoveLeft / this.options.aspectRatio;  
                this.width = this.realWidth + mouseMoveLeft;
            }
            //=========================================================================//
            if (resizeWidth + this.left > this.options.cropMaxWidth) { //宽度大于最大宽度
                if (this.lockAction) {
                    return;
                }
                const overWidth = this.width + this.left - this.options.cropMaxWidth; //正数
                this.top = this.top + overWidth / this.options.aspectRatio;
                this.width = this.options.cropMaxWidth - this.left;
                this.height = this.height - overWidth / this.options.aspectRatio;
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.$refs["resize"].style.top = this.top + "px";
                this.lockWH = true;
                this.lockLT = true;
                this.lockAction = true;
            } else if (resizeTop < this.options.minTop) { //判读顶部是否超出，采用top值是否小于最小top值
                const overTop = this.options.minTop - this.top; //正数
                this.top = this.options.minTop;
                this.width = this.width - overTop * this.options.aspectRatio;
                this.height = this.height - overTop;
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.$refs["resize"].style.top = this.top + "px";
                this.lockWH = true;
                this.lockLT = true;
                this.lockAction = true;
            } else if (resizeWidth < this.options.cropMinWidth) { //判断宽度是否小于最小宽度
                const overWidth = this.options.cropMinWidth - this.width; //正数
                this.top = this.top - overWidth / this.options.aspectRatio;
                this.width = this.options.cropMinWidth;
                this.height = this.height + overWidth / this.options.aspectRatio;
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.$refs["resize"].style.top = this.top + "px";
                this.lockWH = true;
                this.lockLT = true;
                this.lockAction = true;
            } else if (resizeHeight < this.options.cropMinHeight) { //判断高度是否小于最小高度
                const overHeight = this.options.cropMinHeight - this.height; //正数
                this.top = this.top - overHeight;
                this.width = this.width + overHeight * this.options.aspectRatio;
                this.height = this.options.cropMinHeight;
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.$refs["resize"].style.top = this.top + "px";
                this.lockWH = true;
                this.lockLT = true;
                this.lockAction = true;
            } else {
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.$refs["resize"].style.top = this.top + "px";
                this.lockWH = false;
                this.lockLT = false;
                this.lockAction = false;
            }
        },
        // 拖拽左下角
        resizeLeftBottom(e) {
            e.stopPropagation();
            e.preventDefault();
            const mouseMoveLeft = e.clientX - this.startX; //鼠标移动的距离,往左为负数
            const resizeLeft = this.realLeft + mouseMoveLeft; //拖动过程中的left值
            const resizeWidth = this.realWidth - mouseMoveLeft; //拖动过程中的宽度
            const resizeHeight = this.realHeight - mouseMoveLeft / this.options.aspectRatio; //拖动过程中的高度
            if (!this.lockLT) {
                this.left = this.realLeft + mouseMoveLeft;                
            }
            if (!this.lockWH) {
                this.height = this.realHeight - mouseMoveLeft / this.options.aspectRatio;  
                this.width = this.realWidth - mouseMoveLeft;
            }
            if (resizeLeft < this.options.minLeft) { //左侧距离小于最小距离
                if (this.lockAction) { //防止高度大于最大高度导致异常
                    return
                }
                const overLeft = this.options.minLeft - resizeLeft; //正数
                this.left = this.options.minLeft;
                this.width = this.width - overLeft;
                this.height = this.height - overLeft / this.options.aspectRatio;
                this.$refs["resize"].style.left = this.left + "px";   
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.lockLT = true;
                this.lockWH = true;
                this.lockAction = true;
            } else if (resizeHeight + this.top > this.options.cropMaxHeight) { //高度大于最大高度
                const overHeight = this.height + this.top - this.options.cropMaxHeight; //溢出高度
                this.left = this.left + overHeight * this.options.aspectRatio;
                this.width = this.width - overHeight * this.options.aspectRatio;
                this.height = this.options.cropMaxHeight - this.top;
                this.$refs["resize"].style.left = this.left + "px";   
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.lockLT = true;
                this.lockWH = true;
                this.lockAction = true;
            } else if (resizeWidth < this.options.cropMinWidth) { //宽度小于最小宽度
                const overWidth = this.options.cropMinWidth - this.width; //正数
                this.left = this.left - overWidth;
                this.width = this.options.cropMinWidth;
                this.height = this.height + overWidth / this.options.aspectRatio;
                this.$refs["resize"].style.left = this.left + "px";   
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.lockLT = true;
                this.lockWH = true;
                this.lockAction = true;
            } else if (resizeHeight < this.options.cropMinHeight) {
                const overHeight = this.options.cropMinHeight - resizeHeight; //正数
                this.left = this.left - overHeight * this.options.aspectRatio;
                this.width = this.width + overHeight * this.options.aspectRatio;
                this.height = this.options.cropMinHeight;
                this.$refs["resize"].style.left = this.left + "px";   
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.lockLT = true;
                this.lockWH = true;
                this.lockAction = true;
            } else {
                this.lockAction = false;
                this.lockWH = false;
                this.lockLT = false;
                this.$refs["resize"].style.left = this.left + "px";   
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
            }
        },
        // 拖拽右下角
        resizeRightBottom(e) {
            e.stopPropagation();
            e.preventDefault();
            const mouseMoveLeft = e.clientX - this.startX; //鼠标移动的距离
            const resizeWidth = this.realWidth + mouseMoveLeft; //拖动过程中的宽度
            const resizeHeight = this.realHeight + mouseMoveLeft / this.options.aspectRatio; //拖动过程中的高度
            //=========================================================================//
            if (!this.lockWH) {
                this.width = resizeWidth; //实时宽度
                this.height = resizeHeight //实时高度
            }
            //=========================================================================//
            if (resizeWidth + this.left > this.options.cropMaxWidth) { //超过最大宽度， 距离左侧距离 + 自身宽度
                if (this.lockAction) { //这里需要单独判断lockAction防止
                    return
                }
                const overWidth = this.width - (this.options.cropMaxWidth - this.left); //溢出宽度
                this.width = this.options.cropMaxWidth - this.left;
                this.height = this.height - overWidth / this.options.aspectRatio; //当前宽度 - (溢出宽度 / 宽高比)
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.lockWH = true;
            } else if (resizeWidth < this.options.cropMinWidth) { //低于最小宽度
                const overWidth = this.options.cropMinWidth - this.width; //溢出(实际为负溢出)宽度，值为正数
                this.width = this.options.cropMinWidth;
                this.height = this.height + overWidth / this.options.aspectRatio; //当前宽度 + (溢出宽度 / 宽高比)
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.lockWH = true;
                this.lockAction = true;
            } else if (resizeHeight + this.top > this.options.cropMaxHeight) { //超过最大高度，距离顶部距离 + 自身高度
                const overHeight = this.height + this.top - this.options.cropMaxHeight; //溢出的高度
                this.width = this.width - overHeight * this.options.aspectRatio; // 当前宽度 - (溢出高度 / 宽高比)
                this.height = this.options.cropMaxHeight - this.top;
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.lockWH = true;
                this.lockAction = true;
            } else if (resizeHeight < this.options.cropMinHeight) { //小于最小高度
                const overHeight = this.options.cropMinHeight - this.resizeHeight; //溢出，值为正数
                this.height = this.options.cropMinHeight;
                this.width = this.width + overHeight * this.options.aspectRatio;
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
                this.lockWH = true;
                this.lockAction = true;
            } else {
                this.lockAction = false;
                this.lockWH = false;
                this.$refs["resize"].style.width = this.width + "px";
                this.$refs["resize"].style.height = this.height + "px";
            }
        },
        //=====================================拖拽卡片====================================//
        initDragMouseMove(e) {
            e.stopPropagation();
            this.realWidth = parseFloat(this.$refs["resize"].style.width || 0); //结束后赋值宽度和高度
            this.realHeight = parseFloat(this.$refs["resize"].style.height || 0); //结束后赋值宽度和高度
            this.realLeft = parseFloat(this.$refs["resize"].style.left || 0); //结束后赋值左边距离和右边距离
            this.realTop = parseFloat(this.$refs["resize"].style.top || 0); //结束后赋值左边距离和右边距离   
            document.documentElement.removeEventListener("mousemove", this.handleDragMove);
            this.$emit("change", {
                width: this.width,
                height: this.height,
                left: this.left,
                top: this.top,
            });
        },
        handleDragStart(e) {
            this.startX = e.clientX;
            this.startY = e.clientY;
            document.documentElement.addEventListener("mousemove", this.handleDragMove);
            // console.log(222)
        },
        handleDragMove(e) {
            e.stopPropagation();
            const moveLeft = e.clientX - this.startX;
            const moveTop = e.clientY - this.startY;
            const left = this.realLeft + moveLeft;
            const top = this.realTop + moveTop;
            const height = this.realHeight;
            const width = this.realWidth;
            this.left = left;
            this.top = top;

            if (this.left < this.options.minLeft) { //不允许超过左边
                this.left = this.options.minTop;
            } 
            if (this.left + width > this.options.cropMaxWidth) { //不允许超过右边
                this.left = this.options.cropMaxWidth - width;
            } 
            if (this.top < this.options.minTop) { //不允许超过顶部
                this.top = this.options.minTop
            } 
            if (this.top + height > this.options.cropMaxHeight) { //不允许超过底部
                this.top = this.options.cropMaxHeight - height;
            }
            this.$refs["resize"].style.left = this.left + "px"
            this.$refs["resize"].style.top = this.top + "px"    
        }
    }
};
</script>



<style lang="scss">
    .s-resize {
        left: 0;
        top: 0;
        background: rgba(255, 255, 255, 0.3);
        cursor: grab;
        position: absolute;
    }
    .s-resize-content {
        .resize {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border: 2px solid $cyan;
            user-select: none;
            .dot {
                width: 10px;
                height: 10px;
                border: 1px solid $cyan;
                border-radius: 50%;
                position: absolute;
                background: #fff;
                z-index: 1;
                &.lt {
                    left: -6px;
                    top: -6px;
                    cursor: nw-resize;
                }
                &.lb {
                    left: -6px;
                    bottom: -6px;
                    cursor: sw-resize;
                }
                &.rt {
                    right: -6px;
                    top: -6px;
                    cursor: ne-resize;
                }
                &.rb {
                    right: -6px;
                    bottom: -6px;
                    cursor: se-resize;
                }
                &.l {
                    left: -6px;
                    top: calc(50% - 10px);
                    cursor: w-resize;
                }
                &.r {
                    right: -6px;
                    top: calc(50% - 10px);
                    cursor: e-resize;
                }
                &.t {
                    left: calc(50% - 10px);
                    top: -6px;
                    cursor: n-resize;
                }
                &.b {
                    left: calc(50% - 10px);
                    bottom: -6px;
                    cursor: s-resize;
                }
            }
            .width {
                font-size: 12px;
                height: 30px;
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
            }
            .height {
                font-size: 12px;
                width: 20px;
                height: 30px;
                position: absolute;
                top: 10%;
                left: -50px;
            }
        }
    }
</style>
