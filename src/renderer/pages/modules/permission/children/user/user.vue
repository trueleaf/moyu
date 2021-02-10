/*
    创建者：shuxiaokai
    创建时间：2020-05-31 14:18
    模块名称：用户管理
    备注：xxxx
*/
<template>
    <div>
        <!-- 搜索条件 -->
        <s-search autoRequest @change="handleChange">
            <s-search-item label="登录名称" vModel="loginName"></s-search-item>
            <s-search-item label="真实姓名" vModel="realName"></s-search-item>
            <s-search-item label="手机号" vModel="phone"></s-search-item>
            <s-search-item label="部门" vModel="department"></s-search-item>
            <s-search-item label="职位" vModel="title"></s-search-item>
            <el-button slot="operation" size="mini" type="success" @click="isShow = true">新增用户</el-button>
            <s-download slot="operation" class="ml-2" url="/api/security/user_excel_template" @finish="loading = false">
                <el-button :loading="loading" size="mini" type="primary" icon="el-icon-upload" @click="loading = true">下载模板</el-button>
            </s-download>
            <s-upload-plain slot="operation" url="/api/security/add_user_by_excel" excel @success="getData" @upload="loading2 = true" @finish="loading2 = false">
                <el-button :loading="loading2" size="mini" type="primary" icon="el-icon-upload">导入用户</el-button>
            </s-upload-plain>
        </s-search>
        <br>
        <!-- 表格展示 -->
        <s-table ref="table" url="/api/security/user_list">
            <el-table-column prop="loginName" label="登录名称" align="center"></el-table-column>
            <el-table-column prop="realName" label="真实姓名" align="center"></el-table-column>
            <el-table-column prop="phone" label="手机号" align="center"></el-table-column>
            <el-table-column prop="department" label="部门" align="center"></el-table-column>
            <el-table-column prop="title" label="职位" align="center"></el-table-column>
            <el-table-column prop="qq" label="qq号码" align="center"></el-table-column>
            <el-table-column label="角色信息" align="center" width="200px">
                <template slot-scope="scope">
                    <el-tag v-for="(item, index) in scope.row.roleNames" :key="index" class="d-block mb-1">{{ item }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="状态" align="center">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.enable" type="success" size="mini">启用</el-tag>
                    <el-tag v-else type="warning" size="mini">禁用</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="200px">
                <template slot-scope="scope">
                    <!-- <el-button type="text" @click="handleOpenEditInfo(scope.row)">基础信息</el-button> -->
                    <el-button type="text" @click="handleOpenEditUser(scope.row)">修改用户信息</el-button>
                    <el-button type="text" @click="handleForbidRole(scope.row._id, scope.row.enable)">
                        {{ scope.row.enable ? "禁用" : "启用" }}
                    </el-button>
                </template>
            </el-table-column>

        </s-table>
        <s-add-user :isShow.sync="isShow" @success="getData"></s-add-user>
        <s-edit-user v-if="isShow2" :id="roleId" :isShow.sync="isShow2" @success="getData"></s-edit-user>
        <!-- <s-edit-user v-if="isShow3" :id="roleId" :isShow.sync="isShow3" @success="getData"></s-edit-user> -->
    </div>
</template>

<script>
import addUser from "./add/add.vue"
import editUser from "./edit/edit.vue"

export default {
    components: {
        "s-add-user": addUser,
        "s-edit-user": editUser,
    },
    data() {
        return {
            isShow: false, //新增用户弹窗
            isShow2: false, //修改用户角色弹窗
            isShow3: false, //修改用户信息弹窗
            roleId: "", //编辑时候用户id
            roleIds: [], //编辑时候已存在角色信息
            //=====================================其他参数====================================//
            loading: false, //下载模板加载效果
            loading2: false, //批量导入用户加载效果
        };
    },
    created() {

    },
    methods: {
        //=====================================获取远程数据==================================//
        getData(params) {
            this.$refs.table.getData(params);
        },
        //=====================================前后端交互====================================//
        handleChange(params) {
            this.getData(params);
        },
        //=====================================组件间交互====================================//
        handleForbidRole(_id, enable) {
            const tipLabel = enable ? "禁用" : "启用";
            this.$confirm(`确实要${tipLabel}该用户吗?`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const params = {
                    _id,
                    enable: !enable,
                };
                this.axios.put("/api/security/user_state", params).then(() => {
                    this.$refs.table.getData();
                }).catch((err) => {
                    this.$errorThrow(err, this);
                });
            }).catch((err) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
        },
        handleOpenEditUser(row) {
            this.roleId = row._id;
            this.roleIds = row.roleIds;
            this.isShow2 = true;
        },
        handleOpenEditInfo() {

        },
        //=====================================其他操作=====================================//
    },
};
</script>

<style lang="scss">

</style>
