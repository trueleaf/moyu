/*
    创建者：shuxiaokai
    创建时间：2021-04-06 21:02
    模块名称：自定义输入框
    备注：
*/
<template>
    <div>
        <el-input :value="value" v-bind="$attrs" v-on="$listeners" @input="handleInput" style="color: red"></el-input>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            //-----------v-model的值
            type: [String, Number],
            default: "",
        },
    },
    data() {
        return {
            //=================================表单与表格参数================================//
            //===================================枚举参数====================================//
            //===================================业务参数====================================//
            //===================================其他参数====================================//
        };
    },
    created() {},
    methods: {
        handleInput() {
            this.$emit("input", this.value);
        },
    },
};
</script>

<style lang="scss">
</style>
