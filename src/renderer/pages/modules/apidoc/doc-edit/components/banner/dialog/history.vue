/*
    创建者：shuxiaokai
    创建时间：2020-06-26 19:07
    模块名称：查看历史记录
    备注：xxxx
*/
<template>
    <div class="history-dailog">
        <el-drawer title="查看历史记录" :visible="visible" direction="rtl" size="60%" :before-close="handleClose">
           <!-- 表格展示 -->
           <s-table ref="table" url="/api/docs/docs_history" :index="false" :params="{projectId: $route.query.id}">
                <el-table-column label="操作详情" header-align="center" show-overflow-tooltip min-width="100px">
                   <template slot-scope="scope">
                        <div class="d-flex a-center">
                            <!-- 重命名文档 -->
                            <template v-if="scope.row.operation === 'rename' && scope.row.docInfo[1]">
                                <svg class="svg-icon mr-1">
                                    <use xlink:href="#iconrename"></use>
                                </svg>
                                <del>{{ scope.row.docInfo[0].docName }}</del>
                                <span class="red mx-1 el-icon-right"></span>
                                <span>{{ scope.row.docInfo[1].docName }}</span>
                            </template>
                            <!-- 新建文件 -->
                            <template v-if="scope.row.operation === 'addDoc'">
                                <svg v-if="!scope.row.docInfo[0].isFolder" class="svg-icon mr-1">
                                    <use xlink:href="#iconwenjian"></use>
                                </svg>
                                <span>{{ scope.row.docInfo[0].docName }}</span>
                                <span class="green">++</span>
                            </template>
                            <!-- 新建文件夹 -->
                            <template v-if="scope.row.operation === 'addFolder'">
                                <svg v-if="scope.row.docInfo[0].isFolder" class="svg-icon mr-1">
                                    <use xlink:href="#icon-folder-empty"></use>
                                </svg>
                                <span>{{ scope.row.docInfo[0].docName }}</span>
                                <span class="green">++</span>
                            </template>
                            <!-- 复制文档 -->
                            <template v-if="scope.row.operation === 'copyDoc'">
                                <span class="svg-icon mr-1 green">CP</span>
                                <span>{{ scope.row.docInfo[0].docName }}</span>
                            </template>
                            <!-- 删除文档 -->
                            <template v-if="scope.row.operation === 'deleteDoc'">
                                <svg class="svg-icon mr-1">
                                    <use xlink:href="#icondel"></use>
                                </svg>
                                <span>{{ scope.row.docInfo[0].docName }}</span>
                                <span class="red">&nbsp;-&nbsp;-</span>
                            </template>
                            <!-- 删除文件夹 -->
                            <template v-if="scope.row.operation === 'deleteFolder'">
                                <svg v-if="scope.row.docInfo[0].isFolder" class="svg-icon mr-1">
                                    <use xlink:href="#iconshanchuwenjianjia"></use>
                                </svg>
                                <span>{{ scope.row.docInfo[0].docName }}</span>
                                <span class="red">&nbsp;-&nbsp;-</span>
                            </template>
                            <!-- 删除多个 -->
                            <template v-if="scope.row.operation === 'deleteMany'">
                                <span class="svg-icon mr-1 red">批</span>
                                <span>{{ scope.row.docInfo[0].docName }}</span>
                                <span class="red">&nbsp;-&nbsp;-</span>
                            </template>
                            <!-- 修改文档内容 -->
                            <template v-if="scope.row.operation === 'editDoc'">
                                <span class="svg-icon mr-1 orange">修</span>
                                <span>{{ scope.row.docInfo[0].docName }}</span>
                            </template>
                            <!-- 改变文档位置 -->
                            <template v-if="scope.row.operation === 'position'">
                                <span class="svg-icon mr-1 orange">位</span>
                                <span>{{ scope.row.docInfo[0].docName }}</span>
                                <span class="red">&nbsp;-&nbsp;-</span>
                            </template>
                        </div>
                   </template>
                </el-table-column>
                <el-table-column label="操作类型" align="center">
                    <template slot-scope="scope">
                        <span v-if="scope.row.operation === 'addDoc'" class="green">新建文件</span>
                        <span v-if="scope.row.operation === 'addFolder'" class="green">新建文件夹</span>
                        <span v-if="scope.row.operation === 'copyDoc'" class="green">复制文档</span>
                        <span v-if="scope.row.operation === 'copyFolder'" class="green">复制文件夹</span>
                        <span v-if="scope.row.operation === 'deleteFolder'" class="red">删除文件夹</span>
                        <span v-if="scope.row.operation === 'deleteDoc'" class="red">删除文档</span>
                        <span v-if="scope.row.operation === 'deleteMany'" class="red">多个删除</span>
                        <span v-if="scope.row.operation === 'editDoc'" class="orange">修改文档内容</span>
                        <span v-if="scope.row.operation === 'position'" class="orange">改变文档位置</span>
                        <span v-if="scope.row.operation === 'rename'" class="orange">重命名文档</span>
                        <span v-if="scope.row.operation === 'import'" class="red">导入文档</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作时间" align="center">
                    <template slot-scope="scope">
                        <span>{{ new Date(scope.row.createdAt).toLocaleString() }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作者" align="center">
                    <template slot-scope="scope">
                        <span>{{ scope.row.operator }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-popover placement="right" width="400" trigger="click">
                            <pre>
                                {{ historyDetail }}
                            </pre>
                            <span slot="reference" class="ml-2 theme-color cursor-pointer" @click="handleGetHistoryDetail(scope.row.docId)">详情</span>
                        </el-popover>
                    </template>
                </el-table-column>
            </s-table>
        </el-drawer>
    </div>
</template>

<script>
export default {
    props: {
        visible: { //是否现实弹窗
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            historyDetail: [],
            //=====================================其他参数====================================//
            loading: false, //----确认按钮状态
        };
    },
    watch: {
        visible() {
            if (this.$refs.table) {
                this.$refs.table.getData();
            }
        },
    },
    created() {
    },
    methods: {
        //=====================================获取远程数据==================================//
        //获取数据
        handleGetHistoryDetail(docId) {
            const params = {
                docId,
            };
            this.axios.get("/api/docs/docs_records", { params }).then((res) => {
                this.historyDetail = res.data;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================其他操作=====================================//
        //关闭弹窗
        handleClose() {
            this.$emit("update:visible", false);
            this.$emit("close");
        },
    },
};
</script>

<style lang="scss">
.history-dailog {
    .svg-icon {
        width: size(28);
        height: size(28);
        padding: size(4);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid $gray-300;
        border-radius: 50%;
    }
}
</style>
