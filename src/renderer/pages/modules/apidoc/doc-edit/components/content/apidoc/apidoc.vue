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
                <s-tag></s-tag>
            </div>
            <!-- 参数录入 -->
            <div class="params-wrap hidden-md">
                <s-request-path-params
                    v-if="apidocInfo.item && apidocInfo.item.paths && apidocInfo.item.paths.length > 0"
                    ref="path"
                    disabled-tip="当前项目配置该请求方法无法录入path参数，你可以在全局配置中更改该选项"
                >
                </s-request-path-params>
                <s-request-query-params ref="query" :disabled="!enableQueryParams" disabled-tip="当前项目配置该请求方法无法录入query参数，你可以在全局配置中更改该选项"></s-request-query-params>
                <s-request-body-params
                    ref="body"
                    :disabled="!enableBodyParams || (apidocInfo.item && apidocInfo.item.method === 'get')"
                    :disabled-tip="`${(apidocInfo.item && apidocInfo.item.method === 'get') ? 'GET请求只允许Query传参' : '当前项目配置该请求方法无法录入query参数，你可以在全局配置中更改该选项'} `"
                >
                </s-request-body-params>
                <s-response-params ref="response"></s-response-params>
                <s-header-params ref="header"></s-header-params>
                <s-remark></s-remark>
            </div>
        </s-loading>
        <div ref="response" class="view-area" :style="{'user-select': isDragging ? 'none' : 'auto'}">
            <div ref="bar" class="bar" :class="{active: isDragging}" @mousedown="handleResizeMousedown"></div>
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
import requestPathParams from "./components/request-params/path.vue" //path参数
import requestBodyParams from "./components/request-params/body.vue" //body请求参数
import resParams from "./components/response-params/response-params.vue" //返回参数
import headerParams from "./components/header-params/header-params.vue" //请求头
import remark from "./components/remark/remark.vue" //备注信息
import overview from "./components/overview/overview.vue" //展示区域
import tag from "./components/tag/tag.vue" //标签信息

