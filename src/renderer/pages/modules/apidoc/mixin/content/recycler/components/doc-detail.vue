/*
    创建者：shuxiaokai
    创建时间：2020-07-06 17:57
    模块名称：文档书写区域区域
    备注：xxxx
*/
<template>
    <s-loading :loading="loading" class="doc-detail">
        <div class="params-view">
            <s-fieldset title="请求参数" class="mb-5">
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
            <s-fieldset title="返回参数">
                <div v-for="(item, index) in apidocItem.responseParams" :key="index">
                    <s-collapse :key="index" :active="index === 0" :title="item.title">
                        <s-array-view v-if="item.values.length >= 1" :data="item.values" class="mt-2">
                            <div slot="header" v-copy="convertResponseToJson(item)" class="copy-json">复制为json</div>
                        </s-array-view>
                        <div v-if="item.values.length === 0">空</div>
                    </s-collapse>
                </div>
            </s-fieldset>
            <s-fieldset title="请求头">
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
    data() {
        return {
            apidocItem: {},
        };
    },
    mounted() {
    },
    methods: {
        //=====================================初始化====================================//
        initDrag() {
            document.documentElement.addEventListener("mouseup", (e) => {
                e.stopPropagation();
                this.isDragging = false;
                document.documentElement.removeEventListener("mousemove", this.handleResizeMousemove);
            })
            const responseWidth = localStorage.getItem("apidoc/responseWidth") || 500;
            const { response, bar } = this.$refs;
            bar.style.left = 0;
            response.style.width = `${responseWidth}px`;
            document.documentElement.addEventListener("click", () => {
                this.multiSelectNode = [];
            });
        },
        //=====================================获取数据====================================//
    },
};
</script>

<style lang="scss" scoped>
.doc-detail {
    max-height: size(600);
    width: size(800);
    overflow-y: auto;
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
</style>
