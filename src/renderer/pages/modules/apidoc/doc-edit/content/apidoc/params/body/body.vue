/*
    创建者：shuxiaokai
    创建时间：2021-08-20 22:42
    模块名称：body参数
    备注：
*/
<template>
    <div>
        <pre>{{ bodyType }}</pre>
        <!-- body类型选择 -->
        <el-radio-group v-model="bodyType">
            <el-radio label="application/json">json</el-radio>
            <el-radio label="multipart/form-data">form-data</el-radio>
            <el-radio label="application/x-www-form-urlencoded">x-www-form-urlencoded</el-radio>
            <el-radio label="raw">raw</el-radio>
            <el-radio label="none">none</el-radio>
        </el-radio-group>
        <s-params-tree v-if="bodyType === 'application/json'" nest enable-file show-checkbox :data="jsonBodyData"></s-params-tree>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { store } from "@/store/index"

//json格式body参数
const jsonBodyData = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item.requestBody.json;
})
//body类型
const bodyType = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.item.requestBody.mode;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeBodyMode", val);
    },
});
</script>

<style lang="scss">

</style>
