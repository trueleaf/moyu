/*
    创建者：shuxiaokai
    创建时间：2021-08-30 21:28
    模块名称：headers参数录入
    备注：
*/
<template>
    <div>
        <s-params-tree show-checkbox :data="headerData"></s-params-tree>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { store } from "@/store/index"

const headerData = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item.headers;
}) 
</script>

<style lang="scss">

</style>
