/*
    创建者：shuxiaokai
    创建时间：2021-08-15 22:11
    模块名称：参数录入
    备注：
*/
<template>
    <div class="api-params">params</div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    data() {
        return {
        };
    },
    methods: {
    },
})
</script>

<style lang="scss">
.api-params {
    padding: size(10) size(20);
    height: calc(100vh - #{size(250)});
    overflow-y: auto;
}
</style>
