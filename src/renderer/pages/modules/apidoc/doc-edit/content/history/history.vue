/*
    创建者：shuxiaokai
    创建时间：2021-12-06 21:22
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
                    <el-checkbox v-for="(item, index) in memberEnum" :key="index" :label="item.name"></el-checkbox>
                    <el-button link type="primary" text @click="handleClearOperator">清空</el-button>
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
                        value-format="x"
                        start-placeholder="开始日期"
                        class="mr-1"
                        end-placeholder="结束日期"
                    >
                    </el-date-picker>
                    <el-button link type="primary" text @click="handleClearDate">清空</el-button>
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
                    <el-checkbox label="addDoc">新建接口</el-checkbox>
                    <el-checkbox label="addFolder">新建文件夹</el-checkbox>
                    <el-checkbox label="copyDoc">复制文档</el-checkbox>
                    <el-checkbox label="position">改变位置</el-checkbox>
                    <el-checkbox label="rename">重命名</el-checkbox>
                    <el-checkbox label="import">导入</el-checkbox>
                    <el-checkbox label="export">导出</el-checkbox>
                    <el-button link type="primary" text @click="handleClearType">清空</el-button>
                </el-checkbox-group>
            </div>
            <!-- 接口名称和接口url -->
            <div class="op-item">
                <!-- <div class="d-flex a-center mr-5">
                    <div class="flex0">接口名称：</div>
                    <el-input v-model="formInfo.docName" placeholder="通过接口名称匹配" maxlength="100" clearable></el-input>
                </div>
                <div class="d-flex a-center mr-5">
                    <div class="flex0">接口url：</div>
                    <el-input v-model="formInfo.url" placeholder="通过接口url匹配" maxlength="100" clearable></el-input>
                </div> -->
                <div>
                    <el-button type="info" @click="clearAll">全部清空</el-button>
                    <el-button :loading="loading" type="success" @click="getData">刷新</el-button>
                </div>
            </div>
        </s-fieldset>
        <s-loading v-if="historyList.length > 0" :loading="loading" class="list">
            <div v-for="(item, index) in historyInfo" :key="index" class="list-wrap">
                <h2 class="title">{{ item.title }}</h2>
                <div v-for="(item2, index2) in item.history" :key="index2" class="item">
                    <div class="head">{{ $helper.formatDate(item2.createdAt, "a HH:mm") }}</div>
                    <div class="operator mr-2">{{ item2.operator }}</div>
                    <div class="operation mr-1">
                        <div v-if="item2.operation === 'addFolder'">新建文件夹</div>
                        <div v-if="item2.operation === 'addDoc'">新建接口</div>
                        <div v-if="item2.operation === 'copyDoc'">复制文档</div>
                        <div v-if="item2.operation === 'copyFolder'">复制文件夹</div>
                        <div v-if="item2.operation === 'deleteFolder'">删除文件夹</div>
                        <div v-if="item2.operation === 'deleteMany'" class="d-flex a-center">
                            <div>删除</div>
                            <div class="orange">&nbsp;{{ item2.recordInfo.deleteNodes?.length }}&nbsp;</div>
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
                        <!-- 新建接口 -->
                        <div v-if="item2.operation === 'addDoc'" class="doc-info">
                            <template v-for="(req) in validRequestMethods">
                                <span v-if="'get' === req.value.toLowerCase()" :key="req.value" class="mr-1" :style="{color: req.iconColor}">{{ req.name }}</span>
                            </template>
                            <span>{{ item2.recordInfo.nodeName }}</span>
                        </div>
                        <!-- 新建文件夹 -->
                        <div v-if="item2.operation === 'addFolder'" class="doc-info">
                            <img :src="require('@/assets/imgs/apidoc/folder.png')" width="14px" height="14px" class="mr-1" />
                            <span>{{ item2.recordInfo.nodeName }}</span>
                        </div>
                        <!-- 拷贝文档 -->
                        <div v-if="item2.operation === 'copyDoc'" class="doc-info">
                            <template v-for="(req) in validRequestMethods">
                                <span v-if="item2.recordInfo.method === req.value.toLowerCase()" :key="req.value" class="mr-1" :style="{color: req.iconColor}">{{ req.name }}</span>
                            </template>
                            <span>{{ item2.recordInfo.nodeName }}</span>
                            <el-divider direction="vertical"></el-divider>
                            <span>{{ item2.recordInfo.url }}</span>
                        </div>
                        <!-- 删除文档 -->
                        <div v-if="item2.operation === 'deleteDoc'" class="doc-info">
                            <template v-for="(req) in validRequestMethods">
                                <span v-if="item2.recordInfo.deleteNodes[0].method === req.value.toLowerCase()" :key="req.value" class="mr-1" :style="{color: req.iconColor}">{{ req.name }}</span>
                            </template>
                            <span>{{ item2.recordInfo.deleteNodes[0].nodeName }}</span>
                            <el-divider v-if="item2.recordInfo.deleteNodes[0].url" direction="vertical"></el-divider>
                            <span v-if="item2.recordInfo.deleteNodes[0].url">{{ item2.recordInfo.deleteNodes[0].url }}</span>
                        </div>
                        <!-- 删除文件夹 -->
                        <div v-if="item2.operation === 'deleteFolder'" class="doc-info">
                            <img :src="require('@/assets/imgs/apidoc/folder.png')" width="14px" height="14px" class="mr-1" />
                            <span>{{ item2.recordInfo.deleteNodes[0].nodeName }}</span>
                        </div>
                        <!-- 批量删除文档 -->
                        <template v-if="item2.operation === 'deleteMany'">
                            <div v-for="(node, index3) in item2.recordInfo.deleteNodes" :key="index3" class="doc-info">
                                <img v-if="node.isFolder" :src="require('@/assets/imgs/apidoc/folder.png')" width="14px" height="14px" class="mr-1" />
                                <template v-else>
                                    <template v-for="(req) in validRequestMethods">
                                        <span v-if="node.method === req.value.toLowerCase()" :key="req.value" class="mr-1" :style="{color: req.iconColor}">{{ req.name }}</span>
                                    </template>
                                </template>
                                <span>{{ node.nodeName }}</span>
                                <el-divider v-if="!node.isFolder && node.url" direction="vertical"></el-divider>
                                <span v-if="!node.isFolder">{{ node.url }}</span>
                            </div>
                        </template>
                        <!-- 编辑文档 -->
                        <div v-if="item2.operation === 'editDoc'" class="doc-info">
                            <template v-for="(req) in validRequestMethods">
                                <span v-if="item2.recordInfo.method === req.value.toLowerCase()" :key="req.value" class="mr-1" :style="{color: req.iconColor}">{{ req.name }}</span>
                            </template>
                            <span>{{ item2.recordInfo.nodeName }}</span>
                        </div>
                        <!-- 改变文档位置 -->
                        <div v-if="item2.operation === 'position'">
                            <div class="doc-info">
                                <span>{{ item2.recordInfo.nodeName }}</span>
                            </div>
                            <span>拖拽到</span>
                            <div class="ml-2 doc-info">
                                <span>{{ item2.recordInfo.dropNodeName }}</span>
                            </div>
                            <span v-if="item2.recordInfo.dropType === 'before'">之前</span>
                            <span v-else-if="item2.recordInfo.dropType === 'after'">之后</span>
                            <span v-else-if="item2.recordInfo.dropType === 'inner'">里面</span>
                        </div>
                        <!-- 重命名文档 -->
                        <div v-if="item2.operation === 'rename'" class="doc-info">
                            <div class="doc-info">
                                <span>{{ item2.recordInfo.orginNodeName }}</span>
                            </div>
                            <span>重命名为</span>
                            <div class="ml-2 doc-info">
                                <span>{{ item2.recordInfo.nodeName }}</span>
                            </div>
                        </div>
                        <!-- 导入文档 -->
                        <div v-if="item2.operation === 'import'" class="doc-info">
                        </div>
                        <!-- 导出文档 -->
                        <div v-if="item2.operation === 'export'" class="doc-info">
                        </div>
                    </div>
                </div>
            </div>
        </s-loading>
        <el-empty v-else></el-empty>
    </div>
</template>

<script lang="ts" setup>
import { ref, Ref, computed, watch, onMounted } from "vue"
import dayjs from "dayjs"
import isToday from "dayjs/plugin/isToday"
import isYesterday from "dayjs/plugin/isYesterday"
import { ResponseTable, ApidocOperationRecord, ApidocProjectPermission } from "@@/global"
import { debounce } from "@/helper"
import { axios } from "@/api/api";
import { router } from "@/router";
import { store } from "@/store/index"

dayjs.extend(isYesterday)
dayjs.extend(isToday)
dayjs.locale("zh-cn")

type FormInfo = {
    projectId: string, //项目id
    startTime: number | null, //起始日期
    endTime: number | null, //结束日期
    docName: string, //请求名称
    url: string, //请求url
    operators: string[], //操作者信息
    operationTypes: string[], //操作类型
}
/*
|--------------------------------------------------------------------------
| 搜索条件
|--------------------------------------------------------------------------
*/
const formInfo: Ref<FormInfo> = ref({
    projectId: "",
    startTime: null,
    endTime: null,
    docName: "",
    url: "",
    operators: [],
    operationTypes: [],
})
const memberEnum: Ref<{ name: string, permission: ApidocProjectPermission }[]> = ref([]); //操作人员
const dateRange: Ref<string> = ref(""); //日期范围
const customDateRange: Ref<number[]> = ref([]); //自定义日期范围
//获取操作人员枚举
const getOperatorEnum = () => {
    const params = {
        projectId: router.currentRoute.value.query.id as string,
    };
    axios.get("/api/docs/docs_history_operator_enum", { params }).then((res) => {
        memberEnum.value = res.data as { name: string, permission:ApidocProjectPermission }[];
    }).catch((err) => {
        console.error(err);
    });
}
//清空操作人员
const handleClearOperator = () => {
    formInfo.value.operators = [];
}
//清空日期范围
const handleClearDate = () => {
    dateRange.value = ""; //startTime和endTime会在watch中发送改变
}
//清空日志类型
const handleClearType = () => {
    formInfo.value.operationTypes = [];
}
//全部清空
const clearAll = () => {
    handleClearOperator();
    handleClearDate();
    formInfo.value.url = "";
    formInfo.value.docName = "";
}
//自定义日期范围
watch(() => dateRange.value, (val) => {
    let startTime: number | null = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();
    let endTime: number | null = null;
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
        customDateRange.value = [];
        break;
    }
    formInfo.value.startTime = startTime;
    formInfo.value.endTime = endTime;
})
watch(() => customDateRange.value, (val) => {
    if (!val || val.length === 0) {
        formInfo.value.startTime = null;
        formInfo.value.endTime = null;
    } else {
        formInfo.value.startTime = val[0];
        formInfo.value.endTime = val[1];
    }
})
onMounted(() => {
    getOperatorEnum();
})
/*
|--------------------------------------------------------------------------
| 列表数据获取
|--------------------------------------------------------------------------
*/
const validRequestMethods = computed(() => store.state["apidoc/baseInfo"].rules.requestMethods); //请求方法
const loading = ref(false); //数据加载
const historyList: Ref<ApidocOperationRecord[]> = ref([]); //历史记录数据
const historyInfo: Ref<Record<string, { title: string, history: ApidocOperationRecord[] }>> = ref({});

