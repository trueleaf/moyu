/*
    创建者：shuxiaokai
    模块名称：自定义返回头
    备注：
*/
<template>
    <div>
        <s-params-tree :drag="false" show-checkbox :data="headers" :mind-params="mindHeaderParams" no-required-checkbox></s-params-tree>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, Ref } from "vue";
import { store } from "@/store";
import { ApidocProperty } from "@@/global";
import mindHeaders from "../../../headers/mind-headers";

const headers = computed(() => store.state["apidoc/apidoc"].apidoc.mockInfo.responseHeaders);
const mindHeaderParams: Ref<ApidocProperty[]> = ref(mindHeaders);
</script>

<style lang="scss">

</style>
