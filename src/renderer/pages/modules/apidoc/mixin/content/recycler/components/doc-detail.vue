/*
    创建者：shuxiaokai
    创建时间：2020-07-06 17:57
    模块名称：文档书写区域区域
    备注：xxxx
*/
<template>
    <s-loading :loading="loading" class="doc-detail">
        <div class="close el-icon-close" @click="handleClose"></div>
        <div class="params-view">
            <s-fieldset v-if="apidocItem.url" title="基本信息">
                <s-label-value v-if="!isFolder" label="请求方式：" class="w-50">
                    <template v-for="(req) in validRequestMethods">
                        <span v-if="apidocItem.method === req.value.toLowerCase()" :key="req.name" class="label" :style="{color: req.iconColor}">{{ req.name.toUpperCase() }}</span>
                    </template>
                </s-label-value>
                <s-label-value v-if="!isFolder" label="请求地址：" class="w-50 mt-2">
                    <span class="text-ellipsis">{{ apidocItem.url.path }}</span>
                </s-label-value>
                <s-label-value label="接口名称：" class="w-50">
                    <div>{{ apidocInfo.name }}</div>
                </s-label-value>
                <s-label-value label="标签信息：" class="w-50">
                    <div v-if="apidocInfo.tag && apidocInfo.tag.name">
                        <span :style="{color: apidocInfo.tag.color}">{{ apidocInfo.tag.name }}</span>
                    </div>
                </s-label-value>
                <div v-if="apidocInfo" class="base-info">
                    <s-label-value label="维护人员：" :title="apidocInfo.maintainer || apidocInfo.creator" label-width="auto" class="w-50">
                        <span class="text-ellipsis">{{ apidocInfo.maintainer || apidocInfo.creator }}</span>
                    </s-label-value>
                    <s-label-value label="创建人员：" :title="apidocInfo.maintainer || apidocInfo.creator" label-width="auto" class="w-50">
                        <span class="text-ellipsis">{{ apidocInfo.maintainer || apidocInfo.creator }}</span>
                    </s-label-value>
                    <s-label-value label="更新日期：" :title="formatDate(apidocInfo.updatedAt)" label-width="auto" class="w-50">
                        <span class="text-ellipsis">{{ formatDate(apidocInfo.updatedAt) }}</span>
                    </s-label-value>
                    <s-label-value label="创建日期：" :title="formatDate(apidocInfo.createdAt)" label-width="auto" class="w-50">
                        <span class="text-ellipsis">{{ formatDate(apidocInfo.createdAt) }}</span>
                    </s-label-value>
                </div>
            </s-fieldset>
            <s-fieldset v-if="!isFolder" title="请求参数" class="mb-5">
                <template v-if="hasQueryParams || hasBodyParams || hasPathParams">
                    <s-collapse v-if="hasPathParams" title="请求参数(Path)">
                        <s-array-view :data="apidocItem.paths" show-checkbox class="mt-2"></s-array-view>
                    </s-collapse>
                    <s-collapse v-if="hasQueryParams" title="请求参数(Params)">
                        <s-array-view :data="apidocItem.queryParams" show-checkbox class="mt-2">
                            <div slot="header" v-copy="jsonQueryParams" class="copy-json">复制为json</div>
                        </s-array-view>
                    </s-collapse>
                    <s-collapse v-if="hasBodyParams">
                        <div slot="title">
                            <span class="mr-2">请求参数(Body)</span>
                            <span class="theme-color">{{ apidocItem.contentType }}</span>
                        </div>
                        <s-array-view :data="apidocItem.requestBody" show-checkbox class="mt-2">
                            <div slot="header" v-copy="jsonRequestBody" class="copy-json">复制为json</div>
                        </s-array-view>
                    </s-collapse>
                </template>
                <div v-else>空</div>
            </s-fieldset>
            <s-fieldset v-if="!isFolder" title="返回参数">
                <div v-for="(item, index) in apidocItem.responseParams" :key="index">
                    <s-collapse :key="index" :active="index === 0" :title="item.title">
                        <s-array-view v-if="item.values.length >= 1" :data="item.values" class="mt-2">
                            <div slot="header" v-copy="convertResponseToJson(item)" class="copy-json">复制为json</div>
                        </s-array-view>
                        <div v-if="item.values.length === 0">空</div>
                    </s-collapse>
                </div>
            </s-fieldset>
            <s-fieldset v-if="!isFolder" title="请求头">
                <s-array-view v-if="apidocItem.headers && apidocItem.headers.length > 1" :data="apidocItem.headers">
                    <div slot="header" v-copy="jsonHeaders" class="copy-json">复制为json</div>
                </s-array-view>
                <div v-else>空</div>
            </s-fieldset>
        </div>
    </s-loading>
