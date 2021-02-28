/*
    创建者：xxx
    创建时间：2019-05-12 12:15
    模块名称：xxxx
    备注：xxxx
*/
<template>
    <div class="s-empty">
        <slot>暂无数据</slot>
    </div>
</template>

<script>
export default {
    data() {
        return {};
    },
    created() {},
    methods: {
    },
};
</script>

<style lang="scss">
    .s-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
    }
</style>
