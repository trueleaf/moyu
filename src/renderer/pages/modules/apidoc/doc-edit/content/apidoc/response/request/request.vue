/*
    创建者：shuxiaokai
    创建时间：2022-02-09 22:06
    模块名称：请求基本信息
    备注：
*/
<template>
    <div v-if="requestInfo.url" class="request-info" :class="{ vertical: layout === 'vertical' }">
        <s-collapse title="基本信息" bold>
            <div class="pl-1 d-flex a-top">
                <span class="flex0 text-bold mr-1">URL:</span>
                <span class="f-sm">{{ requestInfo.url }}</span>
            </div>
            <div class="mt-1 pl-1 d-flex a-top">
                <span class="flex0 text-bold mr-1">Method:</span>
                <span class="f-sm">{{ requestInfo.method }}</span>
            </div>
        </s-collapse>
        <s-collapse title="请求头" bold>
            <div v-for="(value, key) in requestInfo.headers" :key="key" class="pl-1 mt-1 d-flex a-top">
                <div class="flex0 mr-1 text-bold">{{ upperHeaderKey(key) }}:</div>
                <div>{{ value }}</div>
            </div>
        </s-collapse>
        <s-collapse bold>
            <template #title>
                <span>请求body</span>
                <span v-if="contentType">({{ contentType }})</span>
            </template>
            <pre v-if="contentType === 'application/json'" class="pl-1">{{ formatJsonStr(requestInfo.body as string) }}</pre>
            <div v-else-if="contentType?.includes('multipart/')" class="pl-1">
                <pre>{{ formatFormadata() }}</pre>
            </div>
            <pre v-else-if="contentType === 'application/x-www-form-urlencoded'">{{ requestInfo.body }}</pre>
            <pre v-else-if="contentType === 'text/html'">{{ requestInfo.body }}</pre>
            <pre v-else-if="contentType === 'text/javascript'">{{ requestInfo.body }}</pre>
            <pre v-else-if="contentType === 'text/plain'">{{ requestInfo.body }}</pre>
            <pre v-else-if="contentType === 'application/xml'">{{ requestInfo.body }}</pre>
        </s-collapse>
    </div>
    <div v-else class="d-flex a-center j-center">等待发送请求</div>
</template>

<script lang="ts" setup>
// import json5 from "json5"
import { computed } from "vue"
import { store } from "@/store/index"
import beautify from "js-beautify"
import type FormData from "form-data"

const requestInfo = computed(() => store.state["apidoc/request"]); //请求基本信息
const contentType = computed(() => store.state["apidoc/apidoc"].apidoc.item.contentType); //contentType
const formatJsonStr = (code: string) => beautify(code, { indent_size: 4 });
const upperHeaderKey = (key: string) => key.replace(/(^\w)|(-\w)/g, ($1) => $1.toUpperCase())
const formatFormadata = () => {
    const bufferFormData = (requestInfo.value.body as FormData)?.getBuffer();
    const stringFormData = bufferFormData.toString();
    const boundary = (requestInfo.value.body as FormData)?.getBoundary();
    const result: string[] = [];
    stringFormData.split(boundary).forEach(v => {
        result.push(`${v.slice(0, 255)}${v.length > 255 ? "由于性能原因，仅展示255个字符" : ""}\n`); //最多展示255个字符
    })
    return result.join(boundary);
}
//布局
const layout = computed(() => store.state["apidoc/baseInfo"].layout)

</script>

<style lang="scss">
.request-info {
    width: 100%;
    word-break: break-all;
    height: calc(100vh - #{size(370)});
    overflow-y: auto;
    &.vertical {
        height: 100%;
    }
}
</style>
