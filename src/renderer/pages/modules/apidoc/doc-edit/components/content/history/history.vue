/*
    创建者：shuxiaokai
    创建时间：2021-03-15 22:32
    模块名称：历史记录
    备注：
*/
<template>
    <div class="history">
        <s-fieldset title="过滤条件">
            <div class="op-item">
                <div>操作人员：</div>
                <el-checkbox-group v-model="formInfo.operators">
                    <el-checkbox label="小明"></el-checkbox>
                    <el-checkbox label="小李"></el-checkbox>
                    <el-checkbox label="小花"></el-checkbox>
                </el-checkbox-group>
                <el-button type="text">重置</el-button>
            </div>
            <div class="op-item">
                <div>日期范围：</div>
                <el-checkbox-group v-model="formInfo.operators">
                    <el-checkbox label="今天"></el-checkbox>
                    <el-checkbox label="24小时内"></el-checkbox>
                    <el-checkbox label="3天内"></el-checkbox>
                    <el-checkbox label="7天内"></el-checkbox>
                </el-checkbox-group>
               <el-checkbox label="自定义"></el-checkbox>
               <el-button type="text">重置</el-button>
            </div>
            <div class="op-item">
                <div class="flex0">日志类型：</div>
                <el-checkbox-group v-model="formInfo.operators">
                    <el-checkbox label="删除文档"></el-checkbox>
                    <el-checkbox label="新建文档"></el-checkbox>
                    <el-checkbox label="新建文件夹"></el-checkbox>
                    <el-checkbox label="复制文档"></el-checkbox>
                    <el-checkbox label="删除单个目录"></el-checkbox>
                    <el-checkbox label="删除单个文档"></el-checkbox>
                    <el-checkbox label="批量删除"></el-checkbox>
                    <el-checkbox label="编辑文档"></el-checkbox>
                    <el-checkbox label="改变位置"></el-checkbox>
                    <el-checkbox label="重命名"></el-checkbox>
                    <el-checkbox label="导入"></el-checkbox>
                    <el-checkbox label="导出"></el-checkbox>
                    <el-button type="text" size="mini">重置</el-button>
                </el-checkbox-group>
            </div>
            <div class="op-item">
                <div class="d-flex a-center mr-5">
                    <div class="flex0">接口名称：</div>
                    <el-input v-model="formInfo.name" size="mini" placeholder="通过接口名称匹配" maxlength="100" clearable></el-input>
                </div>
                <div class="d-flex a-center">
                    <div class="flex0">接口url：</div>
                    <el-input v-model="formInfo.name" size="mini" placeholder="通过接口url匹配" maxlength="100" clearable></el-input>
                </div>
            </div>
        </s-fieldset>
        <pre>
            {{ historyList }}
        </pre>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //=================================表单与表格参数================================//
            formInfo: {
                name: "",
                operators: [],
            },
            historyList: [], //历史记录列表
            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
            loading: false, //是否正在请求数据
        };
    },
    created() {
        this.getData();
        this.$event.on("apidoc/fresh", () => {
            this.getData()
        });
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        //获取数据
        getData() {
            this.loading = true;
            const params = {
                projectId: this.$route.query.id,
            };
            this.axios.get("/api/docs/docs_history", { params }).then((res) => {
                this.historyList = res.data.rows;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//

        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.history {
    padding: size(10) size(20);
    .el-checkbox {
        margin-right: size(20);
    }
    .op-item {
        min-height: size(50);
        display: flex;
        align-items: center;
        &:not(:last-of-type) {
            border-bottom: 1px dashed $gray-300;
        }
    }
}
</style>
