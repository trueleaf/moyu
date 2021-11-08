/*
    创建者：shuxiaokai
    创建时间：2021-10-26 22:21
    模块名称：回收站
    备注：
*/
<template>
    <div class="recycler">
        {{ formInfo }}
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
                        value-format="x"
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
    </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, watch } from "vue"
import type { ApidocHttpRequestMethod, ApidocType, ResponseTable } from "@@/global"
import { router } from "@/router/index"
import { axios } from "@/api/api"

type DeleteInfo = {
    _id: string, //项目id
    deletePerson: string, //删除人
    host: string, //host信息
    isFolder: boolean, //是否为文件夹
    method: ApidocHttpRequestMethod, //请求方法
    name: string, //文件名称
    path: string, //请求路径
    pid: string, //父元素id
    type: ApidocType, //文档类型
    updatedAt: string, //更新时间
};
type SearchInfo = {
    projectId: string, //项目id
    startTime: number | null, //--起始日期
    endTime: number | null, //----结束日期
    docName: string, //---------请求名称
    url: string, //----------请求url
    operators: string[], //----操作者信息
}

const formInfo: Ref<SearchInfo> = ref({
    projectId: router.currentRoute.value.query.id as string, //项目id
    startTime: null, //--起始日期
    endTime: null, //----结束日期
    docName: "", //---------请求名称
    url: "", //----------请求url
    operators: [], //----操作者信息
})

/*
|--------------------------------------------------------------------------
| 获取已删除数据信息
|--------------------------------------------------------------------------
*/
const loading = ref(false); //获取数据加载状态
const deletedList: Ref<DeleteInfo[]> = ref([]); //已删除数据列表
const getData = () => {
    loading.value = true;
    const params = formInfo.value;
    axios.post<ResponseTable<DeleteInfo[]>, ResponseTable<DeleteInfo[]>>("/api/docs/docs_deleted_list", params).then((res) => {
        deletedList.value = res.data.rows;
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        loading.value = false;
    });
}

/*
|--------------------------------------------------------------------------
| 搜索相关内容
|--------------------------------------------------------------------------
*/
const memberEnum: Ref<string[]> = ref([]); //操作人员
const dateRange: Ref<string> = ref(""); //日期范围
const customDateRange: Ref<number[]> = ref([]); //自定义日期范围
//获取操作人员枚举
const getOperatorEnum = () => {
    const params = {
        projectId: router.currentRoute.value.query.id as string,
    };
    axios.get("/api/docs/docs_history_operator_enum", { params }).then((res) => {
        memberEnum.value = res.data as string[];
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
    getData();
    getOperatorEnum();
})

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
                    width: size(100);
                }
            }
        }
    }
}
</style>
