/* eslint-disable no-underscore-dangle */
/**
 * @description        apidoc相关store
 * @author             shuxiaokai
 * @create             2020-06-25 11:25
 */
import Vue from "vue";
import http from "@/api/api";
import { findNodeById, throttle, uuid } from "@/lib";
import HttpClient from "./http";

const httpClient = new HttpClient();
const { axios } = http;

export default {
    namespaced: true,
    state: {
        //========================初始化接口所需参数数据=======================//
        variables: [], //--------------接口文档全局变量
        hostEnum: [], //---------------全局host数据
        mindParams: { //--------------文档联想参数
            paths: [],
            queryParams: [],
            requestBody: [],
            responseParams: [],
        },
        presetParamsList: [], //-------预设参数列表
        //===============================接口录入相关=========================//
        apidocInfo: {}, //------------接口文档详情
        originApidocInfo: {}, //------原始接口信息，用于对比接口是否发生变化
        banner: [], //----------------树形导航
        tabs: {}, //------------------api文档tabs
        activeDoc: {}, //-------------当前被选中的tab页
        //============================发送请求===============================//
        sendRequestLoading: false, //是否正在请求数据

        remoteResponse: { //返回参数
            headers: {},
            contentType: null,
            httpVersion: null,
            statusCode: null,
            mime: null,
            rt: null,
            value: null,
            size: null,
            total: null,
            percent: null,
        },
        remoteResponseEqualToLocalResponse: false, //远程返回结果是否和本地相同
        //=====================================其他参数====================================//
        apidocLoading: false, //是否正在请求api文档
        paramsValid: true, //参数是否满足校验需求
    },
    mutations: {
        //===============初始化或改变接口所需参数数据(例如：全局变量，全局域名信息等)==============//
        //初始化全局变量
        initVariables(state, payload) {
            state.variables = payload;
        },
        //初始化host枚举
        initAndChangeHostEnum(state, payload) {
            state.hostEnum = payload;
        },
        //初始化联想参数，输入提示
        initAndChangeMindParams(state, payload) {
            state.mindParams.paths = payload.paths?.map((val) => ({ ...val, _id: uuid(), _select: true }));
            state.mindParams.queryParams = payload.queryParams?.map((val) => ({ ...val, _id: uuid(), _select: true }));
            state.mindParams.requestBody = payload.requestBody?.map((val) => ({ ...val, _id: uuid(), _select: true }));
            state.mindParams.responseParams = payload.responseParams?.map((val) => ({ ...val, _id: uuid(), _select: true }));
        },
        //初始化预设参数模板
        initAndChangePresetParams(state, payload) {
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
            const matchedBannerData = findNodeById(state.banner, id, { id: "_id" });
            if (matchedBannerData && method) {
                matchedBannerData.method = method;
            }
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
            const hasTab = state.tabs[projectId].find((val) => val._id === _id);
            if (!hasTab) {
                if (state.tabs[projectId].length === 7) { //7这个值是预估的不准确
                    state.tabs[projectId].unshift(docInfo);
                } else if (state.tabs[projectId].length > 7) {
                    state.tabs[projectId][0] = docInfo;
                } else {
                    state.tabs[projectId].push(docInfo);
                }
                localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs));
            }
        },
        //改变某个tab信息
        changeTabInfoById(state, payload) {
            const { _id, projectId, name, method, changed } = payload;
            const matchedData = state.tabs[projectId].find((val) => val._id === _id);
            if (matchedData && name) {
                matchedData.name = name;
            }
            if (matchedData && method) {
                matchedData.method = method;
            }
            if (matchedData && changed != null) {
                Vue.set(matchedData, "changed", changed);
            }
            localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs));
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
            localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs));
        },
        //根据id删除tab
        deleteTabById(state, payload) {
            const { projectId, deleteIds } = payload;
            if (state.tabs[projectId]) {
                state.tabs[projectId] = state.tabs[projectId].filter((val) => (deleteIds.indexOf(val._id) === -1));
            }
            localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs));
        },
        //=====================================当前选中的tab====================================//
        //更新当前被选中的文档(不能为folder)
        changeCurrentTab(state, payload) {
            const { projectId } = payload;
            const isInProject = state.activeDoc[projectId]; //当前项目是否存在tabs
            if (!isInProject) {
                Vue.set(state.activeDoc, projectId, {});
            }
            state.activeDoc[projectId] = payload;
            localStorage.setItem("apidoc/activeTab", JSON.stringify(state.activeDoc));
        },
        //改变当前选中tab的基本信息
        changeCurrentTabById(state, payload) {
            const { projectId, name, changed } = payload;
            this.commit("apidoc/changeTabInfoById", {
                _id: state.activeDoc[projectId]._id,
                projectId,
                name,
                changed,
            });
            const matchedData = state.activeDoc[projectId];
            if (matchedData && name) {
                matchedData.name = name;
            }
            if (matchedData) {
                matchedData.changed = changed;
            }
            localStorage.setItem("apidoc/activeTab", JSON.stringify(state.activeDoc));
        },
        //=====================================请求参数录入====================================//
        //改变接口请求状态
        changeApidocLoading(state, loading) {
            state.apidocLoading = loading;
        },
        //改变接口文档的值
        changeApidocInfo(state, payload) {
            state.apidocInfo = payload;
        },
        //存储一份原始接口文档值，用于和变化后的值做对比
        changeOriginApidocInfo(state, payload) {
            state.originApidocInfo = payload;
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
        //改变查询字符串参数
        changeQueryParams(state, payload) {
            state.apidocInfo.item.queryParams = payload;
        },
        //新增一个查询字符串参数
        addQueryParams(state, payload) {
            state.apidocInfo.item.queryParams.push(payload);
        },
        //新增一个或多个查询字符串
        unshiftQueryParams(state, payload) {
            if (Array.isArray(payload)) { //新增多个
                payload.forEach((param) => {
                    state.apidocInfo.item.queryParams.unshift(param);
                })
            } else {
                state.apidocInfo.item.queryParams.unshift(payload);
            }
        },
        //改变requestBody
        changeRequestBody(state, payload) {
            state.apidocInfo.item.requestBody = payload;
        },
        //新增一个或多个requestBody
        unshiftBodyParams(state, payload) {
            if (Array.isArray(payload)) { //新增多个
                payload.forEach((param) => {
                    state.apidocInfo.item.requestBody.unshift(param);
                })
            } else {
                state.apidocInfo.item.requestBody.unshift(payload);
            }
        },
        //新增一个body查询字符串
        addBodyParams(state, payload) {
            state.apidocInfo.item.bodyParams.push(payload);
        },
        //改变请求contentType值
        changeContentType(state, payload) {
            state.apidocInfo.item.contentType = payload;
        },
        //改变response参数
        changeResponse(state, payload) {
            state.apidocInfo.item.responseParams = payload;
        },
        //新增一个response参数
        addResponse(state, payload) {
            state.apidocInfo.item.responseParams.push(payload);
        },
        //删除一个response参数
        deleteResponse(state, deleteIndex) {
            state.apidocInfo.item.responseParams.splice(deleteIndex, 1);
        },
        //改变请求头
        changeHeaders(state, payload) {
            state.apidocInfo.item.headers = payload;
        },
        //改变备注信息
        changeDescription(state, payload) {
            if (state.apidocInfo.info) { //刚创建的时候info值可能不存在
                state.apidocInfo.info.description = payload;
            }
        },
        //新增一条模板数据
        addPresetParams(state, payload) {
            state.presetParamsList.push(payload);
        },
        //=====================================发送请求====================================//
        //改变模拟发送请求返回结果loading效果
        changeSendRequestLoading(state, loading) {
            state.sendRequestLoading = loading;
        },
        //改变大小
        changeResponseProcess(state, payload) {
            const { size, percent, total } = payload;
            if (size != null) state.remoteResponse.size = size;
            if (percent != null) state.remoteResponse.percent = percent;
            if (total != null) state.remoteResponse.total = total;
        },
        //改变基础返回信息
        changeResponseInfo(state, payload) {
            state.remoteResponse.headers = payload.headers;
            state.remoteResponse.contentType = payload.contentType;
            state.remoteResponse.httpVersion = payload.httpVersion;
            state.remoteResponse.statusCode = payload.statusCode;
        },
        //改变基础返回指标数据
        changeResponseIndex(state, payload) {
            state.remoteResponse.mime = payload.mime;
            state.remoteResponse.rt = payload.rt;
            state.remoteResponse.size = payload.size;
            state.remoteResponse.value = payload.value;
        },
        //是否校验通过
        changeParamsValid(state, isValid) {
            state.paramsValid = isValid;
        },
        //重置返回值信息
        clearRespons(state) {
            state.remoteResponse = {
                headers: {},
                contentType: null,
                httpVersion: null,
                statusCode: null,
                mime: null,
                rt: null,
                value: null,
                size: null,
                total: null,
                percent: null,
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
                    projectId: payload.projectId,
                };
                axios.get("/api/project/doc_tree_node", { params }).then((res) => {
                    const result = res.data;
                    context.commit("changeDocBanner", result);
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            });
        },
        //获取全局变量
        async getDocVariable(context, payload) {
            return new Promise((resolve, reject) => {
                const params = {
                    projectId: payload.projectId,
                };
                axios.get("/api/project/project_variable_enum", { params }).then((res) => {
                    const result = res.data;
                    context.commit("initVariables", result);
                    resolve();
                }).catch((err) => {
                    console.error(err);
                    reject(err);
                });
            });
        },
        //获取文档联想参数
        async getMindParamsEnum(context, payload) {
            return new Promise((resolve, reject) => {
                const params = {
                    projectId: payload.projectId,
                };
                axios.get("/api/project/doc_params_mind", { params }).then((res) => {
                    const result = res.data;
                    context.commit("initAndChangeMindParams", result);
                    resolve();
                }).catch((err) => {
                    reject(err);
                    console.error(err);
                });
            });
        },
        //获取预设参数列表
        async getPresetParams(context, payload) {
            return new Promise((resolve, reject) => {
                const params = {
                    projectId: payload.projectId,
                };
                axios.get("/api/project/doc_preset_params_enum", { params }).then((res) => {
                    const result = res.data;
                    context.commit("initAndChangePresetParams", result);
                    resolve();
                }).catch((err) => {
                    reject(err);
                    console.error(err);
                });
            });
        },
        //获取全局host
        async getHostEnum(context, payload) {
            return new Promise((resolve, reject) => {
                const params = {
                    projectId: payload.projectId,
                };
                axios.get("/api/project/doc_service", { params }).then((res) => {
                    context.commit("initAndChangeHostEnum", res.data);
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            });
        },
        /**
         * @description                 发送请求
         * @author                      shuxiaokai
         * @create                      2020-12-11 14:59
         * @param {url}                 url - 请求url
         * @param {string}              method - 请求方法
         * @param {string}              contentType - 参数类型
         * @param {Array<Property>}     paths - 路径参数
         * @param {Array<Property>}     queryParams - 请求参数
         * @param {Array<Property>}     requestBody - 请求body
         * @param {Array<Property>}     headers - 请求头
         */
        sendRequest(context, payload) {
            return new Promise((resolve, reject) => {
                const { url, method, contentType, paths, queryParams, requestBody, headers } = payload;
                context.commit("changeSendRequestLoading", true);
                httpClient.request({
                    url,
                    method,
                    contentType,
                    paths,
                    queryParams,
                    headers,
                    requestBody,
                });
                httpClient.once("response", (response) => {
                    context.commit("changeResponseInfo", response);
                });
                httpClient.once("error", (err) => {
                    reject(err);
                });
                httpClient.once("end", (result) => {
                    context.commit("changeResponseIndex", result);
                    context.commit("changeSendRequestLoading", false);
                    context.commit("changeResponseProcess", {
                        percent: 1,
                    });
                    resolve(result);
                });
                httpClient.once("process", throttle((process) => {
                    context.commit("changeResponseProcess", {
                        size: process.transferred,
                        percent: process.percent,
                        total: process.total,
                    });
                }));
            });
        },
        //取消请求
        stopRequest(context) {
            httpClient.cancel();
            context.commit("changeSendRequestLoading", false);
        },
    },
};
