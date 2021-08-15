/*
    创建者：shuxiaokai
    创建时间：2021-08-15 22:11
    模块名称：参数录入
    备注：
*/
<template>
    <div class="api-params">
        params
        <div class="view-type">
            <div class="active cursor-pointer">横向</div>
            <el-divider direction="vertical"></el-divider>
            <div class="cursor-pointer">纵向</div>
        </div>
    </div>
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
    padding: size(20) size(20) size(10);
    height: calc(100vh - #{size(250)});
    overflow-y: auto;
    position: relative;
    .view-type {
        display: flex;
        align-items: center;
        position: absolute;
        top: size(5);
        right: size(5);
        color: $gray-500;
        .active {
            color: $theme-color;
        }
    }
}
</style>
