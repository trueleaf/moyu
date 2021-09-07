/*
    创建者：shuxiaokai
    创建时间：2021-08-15 22:11
    模块名称：参数录入
    备注：
*/
<template>
    <div class="api-params" :class="{ vertical: layout === 'vertical' }">
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
            <el-tab-pane label="返回参数" name="s-response-params">
                <template #label>
                    <el-badge :is-dot="!!responseNum">返回参数</el-badge>
                    <!-- <el-badge v-if="responseNum" :value="responseNum">返回参数</el-badge>
                    <el-badge v-else>返回参数</el-badge> -->
                </template>
            </el-tab-pane>
            <el-tab-pane label="请求头" name="s-request-headers">
                <template #label>
                    <el-badge :is-dot="hasHeaders">请求头</el-badge>
                </template>
            </el-tab-pane>
            <el-tab-pane label="备注信息" name="s-f"></el-tab-pane>
        </el-tabs>
        <keep-alive>
            <component :is="activeName" class="workbench"></component>
        </keep-alive>
        <div class="view-type">
            <div class="active cursor-pointer">编辑</div>
            <el-divider direction="vertical"></el-divider>
            <div class="cursor-pointer mr-5">预览</div>
            <div class="cursor-pointer" :class="{ active: layout === 'horizontal' }" @click="handleChangeLayout('horizontal')">左右布局</div>
            <el-divider direction="vertical"></el-divider>
            <div class="cursor-pointer" :class="{ active: layout === 'vertical' }" @click="handleChangeLayout('vertical')">上下布局</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import params from "./params/params.vue";
import requestBody from "./body/body.vue";
import requestHeaders from "./headers/headers.vue";
import responseParams from "./response/response.vue";
import { apidocConvertParamsToJsonData } from "@/helper/index"
import type { ApidocTab } from "@@/store"
import { apidocCache } from "@/cache/apidoc"

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
        //是否存在查询参数
        hasQueryOrPathsParams() {
            const { queryParams, paths } = this.$store.state["apidoc/apidoc"].apidoc.item;
            const hasQueryParams = queryParams.filter(p => p.select).some((data) => data.key);
            const hasPathsParams = paths.some((data) => data.key);
            return hasQueryParams || hasPathsParams;
        },
        //是否存在body参数
        hasBodyParams() {
            const { contentType } = this.$store.state["apidoc/apidoc"].apidoc.item;
            return !!contentType;
        },
        //返回参数个数
        responseNum() {
            const { responseParams } = this.$store.state["apidoc/apidoc"].apidoc.item;
            let resNum = 0;
            responseParams.forEach(response => {
                const resValue = response.value;
                const { dataType } = resValue;
                if (dataType === "application/json") {
                    const converJsonData = apidocConvertParamsToJsonData(resValue.json);
                    const hasJsonData = converJsonData && Object.keys(converJsonData).length > 0
                    if (hasJsonData) {
                        resNum ++;
                    }
                } else if (dataType === "text/javascript" || dataType === "text/plain" || dataType === "text/html" || dataType === "application/xml") {
                    if (resValue.text.length > 0) {
                        resNum ++;
                    }
                } else {
                    console.warn(`未实现的返回类型${dataType}`);
                }
            });
            return resNum;
        },
        //是否存在headers
        hasHeaders() {
            const { headers } = this.$store.state["apidoc/apidoc"].apidoc.item;
            const hasHeaders = headers.filter(p => p.select).some((data) => data.key);
            return hasHeaders;
        },
        //当前选中tab
        currentSelectTab(): ApidocTab | null { //当前选中的doc
            const projectId = this.$route.query.id as string;
            const tabs = this.$store.state["apidoc/tabs"].tabs[projectId];
            const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
            return currentSelectTab;
        },
        //布局
        layout() {
            return this.$store.state["apidoc/baseInfo"].layout;
        },
    },
    watch: {
        activeName(val: string) {
            if (this.currentSelectTab) {
                apidocCache.setActiveParamsTab(this.currentSelectTab._id, val);
            }
        },
        currentSelectTab() {
            this.initTabCache();
        }
    },
    created() {
        this.initTabCache();
    },
    methods: {
        //初始化tab缓存
        initTabCache() {
            if (this.currentSelectTab) {
                this.activeName = apidocCache.getActiveParamsTab(this.currentSelectTab._id) || "s-params";
            }
        },
        //切换布局
        handleChangeLayout(layout: "vertical" | "horizontal") {
            this.$store.commit("apidoc/baseInfo/changeLayout", layout);
        },
    },
})
</script>

<style lang="scss">
.api-params {
    padding: size(20) size(0) size(10);
    height: calc(100vh - #{size(250)});
    overflow-y: auto;
    position: relative;
    &.vertical {
        // height: calc(100% - #{size(130)});
        height: size(300);
        // border-bottom: 1px solid $gray-500;
    }
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
