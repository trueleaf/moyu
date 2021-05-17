/*
    创建者：shuxiaokai
    创建时间：2021-05-17 22:33"
    模块名称：权限管理
    备注：
*/
<template>
    <s-dialog title="权限管理" :is-show="visible" class="permission" @close="handleClose">
        <el-tabs v-model="activeName">
            <el-tab-pane label="成员" name="s-a"></el-tab-pane>
            <el-tab-pane label="设置" name="s-b"></el-tab-pane>
        </el-tabs>
        <components :is="activeName"></components>
        <div slot="footer">
            <el-button size="mini" type="primary" @click="handleSubmit">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </div>
    </s-dialog>
</template>

<script>
export default {
    props: {
        visible: { //弹窗是否显示
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            //=================================表单与表格参数================================//

            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
            activeName: "s-a",
        };
    },
    created() {

    },
    methods: {
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//
        handleSubmit() {
        },
        //=====================================其他操作=====================================//
        handleClose() {
            this.$emit("update:visible", false);
        },
    },
};
</script>

<style lang="scss">
.permission {
    .el-dialog__body {
        padding: 0 size(20);
    }
}
</style>
