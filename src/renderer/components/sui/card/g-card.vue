/**
 * @description        全局卡片
 * @author             shuxiaokai
 * @updateAuthor       shuxiaokai
 * @create             2020-02-17 15:28
 * @update             2020-02-17 15:28
 */
<template>
    <div
            v-loading="loading"
            :element-loading-text="randomTip()"
            element-loading-background="rgba(255, 255, 255, 0.9)"
            class="s-card"
            :class="{shadow: shadow}"
            :style="{width: width, display: inline ? 'inline-block' : 'block'}"
    >
        <header v-if="$slots.operation || title">
            <div class="title">{{ title }}</div>
            <div>
                <slot name="operation"></slot>
            </div>
        </header>
        <!-- 搜索 -->
        <section ref="content" class="content" :style="{padding: padding}">
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
        loading: {
            type: Boolean,
            default: false,
        },
        padding: {
            type: String,
            default: "5px 10px",
        },
        shadow: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {};
    },
    mounted() {},
    methods: {},
};
</script>

<style lang="scss" scoped>
.s-card {
    background: $white;
    border: 1px solid $gray-300;
    &.shadow {
        box-shadow: $box-shadow-sm;
    }
}
.s-card header {
    font-size: fz(16);
    height: size(35);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid $gray-300;
    color: $theme-color;
    &.active {
        cursor: pointer;
        transition: background-color 0.3s;
        &:hover {
            background: $gray-100;
        }
    }
}
.s-card header .title {
    padding-left: 1em;
}
.s-card .content {
    position: relative;
    overflow-y: auto;
    &.active {
        padding: 0rem !important;
        height: 0px !important;
    }
}
.s-card .content .search-item {
    display: inline-flex;
    margin-bottom: 1rem;
}

</style>
