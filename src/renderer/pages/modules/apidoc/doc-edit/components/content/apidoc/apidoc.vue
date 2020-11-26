/*
    创建者：shuxiaokai
    创建时间：2020-07-06 17:57
    模块名称：文档书写区域区域
    备注：xxxx
*/
<template>
    <div class="edit-content">
        <div v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" class="border-right-teal workplace">
            <!-- 基本配置 -->
            <div class="request mb-2">
                <!-- 请求备注 -->
                <s-remark-manage v-if="0" v-model="request.description"></s-remark-manage>
                <!-- 服务端地址管理 -->
                <s-server-manage v-model="request.url.host"></s-server-manage>
                <!-- 请求操作区域 -->
                <s-request-operation-manage ref="requestOperation" :request="request" :data-ready="docDataReady" @fresh="handleFresh"></s-request-operation-manage>
                <hr>
            </div>
            <!-- 请求参数 -->
            <div class="params-wrap">
                <s-request-params-manage ref="requestParams" :request="request" :data-ready="docDataReady"></s-request-params-manage>
                <s-response-params-manage ref="responseParams" :request="request" :data-ready="docDataReady"></s-response-params-manage>
                <s-header-params-manage ref="headerParams" :request="request" :data-ready="docDataReady"></s-header-params-manage>
                <s-remark-params-manage :request="request"></s-remark-params-manage>
            </div>            
        </div>
        <s-response class="response-wrap" ref="response" :request-data="request"></s-response>            
    </div>
</template>

