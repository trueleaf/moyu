/*
    创建者：shuxiaokai
    创建时间：2021-08-15 22:10
    模块名称：操作区域
    备注：
*/
<template>
    <div class="api-operation">operation</div>
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
.api-operation {
    position: sticky;
    top: 0;
    padding: size(10) size(20);
    box-shadow: 0 3px 2px $gray-400;
    background: $white;
    z-index: $zIndex-request-info-wrap;
    height: size(150);
}
</style>