</template>

<script>
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数

//=========================================================================//
export default {
    mixins: [mixin],
    props: {
        id: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            apidocItem: {},
            apidocInfo: {},
            isFolder: false, //是否为文件夹
            loading: false,
        };
    },
    computed: {
        hasPathParams() {
            const { apidocItem } = this.apidocItem;
            const hasPathParams = apidocItem && apidocItem.paths && apidocItem.paths.length > 1;
            return hasPathParams;
        },
        hasQueryParams() {
            const { apidocItem } = this.apidocItem;
            const hasQueryParams = apidocItem && apidocItem.queryParams && apidocItem.queryParams.length > 1;
            return hasQueryParams;
        },
        hasBodyParams() {
            let hasRequestBody = false;
            const { apidocItem } = this.apidocItem;
            const bodyIsNotEmpty = apidocItem && apidocItem.requestBody && apidocItem.requestBody.length >= 1;
            if (bodyIsNotEmpty) {
                const childParams = apidocItem.requestBody[0].children[0];
                if (!childParams) {
                    hasRequestBody = false;
                } else if ((childParams.type !== "object" && childParams.type !== "array") && (childParams.key === "" || childParams.value === "")) {
                    hasRequestBody = false;
                } else {
                    hasRequestBody = true;
                }
            } else {
                hasRequestBody = false;
            }
            return hasRequestBody;
        },
        jsonRequestBody() {
            const { requestBody } = this.apidocItem.requestBody;
            const convertRequestBody = this.convertPlainParamsToTreeData(requestBody || []);
            return JSON.stringify(convertRequestBody, null, 4);
        },
        jsonQueryParams() {
            const { queryParams } = this.apidocItem.queryParams;
            const convertQueryParams = this.convertPlainParamsToTreeData(queryParams || []);
            return JSON.stringify(convertQueryParams, null, 4);
        },
        jsonHeaders() {
            const { headers } = this.apidocItem.headers;
            const convertHeaders = this.convertPlainParamsToTreeData(headers || []);
            return JSON.stringify(convertHeaders, null, 4);
        },
        validRequestMethods() {
            return this.$store.state.apidocRules.requestMethods.filter((val) => val.enabled);
        },
    },
    mounted() {
        this.getDocDetail();
    },
    methods: {
        //=====================================初始化====================================//

        //=====================================获取数据====================================//
        //获取文档详情
        getDocDetail() {
            this.loading = true;
            const params = {
                _id: this.id,
                projectId: this.$route.query.id,
            };
            this.axios.get("/api/project/doc_detail", { params }).then((res) => {
                this.apidocItem = res.data.item
                this.apidocInfo = res.data.info;
                this.isFolder = res.data.info.type === "folder";
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //返回值转换为json
        convertResponseToJson(response) {
            const jsonResponse = this.convertPlainParamsToTreeData(response.values || []);
            return JSON.stringify(jsonResponse, null, 4);
        },
        //关闭弹窗
        handleClose() {
            this.$emit("close");
        },
    },
};
</script>

<style lang="scss" scoped>
.doc-detail {
    width: size(800);
    overflow: hidden;
    position: relative;
    .params-view {
        max-height: 65vh;
        overflow-y: auto;
        padding: 0 size(10);
        margin-top: size(30);
        .copy-json {
            cursor: pointer;
            &:hover {
                color: lighten($gray-300, 20%);
            }
        }
    }
    .close {
        @include rt-close;
        font-size: fz(22);
    }
}
</style>
