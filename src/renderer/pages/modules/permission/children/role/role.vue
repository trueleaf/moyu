/*
    创建者：shuxiaokai
    创建时间：2020-05-31 14:18
    模块名称：角色列表
    备注：xxxx
*/
<template>
    <div>
        <!-- 表格展示 -->
        <s-table ref="table" url="/api/security/role_list">
            <el-table-column prop="roleName" label="角色名称" align="center"></el-table-column>
            <el-table-column prop="remark" label="备注" align="center"></el-table-column>
            <el-table-column label="创建时间" align="center">
                <template slot-scope="scope">
                    {{ new Date(scope.row.createdAt).toLocaleString() }}
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                    <el-button type="text" @click="handleOpenEditRole(scope.row._id)">修改</el-button>
                    <el-button type="text" @click="handleDeleteRole(scope.row._id)">删除</el-button>
                </template>
            </el-table-column>
            <el-button slot="operation" size="mini" type="success" @click="isShow = true">新增角色</el-button>
        </s-table>
        <s-add-role v-if="isShow" :isShow.sync="isShow" @success="getData"></s-add-role>
        <s-edit-role v-if="isShow2" :id="roleId" :isShow.sync="isShow2" @success="getData"></s-edit-role>
    </div>
</template>

<script>
import addRole from "./add/add"
import editRole from "./edit/edit"
export default {
    components: {
        "s-add-role": addRole, 
        "s-edit-role": editRole, 
    },
    data() {
        return {
            isShow: false, //新增角色弹窗
            isShow2: false, //修改角色弹窗
            roleId: "", //编辑时候角色id
        };
    },
    created() {

    },
    methods: {
        //=====================================获取远程数据==================================//
        getData() {
            this.$refs["table"].getData();
        },
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        handleDeleteRole(_id) {
            this.$confirm("此操作将永久删除此条记录, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                const params = {
                    ids: [_id] 
                };
                this.axios.delete("/api/security/role", { data: params }).then(() => {
                    this.$refs["table"].getData();
                }).catch(err => {
                    this.$errorThrow(err, this);
                });            
            }).catch(err => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
        },
        handleOpenEditRole(_id) {
            this.roleId = _id;
            this.isShow2 = true;
        },
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
