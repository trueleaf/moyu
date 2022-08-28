/*
    创建者：shuxiaokai
    创建时间：2021-06-23 21:13
    模块名称：新增用户
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" :title="$t('新增用户(默认密码111111)')" @close="handleClose">
        <el-divider content-position="left">基础信息</el-divider>
        <s-form ref="form">
            <s-form-item :label="$t('登录名称')" prop="loginName" required half-line></s-form-item>
            <s-form-item :label="$t('真实姓名')" prop="realName" required half-line></s-form-item>
            <s-form-item :label="$t('手机号')" prop="phone" half-line phone></s-form-item>
        </s-form>
        <el-divider content-position="left">{{ $t("角色选择") }}</el-divider>
        <el-checkbox-group v-model="roleIds">
            <el-checkbox v-for="(item, index) in roleEnum" :key="index" :label="item._id">{{ item.roleName }}</el-checkbox>
        </el-checkbox-group>
        <template #footer>
            <div>
                <el-button :loading="loading" type="primary" @click="handleAddUser">{{ $t("确定") }}</el-button>
                <el-button type="warning" @click="handleClose">{{ $t("取消") }}</el-button>
            </div>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { PermissionRoleEnum, Response } from "@@/global"

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
            roleIds: [] as string[], //---------角色id列表
            roleEnum: [] as PermissionRoleEnum, //--------角色枚举信息
            loading: false, //------------------新增角色按钮
        };
    },
    created() {
        this.getRoleEnum(); //获取角色枚举信息
    },
    methods: {
        //获取角色枚举信息
        getRoleEnum() {
            this.axios.get<Response<PermissionRoleEnum>, Response<PermissionRoleEnum>>("/api/security/role_enum").then((res) => {
                this.roleEnum = res.data;
            }).catch((err) => {
                console.error(err);
            });
        },
        //新增用户
        handleAddUser() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const { formInfo } = this.$refs.form;
                    const roleNames = this.roleIds.map((val) => {
                        const user = this.roleEnum.find((role) => role._id === val);
                        return user ? user.roleName : "";
                    });
                    const params = {
                        loginName: formInfo.loginName,
                        realName: formInfo.realName,
                        phone: formInfo.phone,
                        roleIds: this.roleIds,
                        roleNames,
                    };
                    this.loading = true;
                    this.axios.post("/api/security/useradd", params).then(() => {
                        this.$emit("success");
                        this.handleClose();
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.loading = false;
                    });
                } else {
                    this.$nextTick(() => (document.querySelector(".el-form-item.is-error input") as HTMLInputElement)?.focus());
                    this.$message.warning(this.$t("请完善必填信息"));
                    this.loading = false;
                }
            });
        },
        //关闭弹窗
        handleClose() {
            this.$emit("update:modelValue", false);
        },
    },
})
</script>

<style lang="scss">

</style>
