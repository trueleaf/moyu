/*
    创建者：shuxiaokai
    创建时间：2020-11-25 14:26"
    模块名称：接口文档全局配置
    备注：xxxx
*/
<template>
    <s-dialog title="文档配置" :isShow="visible" @close="closeModel">
        
        <span slot="footer">
            <el-button type="primary" size="mini">确认添加</el-button>
            <el-button type="danger" size="mini" @click="closeModel">取消</el-button>
        </span>
    </s-dialog>
</template>

<script>
export default {
    props: {
        visible: {
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
        };
    },
    mounted() {
       
    },
    methods: {
        //====================================其他操作=====================================//
        //关闭弹窗
        closeModel() {
            this.$emit("update:visible", false);
        },
    }
};
</script>



<style lang="scss">

</style>
