/*
    创建者：shuxiaokai
    创建时间：2021-10-26 22:21
    模块名称：回收站
    备注：
*/
<template>
    <div>recycler</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { router } from "@/router/index"
import { axios } from "@/api/api"

const formInfo = ref({
    projectId: router.currentRoute.value.query.id, //项目id
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
const deletedList = ref([]); //已删除数据列表
const getData = () => {
    loading.value = true;
    const params = formInfo.value;
    axios.post("/api/docs/docs_deleted_list", params).then((res) => {
        deletedList.value = res.data.rows;
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        loading.value = false;
    });
}
onMounted(() => {
    getData();
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
