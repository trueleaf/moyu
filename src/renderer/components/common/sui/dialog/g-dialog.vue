/**
    创建者：shuxiaokai
    创建时间：2020-02-29 14:56"
    模块名称：对话框
    备注：xxxx
*/
<template>
    <el-dialog :title="title" v-bind="$attrs" :visible.sync="isShow" :before-close="closeModel" :close-on-press-escape="easyClose" :close-on-click-modal="easyClose">
        <slot />
        <span slot="footer">
            <slot name="footer" />
            <!-- <el-button :loading="loading" type="primary" :size="config.renderConfig.layout.size" @click="handleAdd">确认添加</el-button>
            <el-button type="danger" :size="config.renderConfig.layout.size" @click="closeModel">取消</el-button> -->
        </span>
    </el-dialog>
</template>

<script>
export default {
    props: {
        isShow: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ""
        },
        easyClose: { //是否可以通过escape和点击model关闭
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            visible: false
        };
    },
    created() {

    },
    methods: {
        //关闭
        closeModel() {
            this.$emit("update:isShow", false);
            this.$emit("close", false);
        },
    }
};
</script>



<style lang="scss">

</style>
