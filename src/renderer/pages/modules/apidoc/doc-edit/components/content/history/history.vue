/*
    创建者：shuxiaokai
    创建时间：2021-03-15 22:32
    模块名称：历史记录
    备注：
*/
<template>
    <div class="history">
        <div class="search-wrap">
            <div class="d-flex">
                <div>操作人员：</div>
                <el-checkbox-group v-model="formInfo.operators">
                    <el-checkbox label="小明"></el-checkbox>
                    <el-checkbox label="小李"></el-checkbox>
                    <el-checkbox label="小花"></el-checkbox>
                </el-checkbox-group>
            </div>
            <div class="d-flex">
                <div>日期范围：</div>
                <el-checkbox-group v-model="formInfo.operators">
                    <el-checkbox label="今天之内"></el-checkbox>
                    <el-checkbox label="24小时内"></el-checkbox>
                    <el-checkbox label="3天内"></el-checkbox>
                    <el-checkbox label="7天内"></el-checkbox>
                </el-checkbox-group>
            </div>
        </div>
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

</style>
