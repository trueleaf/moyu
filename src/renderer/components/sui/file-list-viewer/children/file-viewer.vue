/*
    创建者：shuxiaokai
    创建时间：2019-07-05 09:46
    模块名称：xxxx
    备注：xxxx
*/
<template>
    <div class="s-viewer">
        <div ref="wrap" v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" class="img-wrap" @mouseover.stop="showBtn = true" @mouseleave="showBtn = false">
            <div class="img-ct">
                <img ref="img" :src="imgUrl" @load="handleImgLoad" @mousewheel="handleMouseWheel">
            </div>
            <!-- <img ref="img" src="https://qqadapt.qpic.cn/txdocpic/0/9b7ed05dd046a4f8fdeb9d8319dc4d53/0"> -->
            <transition name="fade">
                <div v-if="showBtn" class="btn left" @click="prevPic">
                    <i class="iconfont icon-shangyiye1"></i>
                </div>
            </transition>
            <transition name="fade">
                <div v-if="showBtn" class="btn right" @click="nextPic">
                    <i class="iconfont icon-xiayiye1"></i>
                </div>
            </transition>
        </div>
        <div class="index text-center f-bg">
            <span>{{ imgIndex + 1 }}</span>
            <span>/</span>
            <span>{{ imgCount }}</span>
        </div>
        <div class="operation">
            <div @click="enlarge">
                <i class="iconfont icon-jia"></i>
                <span>放大</span>
            </div>
            <div @click="shrink">
                <i class="iconfont icon-jian"></i>
                <span>缩小</span>
            </div>
            <div @click="prevPic">
                <i class="iconfont icon-shangyiye"></i>
                <span>上一张</span>
            </div>
            <div @click="nextPic">
                <i class="iconfont icon-xiayiye2"></i>
                <span>下一张</span>
            </div>
            <div @click="anticlockwise">
                <i class="iconfont icon-nishizhen"></i>
                <span>逆时针</span>
            </div>
            <div @click="clockwise">
                <i class="iconfont icon-shunshizhen"></i>
                <span>顺时针</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        url: {
            type: String,
            default: "",
        },
        fileList: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    data() {
        return {
            //=====================================图片缩放相关====================================//
            imgAspect: 1, //宽高比
            caleWidth: 0,
            caleHeight: 0,
            //=========================================================================//
            imgUrl: "",
            imgWidth: 0,
            imgHeight: 0,
            rotate: 0,
            //=====================================其他====================================//
            imgIndex: 0, //图片index值
            loading: false, //图片是否加载中
            showBtn: false, //是否展示切换按钮
        };
    },
    computed: {
        imgCount() {
            const len = this.fileList.length === 0 ? 1 : this.fileList.length;
            return len;
        },
    },
    watch: {
        url: {
            handler(val) {
                this.imgUrl = val;
                this.loading = true;
                this.checkImgIndex();
                this.$nextTick(() => {
                    this.initImgConfig(); //重置图片
                });
                setTimeout(() => {
                    this.loading = false; //hack url的改变可能在load之后
                }, 2000);
            },
            immediate: true,
        },
        fileList: {
            handler() {
                this.checkImgIndex();
                setTimeout(() => {
                    this.loading = false; //hack url的改变可能在load之后
                }, 2000);
            },
            deep: true,
        },
    },
    mounted() {
        this.initImgConfig();
    },
    methods: {
        //=====================================初始化====================================//
        checkImgIndex() {
            if (this.fileList.length === 0) return;
            for (let i = 0; i < this.fileList.length; i += 1) {
                if (this.fileList[i] === this.url) {
                    this.imgIndex = i;
                }
            }
        },
        initImgConfig() {
            this.wrapWidth = this.$refs.wrap.getBoundingClientRect().width;
            this.wrapHeight = this.$refs.wrap.getBoundingClientRect().height;
            this.imgWidth = this.$refs.img.getBoundingClientRect().width;
            this.imgHeight = this.$refs.img.getBoundingClientRect().height;
            this.caleWidth = this.imgWidth;
            this.caleHeight = this.imgHeight;
            this.imgAspect = this.caleWidth / this.caleHeight;
        },
        //=====================================图片加载相关====================================//
        handleImgLoad() {
            this.loading = false;
        },
        //=====================================翻页相关====================================//
        //上一页
        prevPic() {
            if (this.fileList.length === 1) {
                return;
            }
            if (this.imgIndex < 1) {
                this.imgIndex = this.fileList.length - 1;
            } else {
                this.imgIndex -= 1;
            }
            this.imgUrl = this.fileList[this.imgIndex];
        },
        //下一页
        nextPic() {
            if (this.fileList.length === 1) {
                return;
            }
            this.imgIndex = (this.imgIndex + 1) % this.fileList.length;
            this.imgUrl = this.fileList[this.imgIndex];
        },

        //=====================================旋转相关====================================//
        //逆时针
        anticlockwise() {
            this.rotate -= 90;
            this.handleRotate();
        },
        //顺时针
        clockwise() {
            this.rotate += 90;
            this.handleRotate();
        },
        //旋转处理
        handleRotate() {
            if (this.rotate % 180 === 0) {
                this.$refs.img.style.width = null;
            } else if (this.imgWidth > this.wrapHeight) {
                this.$refs.img.style.width = `${this.wrapHeight}px`;
            }
            this.$refs.img.style.transform = `rotate(${this.rotate}deg) scale(1.0)`;
        },
        //=====================================放大缩小====================================//
        enlarge() {
            this.caleWidth += 20;
            this.caleHeight += 20 / this.imgAspect;
            this.$refs.img.style.width = `${this.caleWidth}px`;
            this.$refs.img.style.height = `${this.caleHeight}px`;
        },
        shrink() {
            if (this.caleWidth < 150) {
                return;
            }
            this.caleWidth -= 20;
            this.caleHeight -= 20 / this.imgAspect;
            this.$refs.img.style.width = `${this.caleWidth}px`;
            this.$refs.img.style.height = `${this.caleHeight}px`;
        },
        handleMouseWheel(e) {
            if (e.wheelDelta > 0) {
                this.enlarge();
            } else {
                this.shrink();
            }
        },
    },
};
</script>

<style lang="scss">
    .s-viewer {
        min-height: 70vh;
        display: flex;
        flex-direction: column;
        .img-wrap {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 60vh;
            position: relative;
            overflow: hidden;
            .btn {
                width: 60px;
                height: 60px;
                background: rgba($gray-200, .8);
                position: absolute;
                border-radius: 50%;
                top: calc(50% - 30px);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all .3s;
                &:hover {
                    background: rgba($gray-300, 1);
                }
                &.left {
                    left: 0;
                }
                &.right {
                    right: 0;
                }
            }
            .img-ct {
                width: 100%;
                height: 100%;
            }
            .img-ct>img {
                width: 100%;
                height: 100%;
                position: absolute;
            }
        }
        .operation {
            flex: 0 0 auto;
            width: 50%;
            margin: 0 auto;
            height: 50px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin-top: 10px;
            &>div {
                width: 60px;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                cursor: pointer;
                i {
                    font-size: 22px;
                }
                &:hover {
                    background: $gray-200;
                }
            }
        }
    }
    @keyframes fade {
        0% {
            transform: translate3d(0, -100px, 0);
            opacity: 0.1;
        }
        100% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
        }
    }
</style>
