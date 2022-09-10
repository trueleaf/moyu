/*
    创建者：shuxiaokai
    创建时间：2021-08-30 21:28
    模块名称：headers参数录入
    备注：
*/
<template>
    <div class="header-info">
        <div v-if="!hideDefaultHeader">
            <span class="cursor-pointer no-select" @click="hideDefaultHeader = true">
                <span>{{ $t("点击隐藏默认") }}</span>
            </span>
            <s-params-tree :drag="false" show-checkbox :readonly-keys="defaultHeaderKeys" :data="defaultHeaders"></s-params-tree>
        </div>
        <div v-else class="cursor-pointer no-select d-flex a-center" @click="hideDefaultHeader = false">
            <span>{{ $t("个隐藏", { msg: defaultHeaders.length.toString()}) }}</span>
            <el-icon :size="16" class="ml-1">
                <View />
            </el-icon>
        </div>
        <s-params-tree :drag="false" show-checkbox :data="headerData" :mind-params="mindHeaderParams"></s-params-tree>
        <template v-if="commonHeaders.length > 0">
            <el-divider content-position="left">公共请求头</el-divider>
            <el-table :data="commonHeaders" stripe border size="mini">
                <el-table-column prop="key" label="键" align="center"></el-table-column>
                <el-table-column prop="type" label="类型" align="center"></el-table-column>
                <el-table-column prop="value" label="值" align="center">
                    <template #default="scope">
                        <div class="value-wrap">{{ scope.row.value }}</div>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" align="center"></el-table-column>
            </el-table>
            <!-- <s-params-tree :drag="false" :readonly-keys="commonHeaderKeys" :data="commonHeaders"></s-params-tree> -->
        </template>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, Ref, onMounted } from "vue"
import { store } from "@/store/index"
import { router } from "@/router"
import { View } from "@element-plus/icons-vue"
import { ApidocProperty } from "@@/global";
import { apidocGenerateProperty } from "@/helper";
import mindHeaders from "./mind-headers"

const projectId = router.currentRoute.value.query.id as string;
const currentSelectTab = computed(() => { //当前选中的doc
    const tabs = store.state["apidoc/tabs"].tabs[projectId];
    return tabs?.find((tab) => tab.selected) || null;
})
const hideDefaultHeader = ref(true);
const headerData = computed(() => store.state["apidoc/apidoc"].apidoc.item.headers)
const defaultHeaders = computed(() => store.state["apidoc/apidoc"].defaultHeaders)
const defaultHeaderKeys = computed(() => store.state["apidoc/apidoc"].defaultHeaders.map(v => v.key));
const commonHeaders = computed(() => {
    const data = store.getters["apidoc/baseInfo/headers"](currentSelectTab.value?._id) as Pick<ApidocProperty, "key" | "value" | "description">[];
    return data.map(v => {
        const property = apidocGenerateProperty();
        property.key = v.key;
        property.value = v.value;
        property.description = v.description;
        return property;
    })
});

const mindHeaderParams: Ref<ApidocProperty[]> = ref(mindHeaders);

onMounted(() => {
    // const data = store.commit("apidoc/baseInfo/getCommonHeadersById", currentSelectTab.value?._id);
    // console.log(data, currentSelectTab.value?._id)
})

</script>

<style lang="scss">
.header-info {
    .value-wrap {
        max-height: size(140);
        overflow-y: auto;
    }
}
</style>
