/*
    创建者：shuxiaokai
    创建时间：2021-06-23 21:13
    模块名称：编辑用户
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" :title="$t('修改')" @close="handleClose">
        <el-divider content-position="left">{{ $t("基础信息") }}</el-divider>
        <s-form ref="form" v-loading="loading2" show-tips :edit-data="formInfo">
            <s-form-item :label="$t('登录名称')" prop="loginName" required half-line></s-form-item>
            <s-form-item :label="$t('真实姓名')" prop="realName" required half-line></s-form-item>
            <s-form-item :label="$t('查看范围')" prop="isAdmin" type="select" :select-enum="viewPermissionEnum" half-line></s-form-item>
            <!-- <s-form-item :label="$t('手机号')" prop="phone" half-line phone required></s-form-item> -->
        </s-form>
        <el-divider content-position="left">{{ $t("角色选择") }}</el-divider>
        <el-checkbox-group v-model="roleIds">
            <el-checkbox v-for="(item, index) in roleEnum" :key="index" :label="item._id">{{ item.roleName }}</el-checkbox>
        </el-checkbox-group>
        <template #footer>
            <div>
                <el-button :loading="loading" type="primary" @click="handleEditUser">{{ $t("确定") }}</el-button>
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
        /*
         * 用户id
        */
        userId: {
            type: String,
            default: ""
        },
    },
    emits: ["success", "update:modelValue"],
    data() {
        return {
            formInfo: {} as Record<string, unknown>, //用户基本信息
            roleIds: [] as string[], //----------------角色id列表
            roleEnum: [] as PermissionRoleEnum, //-----角色枚举信息
            viewPermissionEnum: [{
                id: true,
                name: "全部项目"
            }, {
                id: false,
                name: "局部项目"
            }], //-----------------是否允许查看所有项目
            loading: false, //-------------------------用户信息加载
            loading2: false, //------------------------修改用户加载
        };
    },
    created() {
        this.getRoleEnum(); //获取角色枚举信息
        this.getUserInfo(); //获取用户基本信息
    },
    methods: {
        //获取用户基本信息
        getUserInfo() {
            this.loading2 = true;
            this.axios.get("/api/security/user_info_by_id", { params: { _id: this.userId } }).then((res) => {
                this.formInfo = {
                    loginName: res.data.loginName,
                    realName: res.data.realName,
                    phone: res.data.phone,
                    isAdmin: res.data.isAdmin,
                };
                this.roleIds = res.data.roleIds;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading2 = false;
            });
        },
        //获取角色枚举信息
        getRoleEnum() {
            this.axios.get<Response<PermissionRoleEnum>, Response<PermissionRoleEnum>>("/api/security/role_enum").then((res) => {
                this.roleEnum = res.data;
            }).catch((err) => {
                console.error(err);
            });
        },
        //修改用户
        handleEditUser() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const { formInfo } = this.$refs.form;
                    const roleNames = this.roleIds.map((val) => {
                        const user = this.roleEnum.find((role) => role._id === val);
                        return user ? user.roleName : "";
                    });
                    const params = {
                        _id: this.userId,
                        loginName: formInfo.loginName,
                        realName: formInfo.realName,
                        roleIds: this.roleIds,
                        roleNames,
                        isAdmin: formInfo.isAdmin,
                    };
                    this.loading = true;
                    this.axios.put("/api/security/user_permission", params).then(() => {
                        this.$emit("success");
                        this.handleClose();
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.loading = false;
                    });
                } else {
                    this.$nextTick(() => (document.querySelector(".el-form-item.is-error input") as HTMLInputElement)?.focus());
                    this.$message.warning("请完善必填信息");
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
// .add-user {
//     .el-dialog__body {
//         padding-top: 0;
//     }
// }
</style>
