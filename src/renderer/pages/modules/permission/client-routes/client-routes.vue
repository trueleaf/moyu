/*
    创建者：shuxiaokai
    创建时间：2021-06-29 21:54
    模块名称：路由管理
    备注：
*/
<template>
    <div>
        <!-- 搜索条件 -->
        <s-search auto-request @change="handleChange">
            <s-search-item label="名称&地址" prop="name"></s-search-item>
            <s-search-item label="分组名称" prop="groupName" type="select" :select-enum="groupEnum"></s-search-item>
            <template #operation>
                <el-button type="success" size="mini">新增路由</el-button>
                <el-button type="success" size="mini">批量修改类型</el-button>
            </template>
        </s-search>
        <!-- 表格展示 -->
        <s-table ref="table" url="/api/security/client_routes" :res-hook="hookRequest" :paging="false">
            <el-table-column prop="name" label="路由名称" align="center"></el-table-column>
            <el-table-column prop="path" label="路由地址" align="center"></el-table-column>
            <el-table-column prop="groupName" label="分组名称" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
                <template #default="scope">
                    <el-button type="text" @click.stop="handleOpenClientEditDialog(scope.row)">修改</el-button>
                    <el-button type="text" @click.stop="handleDeleteClientRoute(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </s-table>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { Response, ClientRoute } from "@@/global"
type HookThis = {
    tableInfo: unknown[],
    total: number,
}

export default defineComponent({
    data() {
        return {
            groupEnum: [] as { id: string, name: string }[], //分组信息
            dialogVisible: false, //修改路由信息弹窗
            loading: false, //
        };
    },
    created() {
        // this.getClientRoutes();
    },
    methods: {
        handleChange(params: Record<string, unknown>) {
            console.log(params, this.$refs.table.tableData)
        },
        //获取前端路由信息
        hookRequest(res: Response<ClientRoute[]>, _this: HookThis) {
            this.loading = true;
            _this.tableInfo = res.data;
            _this.total = res.data.length;
            const uniqueData = this.$helper.uniqueByKey(res.data, "groupName");
            this.groupEnum = uniqueData.map((v) => ({ id: v.groupName, name: v.groupName }))
            console.log(uniqueData)
        },
        //打开修改前端路由组件
        handleOpenClientEditDialog(row: ClientRoute) {
            this.dialogVisible = true;
            console.log(22, row)
        },
        //删除前端路由组件
        handleDeleteClientRoute(row: ClientRoute) {
            this.$confirm("此操作将永久删除此条记录, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const params = { ids: [row._id] };
                this.axios.delete("/api/security/client_routes", { data: params }).then(() => {
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
