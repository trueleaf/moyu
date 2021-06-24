/*
    创建者：shuxiaokai
    创建时间：2021-06-14 12:15
    模块名称：
    备注：
*/
<template>
    <div>
        <s-search @change="handleChange">
            <s-search-item label="登录名称" prop="loginName"></s-search-item>
            <s-search-item label="真实姓名" prop="realName"></s-search-item>
            <s-search-item label="手机号" prop="phone"></s-search-item>
            <template #operation>
                <el-button size="mini" type="success" @click="addUserDialog = true">新增用户</el-button>
                <s-download class="ml-2" url="/api/security/user_excel_template" @finish="loading = false">
                    <el-button :loading="loading" size="mini" type="primary" icon="el-icon-upload" @click="loading = true">下载模板</el-button>
                </s-download>
                <s-upload-plain url="/api/security/add_user_by_excel" excel @success="getData" @upload="loading2 = true" @finish="loading2 = false">
                    <el-button :loading="loading2" size="mini" type="primary" icon="el-icon-upload">导入用户</el-button>
                </s-upload-plain>
            </template>
        </s-search>
        <!-- 表格展示 -->
        <s-table ref="table" url="/api/security/user_list" class="mt-5">
            <el-table-column prop="loginName" label="登录名称" align="center"></el-table-column>
            <el-table-column prop="realName" label="真实姓名" align="center"></el-table-column>
            <el-table-column prop="phone" label="手机号" align="center"></el-table-column>
            <el-table-column label="创建日期" align="center" width="200px">
                <template #default="scope">
                    {{ $helper.formatDate(scope.row.createdAt) }}
                </template>
            </el-table-column>
            <el-table-column label="上次登录" align="center" width="200px">
                <template #default="scope">
                    {{ $helper.formatDate(scope.row.lastLogin) }}
                </template>
            </el-table-column>
            <el-table-column label="登录次数" align="center" prop="loginTimes"></el-table-column>
            <el-table-column label="角色信息" align="center" width="200px">
                <template #default="scope">
                    <el-tag v-for="(item, index) in scope.row.roleNames" :key="index" class="d-block mb-1">{{ item }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="状态" align="center" width="80px">
                <template #default="scope">
                    <el-tag v-if="scope.row.enable" type="success" size="mini">启用</el-tag>
                    <el-tag v-else type="warning" size="mini">禁用</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="200px">
                <!-- <template #default="scope">
                    <el-button type="text" @click="handleOpenEditUser(scope.row)">修改用户信息</el-button>
                    <el-button type="text" @click="handleForbidRole(scope.row._id, scope.row.enable)">
                        {{ scope.row.enable ? "禁用" : "启用" }}
                    </el-button>
                </template> -->
            </el-table-column>
        </s-table>
        <s-add-user-dialog v-model="addUserDialog" @success="getData"></s-add-user-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import addUserDialog from "./add/add.vue"

export default defineComponent({
    components: {
        "s-add-user-dialog": addUserDialog,
    },
    data() {
        return {
            addUserDialog: false,
            loading: false,
            loading2: false,
        };
    },
    methods: {
        getData(params: Record<string, unknown>) {
            (this.$refs.table as { getData(params: Record<string, unknown>):void }).getData(params);
        },
        handleChange(params: Record<string, unknown>) {
            this.getData(params)
        },
    },
})
</script>

<style lang="scss">
</style>
