/*
    创建者：shuxiaokai
    创建时间：2021-03-15 22:32
    模块名称：历史记录
    备注：
*/
<template>
    <div class="history">
        <s-fieldset title="过滤条件">
            {{ formInfo }}
            <!-- 操作人员 -->
            <div class="op-item">
                <div>操作人员：</div>
                <el-checkbox-group v-model="formInfo.operators">
                    <el-checkbox label="小明"></el-checkbox>
                    <el-checkbox label="小李"></el-checkbox>
                    <el-checkbox label="小花"></el-checkbox>
                    <el-button type="text" @click="handleClearOperator">清空</el-button>
                </el-checkbox-group>
            </div>
            <!-- 日期范围 -->
            <div class="op-item">
                <div class="flex0">
                    <span>日期范围&nbsp;</span>
                    <el-popover placement="top-start" width="350" trigger="hover" content="多少天内代表：当前时间-天数*每天毫秒数">
                        <i slot="reference" class="el-icon-info"></i>
                    </el-popover>
                    <span>：</span>
                </div>
                <el-radio-group v-model="dateRange">
                    <el-radio label="1d">今天</el-radio>
                    <el-radio label="yesterday">昨天</el-radio>
                    <el-radio label="2d">2天内</el-radio>
                    <el-radio label="3d">3天内</el-radio>
                    <el-radio label="7d">7天内</el-radio>
                    <el-radio label="自定义">自定义</el-radio>
                    <el-date-picker
                        v-model="customDateRange"
                        type="datetimerange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        size="mini"
                        class="mr-2"
                        end-placeholder="结束日期">
                    </el-date-picker>
                    <el-button type="text">清空</el-button>
                </el-radio-group>
            </div>
            <!-- 日志类型 -->
            <div class="op-item">
                <div class="flex0">日志类型：</div>
                <el-checkbox-group v-model="formInfo.operationType">
                    <el-checkbox label="删除文档"></el-checkbox>
                    <el-checkbox label="删除单个目录"></el-checkbox>
                    <el-checkbox label="删除单个文档"></el-checkbox>
                    <el-checkbox label="批量删除"></el-checkbox>
                    <el-checkbox label="编辑文档"></el-checkbox>
                    <el-checkbox label="新建文档"></el-checkbox>
                    <el-checkbox label="新建文件夹"></el-checkbox>
                    <el-checkbox label="复制文档"></el-checkbox>
                    <el-checkbox label="改变位置"></el-checkbox>
                    <el-checkbox label="重命名"></el-checkbox>
                    <el-checkbox label="导入"></el-checkbox>
                    <el-checkbox label="导出"></el-checkbox>
                    <el-button type="text">清空</el-button>
                </el-checkbox-group>
            </div>
            <!-- 接口名称和接口url -->
            <div class="op-item">
                <div class="d-flex a-center mr-5">
                    <div class="flex0">接口名称：</div>
                    <el-input v-model="formInfo.name" size="mini" placeholder="通过接口名称匹配" maxlength="100" clearable></el-input>
                </div>
                <div class="d-flex a-center mr-5">
                    <div class="flex0">接口url：</div>
                    <el-input v-model="formInfo.name" size="mini" placeholder="通过接口url匹配" maxlength="100" clearable></el-input>
                </div>
                <div>
                    <el-button size="mini" type="info">全部清空</el-button>
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
                startTime: null, //--起始日期
                endTime: null, //----结束日期
                name: "", //---------请求名称
                url: "", //----------请求url
                operators: [], //----操作者信息
                operationType: [], //操作类型
            },
            customDateRange: [], //--自定义日期范围
            historyList: [], //------历史记录列表
            dateRange: "", //--------日期范围
            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
            loading: false, //是否正在请求数据
        };
    },
    watch: {
        dateRange(val) {
            let startTime = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();
            let endTime = null;
            switch (val) {
            case "1d":
                endTime = Date.now();
                break;
            case "2d":
                endTime = Date.now();
                startTime = endTime - 24 * 86400;
                break;
            case "3d":
                endTime = Date.now();
                startTime = endTime - 72 * 86400;
                break;
            case "7d":
                endTime = Date.now();
                startTime = endTime - 168 * 86400;
                break;
            case "yesterday":
                endTime = startTime;
                startTime -= 24 * 86400;
                break;
            default:
                break;
            }
            this.formInfo.startTime = startTime;
            this.formInfo.endTime = endTime;
        },
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
        //清空操作人员信息
        handleClearOperator() {
            this.formInfo.operators = [];
        },
        //清空日期范围
        handleClearDate() {},
        //清空日志类型
        handleClearType() {},
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.history {
    padding: size(10) size(20);
    .el-checkbox, .el-radio {
        margin-right: size(15);
    }
    .op-item {
        min-height: size(50);
        display: flex;
        align-items: center;
        &:not(:last-of-type) {
            border-bottom: 1px dashed $gray-300;
        }
        .el-button--text {
            padding-top: size(5);
            padding-bottom: size(5);
        }
    }
}
</style>
