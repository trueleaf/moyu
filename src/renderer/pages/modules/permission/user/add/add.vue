/*
    创建者：shuxiaokai
    创建时间：2021-06-23 21:13
    模块名称：新增用户
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" class="add-user" title="新增用户(默认密码111111)" @close="handleClose">
        <el-divider content-position="left">基础信息</el-divider>
        <s-form ref="form" :form-info="formInfo" show-tips show-rules>
            <s-form-item label="登录名称" prop="loginName" required half-line></s-form-item>
            <s-form-item label="真实姓名" prop="realName" required half-line></s-form-item>
            <s-form-item label="手机号" prop="phone" half-line phone></s-form-item>
        </s-form>
        <el-divider content-position="left">角色选择</el-divider>
        <el-checkbox-group v-model="formInfo.roleIds">
            <el-checkbox v-for="(item, index) in roleEnum" :key="index" :label="item._id">{{ item.roleName }}</el-checkbox>
        </el-checkbox-group>
        <template #footer>
            <div>
                <el-button :loading="loading" size="mini" type="primary" @click="handleAddUser">确定</el-button>
                <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
            </div>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { RoleEnum, Response } from "@@/global"

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["success", "update:modelValue"],
    data() {
        return {
            formInfo: { //----------表单信息
                roleIds: [],
                roleNames: [],
            },
            roleEnum: [] as RoleEnum, //--------角色枚举信息
            loading: false, //------新增角色按钮
        };
    },
    created() {
        this.getRoleEnum(); //获取角色枚举信息
    },
    methods: {
        //获取角色枚举信息
        getRoleEnum() {
            this.axios.get<Response<RoleEnum>, Response<RoleEnum>>("/api/security/role_enum").then((res) => {
                this.roleEnum = res.data;
            }).catch((err) => {
                console.error(err);
            });
        },
        //新增用户
        handleAddUser() {
            console.log(2)
        },
        //关闭弹窗
        handleClose() {
            this.$emit("update:modelValue", false);
        },
    },
})
</script>

<style lang="scss">
.add-user {
    .el-dialog__body {
        padding-top: 0;
    }
}
</style>
