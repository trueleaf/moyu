/*
    创建者：shuxiaokai
    创建时间：2019-07-11 14:14
    模块名称：xxxx
    备注：xxxx
*/
<template>
    <div class="s-fieldset">
        <div class="legend">{{ title }}</div>
        <div class="content" :style="{height: height, 'max-height': maxHeight}">
            <slot></slot>
        </div>
        <div class="operation">
            <slot name="operation"></slot>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: ""
        },
        height: {
            type: String,
            default: null
        },
        maxHeight: {
            type: String,
            default: null
        },
    },
    data() {
        return {};
    },
    created() {},
    methods: {}
};
</script>



<style lang="scss">
.s-fieldset {
    display: block;
    min-height: 30px;
    position: relative;
    border: 1px solid $gray-400;
    margin-top: 20px;
    background: inherit;
    // box-shadow: $box-shadow;
    & > .legend {
        position: absolute;
        height: 30px;
        left: 20px;
        top: -10px;
        color: $gray-700;
        background: #fff;
        padding: 0 20px;
        font-size: size(18);
        font-weight: bolder;
        z-index: $zIndex-fieldset;
    }
    & > .content {
        padding: 10px;
        width: 100%;
        padding-top: size(25);
        overflow-y: auto;
    }
    .operation {
        text-align: right;
    }
}
</style>
