/*
    创建者：shuxiaokai
    创建时间：2021-05-17 22:33"
    模块名称：权限管理
    备注：
*/
<template>
    <s-dialog title="权限管理" :is-show="visible" class="permission" @close="handleClose">
        <el-tabs v-model="activeName">
            <el-tab-pane label="成员" name="s-user"></el-tab-pane>
            <el-tab-pane label="设置" name="s-setting"></el-tab-pane>
        </el-tabs>
        <components :is="activeName" v-bind="$attrs"></components>
    </s-dialog>
</template>

<script>
import setting from "./setting/setting.vue"
import user from "./user/user.vue"

export default {
    components: {
        "s-user": user,
        "s-setting": setting,
    },
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
            activeName: "s-user",
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
