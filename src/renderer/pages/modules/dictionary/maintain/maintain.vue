/*
    创建者：shuxiaokai
    创建时间：2021-03-26 14:27
    模块名称：维护页面
    备注：
*/
<template>
    <div class="maintain">
        <div v-show="!showAdd && !showEdit && !showView">
            <!-- 搜索条件 -->
            <s-search showTip autoRequest @change="handleChange">
                <s-search-item label="中文名称" vModel="cnName"></s-search-item>
                <s-search-item label="英文名称" vModel="enName"></s-search-item>
                <s-search-item label="创建者" vModel="creator"></s-search-item>
                <el-button v-if="!showAdd && !showEdit && !showView" slot="operation" type="success" size="mini" @click="showAdd = true">新增词条</el-button>
                <el-button v-if="!showAdd && !showEdit && !showView" slot="operation" type="success" size="mini" @click="showAdd = true">新增标签</el-button>
            </s-search>
            <!-- 表格展示 -->
            <s-table ref="table" url="/api/dictionary/dictionary_list" class="table" deleteMany deleteUrl="/api/dictionary/dictionary">
                <el-table-column prop="cnName" label="中文名称" align="center"></el-table-column>
                <el-table-column prop="enName" label="英文名称" align="center"></el-table-column>
                <el-table-column prop="example" label="例子" align="center"></el-table-column>
                <el-table-column prop="creator" label="创建者" align="center"></el-table-column>
                <el-table-column prop="maintainer" label="维护者" align="center"></el-table-column>
                <el-table-column prop="updatedAt" label="更新时间" align="center">
                    <template slot-scope="scope">
                        {{ $helper.formatDate(scope.row.updatedAt) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" @click="handleShowEdit(scope)">修改</el-button>
                        <el-button type="text" @click="handleDelete(scope)">删除</el-button>
                    </template>
                </el-table-column>
            </s-table>
        </div>
        <s-view v-if="showView"></s-view>
        <s-edit v-if="showEdit" @close="showEdit = false" :id="editId"></s-edit>
        <s-add v-if="showAdd" @close="showAdd = false"></s-add>
    </div>
</template>

<script>
import edit from "./components/edit.vue"
import view from "./components/view.vue"
import add from "./components/add.vue"

export default {
    components: {
        "s-edit": edit,
        "s-view": view,
        "s-add": add,
    },
    data() {
        return {
            //=================================表单与表格参数================================//
            formInfo: {
                projectId: this.$route.query.id,
                startTime: null, //--起始日期
                endTime: null, //----结束日期
                docName: "", //---------请求名称
                url: "", //----------请求url
                operators: [], //----操作者信息
            },
            //===================================枚举参数====================================//

            //===================================业务参数====================================//
            editId: "",
            //===================================其他参数====================================//
            showAdd: false, //-----------是否展示新增
            showEdit: false, //----------是否展示编辑页面
            showView: false, //----------是否展示view页面
        };
    },
    created() {

    },
    methods: {
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//
        handleChange(val) {
            const params = {
                ...val,
            }
            this.$refs.table.getData(params);
        },
        //=====================================组件间交互====================================//
        //删除词汇
        handleDelete(scope) {
            this.$confirm("此操作将永久删除此条记录, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const params = {
                    ids: [scope.row._id],
                };
                this.axios.delete("/api/dictionary/dictionary", { data: params }).then(() => {
                    this.$refs.table.getData();
                }).catch((err) => {
                    this.$errorThrow(err, this);
                })
            }).catch((err) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
        },
        //展示编辑页面
        handleShowEdit(scope) {
            this.editId = scope.row._id;
            this.showEdit = true;
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.maintain {
    min-width: size(500);
    width: 70%;
    margin: size(40) auto 0;
}
</style>
