/*
    创建者：shuxiaokai
    创建时间：2020-07-06 17:57
    模块名称：文档书写区域区域
    备注：xxxx
*/
<template>
    <div class="view-content">
        <s-loading class="view-area">
            <s-base-info class="base-view"></s-base-info>
            <div class="params-view">
                <s-fieldset title="请求参数" class="mb-5">
                    <s-collapse v-if="apidocItem.queryParams && apidocItem.queryParams.length > 1" title="请求参数(Params)">
                        <s-array-view :data="apidocItem.queryParams" class="mt-2">
                            <div v-copy="jsonQueryParams" slot="header" class="copy-json">复制为json</div>
                        </s-array-view>
                    </s-collapse>
                    <s-collapse v-if="apidocItem.requestBody && apidocItem.requestBody.length > 1" title="">
                        <div slot="title">
                            <span class="mr-2">请求参数(Body)</span>
                            <span class="theme-color">{{ apidocItem.contentType  }}</span>
                        </div>
                        <s-array-view :data="apidocItem.requestBody" class="mt-2">
                            <div v-copy="jsonRequestBody" slot="header" class="copy-json">复制为json</div>
                        </s-array-view>
                    </s-collapse>
                </s-fieldset>
                <s-fieldset title="返回参数">
                    <s-collapse v-for="(item, index) in apidocItem.responseParams" :active="index === 0" :key="index" :title="item.title">
                        <s-array-view v-if="item.values.length > 1" :data="item.values" class="mt-2">
                            <div v-copy="jsonRequestBody" slot="header" class="copy-json">复制为json</div>
                        </s-array-view>
                    </s-collapse>
                </s-fieldset>
                <s-fieldset title="请求头">
                    <s-array-view :data="apidocItem.headers">
                        <div v-copy="jsonHeaders" slot="header" class="copy-json">复制为json</div>
                    </s-array-view>
                </s-fieldset>
            </div>
        </s-loading>
        <div class="remote-view">
            <s-overview></s-overview>
        </div>
    </div>
</template>

<script>
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数
import overview from "./components/overview/overview.vue" //展示区域
import baseInfo from "./components/base-info/base-info.vue" //基础信息区域

//=========================================================================//
export default {
    name: "APIDOC_CONTENT",
    mixins: [mixin],
    components: {
        "s-overview": overview,
        "s-base-info": baseInfo,
    },
    watch: {
        currentSelectDoc: {
            handler(currentDoc, oldDoc) {
                if (currentDoc.tabType !== "doc") { //只处理类型为doc数据
                    return;
                }
                if (!oldDoc || currentDoc._id !== oldDoc._id) { //这个判断代表只有是切换tab才会触发请求
                    this.$store.commit("apidoc/clearRespons"); //清空上一次返回数据
                    this.getDocDetail();
                }
            },
            deep: true,
            immediate: true,
        },
    },
    computed: {
        currentSelectDoc() { //当前选中的doc
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
        tabs() { //全部tabs
            return this.$store.state.apidoc.tabs[this.$route.query.id];
        },
        apidocItem() { //接口文档信息
            return this.$store.state.apidoc.apidocInfo?.item || {};
        },
        loading() {
            return this.$store.state.apidoc.apidocLoading;
        },
        validRequestMethods() {
            return this.$store.state.apidocRules.requestMethods.filter((val) => val.enabled);
        },
        jsonRequestBody() {
            const requestBody = this.$store.state.apidoc.apidocInfo?.item?.requestBody;
            const convertRequestBody = this.convertPlainParamsToTreeData(requestBody || []);
            return JSON.stringify(convertRequestBody, null, 4);
        },
        jsonQueryParams() {
            const queryParams = this.$store.state.apidoc.apidocInfo?.item?.queryParams;
            const convertQueryParams = this.convertPlainParamsToTreeData(queryParams || []);
            return JSON.stringify(convertQueryParams, null, 4);
        },
        jsonHeaders() {
            const headers = this.$store.state.apidoc.apidocInfo?.item?.headers;
            const convertHeaders = this.convertPlainParamsToTreeData(headers || []);
            return JSON.stringify(convertHeaders, null, 4);
        },
    },
    data() {
        return {
            //=====================================其他参数====================================//
        };
    },
    mounted() {},
    methods: {
        //=====================================获取数据====================================//
        //获取接口数据
        getDocDetail() {
            if (!this.currentSelectDoc || !this.currentSelectDoc._id) { //没有id不请求数据
                return
            }
            const docId = this.currentSelectDoc._id;
            const { docs } = window.SHARE_DATA;
            const currentDoc = docs.find((doc) => doc._id === docId);
            const apidocInfo = JSON.parse(JSON.stringify(currentDoc));
            this.$store.commit("apidoc/changeApidocInfo", apidocInfo);
        },
    },
};
</script>

<style lang="scss">
.view-content {
    display: flex;
    height: calc(100vh - #{size(100)});
    // 编辑区域
    .view-area {
        border-right: 1px solid $gray-400;
        flex: 1;
        .base-info {
            height: #{size(120)};
        }
        .params-view {
            height: calc(100vh - #{size(220)});
            overflow-y: auto;
            padding: size(10) size(20);
            .copy-json {
                cursor: pointer;
                &:hover {
                    color: lighten($gray-300, 20%);
                }
            }
        }
    }
    // 数据返回区域
    .remote-view {
        flex-grow: 0;
        flex-shrink: 0;
        width: size(550);
    }
}
</style>
