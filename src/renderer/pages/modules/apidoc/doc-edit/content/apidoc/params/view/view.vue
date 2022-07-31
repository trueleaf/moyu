/*
    创建者：shuxiaokai
    创建时间：2021-09-10 22:44
    模块名称：预览界面
    备注：
*/
<template>
    <div class="params-view px-3">
        <s-fieldset :title="$t('请求参数')" class="mb-5">
            <template v-if="hasQueryParams">
                <div class="title">{{ $t("Query参数") }}</div>
                <s-params-view :data="apidocInfo.queryParams" plain class="mb-3"></s-params-view>
            </template>
            <template v-if="hasPathsParams">
                <div class="title">{{ $t("Path参数") }}</div>
                <s-params-view :data="apidocInfo.paths" plain class="mb-3"></s-params-view>
            </template>
            <template v-if="hasJsonBodyParams">
                <div class="title">{{ $t("Body参数") }}(application/json)</div>
                <pre v-if="apidocInfo.requestBody.rawJson">{{ apidocInfo.requestBody.rawJson }}</pre>
                <s-params-view v-else :data="apidocInfo.requestBody.json"></s-params-view>
                <!-- <s-json-editor v-model="apidocInfo.requestBody.rawJson" :config="{ theme: 'vs-dark222' }" read-only></s-json-editor> -->
            </template>
            <template v-if="hasFormDataParams">
                <div class="title">{{ $t("Body参数") }}(multipart/formdata)</div>
                <s-params-view :data="apidocInfo.requestBody.formdata" plain></s-params-view>
            </template>
            <template v-if="hasUrlEncodedParams">
                <div class="title">{{ $t("Body参数") }}(x-www-form-urlencoded)</div>
                <s-params-view :data="apidocInfo.requestBody.urlencoded" plain></s-params-view>
            </template>
            <template v-if="hasRawParams">
                <div class="title">{{ $t("Body参数") }}({{ apidocInfo.requestBody.raw.dataType }})</div>
                <pre>{{ apidocInfo.requestBody.raw.data }}</pre>
            </template>
            <div v-if="!hasQueryParams && !hasPathsParams && !hasJsonBodyParams && !hasFormDataParams && !hasUrlEncodedParams && !hasRawParams">{{ $t("暂无数据") }}</div>
        </s-fieldset>
        <s-fieldset :title="$t('返回参数')">
            <div v-for="(item, index) in apidocInfo.responseParams" :key="index" class="title">
                <div class="mb-2">
                    <span>{{ $t("名称") }}：</span>
                    <span>{{ item.title }}</span>
                    <el-divider direction="vertical"></el-divider>
                    <span>{{ $t("状态码") }}：</span>
                    <span v-if="item.statusCode >= 100 && item.statusCode < 200" class="green">{{ item.statusCode }}</span>
                    <span v-else-if="item.statusCode >= 200 && item.statusCode < 300" class="green">{{ item.statusCode }}</span>
                    <span v-else-if="item.statusCode >= 300 && item.statusCode < 400" class="orange">{{ item.statusCode }}</span>
                    <span v-else-if="item.statusCode >= 400 && item.statusCode < 500" class="red">{{ item.statusCode }}</span>
                    <span v-else class="red">{{ item.statusCode }}</span>
                    <el-divider direction="vertical"></el-divider>
                    <span>{{ $t("返回格式") }}：</span>
                    <span>{{ item.value.dataType }}</span>
                </div>
                <pre v-if="item.value.dataType === 'application/json'">{{ item.value.strJson }}</pre>
                <!-- <s-params-view v-if="item.value.dataType === 'application/json'" :data="item.value.json"></s-params-view> -->
                <div v-if="item.value.dataType === 'application/xml' || item.value.dataType === 'text/plain' || item.value.dataType === 'text/html'">
                    <pre>{{ item.value.text }}</pre>
                </div>
            </div>
        </s-fieldset>
        <s-fieldset :title="$t('请求头')">
            <template v-if="hasHeaders">
                <s-params-view :data="apidocInfo.headers" plain class="mb-3"></s-params-view>
            </template>
            <div v-else>{{ $t("暂无数据") }}</div>
        </s-fieldset>
        <s-fieldset :title="$t('备注')">
            <div v-if="desciption">{{ desciption }}</div>
            <div v-else>{{ $t("暂无数据") }}</div>
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
        desciption() {
            return this.$store.state["apidoc/apidoc"].apidoc.info.description
        },
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
        hasJsonBodyParams() {
            const { contentType } = this.$store.state["apidoc/apidoc"].apidoc.item;
            const { mode } = this.$store.state["apidoc/apidoc"].apidoc.item.requestBody;
            return contentType === "application/json" && mode === "json";
        },
        //是否存在formData参数
        hasFormDataParams() {
            const { contentType } = this.$store.state["apidoc/apidoc"].apidoc.item;
            return contentType === "multipart/form-data";
        },
        //是否存在x-www-form-urlencoded参数
        hasUrlEncodedParams() {
            const { contentType } = this.$store.state["apidoc/apidoc"].apidoc.item;
            return contentType === "application/x-www-form-urlencoded";
        },
        //raw类型返回参数
        hasRawParams() {
            const { mode, raw } = this.$store.state["apidoc/apidoc"].apidoc.item.requestBody;
            return mode === "raw" && raw.data;
        },
        //是否存在headers
        hasHeaders() {
            const { headers } = this.$store.state["apidoc/apidoc"].apidoc.item;
            return headers.filter(p => p.select).some((data) => data.key);
        },
    },
})
</script>

<style lang="scss">
.params-view {
    .title {
        margin-bottom: size(10);
        font-size: fz(15);
    }
}
</style>
