/*
    创建者：shuxiaokai
    创建时间：2021-08-15 22:11
    模块名称：返回参数
    备注：
*/
<template>
    <s-base-info></s-base-info>
    <s-res-info></s-res-info>
    <div class="px-3">
        <el-tabs v-model="activeName">
            <el-tab-pane label="返回值" name="s-body">
                <s-body></s-body>
            </el-tab-pane>
            <el-tab-pane name="s-cookie">
                <template #label>
                    <span>Cookie&nbsp;</span>
                    <!-- <span v-if="cookieLength > 0" class="orange">({{ cookieLength }})</span> -->
                </template>
                <!-- fix: 文字隐藏组件获取dom宽度失败 -->
                <s-cookie v-if="activeName === 's-b'"></s-cookie>
            </el-tab-pane>
            <el-tab-pane name="s-headers">
                <template #label>
                    <span>返回头&nbsp;</span>
                    <!-- <span v-if="headerLength > 0" class="orange">({{ headerLength }})</span> -->
                </template>
                <s-headers></s-headers>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import sBaseInfo from "./base-info/base-info.vue"
import sResInfo from "./res-info/res-info.vue"
import sCookie from "./cookie/cookie.vue"
import sHeaders from "./headers/headers.vue"
import sBody from "./body/body.vue"

const activeName = ref("s-body");



</script>

<style lang="scss">

</style>
