/*
    创建者：shuxiaokai
    创建时间：2021-08-20 22:30
    模块名称：query参数、path参数
    备注：
*/
<template>
    <div>
        <!-- <pre>{{ queryTreeData }}</pre> -->
        <s-params-tree nest enable-file show-checkbox :data="queryTreeData"></s-params-tree>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { store } from "@/store/index"

// const pathTreeData = store.state["apidoc/apidoc"].apidoc.item.paths;
const queryTreeData = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item.queryParams;
})
</script>
<style lang="scss">

</style>
