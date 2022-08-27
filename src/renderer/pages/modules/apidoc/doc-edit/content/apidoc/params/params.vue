/*
    创建者：shuxiaokai
    创建时间：2021-08-15 22:11
    模块名称：参数录入与展示
    备注：
*/
<template>
    <div class="api-params" :class="{ vertical: layout === 'vertical' }">
        <div class="view-type" :class="{ vertical: layout === 'vertical' }">
            <div class="cursor-pointer" :class="{active: workMode === 'edit'}" @click="toggleWorkMode('edit')">{{ $t("编辑") }}</div>
            <el-divider direction="vertical"></el-divider>
            <div class="cursor-pointer mr-5" :class="{active: workMode === 'view'}" @click="toggleWorkMode('view')">{{ $t("预览") }}</div>
            <!-- <el-divider direction="vertical"></el-divider> -->
            <el-dropdown trigger="click">
                <div class="gray-700 cursor-pointer mr-3 hover-theme-color">
                    <span class="mr-1 f-sm iconfont iconbuju"></span>
                    <span>{{ $t("布局") }}</span>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="handleChangeLayout('horizontal')">
                            <span :class="{ 'theme-color': layout === 'horizontal' }">{{ $t("左右布局") }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item @click="handleChangeLayout('vertical')">
                            <span :class="{ 'theme-color': layout === 'vertical' }">{{ $t("上下布局") }}</span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <div v-if="!isView" class="gray-700 cursor-pointer mr-3 hover-theme-color" @click="handleOpenVariable">
                <span class="mr-1 f-sm iconfont iconvariable"></span>
                <span>{{ $t("变量") }}</span>
            </div>
            <div v-if="!isView" class="d-flex a-center gray-700 cursor-pointer mr-3 hover-theme-color" @click="handleOpenMindParams">
                <el-icon :size="16" class="mr-1">
                    <icon-opportunity></icon-opportunity>
                </el-icon>
                <span>{{ $t("联想值") }}</span>
            </div>
            <div class="d-flex a-center gray-700 cursor-pointer mr-3 hover-theme-color">
                <el-popover v-model:visible="generateCodeVisible" width="300px" placement="bottom" trigger="manual">
                    <template #reference>
                        <span @click.stop="generateCodeVisible = true">
                            <i class="iconfont iconshengchengdaima"></i>
                            <span>生成代码</span>
                        </span>
                    </template>
                    <s-hook v-if="generateCodeVisible" @close="generateCodeVisible = false"></s-hook>
                </el-popover>
            </div>
        </div>
        <template v-if="workMode === 'edit'">
            <el-tabs v-model="activeName">
                <el-tab-pane name="s-params">
                    <template #label>
                        <el-badge :is-dot="hasQueryOrPathsParams">Params</el-badge>
                    </template>
                </el-tab-pane>
                <el-tab-pane name="s-request-body">
                    <template #label>
                        <el-badge :is-dot="hasBodyParams">Body</el-badge>
                    </template>
                </el-tab-pane>
                <el-tab-pane name="s-response-params">
                    <template #label>
                        <el-badge :is-dot="!!responseNum">{{ $t("返回参数") }}</el-badge>
                    </template>
                </el-tab-pane>
                <el-tab-pane name="s-request-headers">
                    <template #label>
                        <el-badge :is-dot="hasHeaders">{{ $t("请求头") }}</el-badge>
                    </template>
                </el-tab-pane>
                <el-tab-pane :label="$t('备注信息')" name="s-remarks"></el-tab-pane>
                <el-tab-pane name="s-pre-request">
                    <template #label>
                        <el-badge :is-dot="hasPreRequest">{{ $t("前置脚本") }}</el-badge>
                    </template>
                </el-tab-pane>
                <el-tab-pane name="s-after-request">
                    <template #label>
                        <el-badge :is-dot="hasAfterRequest">{{ $t("后置脚本") }}</el-badge>
                    </template>
                </el-tab-pane>
                <el-tab-pane name="s-mock">
                    <template #label>
                        <el-badge :is-dot="hasCustomMockInfo">Mock</el-badge>
                    </template>
                </el-tab-pane>
            </el-tabs>
            <keep-alive>
                <component :is="activeName" class="workbench"></component>
            </keep-alive>
        </template>
        <template v-if="workMode === 'view'">
            <s-view></s-view>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { DebouncedFunc } from "lodash"
import { Opportunity } from "@element-plus/icons-vue"
import type { ApidocTab } from "@@/store"
import type { ApidocDetail, ApidocProperty } from "@@/global"
import { apidocCache } from "@/cache/apidoc"
import { lodashIsEqual, debounce } from "@/helper/index"
import { store } from "@/store"
import params from "./params/params.vue";
import requestBody from "./body/body.vue";
import requestHeaders from "./headers/headers.vue";
import responseParams from "./response/response.vue";
import preRequestParams from "./pre-request/pre-request.vue";
import afterRequestParams from "./after-request/after-request.vue";
import remarks from "./remarks/remarks.vue";
import view from "./view/view.vue"
import hook from "./hook/hook.vue"
import mock from "./mock/mock.vue"

export default defineComponent({
    components: {
        "s-params": params,
        "s-request-body": requestBody,
        "s-request-headers": requestHeaders,
        "s-response-params": responseParams,
        "s-view": view,
        "s-remarks": remarks,
        "s-pre-request": preRequestParams,
        "s-after-request": afterRequestParams,
        "s-hook": hook,
        "s-mock": mock,
        "icon-opportunity": Opportunity
    },
    data() {
        const mode = this.$route.query.mode as "edit" | "view";
        return {
            workMode: mode, //是否开启预览模式
            activeName: "s-params",
            generateCodeVisible: false, //是否打开生成代码弹窗
            debounceFn: null as (null | DebouncedFunc<(apidoc: ApidocDetail) => void>),
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
        //是否存在预请求脚本
        hasPreRequest() {
            const preRequest = this.$store.state["apidoc/apidoc"].apidoc.preRequest.raw;
            return !!preRequest;
        },
        //是否存在后请求脚本
        hasAfterRequest() {
            const afterRequest = this.$store.state["apidoc/apidoc"].apidoc.afterRequest.raw;
            return !!afterRequest;
        },
        //返回参数个数
        responseNum() {
            const resParams = this.$store.state["apidoc/apidoc"].apidoc.item.responseParams;
            let resNum = 0;
            resParams.forEach(response => {
                const resValue = response.value;
                const { dataType } = resValue;
                if (dataType === "application/json") {
                    if (resValue.strJson.length > 0) {
                        resNum += 1;
                    }
                } else if (dataType === "text/javascript" || dataType === "text/plain" || dataType === "text/html" || dataType === "application/xml") {
                    if (resValue.text.length > 0) {
                        resNum += 1;
                    }
                } else {
                    console.warn(`${this.$t("未实现的返回类型")}${dataType}`);
                }
            });
            return resNum;
        },
        hasCustomMockInfo() {
            const { mockInfo } = store.state["apidoc/apidoc"].apidoc;
            const { path } = this.$store.state["apidoc/apidoc"].apidoc.item.url;
            const { responseHeaders } = this.$store.state["apidoc/apidoc"].apidoc.mockInfo;
            const hasHeaders = responseHeaders.filter(p => p.select).some((data) => data.key);
            if (mockInfo.responseType === "json" && mockInfo.json.trim() !== "") {
                return true;
            }
            if (mockInfo.responseType === "text" && mockInfo.text.trim() !== "") {
                return true;
            }
            if (mockInfo.responseType === "image") {
                return true;
            }
            if (mockInfo.responseType === "file") {
                return true;
            }
            if (mockInfo.responseType === "customJson" && mockInfo.customResponseScript.trim() !== "") {
                return true;
            }
            if (hasHeaders) { //存在自定义headers
                return true;
            }
            if (mockInfo.path !== path) {
                return true;
            }
            if (mockInfo.responseDelay !== 0) {
                return true;
            }
            if (mockInfo.httpStatusCode !== 200) {
                return true;
            }
            return false;
        },
        //是否存在headers
        hasHeaders() {
            const { headers } = this.$store.state["apidoc/apidoc"].apidoc.item;
            const commonHeaders = store.getters["apidoc/baseInfo/headers"](this.currentSelectTab?._id) as ApidocProperty<"string">[];
            const hasHeaders = headers.concat(commonHeaders.map(v => ({ ...v, select: true }))).filter(p => p.select).some((data) => data.key);
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
        //apidoc
        apidoc() {
            return this.$store.state["apidoc/apidoc"].apidoc;
        },
        //当前工作区状态
        isView() {
            return this.$store.state["apidoc/baseInfo"].mode === "view"
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
        },
        apidoc: {
            handler(apidoc: ApidocDetail) {
                if (this.debounceFn) {
                    this.debounceFn(apidoc);
                }
            },
            deep: true,
        },
    },
    mounted() {
        this.debounceFn = debounce((apidoc: ApidocDetail) => {
            const { originApidoc } = this.$store.state["apidoc/apidoc"];
            const isEqual = this.checkApidocIsEqual(apidoc, originApidoc);
            this.$store.commit("apidoc/mock/changeCurrentMockUrl", {
                id: this.currentSelectTab?._id,
                apidoc,
            })
            if (!isEqual) {
                this.$store.commit("apidoc/tabs/changeTabInfoById", {
                    id: this.currentSelectTab?._id,
                    field: "saved",
                    value: false,
                })
                this.$store.commit("apidoc/tabs/changeTabInfoById", {
                    id: this.currentSelectTab?._id,
                    field: "fixed",
                    value: true,
                })
            } else {
                this.$store.commit("apidoc/tabs/changeTabInfoById", {
                    id: this.currentSelectTab?._id,
                    field: "saved",
                    value: true,
                })
            }
            //缓存接口信息
            apidocCache.setApidoc(apidoc);
        }, 200, {
            leading: true
        })
        this.initTabCache();
        this.$store.commit("apidoc/mock/changeCurrentMockUrl", {
            id: this.currentSelectTab?._id,
            apidoc: this.$store.state["apidoc/apidoc"].apidoc,
        })
        document.documentElement.addEventListener("click", this.handleCloseHook)
    },
    unmounted() {
        document.documentElement.removeEventListener("click", this.handleCloseHook)
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
        //=========================================================================//
        //判断apidoc是否发生改变
        checkApidocIsEqual(apidoc: ApidocDetail, originApidoc: ApidocDetail) {
            const cpApidoc: ApidocDetail = JSON.parse(JSON.stringify(apidoc));
            const cpOriginApidoc: ApidocDetail = JSON.parse(JSON.stringify(originApidoc));
            const mockInfoIsEqual = this.checkMockInfo(cpApidoc, cpOriginApidoc);
            const preRequestIsEqual = this.checkPreRequest(cpApidoc, cpOriginApidoc);
            const methodIsEqual = this.checkMethodIsEqual(cpApidoc, cpOriginApidoc);
            const urlIsEqual = this.checkUrlIsEqual(cpApidoc, cpOriginApidoc);
            const headerIsEqual = this.checkPropertyIsEqual(cpApidoc.item.headers, cpOriginApidoc.item.headers);
            const pathsIsEqual = this.checkPropertyIsEqual(cpApidoc.item.paths, cpOriginApidoc.item.paths);
            const queryParamsIsEqual = this.checkPropertyIsEqual(cpApidoc.item.queryParams, cpOriginApidoc.item.queryParams);
            //=====================================Request====================================//
            if (!methodIsEqual || !urlIsEqual || !headerIsEqual || !pathsIsEqual || !queryParamsIsEqual || !preRequestIsEqual || !mockInfoIsEqual) {
                return false;
            }
            if (cpApidoc.item.requestBody.mode !== cpOriginApidoc.item.requestBody.mode) { //body模式不同
                return false;
            }
            if (cpApidoc.item.requestBody.mode === "json") {
                const jsonBodyIsEqual = cpApidoc.item.requestBody.rawJson === cpOriginApidoc.item.requestBody.rawJson
                if (!jsonBodyIsEqual) {
                    return false;
                }
            } else if (cpApidoc.item.requestBody.mode === "formdata") {
                const formDataIsEqual = this.checkPropertyIsEqual(cpApidoc.item.requestBody.formdata, cpOriginApidoc.item.requestBody.formdata);
                if (!formDataIsEqual) {
                    return false;
                }
            } else if (cpApidoc.item.requestBody.mode === "urlencoded") {
                const urlencodedIsEqual = this.checkPropertyIsEqual(cpApidoc.item.requestBody.urlencoded, cpOriginApidoc.item.requestBody.urlencoded);
                if (!urlencodedIsEqual) {
                    return false;
                }
            } else if (cpApidoc.item.requestBody.mode === "raw") {
                const rawDataIsEqual = cpApidoc.item.requestBody.raw.data === cpOriginApidoc.item.requestBody.raw.data
                const rawTypeIsEqual = cpApidoc.item.requestBody.raw.dataType === cpOriginApidoc.item.requestBody.raw.dataType
                if (!rawTypeIsEqual) {
                    return false;
                }
                if (!rawDataIsEqual) {
                    return false;
                }
            }
            //=====================================Response====================================//
            if (cpApidoc.item.responseParams.length !== cpOriginApidoc.item.responseParams.length) { //返回参数长度不相等
                return false;
            }
            for (let i = 0; i < cpApidoc.item.responseParams.length; i += 1) {
                const item = cpApidoc.item.responseParams[i];
                const originItem = cpOriginApidoc.item.responseParams[i];
                // const jsonResponseIsEqual = this.checkPropertyIsEqual(item.value.json, originItem.value.json);
                if (item.value.strJson !== originItem.value.strJson) {
                    return false;
                }
                if (item.statusCode !== originItem.statusCode) { //状态码不相同
                    return false;
                }
                if (item.title !== originItem.title) { //描述不相同
                    return false;
                }
                if (item.value.dataType !== originItem.value.dataType) { //数据类型不相同
                    return false;
                }
                if (item.value.file.url !== originItem.value.file.url || item.value.file.raw !== originItem.value.file.raw) { //文件类型url不相同
                    return false;
                }
                if (item.value.text !== originItem.value.text) { //文件类型url不相同
                    return false;
                }
            }
            return true;
        },
        //检查mockInfo是否改变
        checkMockInfo(apidoc: ApidocDetail, originApidoc: ApidocDetail) {
            return lodashIsEqual(apidoc.mockInfo, originApidoc.mockInfo);
        },
        //检查请求方法是否发生改变
        checkMethodIsEqual(apidoc: ApidocDetail, originApidoc: ApidocDetail) {
            return apidoc.item.method.toLowerCase() === originApidoc.item.method.toLowerCase();
        },
        //检查preRequest是否发送改变
        checkPreRequest(apidoc: ApidocDetail, originApidoc: ApidocDetail) {
            return apidoc.preRequest.raw === originApidoc.preRequest.raw;
        },
        //检查请求url是否发生改变
        checkUrlIsEqual(apidoc: ApidocDetail, originApidoc: ApidocDetail) {
            // const apidocHost = apidoc.item.url.host;
            const apidocPath = apidoc.item.url.path;
            // const originHost = originApidoc.item.url.host;
            const originPath = originApidoc.item.url.path;
            return apidocPath === originPath;
        },
        //检查ApidocProperty[]类型数据是否相同
        checkPropertyIsEqual(value: ApidocProperty[], originValue: ApidocProperty[]) {
            if (value.length !== originValue.length) return false;
            for (let i = 0; i < value.length; i += 1) {
                const item = value[i];
                const { _id } = item;
                const matchedOriginItem = originValue.find(v => v._id === _id);
                if (!matchedOriginItem) {
                    return false;
                }
                if (!this.checkIsSameProperty(item, matchedOriginItem)) {
                    return false;
                }
            }
            return true;
        },
        //检查每个ApidocProperty是否一致
        checkIsSameProperty(p: ApidocProperty, p2: ApidocProperty) {
            let isSame = true;
            const checkProperty = (prop: ApidocProperty, prop2: ApidocProperty) => {
                if (prop.key !== prop2.key) {
                    isSame = false;
                    return;
                }
                if (prop.value !== prop2.value) {
                    isSame = false;
                    return;
                }
                if (prop.type !== prop2.type) {
                    isSame = false;
                    return;
                }
                if (prop.required !== prop2.required) {
                    isSame = false;
                    return;
                }
                if (prop.description !== prop2.description) {
                    isSame = false;
                    return;
                }
                if (prop.select !== prop2.select) {
                    isSame = false;
                    return;
                }
                if (prop.children.length !== prop2.children.length) {
                    isSame = false;
                    return;
                }
                if (prop.children.length > 0) { //prop2长度肯定也大于0
                    for (let i = 0; i < prop.children.length; i += 1) {
                        checkProperty(prop.children[i], prop2.children[i]);
                    }
                }
            }
            checkProperty(p, p2);
            return isSame
        },
        //=========================================================================//
        //切换工作模式
        toggleWorkMode(mode: "edit" | "view") {
            this.workMode = mode;
        },
        //打开变量维护页面
        handleOpenVariable() {
            this.$store.commit("apidoc/tabs/addTab", {
                _id: "variable",
                projectId: this.$route.query.id,
                tabType: "variable",
                label: this.$t("变量维护"),
                head: {
                    icon: "iconvariable",
                    color: ""
                },
                saved: true,
                fixed: true,
                selected: true,
            });
        },
        //打开联想参数
        handleOpenMindParams() {
            this.$store.commit("apidoc/tabs/addTab", {
                _id: "mindParams",
                projectId: this.$route.query.id,
                tabType: "mindParams",
                label: this.$t("联想参数"),
                head: {
                    icon: "iconmindParams",
                    color: ""
                },
                saved: true,
                fixed: true,
                selected: true,
            });
        },
        //关闭生成代码popover
        handleCloseHook() {
            this.generateCodeVisible = false;
        },
    },
})
</script>

<style lang="scss">
.api-params {
    padding: size(0) size(0) size(10);
    height: calc(100vh - #{size(220)});
    overflow-y: auto;
    position: relative;
    &.vertical {
        // height: calc(100% - #{size(130)});
        height: auto;
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
            top: size(10);
            right: size(3);
        }
    }
    .view-type {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        position: sticky;
        top: size(3);
        color: $gray-500;
        padding: size(0) size(20);
        height: size(30);
        display: flex;
        align-items: center;
        background: $white;
        z-index: $zIndex-request-info-wrap;
        &.vertical {
            // position: relative;
            z-index: 1;
        }
        .active {
            color: $theme-color;
        }
    }
    .el-tabs__item {
        height: size(30);
        line-height: size(30);
    }
    .el-dropdown {
        line-height: initial;
    }
}
</style>
