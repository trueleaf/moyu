/*
    创建者：shuxiaokai
    创建时间：2020-09-06 14:23
    模块名称：修改记录比较
    备注：xxxx
*/
<template>
    <div class="mb-1">
        <span>{{ label }}</span>
        <span>
            <span>{{ newValue }}</span>
            <span class="green">(最新版本)</span>
        </span>
        <span>-----</span>
        <span>
            <span>{{ oldValue }}</span>
            <span class="orange">(上个版本)</span>
        </span>
    </div>
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            default: ""
        },
        oldValue: {
            type: String,
            default: ""
        },
        newValue: {
            type: String,
            default: ""
        },
    },
    data() {
        return {};
    },
    created() {},
    methods: {
        
    },
};
</script>



<style lang="scss">
</style>
