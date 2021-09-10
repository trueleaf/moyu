/*
    创建者：shuxiaokai
    创建时间：2021-09-10 22:44
    模块名称：预览界面
    备注：
*/
<template>
    <div class="px-3">
        <s-fieldset title="请求参数" class="mb-5">
            <div v-if="hasQueryParams" class="f-base mb-2">Query参数</div>
            <s-params-view v-if="hasQueryParams" :data="apidocInfo.queryParams" plain class="mb-3"></s-params-view>
            <div v-if="hasPathsParams" class="f-base mb-2">Path参数</div>
            <s-params-view v-if="hasPathsParams" :data="apidocInfo.paths" plain></s-params-view>
            <div v-if="hasBodyParams" class="f-base mb-2">Body参数</div>
            <s-params-view v-if="hasBodyParams" :data="apidocInfo.requestBody.json" plain></s-params-view>
        </s-fieldset>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    data() {
        return {
        };
    },
    computed: {
        apidocInfo() {
            return this.$store.state["apidoc/apidoc"].apidoc.item
        },
        //是否存在查询参数
        hasQueryParams() {
            const { queryParams } = this.$store.state["apidoc/apidoc"].apidoc.item;
            const hasQueryParams = queryParams.filter(p => p.select).some((data) => data.key);
            return hasQueryParams;
        },
        //是否存在path参数
        hasPathsParams() {
            const { paths } = this.$store.state["apidoc/apidoc"].apidoc.item;
            const hasPathsParams = paths.some((data) => data.key);
            return hasPathsParams;
        },
        //是否存在body参数
        hasBodyParams() {
            const { contentType } = this.$store.state["apidoc/apidoc"].apidoc.item;
            return !!contentType;
        },
        //返回参数个数
        // responseNum() {
        //     const { responseParams } = this.$store.state["apidoc/apidoc"].apidoc.item;
        //     let resNum = 0;
        //     responseParams.forEach(response => {
        //         const resValue = response.value;
        //         const { dataType } = resValue;
        //         if (dataType === "application/json") {
        //             const converJsonData = apidocConvertParamsToJsonData(resValue.json);
        //             const hasJsonData = converJsonData && Object.keys(converJsonData).length > 0
        //             if (hasJsonData) {
        //                 resNum ++;
        //             }
        //         } else if (dataType === "text/javascript" || dataType === "text/plain" || dataType === "text/html" || dataType === "application/xml") {
        //             if (resValue.text.length > 0) {
        //                 resNum ++;
        //             }
        //         } else {
        //             console.warn(`未实现的返回类型${dataType}`);
        //         }
        //     });
        //     return resNum;
        // },
        //是否存在headers
        hasHeaders() {
            const { headers } = this.$store.state["apidoc/apidoc"].apidoc.item;
            const hasHeaders = headers.filter(p => p.select).some((data) => data.key);
            return hasHeaders;
        },
    },
    methods: {
    },
})
</script>

<style lang="scss">
</style>
