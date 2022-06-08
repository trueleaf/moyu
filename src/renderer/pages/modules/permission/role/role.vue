/*
    创建者：shuxiaokai
    创建时间：2021-06-28 20:38
    模块名称：角色管理
    备注：
*/
<template>
    <s-table ref="table" url="/api/security/role_list">
        <el-table-column prop="roleName" :label="$t('角色名称')" align="center"></el-table-column>
        <el-table-column prop="remark" :label="$t('备注')" align="center"></el-table-column>
        <el-table-column :label="$t('创建时间')" align="center">
            <template #default="scope">
                {{ $helper.formatDate(scope.row.createdAt) }}
            </template>
        </el-table-column>
        <el-table-column :label="$t('操作')" align="center">
            <template #default="scope">
                <el-button link type="primary" text @click="handleOpenEditRole(scope.row._id)">{{ $t("修改") }}</el-button>
                <el-button link type="primary" text @click="handleDeleteRole(scope.row._id)">{{ $t("删除") }}</el-button>
            </template>
        </el-table-column>
        <template #operation>
            <el-button type="success" @click="addRoleDialog = true">{{ $t("新增角色") }}</el-button>
        </template>
    </s-table>
    <s-add-role v-if="addRoleDialog" v-model="addRoleDialog" @success="getData"></s-add-role>
    <s-edit-role v-if="editRoleDialog" v-model="editRoleDialog" :user-id="userId" @success="getData"></s-edit-role>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import addRole from "./add/add.vue"
import editRole from "./edit/edit.vue"

export default defineComponent({
    components: {
        "s-add-role": addRole,
        "s-edit-role": editRole,
    },
    data() {
        return {
            userId: "", //------------用户id
            addRoleDialog: false, //新增角色弹窗
            editRoleDialog: false, //新增角色弹窗
        };
    },
    methods: {
        //获取数据
        getData() {
            this.$refs.table.getData();
        },
        //修改角色
        handleOpenEditRole(userId: string) {
            this.userId = userId;
            this.editRoleDialog = true;
        },
        //删除角色
        handleDeleteRole(_id: string) {
            this.$confirm(this.$t("此操作将永久删除此条记录, 是否继续?"), this.$t("提示"), {
                confirmButtonText: this.$t("确定"),
                cancelButtonText: this.$t("取消"),
                type: "warning",
            }).then(() => {
                const params = {
                    ids: [_id],
                };
                this.axios.delete("/api/security/role", { data: params }).then(() => {
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
    },
})
</script>

<style lang="scss">

</style>
