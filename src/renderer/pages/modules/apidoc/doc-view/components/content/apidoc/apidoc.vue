/*
    创建者：shuxiaokai
    创建时间：2020-07-06 17:57
    模块名称：文档书写区域区域
    备注：xxxx
*/
<template>
    <div class="view-content">
        <s-loading :loading="loading" class="view-area">
            <s-base-info class="base-view"></s-base-info>
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
        <div ref="response" class="remote-view" :style="{'user-select': isDragging ? 'none' : 'auto'}">
            <div ref="bar" class="bar" :class="{active: isDragging}" @mousedown="handleResizeMousedown"></div>
            <s-overview></s-overview>
        </div>
    </div>
</template>

<script>
import axios from "axios"
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数
import overview from "./components/overview/overview.vue" //展示区域
import baseInfo from "./components/base-info/base-info.vue" //基础信息区域

const { CancelToken } = axios;
//=========================================================================//
export default {
    name: "ApidocContent",
    components: {
        "s-overview": overview,
        "s-base-info": baseInfo,
    },
    mixins: [mixin],
    data() {
        return {
            //=====================================拖拽参数====================================//
            minWidth: 300, //------------最小宽度
            maxWidth: 800, //------------最大宽度
            mousedownLeft: 0, //---------鼠标点击距离
            responseWidth: 0, //-----------response宽度
            isDragging: false, //--------是否正在拖拽
            //=====================================其他参数====================================//
            cancel: [], //----请求列表
        };
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
        hasPathParams() {
            const apidocItem = this.$store.state.apidoc.apidocInfo?.item;
            const hasPathParams = apidocItem && apidocItem.paths && apidocItem.paths.length > 1;
            return hasPathParams;
        },
        hasQueryParams() {
            const apidocItem = this.$store.state.apidoc.apidocInfo?.item;
            const hasQueryParams = apidocItem && apidocItem.queryParams && apidocItem.queryParams.length > 1;
            return hasQueryParams;
        },
        hasBodyParams() {
            let hasRequestBody = false;
            const apidocItem = this.$store.state.apidoc.apidocInfo?.item;
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
    },
    watch: {
        currentSelectDoc: {
            handler(currentDoc, oldDoc) {
                if (currentDoc.tabType !== "doc") { //只处理类型为doc数据
                    if (this.cancel.length > 0) { //切换时都清除上一次请求
                        this.cancel.forEach((c) => {
                            c("取消请求");
                        })
                    }
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
    mounted() {
        this.initDrag()
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
        //获取接口数据
        getDocDetail() {
            if (!this.currentSelectDoc || !this.currentSelectDoc._id) { //没有id不请求数据
                return
            }
            const params = {
                _id: this.currentSelectDoc._id,
                projectId: this.$route.query.id,
            };
            if (this.cancel.length > 0) {
                this.cancel.forEach((c) => {
                    c("取消请求");
                })
            }
            setTimeout(() => { //hack让请求加载不受取消影响
                this.$store.commit("apidoc/changeApidocLoading", true);
            })
            this.axios.get("/api/project/doc_detail", {
                params,
                cancelToken: new CancelToken((c) => {
                    this.cancel.push(c);
                }),
            }).then((res) => {
                if (res === undefined) { //取消接口
                    return
                }
                if (res.data === null) { //接口不存在提示用户删除接口
                    this.confirmInvalidDoc();
                    return;
                }
                const resData = res.data;
                const apidocInfo = JSON.parse(JSON.stringify(resData));
                this.$store.commit("apidoc/changeApidocInfo", apidocInfo);
                this.broadcast("RequestBody", "dataReady");
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.$store.commit("apidoc/changeApidocLoading", false);
            });
        },
        //=====================================组件间操作====================================//
        //接口不存在提醒用户，可能是同时操作的用户删掉了这个接口导致接口不存在
        confirmInvalidDoc() {
            this.$confirm("当前接口不存在，可能已经被删除!", "提示", {
                confirmButtonText: "关闭接口",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                this.$store.commit("apidoc/deleteTabById", {
                    projectId: this.$route.query.id,
                    deleteIds: [this.currentSelectDoc._id],
                });
                if (!this.tabs.find((val) => val._id === this.currentSelectDoc._id)) { //关闭左侧后若在tabs里面无法找到选中节点，则取第一个节点为选中节点
                    this.$store.commit("apidoc/changeCurrentTab", {
                        _id: this.tabs[this.tabs.length - 1]._id,
                        projectId: this.$route.query.id,
                        name: this.tabs[this.tabs.length - 1].name,
                        changed: this.tabs[this.tabs.length - 1].changed,
                        tail: this.tabs[this.tabs.length - 1].tail,
                        tabType: "doc",
                    });
                }
            }).catch((err) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
        },
        //是否存在请求参数
        //=====================================其他操作====================================//
        //返回值转换为json
        convertResponseToJson(response) {
            const jsonResponse = this.convertPlainParamsToTreeData(response.values || []);
            return JSON.stringify(jsonResponse, null, 4);
        },
        //处理鼠标按下事件
        handleResizeMousedown(e) {
            this.mousedownLeft = e.clientX;
            this.responseWidth = this.$refs.response.getBoundingClientRect().width;
            this.isDragging = true;
            document.documentElement.addEventListener("mousemove", this.handleResizeMousemove);
        },
        //处理鼠标移动事件
        handleResizeMousemove(e) {
            e.stopPropagation();
            let moveLeft = 0;
            const { response } = this.$refs;
            moveLeft = this.mousedownLeft - e.clientX;
            const responseWidth = moveLeft + this.responseWidth;
            if (responseWidth < this.minWidth || responseWidth > this.maxWidth) {
                return;
            }
            localStorage.setItem("apidoc/responseWidth", moveLeft + this.responseWidth)
            response.style.width = `${moveLeft + this.responseWidth}px`;
        },
    },
};
</script>

<style lang="scss" scoped>
.view-content {
    display: flex;
    height: calc(100vh - #{size(100)});
    // 编辑区域
    .view-area {
        flex: 1;
        overflow: hidden;
        border-right: 1px solid $gray-400;
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
        width: size(500);
        position: relative;
        &>.bar {
           @include bar;
        }
    }
}
</style>
