/*
    创建者：shuxiaokai
    创建时间：2022-01-24 15:40
    模块名称：公共请求头
    备注：
*/
<template>
    <s-loading :loading="loading" class="common-header">
        <s-fieldset title="说明">
            <p>1. 公共请求头针对目录内所有接口生效</p>
            <p>2. 针对嵌套目录，子目录优先级高于父目录</p>
            <p>3. 接口本身请求头优先级高于公共请求头</p>
        </s-fieldset>
        <s-fieldset title="公共请求头">
            <s-params-tree :drag="false" show-checkbox :data="headerData" :mind-params="mindHeaderParams"></s-params-tree>
            <div class="d-flex a-center j-center mt-5">
                <el-button type="success" :loading="loading2" @click="handleEditCommonHeader">确认修改</el-button>
                <el-button type="primary" :loading="loading" @click="getCommonHeaderInfo">刷新</el-button>
            </div>
        </s-fieldset>
    </s-loading>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref, computed, watch } from "vue"
import { ElMessage } from "element-plus";
import { router } from "@/router"
import { store } from "@/store/index"
import { ApidocProperty, Response } from "@@/global";
import { axios } from "@/api/api";
import { apidocGenerateProperty } from "@/helper";
import mindHeaders from "../apidoc/params/headers/mind-headers";

type CommonHeaderResponse = {
    _id: string,
    commonHeaders: ApidocProperty[]
}

const headerData = ref<ApidocProperty[]>([]);
const projectId = router.currentRoute.value.query.id as string;
const currentSelectTab = computed(() => { //当前选中的doc
    const tabs = store.state["apidoc/tabs"].tabs[projectId];
    return tabs?.find((tab) => tab.selected) || null;
})

//获取公共请求头信息
const loading = ref(false);
const getCommonHeaderInfo = () => {
    loading.value = true;
    const params = {
        projectId,
        id: currentSelectTab.value?._id
    }
    axios.get<Response<CommonHeaderResponse>, Response<CommonHeaderResponse>>("/api/project/common_header_by_id", { params }).then((res) => {
        headerData.value = res.data.commonHeaders || [];
        if (!headerData.value.length) {
            headerData.value.push(apidocGenerateProperty())
        }
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        loading.value = false;
    });
}
//修改公共请求头
const loading2 = ref(false);
const handleEditCommonHeader = () => {
    loading2.value = true;
    const params = {
        projectId,
        id: currentSelectTab.value?._id,
        commonHeaders: headerData.value.map(v => ({
            key: v.key,
            value: v.value,
            description: v.description,
            select: v.select,
        })),
    }
    axios.put("/api/project/common_header", params).then(() => {
        ElMessage.success("修改成功");
        store.dispatch("apidoc/baseInfo/getCommonHeaders")
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        loading2.value = false;
    });
}
watch(currentSelectTab, (newVal) => {
    if (newVal?.tabType === "commonHeader") {
        getCommonHeaderInfo();
    }
}, {
    deep: true,
})
onMounted(() => {
    getCommonHeaderInfo();
})

const mindHeaderParams: Ref<ApidocProperty[]> = ref(mindHeaders);
</script>

<style lang="scss">
    .common-header {
        padding: size(20);
    }
</style>
