/*
    创建者：shuxiaokai
    创建时间：2020-12-16 16:10
    模块名称：response返回值
    备注：xxxx
*/
<template>
    <div class="overview">
        <div class="request-view">
            <s-collapse v-if="apidocInfo.item" title="基本信息">
                <s-label-value label="请求地址：" class="w-100 mt-2">
                    <span class="text-ellipsis">{{ apidocInfo.item.url.host + apidocInfo.item.url.path }}</span>
                </s-label-value>
                <s-label-value label="请求方式：" class="w-50">
                    <template v-for="(req) in validRequestMethods">
                        <span v-if="apidocInfo.item.method === req.value.toLowerCase()" :key="req.name" class="label" :style="{color: req.iconColor}">{{ req.name.toUpperCase() }}</span>
                    </template>
                </s-label-value>
                <s-label-value label="标签信息：" class="w-50">
                    <div v-if="tagInfo.name">
                        <!-- <span class="dot" :style="{background: tagInfo.color}"></span> -->
                        <span :style="{color: tagInfo.color}">{{ tagInfo.name }}</span>
                    </div>
                </s-label-value>
                <div class="base-info">
                    <s-label-value label="维护人员：" :title="apidocInfo.info.maintainer || apidocInfo.info.creator" label-width="auto" class="w-50">
                        <span class="text-ellipsis">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
                    </s-label-value>
                    <s-label-value label="创建人员：" :title="apidocInfo.info.maintainer || apidocInfo.info.creator" label-width="auto" class="w-50">
                        <span class="text-ellipsis">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
                    </s-label-value>
                    <s-label-value label="更新日期：" :title="formatDate(apidocInfo.updatedAt)" label-width="auto" class="w-50">
                        <span class="text-ellipsis">{{ formatDate(apidocInfo.updatedAt) }}</span>
                    </s-label-value>
                    <s-label-value label="创建日期：" :title="formatDate(apidocInfo.createdAt)" label-width="auto" class="w-50">
                        <span class="text-ellipsis">{{ formatDate(apidocInfo.createdAt) }}</span>
                    </s-label-value>
                </div>
            </s-collapse>
        </div>
        <s-response-view class="response-view"></s-response-view>
    </div>
</template>

<script>
import responseView from "./response-view/response-view.vue"

export default {
    components: {
        "s-response-view": responseView,
    },
    data() {
        return {

        };
    },
    computed: {
        apidocInfo() { //接口文档信息
            // console.log(this.$store.state.apidoc.apidocInfo);
            return this.$store.state.apidoc.apidocInfo;
        },
        validRequestMethods() {
            return this.$store.state.apidocRules.requestMethods.filter((val) => val.enabled);
        },
        tagInfo() { //标签信息
            return this.$store.state.apidoc.apidocInfo?.info?.tag || {};
        },
    },
    created() {

    },
    methods: {
    },
};
</script>

<style lang="scss">
.overview {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .request-view {
        flex-grow: 0;
        flex-shrink: 0;
        box-shadow: 0 3px 2px $gray-400;
        margin-bottom: size(10);
        padding: size(10);
        height: size(170);
        .svg-icon {
            width: size(15);
            height: size(15);
            cursor: pointer;
        }
        .base-info {
            display: flex;
            flex-wrap: wrap;
        }
    }
    .response-view {
        width: 100%;
        padding: size(10) size(10);
        flex: 0 0 calc(100vh - #{size(290)});
        overflow-x: hidden;
        overflow-y: auto;
    }
    .dot {
        display: inline-block;
        width: size(10);
        height: size(10);
        border-radius: 50%;
        margin-right: size(5);
        margin-top: -size(2);
    }
}
</style>
