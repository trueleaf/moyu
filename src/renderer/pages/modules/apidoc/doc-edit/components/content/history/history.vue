/*
    创建者：shuxiaokai
    创建时间：2021-03-15 22:32
    模块名称：历史记录
    备注：
*/
<template>
    <div class="history">
        <s-fieldset title="过滤条件" class="search">
            <!-- 操作人员 -->
            <div class="op-item">
                <div>操作人员：</div>
                <el-checkbox-group v-model="formInfo.operators">
                    <el-checkbox v-for="(item, index) in memberEnum" :key="index" :label="item"></el-checkbox>
                    <el-button type="text" @click="handleClearOperator">清空</el-button>
                </el-checkbox-group>
            </div>
            <!-- 日期范围 -->
            <div class="op-item">
                <div class="flex0">
                    <span>日期范围&nbsp;</span>
                    <!-- <el-popover placement="top-start" width="350" trigger="hover" content="多少天内代表：当前时间-天数*每天毫秒数">
                        <i slot="reference" class="el-icon-info"></i>
                    </el-popover> -->
                    <span>：</span>
                </div>
                <el-radio-group v-model="dateRange">
                    <el-radio label="1d">今天</el-radio>
                    <el-radio label="yesterday">昨天</el-radio>
                    <el-radio label="2d">近两天</el-radio>
                    <el-radio label="3d">近三天</el-radio>
                    <el-radio label="7d">近七天</el-radio>
                    <el-radio label="自定义">自定义</el-radio>
                    <el-date-picker
                        v-if="dateRange === '自定义'"
                        v-model="customDateRange"
                        type="datetimerange"
                        range-separator="至"
                        value-format="timestamp"
                        start-placeholder="开始日期"
                        size="mini"
                        class="mr-2"
                        end-placeholder="结束日期">
                    </el-date-picker>
                    <el-button type="text" @click="handleClearDate">清空</el-button>
                </el-radio-group>
            </div>
            <!-- 日志类型 -->
            <div class="op-item">
                <div class="flex0">日志类型：</div>
                <el-checkbox-group v-model="formInfo.operationTypes">
                    <el-checkbox label="deleteDoc">删除单个文档</el-checkbox>
                    <el-checkbox label="deleteFolder">删除单个目录</el-checkbox>
                    <el-checkbox label="deleteMany">批量删除</el-checkbox>
                    <el-checkbox label="editDoc">编辑文档</el-checkbox>
                    <el-checkbox label="addDoc">新建文档</el-checkbox>
                    <el-checkbox label="addFolder">新建文件夹</el-checkbox>
                    <el-checkbox label="copyDoc">复制文档</el-checkbox>
                    <el-checkbox label="position">改变位置</el-checkbox>
                    <el-checkbox label="rename">重命名</el-checkbox>
                    <el-checkbox label="import">导入</el-checkbox>
                    <el-checkbox label="export">导出</el-checkbox>
                    <el-button type="text" @click="handleClearType">清空</el-button>
                </el-checkbox-group>
            </div>
            <!-- 接口名称和接口url -->
            <div class="op-item">
                <div class="d-flex a-center mr-5">
                    <div class="flex0">接口名称：</div>
                    <el-input v-model="formInfo.docName" size="mini" placeholder="通过接口名称匹配" maxlength="100" clearable></el-input>
                </div>
                <div class="d-flex a-center mr-5">
                    <div class="flex0">接口url：</div>
                    <el-input v-model="formInfo.url" size="mini" placeholder="通过接口url匹配" maxlength="100" clearable></el-input>
                </div>
                <div>
                    <el-button size="mini" type="info" @click="clearAll">全部清空</el-button>
                </div>
            </div>
        </s-fieldset>
        <s-loading :loading="loading" class="list">
            <div v-for="(item, index) in historyInfo" :key="index" class="list-wrap">
                <h2 class="title">{{ item.title }}</h2>
                <div v-for="(item2, index2) in item.history" :key="index2" class="item">
                    <div class="head">{{ $helper.formatDate(item2.createdAt, "HH:mm") }}</div>
                    <div class="operator mr-2">{{ item2.operator }}</div>
                    <div class="operation mr-2">
                        <div v-if="item2.operation === 'addFolder'">新建文件夹</div>
                        <div v-if="item2.operation === 'addDoc'">新建文档</div>
                        <div v-if="item2.operation === 'copyDoc'">复制文档</div>
                        <div v-if="item2.operation === 'copyFolder'">复制文件夹</div>
                        <div v-if="item2.operation === 'deleteFolder'">删除文件夹</div>
                        <div v-if="item2.operation === 'deleteMany'" class="d-flex a-center">
                            <div>删除</div>
                            <div class="orange">&nbsp;{{ item2.recordInfo.deleteNodes.length }}&nbsp;</div>
                            <div>个文档</div>
                        </div>
                        <div v-if="item2.operation === 'deleteDoc'">删除单个文档</div>
                        <div v-if="item2.operation === 'editDoc'">编辑文档</div>
                        <div v-if="item2.operation === 'position'">改变文档位置</div>
                        <div v-if="item2.operation === 'rename'">重命名文档</div>
                        <div v-if="item2.operation === 'import'">导入文档</div>
                        <div v-if="item2.operation === 'export'">导出文档</div>
                    </div>
                    <div class="doc-wrap">
                        <!-- 新增文档 -->
                        <div v-if="item2.operation === 'addDoc'" class="doc-info">
                            <template v-for="(req) in validRequestMethods">
                                <span v-if="'get' === req.value.toLowerCase()" :key="req.value" class="mr-2" :style="{color: req.iconColor}">{{ req.name }}</span>
                            </template>
                            <span>{{ item2.recordInfo.nodeName }}</span>
                        </div>
                        <!-- 新建文件夹 -->
                        <div v-if="item2.operation === 'addFolder'" class="doc-info">
                            <img :src="require('@/assets/imgs/apidoc/folder.png')" width="14px" height="14px" class="mr-2"/>
                            <span>{{ item2.recordInfo.nodeName }}</span>
                        </div>
                        <!-- 拷贝文档 -->
                        <div v-if="item2.operation === 'copyDoc'" class="doc-info">
                            <template v-for="(req) in validRequestMethods">
                                <span v-if="item2.recordInfo.method === req.value.toLowerCase()" :key="req.value" class="mr-2" :style="{color: req.iconColor}">{{ req.name }}</span>
                            </template>
                            <span>{{ item2.recordInfo.nodeName }}</span>
                            <el-divider direction="vertical"></el-divider>
                            <span>{{ item2.recordInfo.url }}</span>
                        </div>
                        <!-- 删除文档 -->
                        <div v-if="item2.operation === 'deleteDoc'" class="doc-info">
                            <template v-for="(req) in validRequestMethods">
                                <span v-if="item2.recordInfo.deleteNodes[0].method === req.value.toLowerCase()" :key="req.value" class="mr-2" :style="{color: req.iconColor}">{{ req.name }}</span>
                            </template>
                            <span>{{ item2.recordInfo.deleteNodes[0].nodeName }}</span>
                            <el-divider direction="vertical"></el-divider>
                            <span>{{ item2.recordInfo.deleteNodes[0].url }}</span>
                        </div>
                        <!-- 删除文件夹 -->
                        <div v-if="item2.operation === 'deleteFolder'" class="doc-info">
                            <img :src="require('@/assets/imgs/apidoc/folder.png')" width="14px" height="14px" class="mr-2"/>
                            <span>{{ item2.recordInfo.deleteNodes[0].nodeName }}</span>
                        </div>
                        <!-- 批量删除文档 -->
                        <template v-if="item2.operation === 'deleteMany'">
                            <div v-for="(node, index3) in item2.recordInfo.deleteNodes" :key="index3"  class="doc-info">
                                <img v-if="node.isFolder" :src="require('@/assets/imgs/apidoc/folder.png')" width="14px" height="14px" class="mr-2"/>
                                <template v-else>
                                    <template v-for="(req) in validRequestMethods">
                                        <span v-if="node.method === req.value.toLowerCase()" :key="req.value" class="mr-2" :style="{color: req.iconColor}">{{ req.name }}</span>
                                    </template>
                                </template>
                                <span>{{ node.nodeName }}</span>
                                <el-divider  v-if="!node.isFolder && node.url" direction="vertical"></el-divider>
                                <span v-if="!node.isFolder" >{{ node.url }}</span>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </s-loading>
    </div>
