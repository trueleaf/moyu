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
                    <span v-if="cookies.length > 0" class="orange">({{ cookies.length }})</span>
                </template>
                <!-- fix: 文字隐藏组件获取dom宽度失败 -->
                <s-cookie v-if="activeName === 's-cookie'"></s-cookie>
            </el-tab-pane>
            <el-tab-pane name="s-headers">
                <template #label>
                    <span>返回头&nbsp;</span>
                    <span v-if="headers.length > 0" class="orange">({{ headers.length }})</span>
                </template>
                <s-headers></s-headers>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { store } from "@/store/index"
import sBaseInfo from "./base-info/base-info.vue"
import sResInfo from "./res-info/res-info.vue"
import sCookie from "./cookie/cookie.vue"
import sHeaders from "./headers/headers.vue"
import sBody from "./body/body.vue"

const activeName = ref("s-body");

const cookies = computed(() => {
    return store.state["apidoc/response"].cookies;
})
const headers = computed(() => {
    const { header } = store.state["apidoc/response"];
    const result: { key: string, value: string }[] = [];
    Object.keys(header).forEach(key => {
        result.push({
            key,
            value: header[key] as string,
        });
    })
    return result
})


</script>

<style lang="scss">

</style>
