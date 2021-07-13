/*
    创建者：shuxiaokai
    创建时间：2021-06-29 21:54
    模块名称：服务端路由管理
    备注：
*/
<template>
    <div>
        <!-- 搜索条件 -->
        <s-search auto-request @change="handleChange">
            <s-search-item label="名称&地址" prop="name"></s-search-item>
            <s-search-item label="分组名称" prop="groupName" type="select" :select-enum="groupEnum"></s-search-item>
            <template #operation>
                <el-button type="success" size="mini" @click="handleOpenAddRouteDialog">新增路由</el-button>
                <el-button :disabled="selectedData.length === 0" type="success" size="mini" @click="handleOpenMultiEditTypeDialog">批量修改类型</el-button>
            </template>
        </s-search>
        <!-- 表格展示 -->
        <s-table ref="table" url="/api/security/server_routes" :res-hook="hookRequest" :paging="false" selection @select="handleSelect">
            <el-table-column label="请求方法" align="center">
                <template #default="scope">
                    <span v-if="scope.row.method === 'get'" class="green">GET</span>
                    <span v-else-if="scope.row.method === 'post'" class="orange">POST</span>
                    <span v-else-if="scope.row.method === 'put'" class="teal">PUT</span>
                    <span v-else-if="scope.row.method === 'delete'" class="red">DELETE</span>
                    <span v-else>{{ scope.row.method }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" label="路由名称" align="center"></el-table-column>
            <el-table-column prop="path" label="路由地址" align="center"></el-table-column>
            <el-table-column prop="groupName" label="分组名称" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
                <template #default="scope">
                    <el-button type="text" @click.stop="handleOpenServerEditDialog(scope.row)">修改</el-button>
                    <el-button type="text" @click.stop="handleDeleteServerRoute(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </s-table>
        <s-add-server-route v-if="dialogVisible" v-model="dialogVisible" @success="getData"></s-add-server-route>
        <s-edit-server-route v-if="dialogVisible2" v-model="dialogVisible2" :edit-data="editData" @success="getData"></s-edit-server-route>
        <s-multi-edit-server-route v-if="dialogVisible3" v-model="dialogVisible3" :edit-data="selectedData" @success="getData"></s-multi-edit-server-route>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import addServerRoute from "./add/add.vue"
import editServerRoute from "./edit/edit.vue"
import multiEditServerRoute from "./edit/edit2.vue"
import { Response, ServerRoute } from "@@/global"
type HookThis = {
    tableData: ServerRoute[],
    total: number,
}
export default defineComponent({
    components: {
        "s-add-server-route": addServerRoute,
        "s-edit-server-route": editServerRoute,
        "s-multi-edit-server-route": multiEditServerRoute,
    },
    data() {
        return {
            selectedData: [] as ServerRoute[], //-----------------当前被选中的表单数据
            editData: {} as ServerRoute, //-----------------------需要编辑的数据
            originTableData: [] as ServerRoute[], //--------------原始表单数据
            groupEnum: [] as { id: string, name: string }[], //---分组信息
            dialogVisible: false, //------------------------------新增路由信息弹窗
            dialogVisible2: false, //-----------------------------修改路由信息弹窗
            dialogVisible3: false, //-----------------------------批量修改路由信息弹窗
        };
    },
    methods: {
        //=====================================数据获取====================================//
        //获取表格数据
        getData() {
            this.$refs.table.getData();
        },
        //搜索数据
        handleChange(params: { name: string, groupName: string }) {
            const { name, groupName } = params;
            this.$refs.table.tableData = this.originTableData.filter((val) => {
                const matchedName = name ? val.name.match(name) : true;
                const matchedPath = name ? val.path.match(name) : true;
                const matchedGroupName = groupName ? val.groupName.match(groupName) : true;
                return (matchedName || matchedPath) && matchedGroupName;
            })
        },
        //获取前端路由信息
        hookRequest(res: Response<ServerRoute[]>, _this: HookThis) {
            this.originTableData = res.data;
            _this.tableData = res.data;
            _this.total = res.data.length;
            const uniqueData = this.$helper.uniqueByKey(res.data, "groupName");
            this.groupEnum = uniqueData.map((v) => ({ id: v.groupName, name: v.groupName })).sort((a, b) => {
                return (a.name.charCodeAt(0) - b.name.charCodeAt(0));
            })
        },
        //=========================================================================//
        handleSelect(routeList: ServerRoute[]) {
            this.selectedData = routeList;
        },
        //删除前端路由组件
        handleDeleteServerRoute(row: ServerRoute) {
            this.$confirm("此操作将永久删除此条记录, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const params = { ids: [row._id] };
                this.axios.delete("/api/security/server_routes", { data: params }).then(() => {
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
        //=====================================其他操作====================================//
        //打开新增前端路由
        handleOpenAddRouteDialog() {
            this.dialogVisible = true;
        },
        //打开修改前端路由
        handleOpenServerEditDialog(row: ServerRoute) {
            this.editData = row;
            this.dialogVisible2 = true;
        },
        //打开批量修改前端路由类型
        handleOpenMultiEditTypeDialog() {
            this.dialogVisible3 = true;
        },
    },
})
</script>

<style lang="scss">

</style>
