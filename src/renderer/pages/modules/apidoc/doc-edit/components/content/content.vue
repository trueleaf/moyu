/*
    创建者：shuxiaokai
    创建时间：2020-07-06 17:57
    模块名称：文档书写区域区域
    备注：xxxx
*/
<template>
    <div v-if="tabs && tabs.length > 0" class="edit-content d-flex" tabindex="0">
        <div v-loading="loading2" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" class="border-right-teal workplace">
            <!-- 基本配置 -->
            <div class="request mb-2">
                <!-- 请求备注 -->
                <s-remark-manage v-model="request.description"></s-remark-manage>
                <!-- 服务端地址管理 -->
                <s-server-manage v-model="request.url.host"></s-server-manage>
                <!-- 请求操作区域 -->
                <s-request-manage :request="request" :data-ready="docDataReady"></s-request-manage>
                <hr>
            </div>
            <!-- 请求参数 -->
            <div class="params-wrap">
                <s-request-params :request="request" :nest="request.requestType !== 'query' && request.requestType !== 'formData'"></s-request-params>
                <!-- <s-params-tree 
                    ref="reqTree"
                    :tree-data="request.requestParams"
                    title="请求参数"
                    :ready="ready"
                    :is-form-data="request.requestType === 'formData'"
                    showCheckbox
                    :plain="currentReqeustLimit.contentType.length === 1 && currentReqeustLimit.contentType[0] === 'query'"
                >
                    <div slot="operation" class="operation d-flex h-100 flex1 pl-3 a-center">
                        <div class="op_item" @click.stop="dialogVisible3 = true">
                            <el-popover placement="top-start" width="200" trigger="hover" content="将json格式数据转换为请求或者返回参数，之前保存过的参数描述也会同时被转化">
                                <span slot="reference">
                                    <span>json转换</span>
                                    <i class="el-icon-warning theme-color"></i>
                                </span>
                            </el-popover>
                        </div>
                        <div class="op_item">
                            <el-dropdown trigger="click" :show-timeout="0" @command="handleSelectRequestPresetParams">
                                <div @click.stop.prevent="freshLocalUsefulParams">
                                    <el-popover placement="top-start" width="200" trigger="hover" content="应用一段常用的请求或者返回参数">
                                        <span slot="reference">
                                            <span class="cursor-pointer hover-theme-color">应用模板</span>
                                            <i class="el-icon-warning theme-color"></i>
                                        </span>
                                    </el-popover>                                
                                </div>
                                <div slot="dropdown">
                                    <el-dropdown-menu>
                                        <div class="manage-params">
                                            <div class="cyan mb-2">常用</div>
                                            <template v-for="(item, index) in usefulPresetRequestParamsList.slice(0, 3)">
                                                <span class="params-item">{{ item.name }}</span>
                                            </template>
                                            <span class="theme-color cursor-pointer ml-2" @click="dialogVisible5 = true,presetParamsType = 'request'">维护</span>
                                            <hr>
                                        </div>
                                        <el-dropdown-item v-for="(item, index) in presetRequestParamsList" :key="index" :command="item">
                                            <span class="d-flex j-between">
                                                <span>{{ item.name }}</span>
                                                <span class="gray-400">{{ item.creatorName }}</span>
                                            </span>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>                        
                                </div>
                            </el-dropdown>                            
                        </div>
                        <div class="op_item" @click="dialogVisible7 = true,presetParamsType = 'request'">
                            <el-popover placement="top-start" width="200" trigger="hover" content="将当前请求或者返回参数保存为模板">
                                <span slot="reference">
                                    <span>保存为模板</span>
                                    <i class="el-icon-warning theme-color"></i>
                                </span>
                            </el-popover>
                        </div>
                    </div>
                </s-params-tree> -->
                <s-params-tree ref="resTree" :tree-data="request.responseParams" title="响应参数">
                    <div slot="operation" class="operation d-flex h-100 flex1 pl-3 d-flex a-center">
                        <div class="op_item" @click.stop="dialogVisible4 = true">json转换</div>
                        <div class="op_item">
                            <el-dropdown trigger="click" :show-timeout="0" @command="handleSelectResponsePresetParams">
                                <span class="cursor-pointer hover-theme-color" @click.stop.prevent="freshLocalUsefulParams">快捷参数</span>
                                <div slot="dropdown">
                                    <el-dropdown-menu>
                                        <div class="manage-params">
                                            <div class="cyan mb-2">常用</div>
                                            <template v-for="(item, index) in usefulPresetResponseParamsList.slice(0, 3)">
                                                <span class="params-item">{{ item.name }}</span>
                                            </template>
                                            <span class="theme-color cursor-pointer ml-2" @click="dialogVisible5 = true,presetParamsType = 'response'">维护</span>
                                            <hr>
                                        </div>
                                        <el-dropdown-item v-for="(item, index) in presetResponseParamsList" :key="index" :command="item">
                                            <span class="d-flex j-between">
                                                <span>{{ item.name }}</span>
                                                <span class="gray-400">{{ item.creatorName }}</span>
                                            </span>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>                        
                                </div>
                            </el-dropdown>                            
                        </div>
                        <div class="op_item" @click="dialogVisible7 = true,presetParamsType = 'response'">
                            <span>保存为模板</span>
                        </div>
                    </div>
                </s-params-tree>
                <s-params-tree :tree-data="request.header" title="请求头" plain :fold="foldHeader" :valid-key="false"></s-params-tree>            
            </div>            
        </div>
        <div class="response-wrap">
            <s-response ref="response" :request-data="request"></s-response>
        </div>
        <s-json-schema :visible.sync="dialogVisible3" :plain="request.methods === 'get'" @success="handleConvertJsonToRequestParams"></s-json-schema>
        <s-json-schema :visible.sync="dialogVisible4" @success="handleConvertJsonToResponseParams"></s-json-schema>
        <s-internal-params :visible.sync="dialogVisible6"></s-internal-params>
        <s-dialog title="保存当前请求值为模板" :isShow.sync="dialogVisible7" width="30%">
            <s-form v-if="dialogVisible7" ref="form" :formInfo="formInfo">
                <s-form-item label="请输入模板名称" vModel="name" required :max-len="8" one-line></s-form-item>
            </s-form>  
            <div slot="footer">
                <el-button size="mini" type="primary" :loading="loading5" @click="handleAddRequestTemplate">确定</el-button>
                <el-button size="mini" type="warning" @click="dialogVisible7 = false">取消</el-button>
            </div>
        </s-dialog>
        <s-dialog title="保存当前返回值为模板" :isShow.sync="dialogVisible8" width="30%">
            <s-form v-if="dialogVisible8" ref="form2" :formInfo="formInfo2">
                <s-form-item label="请输入模板名称" vModel="name" required :max-len="8" one-line></s-form-item>
            </s-form>  
            <div slot="footer">
                <el-button size="mini" type="primary" :loading="loading6" @click="handleAddResponseTemplate">确定</el-button>
                <el-button size="mini" type="warning" @click="dialogVisible8 = false">取消</el-button>
            </div>
        </s-dialog>
    </div>
    <div v-else></div>