</template>

<script>
import dayjs from "dayjs"
import { debounce } from "@/lib";

export default {
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
                operationTypes: [], //操作类型
            },
            customDateRange: [], //--自定义日期范围
            historyInfo: {}, //------历史记录列表
            historyList: [],
            dateRange: "", //--------日期范围
            //===================================枚举参数====================================//
            memberEnum: [], //-------成员信息
            //===================================业务参数====================================//

            //===================================其他参数====================================//
            loading: false, //是否正在请求数据
            debounceFn: null, //节流函数
        };
    },
    computed: {
        validRequestMethods() {
            return this.$store.state.apidocRules.requestMethods.filter((val) => val.enabled);
        },
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
                startTime = endTime - 86400000;
                break;
            case "3d":
                endTime = Date.now();
                startTime = endTime - 3 * 86400000;
                break;
            case "7d":
                endTime = Date.now();
                startTime = endTime - 7 * 86400000;
                break;
            case "yesterday":
                endTime = startTime;
                startTime -= 86400000;
                break;
            default: //自定义
                startTime = null;
                endTime = null;
                this.customDateRange = [];
                break;
            }
            this.formInfo.startTime = startTime;
            this.formInfo.endTime = endTime;
        },
        customDateRange(val) {
            if (!val || val.length === 0) {
                this.formInfo.startTime = null;
                this.formInfo.endTime = null;
            } else {
                this.formInfo.startTime = val[0];
                this.formInfo.endTime = val[1];
            }
        },
        formInfo: {
            handler() {
                if (!this.debounceFn) {
                    this.debounceFn = debounce(() => {
                        this.getData();
                    });
                }
                this.debounceFn();
            },
            deep: true,
        },
    },
    created() {
        this.getData();
        this.getOperatorEnum();
        this.$event.once("apidoc/fresh", () => {
            this.getData()
            this.getOperatorEnum();
        });
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        //获取操作人员枚举信息
        getOperatorEnum() {
            const params = {
                projectId: this.$route.query.id,
            };
            this.axios.get("/api/docs/docs_history_operator_enum", { params }).then((res) => {
                this.memberEnum = res.data;
            }).catch((err) => {
                console.error(err);
            });
        },
        //获取数据
        getData() {
            this.loading = true;
            const params = this.formInfo;
            this.axios.post("/api/docs/docs_history", params).then((res) => {
                this.historyInfo = {};
                res.data.rows.forEach((item) => {
                    const { createdAt } = item;
                    const ymdString = dayjs(createdAt).format("YYYY-MM-DD");
                    if (!this.historyInfo[ymdString]) {
                        this.historyInfo[ymdString] = {
                            title: dayjs(createdAt).format("YYYY年M月DD号"),
                            history: [item],
                        };
                    } else {
                        this.historyInfo[ymdString].history.push(item)
                    }
                })
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
        handleClearDate() {
            this.dateRange = null; //startTime和endTime会在watch中发送改变
        },
        //清空日志类型
        handleClearType() {
            this.formInfo.operationTypes = [];
        },
        //全部清空
        clearAll() {
            this.handleClearOperator();
            this.handleClearDate();
            this.handleClearType();
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.history {
    padding: 0 size(20) size(10);
    height: calc(100vh - #{size(100)});
    width: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    // 搜索
    .search {
        flex: 0 0 auto;
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
    // 列表展示
    .list {
        flex: 1;
        overflow-y: auto;
        .item {
            display: flex;
            align-items: center;
            height: size(40);
            overflow: hidden;
            .head {
                flex: 0 0 auto;
                width: size(80);
            }
            .operator {
                flex: 0 0 auto;
            }
            .operation {
                flex: 0 0 auto;
            }
            .doc-wrap {
                display: inline-flex;
                max-width: 30%;
                overflow-x: auto;
                &::-webkit-scrollbar {
                    height: 0px;
                }
                .doc-info {
                    flex: 0 0 auto;
                    display: inline-flex;
                    align-items: center;
                    height: size(25);
                    padding: size(2) size(10);
                    border: 1px solid $gray-300;
                    &:not(:last-child) {
                        margin-right: size(10);
                    }
                }
            }
        }
    }
}
</style>
