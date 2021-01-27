/*
    创建者：shuxiaokai
    创建时间：2020-07-06 17:57
    模块名称：文档书写区域区域
    备注：xxxx
*/
<template>
    <div class="edit-content">
        <s-loading :loading="loading" class="edit-area">
            <!-- 基本配置 -->
            <div class="info-wrap">
                <s-host-manage></s-host-manage>
                <s-request-operation-manage></s-request-operation-manage>
            </div>
            <!-- 参数录入 -->
            <div class="params-wrap">
                <s-request-query-params ref="query"></s-request-query-params>
                <s-request-body-params ref="body" :disabled="apidocInfo.item && apidocInfo.item.method === 'get'" disabled-tip="GET请求只允许Query传参"></s-request-body-params>
                <s-response-params ref="response"></s-response-params>
                <s-header-params ref="header"></s-header-params>
                <s-remark></s-remark>
                <pre v-if="apidocInfo.item" class="h-300px scroll-y">{{ apidocInfo.item.queryParams }}</pre>
            </div>
        </s-loading>
        <div class="view-area">
            <s-overview></s-overview>
        </div>
    </div>
</template>

<script>
import axios from "axios"
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数
import hostManage from "./components/host/host.vue" //---------------------------------请求地址列表
import requestOperationManage from "./components/request-operation/request-operation.vue" //--------请求操作和url管理
import requestQueryParams from "./components/request-params/query.vue" //查询字符串
import requestBodyParams from "./components/request-params/body.vue" //body请求参数
import resParams from "./components/response-params/response-params.vue" //返回参数
import headerParams from "./components/header-params/header-params.vue" //请求头
import remark from "./components/remark/remark.vue" //备注信息
import overview from "./components/overview/overview.vue" //展示区域

