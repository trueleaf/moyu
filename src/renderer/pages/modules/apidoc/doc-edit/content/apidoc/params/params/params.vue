/*
    创建者：shuxiaokai
    创建时间：2021-08-20 22:30
    模块名称：query参数、path参数
    备注：
*/
<template>
    <div class="query-path-params">
        <!-- <pre>{{ hasPathParams }}</pre> -->
        <div class="title">Query&nbsp;参数</div>
        <s-params-tree enable-file show-checkbox :data="queryTreeData"></s-params-tree>
        <div v-show="hasPathParams" class="title">Path&nbsp;参数</div>
        <s-params-tree v-show="hasPathParams" disable-add disable-delete show-checkbox :data="pathTreeData"></s-params-tree>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { store } from "@/store/index"

const pathTreeData = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item.paths;
}) 
const queryTreeData = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item.queryParams;
})
//是否存在path参数
const hasPathParams = computed(() => {
    const { paths } = store.state["apidoc/apidoc"].apidoc.item;
    const hasPathsParams = paths.some((data) => data.key);
    return hasPathsParams;
})

</script>
<style lang="scss">
.query-path-params {
    .title {
        margin-left: size(15);
        font-size: fz(14);
        // font-weight: bolder;
    }
}
</style>
