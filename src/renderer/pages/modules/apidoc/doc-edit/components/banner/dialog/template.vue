/*
    创建者：shuxiaokai
    创建时间：2020-11-4 19:07
    模块名称：以模板新增
    备注：xxxx
*/
<template>
    <s-dialog title="以模板新建" :isShow="visible" width="70%" @close="handleClose">
        <div>
            aaa
        </div>
        <div slot="footer">
            <el-button size="mini" type="warning" @click="handleClose">关闭</el-button>
        </div>
    </s-dialog>
</template>

<script>
export default {
    props: {
        visible: { //是否现实弹窗
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            formInfo: {
                name: "", //------文件名称
            },
            //=====================================其他参数====================================//
            loading: false, //----确认按钮状态
        };
    },
    mounted() {},
    methods: {
        //=====================================其他操作=====================================//
        //关闭弹窗
        handleClose() {
            this.$emit("update:visible", false);
            this.$emit("close");
        },
    },
};
</script>

<style lang="scss">

</style>
