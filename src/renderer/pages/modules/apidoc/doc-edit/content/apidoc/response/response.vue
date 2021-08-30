/*
    创建者：shuxiaokai
    创建时间：2021-08-15 22:11
    模块名称：返回参数
    备注：
*/
<template>
    {{ item.contentType }}
    <pre class="h-400px overflow-y">{{ item.responseParams }}</pre>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { store } from "@/store/index"

const item = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item
});

</script>

<style lang="scss">

</style>