<script>
import { debounce, dfsForest } from "@/lib"
import axios from "axios" 
import uuid from "uuid/v4"
import response from "./components/response"
import FileType from "file-type/browser"
//=========================================================================//
import remarkManage from "./components/remark" //-----------------------------------接口备注
import serverManage from "./components/server" //-----------------------------------请求地址列表
import requestOperationManage from "./components/request-operation" //--------------请求操作和url管理
import requestParamsManage from "./components/request-params" //--------------------请求参数管理
import responseParamsManage from "./components/response-params" //------------------返回参数管理
import headerParamsManage from "./components/header-params" //----------------------请求头管理
import remarkParamsManage from "./components/remark-params" //----------------------备注管理
//=========================================================================//
const CancelToken = axios.CancelToken;
export default {
    name: "APIDOC_CONTENT",
    components: {
        "s-request-params-manage": requestParamsManage,
        "s-response-params-manage": responseParamsManage,
        "s-header-params-manage": headerParamsManage,
        "s-remark-params-manage": remarkParamsManage,
        "s-server-manage": serverManage,
        "s-remark-manage": remarkManage,
        "s-request-operation-manage": requestOperationManage,
        "s-response": response,
    },
    data() {
        return {
            //=====================================请求基本信息====================================//
            request: {
                methods: "get", //---------------请求方式
                requestType: "query", //
                url: {
                    host: "", //-----------------主机(服务器)地址
                    path: "", //-----------------接口路径
                }, //----------------------------请求地址信息
                requestParams: [],
                responseParams: [],
                header: [], //----------------------------请求头信息
                description: "", //--------------请求描述
                _variableChange: true, //----------hack强制触发request数据发生改变
            },
            remoteResponse: {},
            //=====================================快捷参数====================================//
            watchFlag: null,
            debounceFn: null, //防抖函数
            cancel: [], //请求取消
            validError: false, //是否校验出错
            loading: false, //加载效果
            docDataReady: false, //文档数据是否加载完成
        };
    },
    computed: {
        currentSelectDoc() { //当前选中的doc
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
        tabs() { //全部tabs
            return this.$store.state.apidoc.tabs[this.$route.query.id];
        },
        variables() { //全局变量
            return this.$store.state.apidoc.variables || [];
        },
        originDocInfo() { //返回原始文档数据
            return this.$store.state.apidoc.originDocInfo;
        }
    },
    watch: {
        currentSelectDoc: {
            handler(val, oldVal) {
                if (val && this.currentSelectDoc.tabType === "doc") {
                    if (!oldVal || val._id !== oldVal._id) {
                        if (!this.currentSelectDoc.changed) { //没有发生改变重新拉取数据
                            this.$store.commit("apidoc/clearRespons");
                            this.getDocDetail();
                        } else {
                            this.db.findById("apidoc_doc", this.currentSelectDoc._id).then(data => {
                                this.$store.commit("apidoc/changeDocResponseInfo", data.docs); //改变接口完整返回值
                                this.formatRequestData(data.docs);
                                this.$refs["requestOperation"].fixContentType();
                                if (this.watchFlag) { //去除watch数据对比
                                    this.watchFlag();
                                }
                                this.watchFlag = this.$watch("request", debounce(() => {
                                    this.syncRequestParams();
                                    this.diffEditParams();
                                }, 100), {
                                    deep: true
                                })                                  
                            });
                        }
                    }
                }
            },
            deep: true,
            immediate: true
        },
    },
    mounted() {
    },
    methods: {
        //=====================================获取数据====================================//
        //手动刷新页面
        handleFresh() {
            if (!this.currentSelectDoc.changed) {
                this.$store.commit("apidoc/clearRespons");
                this.getDocDetail();
            } else {
                this.$confirm("刷新后未保存数据据将丢失", "提示", {
                    confirmButtonText: "刷新",
                    cancelButtonText: "取消",
                    type: "warning"
                }).then(() => {
                    this.$store.commit("apidoc/clearRespons");
                    this.getDocDetail();
                    this.$store.commit("apidoc/changeCurrentTabById", {
                        _id: this.currentSelectDoc._id,
                        projectId: this.$route.query.id,
                        changed: false
                    });
                }).catch(err => {
                    if (err === "cancel" || err === "close") {
                        return;
                    }
                    this.$errorThrow(err, this);
                });
            }
        },
        //获取文档详情
        getDocDetail() {
            if (!this.currentSelectDoc || !this.currentSelectDoc._id) { //没有id不请求数据
                return
            }
            const params = {
                _id: this.currentSelectDoc._id
            };
            if (this.cancel.length > 0) {
                this.cancel.forEach(c => {
                    c("取消请求");
                })
            }
            setTimeout(() => { //hack让请求加载不受取消影响
                this.loading = true;
                this.docDataReady = false;
            })
            this.axios.get("/api/project/doc_detail", {
                params,
                cancelToken: new CancelToken((c) => {
                    this.cancel.push(c);
                })
            }).then(res => {
                if (res === undefined) { //取消接口
                    return
                }
                if (res.data === null) { //接口不存在提示用户删除接口
                    this.confirmInvalidDoc();
                    return;
                }
                if (this.watchFlag) { //去除watch数据对比
                    this.watchFlag();
                }
                this.$store.commit("apidoc/changeDocResponseFullInfo", res.data); //改变接口完整返回值
                this.$store.commit("apidoc/changeDocResponseInfo", res.data.item); //改变接口内容
                this.formatRequestData(res.data.item);
                //触发子组件全选
                Promise.all([this.$refs["requestParams"].selectChecked(), this.$refs["headerParams"].selectAll()]).catch((err) => {
                    console.error(err);
                }).finally(() => {
                    this.$refs["requestOperation"].fixContentType();
                    this.$store.commit("apidoc/changeDocEditInfo", {
                        description: this.request.description,
                        header: this.request.header,
                        methods: this.request.methods,
                        requestParams: this.request.requestParams,
                        responseParams: this.request.responseParams,
                        url: this.request.url
                    }); //改变文档编辑内容，用于判断文档值是否发生了改变
                    this.watchFlag = this.$watch("request", debounce(() => {
                        this.syncRequestParams();
                        this.diffEditParams();
                    }, 100), {
                        deep: true
                    })   
                    // console.log(22222, this.request)                 
                })

            }).catch(err => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //将返回值
        formatRequestData(requestData) {
            Object.assign(this.request,requestData);
            dfsForest(this.request.requestParams, {
                rCondition(value) {
                    return value ? value.children : null;
                },
                rKey: "children",
                hooks: async (val, ) => {
                    //文件类型需要处理value值
                    if (val && val._value && val.type === "file") { 
                        //获取文件类型
                        const type = await FileType.fromBuffer(val._value);
                        const blobData = new Blob([val._value], { type: type.mime });
                        const blobUrl = URL.createObjectURL(blobData)
                        this.$set(val, "_fileInfo", {
                            mime: type.mime,
                            url: blobUrl,
                        });
                    }
                }
            });

            this.request.requestParams.forEach(val => this.$set(val, "id", val._id))
            this.request.responseParams.forEach(val => this.$set(val, "id", val._id))
            this.request.header.forEach(val => {
                this.$set(val, "id", val._id)
                if (val.key.toLowerCase() === "host") {
                    this.$set(val, "_readOnly", true)
                    this.$set(val, "value", "")
                }
                if (val.key.toLowerCase() === "content-type") {
                    this.$set(val, "_readOnly", true)
                    if (this.request.requestType === "query") {
                        this.$set(val, "value", "application/json; charset=utf-8")
                    } else if (this.request.requestType === "json") {
                        this.$set(val, "value", "application/json; charset=utf-8")
                    } else if (this.request.requestType === "formData") {
                        this.$set(val, "value", "multipart/form-data")
                    } else if (this.request.requestType === "x-www-form-urlencoded") {
                        this.$set(val, "value", "x-www-form-urlencoded")
                    }
                }
            })
            const matchedHost = this.request.header.find(val => val.key.toLowerCase() === "host");
            if (!matchedHost) {
                this.request.header.unshift({
                    id: uuid(),
                    key: "host", //--------------请求头键
                    value: location.host, //------------请求头值
                    type: "string", //-------请求头值类型
                    description: "host", //------描述
                    required: true, //-------是否必填
                    children: [], //---------子参数
                    _readOnly: true,
                });                    
            } else {
                matchedHost.id = uuid();
                matchedHost.key = "host";
                matchedHost.value = location.host;
                matchedHost.type = "string";
                matchedHost.description = "host";
                matchedHost.required = true;
                matchedHost._readOnly = true;
                matchedHost.children = [];
            }
            const matchedContentType = this.request.header.find(val => val.key.toLowerCase() === "content-type");
            if (!matchedContentType) {
                this.request.header.unshift({
                    id: uuid(),
                    key: "content-type", //--------------请求头键
                    value: "application/json; charset=utf-8", //------------请求头值
                    type: "string", //-------请求头值类型
                    description: "请求体的MIME类型", //------描述
                    required: true, //-------是否必填
                    children: [], //---------子参数
                    _readOnly: true,
                });
            } else {
                matchedContentType.id = uuid();
                matchedContentType.key = "content-type";
                matchedContentType.value = "application/json; charset=utf-8";
                matchedContentType.type = "string";
                matchedContentType.description = "请求体的MIME类型";
                matchedContentType.required = true;
                matchedContentType._readOnly = true;
                matchedContentType.children = [];
            }
            // this.currentReqeustLimit = this.docRules.requestMethod.config.find(val => val.name === res.data.item.methods);
            const reqParams = this.request.requestParams;
            const resParams = this.request.responseParams;
            const headerParams = this.request.header;
            const reqParamsLen = this.request.requestParams.length;
            const resParamsLen = this.request.responseParams.length;
            const headerParamsLen = this.request.header.length;
            const reqLastItemIsEmpty = (reqParams[reqParamsLen - 1] && reqParams[reqParamsLen - 1].key === "" && reqParams[reqParamsLen - 1].value === "");
            const resLastItemIsEmpty = (resParams[resParamsLen - 1] && resParams[resParamsLen - 1].key === "" && resParams[resParamsLen - 1].value === "");
            const headerLastItemIsEmpty = (headerParams[headerParamsLen - 1] && headerParams[headerParamsLen - 1].key === "" && headerParams[headerParamsLen - 1].value === "");
            if (reqParamsLen === 0 || !reqLastItemIsEmpty) this.request.requestParams.push(this.generateParams());
            if (resParamsLen === 0 || !resLastItemIsEmpty) this.request.responseParams.push(this.generateParams());
            if (headerParamsLen === 0 || !headerLastItemIsEmpty) this.request.header.push(this.generateParams());
            // if (this.request.url.host === "") this.request.url.host = location.origin;
            this.request.description = requestData.description;
            //根据实际请求类型修正tabs显示的请求类型(刷新和切换时候防止请求类型不一致)
            this.$store.commit("apidoc/changeTabInfoById", {
                _id: this.currentSelectDoc._id,
                projectId: this.$route.query.id,
                method: requestData.methods
            });
            //改变banner请求方式
            this.$store.commit("apidoc/changeDocBannerInfoById", {
                id: this.currentSelectDoc._id,
                method: requestData.methods
            });
        },
        generateParams() {
            return {
                id: uuid(),
                key: "", //--------------请求头键
                value: "", //------------请求头值
                type: "string", //-------请求头值类型
                description: "", //------描述
                required: true, //-------是否必填
                children: [], //---------子参数
            };
        },
        //接口不存在提醒用户，可能是同时操作的用户删掉了这个接口导致接口不存在
        confirmInvalidDoc() {
            this.$confirm("当前接口不存在，可能已经被删除!", "提示", {
                confirmButtonText: "关闭接口",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                this.$store.commit("apidoc/deleteTabById", {
                    projectId: this.$route.query.id,
                    deleteIds: [this.currentSelectDoc._id]
                });
                if (!this.tabs.find(val => val._id === this.currentSelectDoc._id)) { //关闭左侧后若在tabs里面无法找到选中节点，则取第一个节点为选中节点
                    this.$store.commit("apidoc/changeCurrentTab", {
                        projectId: this.$route.query.id,
                        activeNode: this.tabs[this.tabs.length - 1],
                    });
                }
            }).catch(err => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
        },
        //=====================================其他操作=====================================//
        //同步请求数据
        syncRequestParams() {
            console.log("同步");
            this.db.findByIdAndUpdate("apidoc_doc", this.currentSelectDoc._id, {
                docs: this.request
            });
            let savedRequest = JSON.parse(localStorage.getItem("apidoc/request") || "{}");
            if (!savedRequest[this.currentSelectDoc._id]) {
                savedRequest[this.currentSelectDoc._id] = {};
            }
            savedRequest[this.currentSelectDoc._id] = this.request;
            localStorage.setItem("apidoc/request", JSON.stringify(savedRequest))
        },
        //对比填写参数是否发送变化
        diffEditParams() {
            const orginBaseText = JSON.stringify(this.originDocInfo.url) + this.originDocInfo.description + this.originDocInfo.methods;
            const newBaseText = JSON.stringify(this.request.url) + this.request.description + this.request.methods;
            const orginHeaderText = JSON.stringify(this.originDocInfo.header) + JSON.stringify(this.originDocInfo.requestParams) + JSON.stringify(this.originDocInfo.responseParams);
            const newHeaderText = JSON.stringify(this.request.header) + JSON.stringify(this.request.requestParams) + JSON.stringify(this.request.responseParams);
            if (orginBaseText === newBaseText && orginHeaderText === newHeaderText) {
                this.$store.commit("apidoc/changeCurrentTabById", {
                    projectId: this.$route.query.id,
                    changed: false
                });
            } else {
                this.$store.commit("apidoc/changeCurrentTabById", {
                    projectId: this.$route.query.id,
                    changed: true
                });
            }
            // console.log(999, orginBaseText === newBaseText, orginHeaderText === newHeaderText)
        },
        //将变量转换为实际数据
        convertVariable(val) {
            if (val == null) {
                return;
            }
            const matchedData = val.toString().match(/{{\s*(\w+)\s*}}/);
            if (val && matchedData) {
                const varInfo = this.variables.find(v => {
                    return v.name === matchedData[1];
                });
                if (varInfo) {
                    return val.replace(/{{\s*(\w+)\s*}}/, varInfo.value);
                } else {
                    return val;
                }
            } else {
                return val;
            }
        },
    }
};
</script>



<style lang="scss">
.edit-content {
    display: flex;
    padding: size(10) size(0) size(10) size(20);
    @media only screen and (max-width: 1500px) {
        flex-direction: column;
        .response-wrap {
            padding: size(10);
            margin-top: size(10);
            border-top: 1px solid $gray-300;
            box-shadow: $box-shadow;
        }
        .response {
            height: auto;
        }
    }
    .workplace {
        flex: 0 0 65%;
    }
    .response-wrap {
        flex: 1 0 35%;
    }
    .params-wrap {
        max-height: calc(100vh - #{size(300)});
        overflow-y: auto;
    }
}


</style>
