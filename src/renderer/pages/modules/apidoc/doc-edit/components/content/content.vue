/*
    创建者：shuxiaokai
    创建时间：2020-07-06 17:57
    模块名称：文档书写区域区域
    备注：xxxx
*/
<template>
    <div v-if="tabs && tabs.length > 0" class="edit-content d-flex" tabindex="0">
        <div v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" class="border-right-teal workplace">
            <!-- 基本配置 -->
            <div class="request mb-2">
                <!-- 请求备注 -->
                <s-remark-manage v-model="request.description"></s-remark-manage>
                <!-- 服务端地址管理 -->
                <s-server-manage v-model="request.url.host"></s-server-manage>
                <!-- 请求操作区域 -->
                <s-request-operation-manage :request="request" :data-ready="docDataReady"></s-request-operation-manage>
                <hr>
            </div>
            <!-- 请求参数 -->
            <div class="params-wrap">
                <s-request-params-manage :request="request" :data-ready="docDataReady"></s-request-params-manage>
                <s-response-params-manage :request="request" :data-ready="docDataReady"></s-response-params-manage>
                <s-header-params-manage :request="request" :data-ready="docDataReady"></s-header-params-manage>
            </div>            
        </div>
        <div class="response-wrap">
            <s-response ref="response" :request-data="request"></s-response>
        </div>
    </div>
    <div v-else></div>
</template>

<script>
import axios from "axios" 
import uuid from "uuid/v4"
import response from "./components/response"
//=========================================================================//
import remarkManage from "./components/remark" //-----------------------------------接口备注
import serverManage from "./components/server" //-----------------------------------请求地址列表
import requestOperationManage from "./components/request-operation" //--------------请求操作和url管理
import requestParamsManage from "./components/request-params" //--------------------请求参数管理
import responseParamsManage from "./components/response-params" //------------------返回参数管理
import headerParamsManage from "./components/header-params" //------------------请求头管理
//=========================================================================//
const CancelToken = axios.CancelToken;
export default {
    components: {
        "s-request-params-manage": requestParamsManage,
        "s-response-params-manage": responseParamsManage,
        "s-header-params-manage": headerParamsManage,
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
                requestParams: [
                    {
                        id: uuid(),
                        key: "", //--------------请求参数键
                        value: "", //------------请求参数值
                        type: "string", //-------------请求参数值类型
                        description: "", //------描述
                        required: true, //-------是否必填
                        children: [], //---------子参数
                    }
                ],
                responseParams: [
                    {
                        id: uuid(),
                        key: "", //--------------请求参数键
                        value: "", //------------请求参数值
                        type: "string", //-------------请求参数值类型
                        description: "", //------描述
                        required: true, //-------是否必填
                        children: [], //---------子参数
                    }
                ],
                header: [
                    {
                        id: uuid(),
                        key: "", //--------------请求头键
                        value: "", //------------请求头值
                        type: "string", //-------请求头值类型
                        description: "", //------描述
                        required: true, //-------是否必填
                        children: [], //---------子参数
                    }
                ], //----------------------------请求头信息
                description: "在这里输入文档描述", //--------------请求描述
                _variableChange: true, //----------hack强制触发request数据发生改变
            },
            //=====================================快捷参数====================================//
            cancel: [], //请求取消
            validError: false, //是否校验出错
            loading: false, //加载效果
            docDataReady: false, //文档数据是否加载完成
            ready: false, //---------------------是否完成第一次数据请求
        };
    },
    computed: {
        currentSelectDoc() { //当前选中的doc
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
        tabs() { //全部tabs
            return this.$store.state.apidoc.tabs[this.$route.query.id];
        },
        mindParams() {
            return this.$store.state.apidoc.mindParams;
        },
    },
    watch: {
        currentSelectDoc: {
            handler(val, oldVal) {
                if (val) {
                    if (!oldVal || val._id !== oldVal._id) {
                        this.$store.commit("apidocRules/resetCondition");
                        this.getDocDetail();
                    }
                }
            },
            deep: true,
            immediate: true
        }
    },
    mounted() {
        this.getMindParamsEnum(); //获取联想参数枚举
        this.getPresetParams(); //获取预设参数
    },
    methods: {
        //=====================================获取数据====================================//
        //获取联想参数
        getMindParamsEnum() {
            this.$store.dispatch("apidoc/getMindParamsEnum", {
                projectId: this.$route.query.id,
            });
        },
        //获取预设参数
        getPresetParams() {
            this.$store.dispatch("apidoc/getPresetParams", {
                projectId: this.$route.query.id,
            });
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
                this.ready = false;
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
                this.ready = true;
                Object.assign(this.request, res.data.item);
                this.request.requestParams.forEach(val => this.$set(val, "id", val._id))
                this.request.responseParams.forEach(val => this.$set(val, "id", val._id))
                this.request.header.forEach(val => this.$set(val, "id", val._id))
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
                if (this.request.url.host === "") this.request.url.host = location.origin;
                this.request.description = res.data.item.description || "在这里输入文档描述";
                //根据实际请求类型修正tabs显示的请求类型(刷新和切换时候防止请求类型不一致)
                this.$store.commit("apidoc/changeTabInfoById", {
                    _id: this.currentSelectDoc._id,
                    projectId: this.$route.query.id,
                    method: res.data.item.methods
                });
                //改变banner请求方式
                this.$store.commit("apidoc/changeDocBannerInfoById", {
                    id: this.currentSelectDoc._id,
                    method: res.data.item.methods
                });
                this.docDataReady = true;
                
            }).catch(err => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
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
          
    }
};
</script>



<style lang="scss">
.edit-content {
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
    .request {
        .el-radio {
            margin-right: size(10);
        }
    }
    .params-wrap {
        max-height: calc(100vh - 350px);
        overflow-y: auto;
    }
}


</style>
