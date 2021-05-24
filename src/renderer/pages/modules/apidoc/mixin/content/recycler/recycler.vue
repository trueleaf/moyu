/*
    创建者：shuxiaokai
    创建时间：2021-03-15 22:32
    模块名称：回收站
    备注：
*/
<template>
    <div class="recycler">
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
                        class="mr-1"
                        end-placeholder="结束日期"
                    >
                    </el-date-picker>
                    <el-button type="text" @click="handleClearDate">清空</el-button>
                </el-radio-group>
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
        <s-loading v-if="deletedList.length > 0" :loading="loading" class="list">
            <div v-for="(item, index) in deletedInfo" :key="index" class="list-wrap">
                <h2 class="title">{{ item.title }}</h2>
                <div class="oneday-wrap">
                    <div v-for="(chunkDeleteInfo, key) in item.deleted" :key="key" class="date-chunk">
                        <h3 class="date my-2">{{ $helper.formatDate(key, "a HH:mm") }}</h3>
                        <div class="date-list-wrap">
                            <div v-for="(docInfo, index3) in chunkDeleteInfo" :key="index3" class="docinfo">
                                <div class="op-area mr-4">
                                    <el-button type="text" :loading="loading2" @click="handleRestore(docInfo)">恢复</el-button>
                                    <el-divider direction="vertical"></el-divider>
                                    <el-popover v-model="docInfo._visible" placement="right" trigger="manual" transition="none">
                                        <doc-detail v-if="docInfo._visible" :id="docInfo._id" @close="docInfo._visible = false;"></doc-detail>
                                        <span slot="reference" class="theme-color cursor-pointer" @click="handleShowDetail(docInfo)">详情</span>
                                    </el-popover>
                                </div>
                                <div class="operator mr-1">{{ docInfo.deletePerson }}</div>
                                <div class="mr-1">删除了</div>
                                <div v-if="docInfo.isFolder" class="d-flex a-center">
                                    <img :src="require('@/assets/imgs/apidoc/folder.png')" width="14px" height="14px" class="mr-1" />
                                    <span>{{ docInfo.name }}</span>
                                </div>
                                <div v-else class="d-flex a-center">
                                    <img :src="require('@/assets/imgs/apidoc/file.png')" width="14px" height="14px" class="mr-1" />
                                    <span class="mr-2">{{ docInfo.name }}</span>
                                    <template v-for="(req) in validRequestMethods">
                                        <span v-if="docInfo.method === req.value.toLowerCase()" :key="req.value" class="mr-1" :style="{color: req.iconColor}">{{ req.name }}</span>
                                    </template>
                                    <span>{{ docInfo.path }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </s-loading>
        <s-empty v-else></s-empty>
    </div>
</template>

<script>
import dayjs from "dayjs"
import isToday from "dayjs/plugin/isToday"
import isYesterday from "dayjs/plugin/isYesterday"
import "dayjs/locale/zh-cn"
import { debounce } from "@/lib";
import docDetail from "./components/doc-detail.vue"

dayjs.extend(isYesterday)
dayjs.extend(isToday)
dayjs.locale("zh-cn")

export default {
    components: {
        "doc-detail": docDetail,
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
            customDateRange: [], //--自定义日期范围
            deletedInfo: {}, //------历史记录列表
            deletedList: [],
            dateRange: "", //--------日期范围
            //===================================枚举参数====================================//
            memberEnum: [], //-------成员信息
            //===================================业务参数====================================//

            //===================================其他参数====================================//
            visible: false, //是否显示详情
            loading: false, //是否正在请求数据
            loading2: false, //恢复按钮
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
        this.$event.one("apidoc/fresh", () => {
            this.getData()
            this.getOperatorEnum();
        });
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        //获取回收站数据
        getData() {
            this.loading = true;
            const params = this.formInfo;
            this.axios.post("/api/docs/docs_deleted_list", params).then((res) => {
                this.deletedInfo = {};
                res.data.rows.forEach((item) => {
                    const { updatedAt } = item;
                    const ymdString = dayjs(updatedAt).format("YYYY-MM-DD");
                    const ymdhmString = dayjs(updatedAt).format("YYYY-MM-DD HH:mm");
                    if (!this.deletedInfo[ymdString]) {
                        let title = "";
                        if (dayjs(updatedAt).isToday()) {
                            title = "今天"
                        } else if (dayjs(updatedAt).isYesterday()) {
                            title = "昨天"
                        } else {
                            title = dayjs(updatedAt).format("YYYY年M月DD号");
                        }
                        this.deletedInfo[ymdString] = {
                            title,
                            deleted: {},
                        };
                    }
                    if (!this.deletedInfo[ymdString].deleted[ymdhmString]) {
                        this.deletedInfo[ymdString].deleted[ymdhmString] = [];
                    }
                    this.deletedInfo[ymdString].deleted[ymdhmString].push(item);
                })
                this.deletedList = res.data.rows;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
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
        //=====================================前后端交互====================================//
        //恢复接口
        handleRestore(docInfo) {
            const { banner } = this.$store.state.apidoc;
            const { pid, isFolder } = docInfo;
            let hasParent = false;
            this.$helper.forEachForest(banner, (node) => {
                if (node._id === pid) {
                    hasParent = true;
                }
            });
            if (!pid && !isFolder) { //文档，根元素
                this.restoreDocDirectly(docInfo)
            } else if (pid && !isFolder && hasParent) { //文档，非根元素,存在父元素
                this.restoreDocDirectly(docInfo)
            } else if (pid && !isFolder && !hasParent) { //文档，非根元素,不存在父元素
                this.$confirm(`当前文档父级节点不存在，是否还原到根节点`, "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                }).then(() => {
                    // this.loading2 = true;
                    // const params = {
                    //     _id: docInfo._id,
                    //     projectId: this.$route.query.id,
                    // };
                    // this.axios.put("/api/docs/docs_restore", params).then(() => {
                    //     this.$event.emit("apidoc/freshBanner")
                    // }).catch((err) => {
                    //     console.error(err);
                    // }).finally(() => {
                    //     this.loading2 = false;
                    // });
                }).catch((err) => {
                    if (err === "cancel" || err === "close") {
                        return;
                    }
                    this.$errorThrow(err, this);
                });
            }
            console.log(222, hasParent, isFolder, pid, docInfo)
        },
        //直接恢复
        restoreDocDirectly(docInfo) {
            this.$confirm(`确实要恢复 ${docInfo.name} 吗?`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                this.loading2 = true;
                const params = {
                    _id: docInfo._id,
                    projectId: this.$route.query.id,
                };
                this.axios.put("/api/docs/docs_restore", params).then(() => {
                    this.$event.emit("apidoc/freshBanner")
                }).catch((err) => {
                    console.error(err);
                }).finally(() => {
                    this.loading2 = false;
                });
            }).catch((err) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
        },
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
        //显示文档详情
        handleShowDetail(docInfo) {
            Object.keys(this.deletedInfo).forEach((key) => {
                const el = this.deletedInfo[key];
                Object.keys(el.deleted).forEach((key2) => {
                    const el2 = el.deleted[key2];
                    el2.forEach((info) => {
                        this.$set(info, "_visible", false);
                    })
                })
            })
            this.$set(docInfo, "_visible", true);
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.recycler {
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
        }
        .date-chunk {
            margin-left: size(30);
            display: flex;
            flex-direction: column;
            .date-list-wrap {
                margin-left: size(30);
                .docinfo {
                    display: flex;
                    align-items: center;
                    height: size(30);
                    &:hover {
                        background: $gray-200;
                    }
                }
                .op-area {
                    width: size(80);
                }
            }
        }
    }
}
</style>