const { CancelToken } = axios;
//=========================================================================//
export default {
    name: "ApidocContent",
    components: {
        "s-host-manage": hostManage,
        "s-request-operation-manage": requestOperationManage,
        "s-request-path-params": requestPathParams,
        "s-request-query-params": requestQueryParams,
        "s-request-body-params": requestBodyParams,
        "s-response-params": resParams,
        "s-header-params": headerParams,
        "s-remark": remark,
        "s-overview": overview,
        "s-tag": tag,
    },
    mixins: [mixin],
    data() {
        return {
            //=====================================记录录入时长===============================//
            startTime: null, //开始时间
            endTime: null, //结束时间
            writeSensitivity: 25000, //毫秒，文档录入灵敏度，25s内有操作都算作持续录入
            //=====================================拖拽参数====================================//
            minWidth: 300, //------------最小宽度
            maxWidth: 800, //------------最大宽度
            mousedownLeft: 0, //---------鼠标点击距离
            responseWidth: 0, //-----------response宽度
            isDragging: false, //--------是否正在拖拽
            //=====================================其他参数====================================//
            watchFlag: null, //用于清空录入参数变化的watch
            cancel: [], //----请求列表
            activeName: "s-a",
        };
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
        docRules() { //---------文档规则
            return this.$store.state.apidocRules;
        },
        enableQueryParams() {
            const rules = this.$store.state.apidocRules;
            const requestMethod = this.$store.state.apidoc.apidocInfo?.item?.method
            const matchedContentType = rules.requestMethods.find((val) => val.value === requestMethod);
            if (!matchedContentType) {
                return false;
            }
            const { enabledContenType } = matchedContentType;
            return enabledContenType.find((val) => val === "params");
        },
        enableBodyParams() {
            const rules = this.$store.state.apidocRules;
            const requestMethod = this.$store.state.apidoc.apidocInfo?.item?.method
            const matchedContentType = rules.requestMethods.find((val) => val.value === requestMethod);

            if (!matchedContentType) {
                return false;
            }
            const { enabledContenType } = matchedContentType;
            return enabledContenType.find((val) => (val === "json" || val === "form-data" || val === "x-www-form-urlencoded"));
        },
        contentType() {
            return this.$store.state.apidoc.apidocInfo?.item?.contentType;
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
                    this.checkCache(currentDoc);
                    this.resumeRemoteResponse(); //恢复远端请求
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
            document.documentElement.addEventListener("mouseup", () => {
                // e.stopPropagation();
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
                    //去除mock弹窗
                    data.docs.item.responseParams.forEach((response) => {
                        this.$helper.forEachForest(response.values, (value) => {
                            this.$set(value, "_visible", false)
                        });
                    })
                    this.$store.commit("apidoc/changeApidocInfo", data.docs);
                    this.$event.emit("apidoc/getCacheSuccess");
                    this.$event.emit("apidoc/changeApiDocInfo");
                    this.broadcast("RequestBody", "dataReady");
                    const { query, body, header } = this.$refs;
                    Promise.all([query.selectChecked(), body.selectChecked(), header.selectChecked()]).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        if (this.watchFlag) { //去除watch数据对比
                            this.watchFlag();
                        }
                        this.watchFlag = this.$watch("apidocInfo", this.$helper.debounce(() => {
                            this.syncRequestParams();
                            this.diffEditParams();
                            this.calcSpendTime(); //计算编写接口花费的时间
                        }, 50), {
                            deep: true,
                        })
                    })
                }).catch((err) => {
                    console.error(err);
                });
            } else {
                this.getDocDetail();
            }
        },
        //恢复上次远端返回
        resumeRemoteResponse() {
            this.$store.commit("apidoc/clearRespons")
            let remoteResponse = localStorage.getItem("apidoc/remoteResponse") || "{}";
            remoteResponse = JSON.parse(remoteResponse);
            if (remoteResponse[this.currentSelectDoc._id]) {
                this.$store.commit("apidoc/changeRemoteResponse", remoteResponse[this.currentSelectDoc._id]);
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
                //去除mock弹窗
                res.data.item.responseParams.forEach((response) => {
                    this.$helper.forEachForest(response.values, (value) => {
                        this.$set(value, "_visible", false)
                    });
                })
                const resData = res.data;
                this.addOperateDateForApidoc(resData);
                const apidocInfo = JSON.parse(JSON.stringify(resData));
                const originApidocInfo = JSON.parse(JSON.stringify(resData));
                this.$store.commit("apidoc/changeApidocInfo", apidocInfo);
                this.$store.commit("apidoc/changeOriginApidocInfo", originApidocInfo);
                this.$event.emit("apidoc/changeApiDocInfo");
                this.broadcast("RequestBody", "dataReady");
                const { query, body, header } = this.$refs;
                Promise.all([query.selectChecked(), body.selectChecked(), header.selectChecked()]).catch((err) => {
                    console.error(err);
                }).finally(() => {
                    if (this.watchFlag) { //去除watch数据对比
                        this.watchFlag();
                    }
                    this.watchFlag = this.$watch("apidocInfo", this.$helper.debounce(() => {
                        this.syncRequestParams();
                        this.diffEditParams();
                        this.calcSpendTime(); //计算编写接口花费的时间
                    }, 50), {
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
                let lastIsEmpty = false;
                const lastItem = arrData[len - 1];
                const isComplex = lastItem && (lastItem.type === "array" || lastItem.type === "object");
                if (!lastItem) {
                    lastIsEmpty = true;
                } else if (isComplex) {
                    lastIsEmpty = false;
                } else if (lastItem.key !== "" || lastItem.value !== "") {
                    lastIsEmpty = true;
                }
                return lastIsEmpty;
            }
            const request = resData.item;
            const { queryParams, requestBody, responseParams, headers } = request;
            if (lastItemIsEmpty(queryParams)) {
                queryParams.push(this.generateProperty());
            }
            if (lastItemIsEmpty(requestBody) && this.contentType === "application/json") {
                const property = this.generateProperty("object");
                property.key = "根元素";
                property.children.push(this.generateProperty());
                requestBody.push(property);
            }
            if (responseParams.length === 0) {
                responseParams.push({
                    title: "成功返回",
                    values: [this.generateProperty()],
                });
            }
            //添加默认headers
            const defaultHeaders = this.generateDefaultHeaders(resData);
            request.headers = this.$helper.unique(defaultHeaders.concat(headers), "key"); //默认header会覆盖远程返回header
            if (lastItemIsEmpty(request.headers)) {
                request.headers.push(this.generateProperty());
            }
            responseParams.forEach((response) => {
                if (lastItemIsEmpty(response.values)) {
                    const property = this.generateProperty("object");
                    property.key = "根元素";
                    property.children.push(this.generateProperty());
                    response.values.push(property);
                }
            })
            //如果无请求server则添加本地上次选择的server
            let localServer = localStorage.getItem("apidoc/server") || "{}";
            localServer = JSON.parse(localServer);
            localServer = localServer[this.$route.query.id];
            if (localServer && !resData.item.url.host) {
                resData.item.url.host = localServer;
            }
        },
        //生成默认请求头
        generateDefaultHeaders(resData) {
            const userAgent = this.generateProperty();
            const contentType = this.generateProperty();
            const host = this.generateProperty();
            host._readOnly = true;
            host.key = "Host";
            host.description = "主机信息";
            host.value = "自动生成";
            userAgent._readOnly = true;
            userAgent.key = "user-agent";
            userAgent.value = "moyu(https://github.com/trueleaf/moyu)";
            userAgent.description = "用户代理";
            contentType._readOnly = true;
            contentType.key = "content-type";
            contentType.value = resData.item.contentType;
            contentType.description = "内容类型";
            return [userAgent, contentType, host];
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
            const pickerProperty = (arrData) => {
                if (!arrData) {
                    return [];
                }
                const result = this.$helper.recursivePicker(arrData, {
                    condition(item) {
                        const isComplex = item.type === "array" || item.type === "object"
                        return isComplex || item.key !== "" || item.value !== "";
                    },
                    fields: ["key", "type", "description", "value", "required"],
                });
                return result;
            };
            //挑选整个接口文档需要对比的参数
            const pickerValidDiffParams = (docInfo) => {
                const responseParams = [];
                docInfo.item?.responseParams.forEach((response) => {
                    response.values.forEach((val) => {
                        responseParams.push(val);
                    });
                })
                const result = {
                    info: docInfo.info,
                    item: {
                        method: docInfo.item?.method,
                        url: docInfo.item?.url,
                        paths: pickerProperty(docInfo.item?.paths),
                        queryParams: pickerProperty(docInfo.item?.queryParams),
                        requestBody: pickerProperty(docInfo.item?.requestBody),
                        responseParams: pickerProperty(responseParams),
                        headers: pickerProperty(docInfo.item?.headers),
                        contentType: docInfo.item?.contentType,
                    },
                }
                return result;
            }
            const diffOriginApidocInfo = pickerValidDiffParams(this.originApidocInfo);
            const diffApidocInfo = pickerValidDiffParams(this.apidocInfo);
            const isEqual = this.$helper.isEqual(diffOriginApidocInfo, diffApidocInfo);
            if (isEqual) {
                this.$store.commit("apidoc/changeCurrentTabInfo", {
                    projectId: this.$route.query.id,
                    changed: false,
                });
            } else {
                this.$store.commit("apidoc/changeCurrentTabInfo", {
                    projectId: this.$route.query.id,
                    changed: true,
                });
            }
        },
        //计算接口录入花费的时间
        calcSpendTime() {
            let spendTime = 0;
            if (!this.startTime) { //开始时间
                this.startTime = Date.now() - 300;
            }
            if (Date.now() - this.startTime > this.writeSensitivity) { //超过限制时间没有录入接口则默认花费时间为0
                this.startTime = null;
                this.endTime = null;
                spendTime = 0;
            } else { //在限制时间内则说明用户一直在录入
                spendTime = Date.now() - this.startTime;
                this.startTime = Date.now();
            }
            const currentDocUsedTime = JSON.parse(localStorage.getItem("apidoc/spendTime") || "{}");
            if (!currentDocUsedTime[this.currentSelectDoc._id]) {
                currentDocUsedTime[this.currentSelectDoc._id] = 0;
            }
            currentDocUsedTime[this.currentSelectDoc._id] += spendTime;
            localStorage.setItem("apidoc/spendTime", JSON.stringify(currentDocUsedTime));
        },
        //=====================================其他操作====================================//
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
            // bar.style.left = `${moveLeft}px`;
            response.style.width = `${moveLeft + this.responseWidth}px`;
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
        flex: 1;
        overflow: hidden;
        .info-wrap {
            position: sticky;
            top: 0;
            padding: size(10) size(20);
            box-shadow: 0 3px 2px $gray-400;
            background: $white;
            z-index: $zIndex-request-info-wrap;
        }
        .params-wrap {
            padding: size(20);
            max-height: calc(100vh - #{size(230)});
            overflow-y: auto;
        }
    }
    // 展示区域
    .view-area {
        flex-grow: 0;
        flex-shrink: 0;
        width: size(500);
        position: relative;
        &>.bar {
            @include bar;
        }
    }
    .show-md {
        display: none;
    }
    // @media only screen and (max-width: 1440px) {
    //     display: block;
    //     .hidden-md {
    //         display: none;
    //     }
    //     .show-md {
    //         display: block;
    //     }
    //     .params-sm-wrap {
    //         display: block;
    //         padding: 0 size(10);
    //         height: size(300);
    //         overflow-y: auto;
    //         box-shadow: 0 3px 2px $gray-400;
    //         .el-tabs__header {
    //             margin: 0;
    //         }
    //     }
    //     .edit-area {
    //         flex: 0 0 auto;
    //     }
    //     .view-area {
    //         width: 100%;
    //         .request-view {
    //             display: none;
    //         }
    //         .response-view {
    //             flex: 0 0 calc(100vh - #{size(530)});
    //             min-height: size(300);
    //         }
    //         .body-view {
    //             height: calc(100vh - #{size(625)});
    //             min-height: size(200);
    //         }
    //     }
    // }
}
</style>