</template>

<script>
import axios from "axios" 
import uuid from "uuid/v4"
import qs from "qs"
import requestParams from "./components/request-params/request-params"
import paramsTree from "./components/params-tree"
import response from "./components/response"

import jsonSchema from "./dialog/json-schema"
import internalParams from "./dialog/internal-params"
import savePresetParamsTemplate from "./dialog/preset-params-temp"
import { dfsForest, findParentNode } from "@/lib/index"
//=========================================================================//
import serverManage from "./components/server"
import remarkManage from "./components/remark"
import requestManage from "./components/request"
//=========================================================================//
const CancelToken = axios.CancelToken;
export default {
    components: {
        "s-request-params": requestParams,
        "s-params-tree": paramsTree,
        "s-server-manage": serverManage,
        "s-remark-manage": remarkManage,
        "s-request-manage": requestManage,
        // "s-variable-manage": variableManage,
        // "s-preset-params": presetParams,
        "s-response": response,
        "s-json-schema": jsonSchema,
        "s-internal-params": internalParams,
        "s-save-preset-params-as-template": savePresetParamsTemplate,
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
            presetRequestParamsList: [], //------请求参数预设值
            usefulPresetRequestParamsList: [], //常用请求参数预设值
            presetResponseParamsList: [], //-----返回参数预设值
            usefulPresetResponseParamsList: [], //常用返回参数预设值
            presetParamsType: "", //-------------预设参数类型(请求参数，返回参数...)
            formInfo: {}, //---------------------请求参数模板信息
            formInfo2: {}, //--------------------返回参数模板信息
            currentReqeustLimit: { contentType: [] }, //----------当前请求限制条件
            //=====================================域名相关====================================//
            //=====================================其他参数====================================//
            // urlInvalid: false, //----------------url是否合法
            docDataReady: false, //文档数据是否加载完成
            cancel: [], //-----------------------需要取消的接口
            loading: false, //-------------------保存接口
            loading2: false, //------------------获取文档详情接口
            loading3: false, //------------------发送请求状态
            loading4: false, //------------------发布接口状态
            loading5: false, //------------------保存为请求值模板确认按钮
            loading6: false, //------------------保存为返回值模板确认按钮
            foldHeader: true, //-----------------是否折叠header，当校验错误时候自动展开header
            dialogVisible2: false, //------------全局变量管理弹窗
            dialogVisible3: false, //------------将json格式的请求参数转换为标准请求参数弹窗
            dialogVisible4: false, //------------将json格式的返回参数转换为标准返回参数弹窗
            dialogVisible5: false, //------------快捷参数维护弹窗
            dialogVisible6: false, //------------内置参数
            dialogVisible7: false, //------------保存为请求值模板
            dialogVisible8: false, //------------保存为返回值模板
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
        currentCondition() { //预发布满足提交的条件
            return this.$store.state.apidocRules.currentCondition
        },
      
        docRules() { //---------文档规则
            return this.$store.state.apidocRules;
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
        
    },
    methods: {
        //=====================================获取数据====================================//
        //获取预设参数枚举
        // getPresetEnum() {
        //     const params = {
        //         projectId: this.$route.query.id,
        //     };
        //     this.axios.get("/api/project/doc_preset_params_enum", { params }).then(res => {
        //         this.presetRequestParamsList = res.data.filter(val => val.presetParamsType === "request");
        //         this.presetResponseParamsList = res.data.filter(val => val.presetParamsType === "response");
        //     }).catch(err => {
        //         console.error(err);
        //     });
        // },
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
                this.loading2 = true;
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
                this.loading2 = false;
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

        //=====================================快捷操作====================================//
        handleConvertJsonToRequestParams(reqParams) {
            reqParams.forEach(val => {
                const matchMindParams = this.mindParams.mindRequestParams.find(p => p.key === val.key)
                if (matchMindParams) {
                    val.description = matchMindParams.description;
                }
            })
            this.request.requestParams = reqParams;
        },
        handleConvertJsonToResponseParams(resParams) {
            resParams.forEach(val => {
                const matchMindParams = this.mindParams.mindResponseParams.find(p => p.key === val.key)
                if (matchMindParams) {
                    val.description = matchMindParams.description;
                }
            })
            this.request.responseParams = resParams;
        },
        //选择快捷请求参数
        handleSelectRequestPresetParams(item) {
            let currentLocalData = localStorage.getItem("pages/presetParams/request") || "[]";
            currentLocalData = JSON.parse(currentLocalData);
            const findDoc = currentLocalData.find(val => val._id === item._id)
            if (!findDoc) {
                currentLocalData.push(item)
            } else {
                if (!findDoc.selectNum) {
                    findDoc.selectNum = 0;
                }
                findDoc.selectNum ++;                
            }
            localStorage.setItem("pages/presetParams/request", JSON.stringify(currentLocalData))
            const preParams = item.items.filter(val => val.key !== "" && val.value !== "");
            const reqParams = this.request.requestParams;
            for(let i = 0, len = preParams.length; i < len; i++) {
                const element = preParams[i];
                if (element.key === "" || element.value === "") {
                    continue;
                }
                if (!reqParams.find(val => val.key === element.key)) {
                    element.id = element._id;
                    reqParams.unshift(element);
                    setTimeout(() => { //hack
                        this.$refs["reqTree"].$refs["tree"].setChecked(element.id, true)
                    })
                }
            }
        },
        //选择快捷返回参数
        handleSelectResponsePresetParams(item) {
            let currentLocalData = localStorage.getItem("pages/presetParams/response") || "[]";
            currentLocalData = JSON.parse(currentLocalData);
            const findDoc = currentLocalData.find(val => val._id === item._id)
            if (!findDoc) {
                currentLocalData.push(item)
            } else {
                if (!findDoc.selectNum) {
                    findDoc.selectNum = 0;
                }
                findDoc.selectNum ++;                
            }
            localStorage.setItem("pages/presetParams/response", JSON.stringify(currentLocalData))
            const preParams = item.items.filter(val => val.key !== "" && val.value !== "");
            const reqParams = this.request.responseParams;
            for(let i = 0, len = preParams.length; i < len; i++) {
                const element = preParams[i];
                if (element.key === "" || element.value === "") {
                    continue;
                }
                if (!reqParams.find(val => val.key === element.key)) {
                    element.id = element._id;
                    reqParams.unshift(element);
                    setTimeout(() => { //hack
                        this.$refs["resTree"].$refs["tree"].setChecked(element.id, true)
                    })
                }
            }
        },
        //刷新本地快捷参数
        freshLocalUsefulParams() {
            const projectId = this.$route.query.id;
            let localReqParams = localStorage.getItem("pages/presetParams/request") || "{}";
            localReqParams = JSON.parse(localReqParams)[projectId] || [];
            localReqParams = localReqParams.sort((a, b) => a.selectNum < b.selectNum);
            let localResParams = localStorage.getItem("pages/presetParams/response") || "{}";
            localResParams = JSON.parse(localResParams)[projectId] || [];
            localResParams = localReqParams.sort((a, b) => a.selectNum < b.selectNum);
            this.usefulPresetResponseParamsList = localResParams;
            this.usefulPresetRequestParamsList = localReqParams;
        },
        //保存快捷输入参数
        saveMindParams() {
            const mindRequestParams = [];
            const mindResponseParams = [];
            dfsForest(this.request.responseParams, {
                rCondition(value) {
                    return value.children;
                },
                rKey: "children",
                hooks: (data) => {
                    if (data.key !== "" && data.value !== "" && data.description !== "") {
                        const copyData = JSON.parse(JSON.stringify(data));
                        mindResponseParams.push(copyData);
                    }
                    if (data.key !== "" && (data.type === "object" || data.type === "array") && data.description !== "") {
                        const copyData = JSON.parse(JSON.stringify(data));
                        copyData.children = []; //只记录扁平数据
                        mindResponseParams.push(copyData);
                    }
                }
            });
            dfsForest(this.request.requestParams, {
                rCondition(value) {
                    return value.children;
                },
                rKey: "children",
                hooks: (data) => {
                    if (data.key !== "" && data.value !== "" && data.description !== "") {
                        mindRequestParams.push(data);
                    }
                }
            });
            const projectId = this.$route.query.id;
            // let currentLocalRequestMindParams = localStorage.getItem("pages/mindParams/request") || "{}";
            // let currentLocalResponseMindParams = localStorage.getItem("pages/mindParams/response") || "{}";
            // currentLocalRequestMindParams = JSON.parse(currentLocalRequestMindParams);
            // currentLocalResponseMindParams = JSON.parse(currentLocalResponseMindParams);
            // currentLocalRequestMindParams[projectId] || (currentLocalRequestMindParams[projectId] = []); 
            // currentLocalResponseMindParams[projectId] || (currentLocalResponseMindParams[projectId] = []); 
            // for (let i = 0; i < mindRequestParams.length; i++ ) {
            //     const ele = mindRequestParams[i];
            //     const sameDoc = currentLocalRequestMindParams[projectId].find(val => (val.key === ele.key));
            //     if (!sameDoc) {
            //         currentLocalRequestMindParams[projectId].push(ele)
            //     } else {
            //         if (!sameDoc._selectNum) {
            //             sameDoc._selectNum = 0;
            //         }
            //         sameDoc._selectNum ++;                
            //     }
            //     localStorage.setItem("pages/mindParams/request", JSON.stringify(currentLocalRequestMindParams))
            // }
            // for (let i = 0; i < mindResponseParams.length; i++ ) {
            //     const ele = mindResponseParams[i];
            //     const sameDoc = currentLocalResponseMindParams[projectId].find(val => (val.key === ele.key));
            //     if (!sameDoc) {
            //         currentLocalResponseMindParams[projectId].push(ele)
            //     } else {
            //         if (!sameDoc._selectNum) {
            //             sameDoc._selectNum = 0;
            //         }
            //         sameDoc._selectNum ++;                
            //     }
            //     localStorage.setItem("pages/mindParams/response", JSON.stringify(currentLocalResponseMindParams))
            // }
            // const mindParamsList = [...mindRequestParams, ...mindResponseParams];
            // mindParamsList.forEach(val => {
            //     val._projectId = this.$route.query.id
            // })
            console.log(mindResponseParams)
            const params = {
                projectId,
                mindRequestParams,
                mindResponseParams,
            };
            this.axios.post("/api/project/doc_params_mind", params).then(res => {
                
            }).catch(err => {
                console.error(err);
            });
        },
        //保存为模板
        handleAddRequestTemplate() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    const params = {
                        name: this.formInfo.name,
                        presetParamsType: "request",
                        projectId: this.$route.query.id,
                        items: this.request.requestParams,
                    };
                    this.loading5 = true;
                    this.axios.post("/api/project/doc_preset_params", params).then(res => {
                        this.dialogVisible7 = false;
                        this.getPresetEnum();
                    }).catch(err => {
                        console.error(err);
                    }).finally(() => {
                        this.loading5 = false;
                    });
                } 
            });
        },
        handleAddResponseTemplate() {
            this.$refs["form2"].validate(valid => {
                if (valid) {
                    const params = {
                        name: this.formInfo2.name,
                        presetParamsType: "response",
                        projectId: this.$route.query.id,
                        items: this.response.responseParams,
                    };
                    this.loading6 = true;
                    this.axios.post("/api/project/doc_preset_params", params).then(res => {
                        this.dialogVisible8 = false;
                        this.getPresetEnum();
                    }).catch(err => {
                        console.error(err);
                    }).finally(() => {
                        this.loading6 = false;
                    });
                } 
            });
        },
        //=====================================其他操作=====================================//
        validateParams() {
            let isValidRequest = true;
            //=====================================检查请求url====================================//
            if (this.request.url.path.trim() === "") { 
                this.urlError.error = true;
                this.urlError.message = "请求url不能为空";
                isValidRequest = false;
            }
            //===========================检查参数是否必填或者按照规范填写======================//
            const deepMap = (requestData) => {
                for (let i = 0, len = requestData.length; i < len; i++) {
                    const params = requestData[i];
                    if (params.children) {
                        deepMap(params.children);
                    }
                    if (i !== len - 1 || params.key.trim() !== "") { //最后一个数据并且未填写值则不做处理
                        const valueType = params.type;
                        const parentNode = findParentNode(params.id, requestData);
                        const isParentArray = (parentNode && parentNode.type === "array"); //父元素为数组，不校验key因为数组元素不必填写key值
                        const isComplex = (valueType === "object" || valueType === "array"); //自身类型为复杂类型不校验参数值，参数值写在树形组件下层
                        const key = params.key;
                        const value = params.value;
                        const description = params.description;
                        if (!isParentArray && (key.trim() === "" || key.includes(" "))) { //禁止包含空字符串(key)
                            this.$set(params, "_keyError", {
                                error: true,
                                message: "不能存在空白字符串"
                            });
                            isValidRequest = false;
                        }
                        if (!isComplex) { //非对象，数组
                            if (value.trim() === "" || value.includes(" ")) { //非空判断
                                this.$set(params, "_valueError", {
                                    error: true,
                                    message: "不能存在空白字符串"
                                });
                                isValidRequest = false;
                            } else if (valueType === "number" && !value.match(/^-?(0\.\d+|[1-9]+\.\d+|[1-9]\d{0,20}|[0-9])$/)) {
                                this.$set(params, "_valueError", {
                                    error: true,
                                    message: "参数值必须为数字类型"
                                });
                                isValidRequest = false;
                            }
                        }
                        if (!isComplex && (description.trim() === "" || description.includes(" "))) { //禁止包含空字符串(description)
                            this.$set(params, "_descriptionError", {
                                error: true,
                                message: "不能存在空白字符串"
                            });
                            isValidRequest = false;
                        }
                    }
                }
            }
            deepMap(this.request.requestParams);
            deepMap(this.request.responseParams);
            deepMap(this.request.header);

            if (!isValidRequest) {
                this.$nextTick(() => {
                    const errorIptDom = document.querySelector(".v-input.valid-error .el-input__inner");
                    errorIptDom ? errorIptDom.focus() : null;
                })
            }
            return isValidRequest;
        },
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
        .operation {
            .op_item {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: size(0) size(10);
                cursor: pointer;
                margin-right: size(10);
                &:hover {
                    // background: mix($theme-color, $white, 80%);
                    color: $theme-color;
                }
            }
        }
    }
}
.manage-params {
    width: size(350);
    position: sticky;
    top: 0;
    // box-shadow: $box-shadow-sm;
    background: $white;
    padding: size(10) size(15) 0;
    .manage-config {
        padding: size(0) size(10);
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: size(30);
        background: $theme-color;        
    }
    .manage-ipt {
        display: flex;
        align-items: center;
        border-top: 1px dashed $gray-400;
        margin-top: size(10);
        input {
            flex: 1;
            height: size(30);
            line-height: size(30);
            border: none;
            text-indent: 1em;
            border-right: 1px solid $gray-400;
        }       
    }
    .params-item {
        display: inline-block;
        padding: size(2) size(10);
        cursor: pointer;
        background: $gray-200;
        margin-left: size(10);
        &:hover {
            background: $gray-300;
        }

    }
}

</style>
