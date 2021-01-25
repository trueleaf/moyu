/**
 * @description        全局卡片
 * @author             shuxiaokai
 * @updateAuthor       shuxiaokai
 * @create             2020-02-17 15:28
 * @update             2020-02-17 15:28
 */
<template>
    <div
            class="widget-card"
            :class="{shadow: shadow}"
            :style="{ width: width }"
    >
        <header v-if="$slots.operation || title" :class="{collapse: collapse}">
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
            default: "",
        },
        width: { //宽度
            type: String,
            default: "100%",
        },
        inline: {
            type: Boolean,
            default: false,
        },
        titleColor: {
            type: String,
            default: "#444",
        },
        collapse: { //是否允许折叠
            type: Boolean,
            default: false,
        },
        fold: { //默认是否折叠
            type: Boolean,
            default: false,
        },
        shadow: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        fold() {
            this.showContent = !this.fold;
        },
    },
    data() {
        return {
            showContent: true,
        };
    },
    mounted() {
        this.showContent = !this.fold;
    },
    methods: {},
};
</script>

<style lang="scss">
.widget-card {
    width: 100%;
    // height: 100%;
    border: 1px solid $gray-200;
    background: $white;
    border-radius: $border-radius-base;
    display: flex;
    flex-direction: column;
    &.shadow {
        box-shadow: $box-shadow;
    }
    // 头部
    .collapse {
        user-select: none;
        background: $gray-200;
    }
    header {
        display: flex;
        border-bottom: 1px solid $gray-200;
        align-items: center;
        flex: 0 0 size(40);
        height: size(40);
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
    }
}
</style>