const getData = () => {
    const params = {
        ...formInfo.value,
        projectId: router.currentRoute.value.query.id as string,
    };
    axios.post<ResponseTable<ApidocOperationRecord[]>, ResponseTable<ApidocOperationRecord[]>>("/api/docs/docs_history", params).then((res) => {
        historyInfo.value = {};
        res.data.rows.forEach((item) => {
            const { createdAt } = item;
            const ymdString = dayjs(createdAt).format("YYYY-MM-DD");
            if (!historyInfo.value[ymdString]) {
                let title = "";
                if (dayjs(createdAt).isToday()) {
                    title = "今天"
                } else if (dayjs(createdAt).isYesterday()) {
                    title = "昨天"
                } else {
                    title = dayjs(createdAt).format("YYYY年M月DD号");
                }
                historyInfo.value[ymdString] = {
                    title,
                    history: [item],
                };
            } else {
                historyInfo.value[ymdString].history.push(item)
            }
        })
        historyList.value = res.data.rows;
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        loading.value = false;
    });
}
const debounceFn: Ref<(() => void) | null> = ref(null);
watch(() => formInfo.value, () => {
    if (!debounceFn.value) {
        debounceFn.value = debounce(() => {
            getData();
        });
    }
    if (debounceFn.value) {
        debounceFn.value();
    }
}, {
    deep: true
})
onMounted(() => {
    getData();
})

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
