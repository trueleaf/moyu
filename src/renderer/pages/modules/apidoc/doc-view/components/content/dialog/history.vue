/*
    创建者：shuxiaokai
    创建时间：2020-06-26 19:07
    模块名称：查看历史记录
    备注：xxxx
*/
<template>
    <div class="history-dailog">
        <el-drawer title="查看历史记录" :visible="visible" direction="rtl" size="40%" :before-close="handleClose">
            <!-- 搜索 -->
            <div class="search-wraper">
                <el-form ref="form" :model="form" label-width="80px"  size="mini"  class="demo-form-inline">
                    <div class="d-flex">
                        <el-form-item label="接口名称">
                            <el-input v-model="form.name"></el-input>
                        </el-form-item>
                        <el-form-item label="作者">
                            <el-input v-model="form.operation"></el-input>
                        </el-form-item>
                    </div>
                    <el-form-item label="接口url">
                        <el-input v-model="form.url" class="url-input"></el-input>
                    </el-form-item>
                    <el-form-item label="操作">
                        <el-radio-group v-model="form.resource">
                            <el-radio-button label="新增"></el-radio-button>
                            <el-radio-button label="编辑"></el-radio-button>
                            <el-radio-button label="删除"></el-radio-button>
                            <el-radio-button label="修改接口位置"></el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item class="d-flex j-end sumbit-wraper">
                        <el-button type="primary" @click="onSubmit">查找</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <!-- 结果 -->
            <el-table :data="tableInfo" height="calc(100vh - 280px)">
                <el-table-column prop="createdAt" label="操作时间" width="180px">
                    <template slot-scope="scope">
                        <span class="f-xs">{{ new Date(scope.row.createdAt).toLocaleString() }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="接口名称" min-width="300">
                    <template slot-scope="scope">
                        <el-popover v-if="scope.row.docInfo.length > 1" placement="bottom" width="450" trigger="hover">
                            <div class="history-dailog-table-popover">
                                <div v-for="(item,key) in scope.row.docInfo" :key="key">
                                    <div class="d-flex j-between a-center mb-5">
                                        {{item.docName}} {{ item.url }} 
                                        <el-tooltip class="item" effect="dark" content="撤销操作" placement="bottom">
                                            <span class="el-icon-refresh red"></span>
                                        </el-tooltip>
                                    </div>
                                </div>
                            </div>
                            <div slot="reference">
                                <div>{{ scope.row.docInfo[0].docName }}</div>
                                <div class="f-xs gray-500">{{ scope.row.docInfo[0].url }}</div>
                            </div>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                        </el-popover>
                        <div v-else class="d-flex j-between a-center">
                            <div>
                                <div>{{ scope.row.docInfo[0].docName }}</div>
                                <div class="f-xs gray-500">{{ scope.row.docInfo[0].url }}</div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="operation" label="操作" width="100">
                    <template slot-scope="scope">
                        <div>
                            <el-tag type="info" size="mini">删除多个接口</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="operator" label="操作人员"></el-table-column>
            </el-table>
        </el-drawer>
    </div>
</template>

<script>
export default {
    props: {
        visible: { //是否现实弹窗
            type: Boolean,
            default: true
        },
    },
    data() {
        return {
            tableInfo:[], //历史记录列表
            form: {
                name: "",
                author: "",
                url: "",
                type: [],
            },//表单数据
            //=====================================其他参数====================================//
            loading: false, //----确认按钮状态
        };
    },
    created() {
        this.getHistoryData();
    },
    methods: {
        //=====================================获取远程数据==================================//
        //请求历史数据列表
        getHistoryData() {
            const params = {
                projectId: this.$route.query.id
            };
            this.axios.get("/api/docs/docs_history", { params }).then((res) => {
                var datas = res.data.rows;
                this.tableInfo = datas;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        //=====================================其他操作=====================================//
        //提交表单
        onSubmit() {},
        //关闭弹窗
        handleClose() {
            this.$emit("update:visible", false);
            this.$emit("close");
        },
    }
};
</script>



<style lang="scss">
.history-dailog-table-popover{
    max-height: size(350);
    overflow: auto;
}
.history-dailog{
    .search-wraper{
        width: 90%;
        margin: 0 auto;
        .url-input{
            .el-input__inner{
                width: 72%;
            }
        }
        .sumbit-wraper{
            margin-top: size(-45);
        }
    }
    .el-table{
        width: 90%;
        margin: 0 auto;
        // .txt,.sub-txt{
        //     margin: 0;
        // }
        // .sub-txt{
        //     font-size: size(12);
        //     color: $gray-500;
        // }

        .time-msg{
            font-size: size(12);
            color: $gray-600; 
        }
    }

    // .el-table__body-wrapper{
    //     height: calc(100vh - 280px);
    //     overflow-y: auto;
    // }
    .history-list{
        height: calc(100vh - 250px);
        overflow: auto;
        width: 90%;
        margin: 0 auto;
        li{
            height: size(60);
            line-height: size(60);
        }
        span{
            margin-right: size(25);
        }
        .time {
            color: $gray-400;
        }

        .link{
            &:hover{
                text-decoration: underline;
                color: $blue;
            }
            width: 50%;
        }
        .author{
            width: 10%;
        }
        .operation{
            width: 12%;
            text-align: center;
            span{
                margin: 0;
            }
        }
    }
}


</style>
