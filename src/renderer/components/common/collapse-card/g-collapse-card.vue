/*
    创建者：shuxiaokai
    创建时间：2020-10-17 15:56
    模块名称：折叠卡片
    备注：xxxx
*/
<template>
    <div 
            class="collapse-card" 
            :class="{shadow: shadow}"
            :style="{ width: width }"
    >
        <header v-if="$slots.operation || title">
            <div class="tail d-flex flex0 a-center" @click="showContent = !showContent">
                <span v-if="!showContent" class="el-icon-caret-right"></span>
                <span v-else class="el-icon-caret-bottom"></span>
                <div class="ml-2 title" :title="title" :style="{ color: titleColor }">{{ title }}</div>
            </div>
            <slot name="operation"></slot>
        </header>
        <section v-show="showContent" ref="content" class="content">
            <slot></slot>
        </section>
    </div>
</template>

<script>
export default {
    props: {
        title: { // card头部标题
            type: String,
            default: ""
        },
        width: { //宽度
            type: String,
            default: "100%"
        },
        inline: {
            type: Boolean,
            default: false
        },
        titleColor: {
            type: String,
            default: "#444"
        },
        fold: { //默认是否折叠
            type: Boolean,
            default: false
        },
        shadow: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        fold(val) {
            console.log(val)
            this.showContent = !this.fold;
        }
    },
    data() {
        return {
            showContent: true
        };
    },
    mounted() {
        this.showContent = !this.fold;
    },
    methods: {
        expand() {
            this.showContent = true;
        }
    }
};
</script>



<style lang="scss">
.collapse-card {
    width: 100%;
    // border: 1px solid $gray-300;
    background: $white;
    // border-radius: $border-radius-base;
    display: flex;
    flex-direction: column;
    margin-bottom: size(10);
    &.shadow {
        box-shadow: $box-shadow;
    }
    &>header {
        background: $gray-200;
        display: flex;
        // border-bottom: 1px solid $gray-300;
        align-items: center;
        flex: 0 0 size(40);
        height: size(40);
        // padding: 0 size(20);
        user-select: none;
        .tail {
            padding-left: size(20);
            cursor: pointer;
            &:hover {
                background: $gray-300;
            }            
        }
        .title {
            max-width: 80%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            height: size(40);
            line-height: size(40);
            padding-right: size(20);
            border-right: 1px solid $gray-300;
        }
    }
    // 内容区域
    .content {
        flex: 1;
        overflow: hidden;
        box-shadow: 0px 2px 2px $gray-200;
    }
}
</style>
