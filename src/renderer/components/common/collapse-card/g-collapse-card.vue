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
        <header v-if="$slots.operation || title || $slots.head">
            <div class="head" @click="showContent = !showContent">
                <span v-if="!showContent" class="el-icon-caret-right mr-2"></span>
                <span v-else class="el-icon-caret-bottom mr-2"></span>
                <div v-if="!$slots.head" class="title" :title="title" :style="{ color: titleColor }">{{ title }}</div>
                <slot v-else name="head">{{ title }}</slot>
            </div>
            <slot name="operation"></slot>
            <div class="tail">
                <slot name="tail"></slot>
            </div>
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
    background: $white;
    display: flex;
    flex-direction: column;
    margin-bottom: size(10);
    &.shadow {
        box-shadow: $box-shadow;
    }
    &>header {
        background: $gray-200;
        display: flex;
        align-items: center;
        height: size(40);
        user-select: none;
        .head {
            padding-left: size(10);
            padding-right: size(20);
            cursor: pointer;
            display: flex;
            align-items: center;
            height: 100%;
            min-width: size(150);
            border-right: 1px solid $gray-300;
            &:hover {
                background: $gray-300;
            }            
        }
        .title {
            max-width: size(300);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            height: size(40);
            line-height: size(40);
        }
        .tail {
            padding-right: size(20);
            margin-left: auto;
        }
    }
    // 内容区域
    .content {
        flex: 1;
        overflow: hidden;
    }
}
</style>
