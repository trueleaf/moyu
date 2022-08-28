/*
    创建者：shuxiaokai
    创建时间：2021-06-14 12:15
    模块名称：
    备注：
*/
<template>
    <div>
        <s-search @change="handleChange">
            <s-search-item :label="$t('登录名称')" prop="loginName"></s-search-item>
            <s-search-item :label="$t('真实姓名')" prop="realName"></s-search-item>
            <s-search-item :label="$t('手机号')" prop="phone"></s-search-item>
            <template #operation>
                <el-button type="success" @click="addUserDialog = true">新增用户</el-button>
                <s-download class="ml-2" url="/api/security/user_excel_template" @finish="loading = false">
                    <el-button :loading="loading" type="primary" @click="loading = true">下载模板</el-button>
                </s-download>
                <s-upload-plain url="/api/security/add_user_by_excel" excel @success="handleImportSuccess" @upload="loading2 = true" @finish="loading2 = false">
                    <el-button :loading="loading2" type="primary">导入用户</el-button>
                </s-upload-plain>
            </template>
        </s-search>
        <!-- 表格展示 -->
        <s-table ref="table" url="/api/security/user_list" class="mt-5">
            <el-table-column prop="loginName" :label="$t('登录名称')" align="center"></el-table-column>
            <el-table-column prop="realName" :label="$t('真实姓名')" align="center"></el-table-column>
            <el-table-column prop="phone" :label="$t('手机号')" align="center"></el-table-column>
            <el-table-column :label="$t('创建日期')" align="center" width="200px">
                <template #default="scope">
                    {{ $helper.formatDate(scope.row.createdAt) }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('上次登录')" align="center" width="200px">
                <template #default="scope">
                    {{ $helper.formatDate(scope.row.lastLogin) }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('登录次数')" align="center" prop="loginTimes"></el-table-column>
            <el-table-column :label="$t('角色信息')" align="center" width="200px">
                <template #default="scope">
                    <el-tag v-for="(item, index) in scope.row.roleNames" :key="index" class="d-flex a-center j-center mb-1">{{ item }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('状态')" align="center" width="80px">
                <template #default="scope">
                    <el-tag v-if="scope.row.enable" type="success">{{ $t("启用") }}</el-tag>
                    <el-tag v-else type="warning">{{ $t("禁用") }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column :label="$t('操作')" align="center" width="300px">
                <template #default="scope">
                    <el-button link type="primary" text @click="handleOpenEditUser(scope.row)">{{ $t('修改') }}</el-button>
                    <el-button link type="primary" text @click="handleResetPassword(scope.row)">重置密码</el-button>
                    <el-button link type="primary" text @click="handleForbidRole(scope.row._id, scope.row.enable)">
                        {{ scope.row.enable ? $t("禁用") : $t("启用") }}
                    </el-button>
                </template>
            </el-table-column>
        </s-table>
        <s-add-user-dialog v-model="addUserDialog" @success="getData"></s-add-user-dialog>
        <s-edit-user-dialog v-if="editUserDialog" v-model="editUserDialog" :user-id="editUserId" @success="getData"></s-edit-user-dialog>
        <s-reset-password-dialog v-if="resetPwdDialog" v-model="resetPwdDialog" :user-id="editUserId"></s-reset-password-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import addUserDialog from "./add/add.vue"
import editUserDialog from "./edit/edit.vue"
import resetPasswordDialog from "./reset-pwd/reset-pwd.vue"

export default defineComponent({
    components: {
        "s-add-user-dialog": addUserDialog,
        "s-edit-user-dialog": editUserDialog,
        "s-reset-password-dialog": resetPasswordDialog,
    },
    data() {
        return {
            addUserDialog: false, //------------------新增用户弹窗
            editUserDialog: false, //-----------------编辑用户弹窗
            resetPwdDialog: false, //-----------------重置密码弹窗
            editUserId: "", //------------------------编辑时候用户id
            loading: false, //------------------------下载模板加载效果
            loading2: false, //-----------------------批量导入用户加载效果
        };
    },
    methods: {
        //获取用户基本信息
        getData(params?: Record<string, unknown>) {
            this.$refs.table.getData(params);
        },
        //搜索用户
        handleChange(params: Record<string, unknown>) {
            this.getData(params)
        },
        //禁用角色
        handleForbidRole(_id: string, enable: boolean) {
            const tipLabel = enable ? this.$t("禁用") : this.$t("启用");
            this.$confirm(this.$t("确实要该用户吗", { msg: tipLabel }), this.$t("提示"), {
                confirmButtonText: this.$t("确定"),
                cancelButtonText: this.$t("取消"),
                type: "warning",
            }).then(() => {
                const params = {
                    _id,
                    enable: !enable,
                };
                this.axios.put("/api/security/user_state", params).then(() => {
                    this.$refs.table.getData();
                }).catch((err) => {
                    console.error(err);
                });
            }).catch((err: Error | string) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                console.error(err);
            });
        },
        handleOpenEditUser(row: { _id: string }) {
            this.editUserId = row._id;
            this.editUserDialog = true;
        },
        //重置密码
        handleResetPassword(row: { _id: string }) {
            this.editUserId = row._id;
            this.resetPwdDialog = true;
        },
        //导入成功弹窗
        handleImportSuccess(data: { total: number, success: number }) {
            this.getData();
            this.$alert(`共导入 ${data.total} 个，成功 ${data.success} 个`, {
                confirmButtonText: "确定",
                type: "warning"
            }).then(() => {
                //console.log(222)
            });
        },
    },
})
</script>

<style lang="scss">
</style>
