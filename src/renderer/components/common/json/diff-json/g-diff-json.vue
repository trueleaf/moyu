/*
    创建者：shuxiaokai
    创建时间：2020-07-30 17:31
    模块名称：json格式参数对比
    备注：xxxx
*/
<template>
    <div class="diff-json-wrap">
        <div class="flex0 w-50">
            <s-diff-json-new :data="data"></s-diff-json-new>
        </div>
        <div class="flex0 w-50">
            <s-diff-json-old :data="data"></s-diff-json-old>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        data: {
            type: [Object, Array],
            default() {
                return {};
            },
        },
    },
    watch: {
        data: {
            handler() {
            },
            deep: true,
        },
    },
    data() {
        return {};
    },
    created() {

    },
    methods: {},
};
</script>

<style lang="scss">
.diff-json-wrap {
    display: flex;
    padding: size(10) size(10);
    position: relative; //递归组件只在外层添加relative，否则offsetleft取值会出现问题
    border-radius: $border-radius-sm;
    background: #1E1E1E;
}
</style>
