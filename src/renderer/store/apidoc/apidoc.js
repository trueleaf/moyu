/**
 * @description        apidoc相关store
 * @author             shuxiaokai
 * @create             2020-06-25 11:25
 */
import Vue from "vue"
import http from "@/api/api.js"
import { findoNode, throttle } from "@/lib"
import HttpClient from "@/../main/http"
const httpClient = new HttpClient();


const axios = http.axios;
export default {
    namespaced: true,
    state: {
        //========================初始化接口所需参数数据=======================//
        variables: [], //--------------接口文档全局变量
        hostEnum: [], //---------------全局host数据
        mindParams: { //--------------文档联想参数
            mindRequestParams: [],
            mindResponseParams: []
        },
        presetParamsList: [], //-------预设参数列表

        //===============================远程返回数据=========================//
        apidocInfo: {}, //------------接口文档详情
        banner: [], //----------------树形导航
        tabs: {}, //------------------api文档tabs
        activeDoc: {}, //-------------当前被选中的tab页
        
        responseData: {//返回参数
            headers: {},
            contentType: null,
            httpVersion: null,
            statusCode: null,
            mime: null,
            rt: null,
            value: null,
            size: null,
            total: null,
            percent: null
        }, 
        remoteResponseEqualToLocalResponse: false, //远程返回结果是否和本地相同
        
        
        //=====================================其他参数====================================//
        apidocLoading: false, //是否正在请求api文档
        loading: false, //是否正在请求数据
        paramsValid: true, //参数是否满足校验需求
    },
    mutations: {
        //===============初始化接口所需参数数据(例如：全局变量，全局域名信息等)==============//
        //初始化全局变量
        initVariables(state, payload) {
            state.variables = payload;
        },
        //初始化host枚举
        initHostEnum(state, payload) {
            state.hostEnum = payload;
        },
        //初始化联想参数，输入提示
        initMindParams(state, payload) {
            state.mindParams.mindRequestParams = payload.mindRequestParams;
            state.mindParams.mindResponseParams = payload.mindResponseParams;
        },
        //初始化预设参数模板
        initPresetParams(state, payload) {
            state.presetParamsList = payload;
        },
        //=====================================banner====================================//
        //改变文档banner
        changeDocBanner(state, payload) {
            state.banner = payload;
        },
        //根据id改变文档banner信息
        changeDocBannerInfoById(state, payload) {
            const { id, method } = payload;
            const matchedData = findoNode(id, state.banner, null, { id: "_id" });
            if (matchedData && method) {
                matchedData.item.methods = method;
            }
            // console.log(state.banner, matchedData, 222)
        },
        //=====================================tabs====================================//
        //新增一个tab
        addTab(state, payload) {
            const { _id, projectId } = payload;
            const docInfo = payload;
            const isInProject = state.tabs[projectId]; //当前项目是否存在tabs
            if (!isInProject) {
                Vue.set(state.tabs, projectId, []);
            }
            const hasTab = state.tabs[projectId].find(val => val._id === _id);
            if (!hasTab) {
                if (state.tabs[projectId].length === 7) { //7这个值是预估的不准确
                    state.tabs[projectId].unshift(docInfo);
                } else if (state.tabs[projectId].length > 7) {
                    state.tabs[projectId][0] = docInfo;
                } else {
                    state.tabs[projectId].push(docInfo);
                }
                localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs))
            }
        },
        //改变某个tab信息
        changeTabInfoById(state, payload) {
            const { _id, projectId, name, method, changed } = payload;
            const matchedData = state.tabs[projectId].find(val => val._id === _id);
            if (matchedData && name) {
                matchedData.name = name;
            }
            if (matchedData && method && matchedData.item) {
                matchedData.item.methods = method;
            }
            if (matchedData && changed != null) {
                Vue.set(matchedData, "changed", changed)
            }
            localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs))
        },
        //更新所有tab
        updateAllTabs(state, payload) {
            const { projectId, tabs } = payload;
            if (!state.tabs[projectId]) {
                Vue.set(state.tabs, projectId, []);
            }
            state.tabs[projectId] = tabs;
        },
        //根据位置删除tab
        deleteTabByPosition(state, payload) {
            const { projectId, start, num } = payload;
            if (state.tabs[projectId]) {
                state.tabs[projectId].splice(start, num);
            }
            localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs))
        },
        //根据id删除tab
        deleteTabById(state, payload) {
            const { projectId, deleteIds } = payload;
            if (state.tabs[projectId]) {
                state.tabs[projectId] = state.tabs[projectId].filter(val => {
                    return deleteIds.indexOf(val._id) === -1;
                })
            }
            localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs))
        },
        //=====================================当前选中的tab====================================//
        //更新当前被选中的文档(不能为folder)
        changeCurrentTab(state, payload) {
            const { projectId, activeNode } = payload;
            const isInProject = state.activeDoc[projectId]; //当前项目是否存在tabs
            if (!isInProject) {
                Vue.set(state.activeDoc, projectId, {});
            }
            state.activeDoc[projectId] = activeNode;
            localStorage.setItem("apidoc/activeTab", JSON.stringify(state.activeDoc))
        },
        //改变当前选中tab的基本信息
        changeCurrentTabById(state, payload) {
            const { projectId, name, changed } = payload;
            this.commit("apidoc/changeTabInfoById", {
                _id: state.activeDoc[projectId]._id,
                projectId,
                name,
                changed
            });
            const matchedData = state.activeDoc[projectId];
            if (matchedData && name) {
                matchedData.name = name;
            }
            if (matchedData) {
                matchedData.changed = changed;
            }
            localStorage.setItem("apidoc/activeTab", JSON.stringify(state.activeDoc))
        },
        //=====================================请求参数录入====================================//
        //改变接口请求状态
        changeApidocLoading(state, loading) {
            state.apidocLoading = loading;
        },
        //改变接口返回值
        changeDocDetail(state, payload) {
            state.apidocInfo = payload;
        },
        //改变host的值
        changeDocHost(state, payload) {
            state.apidocInfo.item.url.host = payload;
        },
        //改变请求路径
        changeDocPath(state, payload) {
            state.apidocInfo.item.url.path = payload;
        },
        //改变请求方法
        changeDocMethod(state, payload) {
            state.apidocInfo.item.method = payload;
        },
        //=====================================发送请求====================================//
        //是否校验通过
        changeParamsValid(state, isValid) {
            state.paramsValid = isValid
        },
        //改变文档信息
        changeDocResponseFullInfo(state, payload) {
            state.docFullInfo = payload;
        },
        changeDocResponseInfo(state, payload) {
            state.docInfo = payload;
        },
        //将接口变化得内容存放起来，用于监听接口是否发生变化
        changeDocEditInfo(state, payload) {
            // description,header,methods,requestParams,responseParams,url
            state.originDocInfo = JSON.parse(JSON.stringify(payload));
        },
        //改变基础返回信息
        changeResponseInfo(state, payload) {
            state.responseData.headers = payload.headers;
            state.responseData.contentType = payload.contentType;
            state.responseData.httpVersion = payload.httpVersion;
            state.responseData.statusCode = payload.statusCode;
        },
        //改变大小
        changeResponseProcess(state, payload) {
            const { size, percent, total } = payload;
            if (size != null) {
                state.responseData.size = size; 
            }
            if (percent != null) {
                state.responseData.percent = percent; 
            }
            if (total != null) {
                state.responseData.total = total; 
            }
        },
        //改变基础返回指标数据
        changeResponseIndex(state, payload) {
            state.responseData.mime = payload.mime;
            state.responseData.rt = payload.rt;            
            state.responseData.size = payload.size;            
            state.responseData.value = payload.value;            
        },
        //改变loading效果
        changeLoading(state, loading) {
            state.loading = loading;
        },
        //重置返回值信息
        clearRespons(state) {
            state.responseData = {
                headers: {},
                contentType: null,
                httpVersion: null,
                statusCode: null,
                mime: null,
                rt: null,
                value: null,
                size: null,
                total: null,
                percent: null
            };
            state.remoteResponseEqualToLocalResponse = false;
        },
        //本地录入参数是否与远程返回参数一致
        changeCondition(state, isValid) {
            state.remoteResponseEqualToLocalResponse = isValid;
        },
    },
    actions: {
        //获取文档左侧banner
        async getDocBanner(context, payload) {
            return new Promise((resolve, reject) => {
                const params = {
                    projectId: payload.projectId
                };
                axios.get("/api/project/doc_tree_node", { params }).then(res => {
                    const result = res.data;
                    context.commit("changeDocBanner", result);
                    resolve();
                }).catch(err => {
                    reject(err);
                });                
            })
        },
        //获取全局变量
        async getDocVariable(context, payload) {
            return new Promise((resolve, reject) => {
                const params = {
                    projectId: payload.projectId
                };
                axios.get("/api/project/project_variable_enum", { params }).then(res => {
                    const result = res.data;
                    context.commit("initVariables", result);
                    resolve();
                }).catch(err => {
                    console.error(err);
                    reject(err);
                });                
            })
        },
        //获取文档请求参数
        async getMindParamsEnum(context, payload) {
            return new Promise((resolve, reject) => {
                const params = {
                    projectId: payload.projectId
                };
                axios.get("/api/project/doc_params_mind", { params }).then(res => {
                    const result = res.data;
                    context.commit("initMindParams", result);
                    resolve();
                }).catch(err => {
                    reject(err)
                    console.error(err);
                });              
            })
        },
        //获取预设参数列表
        async getPresetParams(context, payload) {
            return new Promise((resolve, reject) => {
                const params = {
                    projectId: payload.projectId
                };
                axios.get("/api/project/doc_preset_params_enum", { params }).then(res => {
                    const result = res.data;
                    context.commit("initPresetParams", result);
                    resolve();
                }).catch(err => {
                    reject(err)
                    console.error(err);
                });              
            })
        },
        //获取全局host
        async getHostEnum(context, payload) {
            return new Promise((resolve, reject) => {
                const params = {
                    projectId: payload.projectId
                };
                axios.get("/api/project/doc_service", { params }).then(res => {
                    context.commit("initHostEnum", res.data);
                    resolve();
                }).catch(err => {
                    reject(err)
                })
                            
            })
        },


        /** 
         * @description        发送请求
         * @author             shuxiaokai
         * @create             2020-12-11 14:59
         * @param {url}        url - 请求url       
         * @param {method}     method - 请求方法       
         * @param {headers}    headers - 请求头       
         * @param {data}       data - 请求数据       
         */
        sendRequest(context, payload) {
            return new Promise((resolve, reject) => {
                const { url, method, headers, data, requestType } = payload;
                console.log(url, method, headers, data, requestType);
                context.commit("changeLoading", true)
                httpClient.request(url, {
                    method,
                    headers,
                    data,
                    requestType
                })
                httpClient.once("response", response => {
                    // console.log("response", response)
                    context.commit("changeResponseInfo", response);
                })
                httpClient.once(err => {
                    reject(err);
                });
                httpClient.once("end", (result) => {
                    context.commit("changeResponseIndex", result);
                    context.commit("changeLoading", false)
                    context.commit("changeResponseProcess", {
                        percent: 1,
                    });
                    resolve(result);
                })     
                httpClient.once("process", throttle((process) => {
                    context.commit("changeResponseProcess", {
                        size: process.transferred,
                        percent: process.percent,
                        total: process.total,
                    });
                }))    
            })
        },
        //取消请求
        stopRequest() {
            httpClient.cancel();
        },
    },
};