const { CancelToken } = axios;
//=========================================================================//
export default {
    name: "APIDOC_CONTENT",
    mixins: [mixin],
    components: {
        "s-host-manage": hostManage,
        "s-request-operation-manage": requestOperationManage,
        "s-request-query-params": requestQueryParams,
        "s-request-body-params": requestBodyParams,
        "s-response-params": resParams,
        "s-header-params": headerParams,
        "s-remark": remark,
        "s-overview": overview,
    },
    watch: {
        currentSelectDoc: {
            handler(currentDoc, oldDoc) {
                if (currentDoc.tabType !== "doc") return; //只处理类型为doc数据
                if (!oldDoc || currentDoc._id !== oldDoc._id) { //这个判断代表只有是切换tab才会触发请求
                    this.checkCache(currentDoc);
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
        originApidocInfo() { //原始接口文档信息
            return this.$store.state.apidoc.originApidocInfo;
        },
        apidocInfo() { //接口文档信息
            return this.$store.state.apidoc.apidocInfo;
        },
        loading() {
            return this.$store.state.apidoc.apidocLoading;
        },
    },
    data() {
        return {
            //=====================================其他参数====================================//
            watchFlag: null, //用于清空录入参数变化的watch
            cancel: [], //----请求列表
        };
    },
    mounted() {},
    methods: {
        //=====================================获取数据====================================//
        //查看是否存在缓存
        checkCache(currentDoc) {
            //不管有没有缓存，都取消上一次的请求
            if (this.cancel.length > 0) {
                this.cancel.forEach((c) => {
                    c("取消请求");
                })
            }
            if (currentDoc.changed) { //存在缓存直接应用缓存
                this.db.findById("apidoc_doc", this.currentSelectDoc._id).then((data) => {
                    this.$store.commit("apidoc/changeApidocInfo", data.docs);
                    this.broadcast("REQUEST_BODY", "dataReady");
                    Promise.all([this.$refs.query.selectChecked(), this.$refs.body.selectChecked(), this.$refs.header.selectChecked()]).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        if (this.watchFlag) { //去除watch数据对比
                            this.watchFlag();
                        }
                        this.watchFlag = this.$watch("apidocInfo", this.$helper.debounce(() => {
                            this.syncRequestParams();
                            this.diffEditParams();
                        }), {
                            deep: true,
                        })
                    })
                });
            } else {
                this.$store.commit("apidoc/clearRespons"); //清空上一次返回数据
                this.getDocDetail();
            }
        },
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
                this.addOperateDateForApidoc(resData);
                const apidocInfo = JSON.parse(JSON.stringify(resData));
                const originApidocInfo = JSON.parse(JSON.stringify(resData));
                this.$store.commit("apidoc/changeApidocInfo", apidocInfo);
                this.$store.commit("apidoc/changeOriginApidocInfo", originApidocInfo);
                this.broadcast("REQUEST_BODY", "dataReady");
                Promise.all([this.$refs.query.selectChecked(), this.$refs.body.selectChecked(), this.$refs.header.selectChecked()]).catch((err) => {
                    console.error(err);
                }).finally(() => {
                    if (this.watchFlag) { //去除watch数据对比
                        this.watchFlag();
                    }
                    this.watchFlag = this.$watch("apidocInfo", this.$helper.debounce(() => {
                        this.syncRequestParams();
                        this.diffEditParams();
                    }), {
                        deep: true,
                    })
                })
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
        //对于请求参数和返回参数为空情况，默认添加一个操作数据
        addOperateDateForApidoc(resData) {
            const lastItemIsEmpty = (arrData) => {
                const len = arrData.length;
                const lastItem = arrData[len - 1];
                const lastIsEmpty = (!lastItem || lastItem.key !== "" || lastItem.value !== "");
                return lastIsEmpty;
            }
            const request = resData.item;
            const { queryParams, requestBody, responseParams, headers } = request;
            if (lastItemIsEmpty(queryParams)) {
                queryParams.push(this.generateProperty());
            }
            if (lastItemIsEmpty(requestBody)) {
                requestBody.push(this.generateProperty());
            }
            if (lastItemIsEmpty(headers)) {
                headers.push(this.generateProperty());
            }
            responseParams.forEach((response) => {
                if (lastItemIsEmpty(response.values)) {
                    response.values.push(this.generateProperty());
                }
            })
        },
        //同步请求数据
        syncRequestParams() {
            this.db.findByIdAndUpdate("apidoc_doc", this.currentSelectDoc._id, {
                docs: this.apidocInfo,
            });
            const savedDocInfo = JSON.parse(localStorage.getItem("apidoc/docInfo") || "{}");
            if (!savedDocInfo[this.currentSelectDoc._id]) {
                savedDocInfo[this.currentSelectDoc._id] = {};
            }
            savedDocInfo[this.currentSelectDoc._id] = this.apidocInfo;
            localStorage.setItem("apidoc/docInfo", JSON.stringify(savedDocInfo))
        },
        //对比填写参数是否发送变化
        diffEditParams() {
            //挑选参数字段需要对比的参数
            const pickerProperty = (property) => ({
                key: property.key,
                type: property.type,
                description: property.description,
                value: property.value,
                required: property.required,
                _select: property._select,
            });
            //挑选整个接口文档需要对比的参数
            const pickerValidDiffParams = (docInfo) => {
                const result = {
                    info: docInfo.info,
                    item: {
                        method: docInfo.item.method,
                        url: docInfo.item.url,
                        paths: docInfo.item.paths.map((val) => pickerProperty(val)),
                        queryParams: docInfo.item.queryParams.map((val) => pickerProperty(val)),
                        requestBody: docInfo.item.requestBody.map((val) => pickerProperty(val)),
                        responseParams: docInfo.item.responseParams.map((val) => pickerProperty(val)),
                        headers: docInfo.item.headers.map((val) => pickerProperty(val)),
                        contentType: docInfo.item.contentType,
                    },
                }
                return result;
            }
            const diffOriginApidocInfo = pickerValidDiffParams(this.originApidocInfo);
            const diffApidocInfo = pickerValidDiffParams(this.apidocInfo);
            const isEqual = this.$helper.isEqual(diffOriginApidocInfo, diffApidocInfo);
            if (isEqual) {
                this.$store.commit("apidoc/changeCurrentTabById", {
                    projectId: this.$route.query.id,
                    changed: false,
                });
            } else {
                this.$store.commit("apidoc/changeCurrentTabById", {
                    projectId: this.$route.query.id,
                    changed: true,
                });
            }
        },
    },
};
</script>

<style lang="scss">
.edit-content {
    display: flex;
    height: calc(100vh - #{size(100)});
    // 编辑区域
    .edit-area {
        border-right: 1px solid $gray-400;
        flex: 0 0 65%;
        .info-wrap {
            padding: size(10) size(20);
            box-shadow: 0 3px 2px $gray-400;
            position: relative;
            z-index: 1;
        }
        .params-wrap {
            padding: size(20);
            max-height: calc(100vh - #{size(230)});
            overflow-y: auto;
        }
    }
    // 展示区域
    .view-area {
        flex: 1 0 35%;
    }
    @media only screen and (max-width: 1440px) {
        flex-direction: column;
        .edit-area {
            flex: 0 0 auto;
        }
        .view-area {
            flex: 0 0 auto;
        }
    }
}
</style>
