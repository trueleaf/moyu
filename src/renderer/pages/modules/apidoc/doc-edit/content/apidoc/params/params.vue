/*
    创建者：shuxiaokai
    创建时间：2021-08-15 22:11
    模块名称：参数录入
    备注：
*/
<template>
    <div class="api-params">
        <el-tabs v-model="activeName">
            <el-tab-pane label="Params" name="s-params">
                <template #label>
                    <el-badge :is-dot="hasQueryOrPathsParams">Params</el-badge>
                </template>
            </el-tab-pane>
            <el-tab-pane label="Body" name="s-request-body">
                <template #label>
                    <el-badge :is-dot="hasBodyParams">Body</el-badge>
                </template>
            </el-tab-pane>
            <el-tab-pane label="返回参数" name="s-response-params"></el-tab-pane>
            <el-tab-pane label="请求头" name="s-request-headers"></el-tab-pane>
            <el-tab-pane label="备注信息" name="s-f"></el-tab-pane>
        </el-tabs>
        <component :is="activeName" class="workbench"></component>
        <div class="view-type">
            <div class="active cursor-pointer">横向</div>
            <el-divider direction="vertical"></el-divider>
            <div class="cursor-pointer">纵向</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import params from "./params/params.vue";
import requestBody from "./body/body.vue";
import requestHeaders from "./headers/headers.vue";
import responseParams from "./response/response.vue";

export default defineComponent({
    components: {
        "s-params": params,
        "s-request-body": requestBody,
        "s-request-headers": requestHeaders,
        "s-response-params": responseParams,
    },
    data() {
        return {
            activeName: "s-params",
        };
    },
    computed: {
        hasQueryOrPathsParams() {
            const { queryParams, paths } = this.$store.state["apidoc/apidoc"].apidoc.item;
            const hasQueryParams = queryParams.some((data) => data.key);
            const hasPathsParams = paths.some((data) => data.key);
            return hasQueryParams || hasPathsParams;
        },
        hasBodyParams() {
            const { contentType } = this.$store.state["apidoc/apidoc"].apidoc.item;
            return !!contentType;
        },
    },
    watch: {
        activeName() {
            localStorage.setItem("apidoc/paramsActiveTab", this.activeName)
        },
    },
    created() {
        const activeName = localStorage.getItem("apidoc/paramsActiveTab");
        this.activeName = activeName || "s-params";
    },
})
</script>

<style lang="scss">
.api-params {
    padding: size(20) size(0) size(10);
    height: calc(100vh - #{size(250)});
    overflow-y: auto;
    position: relative;
    .el-tabs, .workbench {
        padding-right: size(20);
        padding-left: size(20);
    }
    .el-tabs__item {
        user-select: none;
    }
    .el-badge__content {
        transition: none;
        top: size(10);
        &.is-fixed.is-dot {
            right: size(3);
        }
    }
    .view-type {
        display: flex;
        align-items: center;
        position: absolute;
        top: size(10);
        right: size(5);
        color: $gray-500;
        .active {
            color: $theme-color;
        }
    }
}
</style>
