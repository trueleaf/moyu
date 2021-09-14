/*
    创建者：shuxiaokai
    创建时间：2021-08-15 22:11
    模块名称：返回参数
    备注：
*/
<template>
    <s-base-info v-show="layout === 'horizontal'"></s-base-info>
    <s-res-info v-show="layout === 'horizontal'"></s-res-info>
    <div v-show="remoteResponse.data.type" class="remote-response-wrap px-3" :class="{ vertical: layout === 'vertical' }">
        <el-tabs v-model="activeName" class="h-100">
            <el-tab-pane label="返回值" name="s-body">
                <s-body class="h-100"></s-body>
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
    <el-empty v-show="!remoteResponse.data.type">
        <template #description>
            <span>点击发送按钮发送请求</span>
        </template>
    </el-empty>
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
const layout = computed(() => {
    return store.state["apidoc/baseInfo"].layout;
})
const remoteResponse = computed(() => {
    return store.state["apidoc/response"]
})

</script>

<style lang="scss">
.remote-response-wrap {
    height: calc(100vh - #{size(310)});
    .el-tabs__content {
        height: calc(100% - 55px);
        .el-tab-pane {
            height: 100%;
        }
    }
    &.vertical {
        height: 100%;
        margin-top: size(15);
        .el-tabs__content {
            height: calc(100% - 55px);
            overflow-y: auto;
            .el-tab-pane {
                height: 100%;
            }
        }
    }
}
</style>
