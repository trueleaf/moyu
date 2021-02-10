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
    width: 100%;
    border: 1px solid #ecf5ff;
    background: #fff;
    border-radius: 3px;
    padding-bottom: 10px;//请不要添加margin和padding，会导致高度计算出错，出现滚动条
    &.shadow {
        box-shadow: $box-shadow;
    }
}
.s-card header {
    display: flex;
    padding: 10px 0;
    padding-right: 1em;
    border-bottom: 1px solid #ecf5ff;
    justify-content: space-between;
    align-items: center;
    height: size(40);
    &.active {
        cursor: pointer;
        transition: background-color 0.3s;
        &:hover {
            background: $gray-100;
        }
    }
}
.s-card header .title {
    padding-left: 1.5em;
    color: #369;
    font-weight: bolder;
    border-left: 4px solid #409eff;
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
.s-card .content .label {
    color: #666;
    font-size: 12px;
    display: flex;
    align-items: center;
}
</style>
