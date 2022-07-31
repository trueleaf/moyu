import { ActionContext } from "vuex"
import axios, { Canceler } from "axios"
import { ElMessageBox } from "element-plus"
import type { State as RootState, ApidocState, } from "@@/store"
import type { ApidocDetail, Response, ApidocProperty, ApidocBodyMode, ApidocHttpRequestMethod, ApidocBodyRawType, ApidocContentType } from "@@/global"
import { store } from "@/pages/modules/apidoc/doc-view/store/index"
import { apidocGenerateProperty, apidocGenerateApidoc, cloneDeep, uuid } from "@/helper/index"
import { $t } from "@/i18n/i18n"
import { axios as axiosInstance } from "../../api/api"
import router from "../../router/index"

const isBuildHtml = process.env.VUE_APP_BUILD_HTML;

type EditApidocPropertyPayload<K extends keyof ApidocProperty> = {
    data: ApidocProperty,
    field: K,
    value: ApidocProperty[K]
}

//接口删除提示用户
function confirmInvalidDoc(projectId: string, delId: string) {
    ElMessageBox.confirm($t("当前接口不存在，可能已经被删除!"), $t("提示"), {
        confirmButtonText: $t("关闭接口"),
        cancelButtonText: $t("取消"),
        type: "warning",
    }).then(() => {
        store.dispatch("apidoc/tabs/deleteTabByIds", {
            projectId,
            ids: [delId]
        });
    }).catch((err) => {
        if (err === "cancel" || err === "close") {
            return;
        }
        console.error(err);
    });
}
//添加默认请求头
function getDefaultHeaders(contentType: ApidocContentType) {
    const defaultHeaders: ApidocProperty<"string">[] = [];
    const params = apidocGenerateProperty();
    params.key = "Content-Length";
    params.value = $t("<发送请求时候自动计算>");
    params.description = $t("<消息的长度>");
    defaultHeaders.push(params);
    //=========================================================================//
    const params2 = apidocGenerateProperty();
    params2.key = "User-Agent";
    params2.value = $t("<发送请求时候自动处理>");
    params2.description = $t("<用户代理软件信息>");
    defaultHeaders.push(params2);
    //=========================================================================//
    const params3 = apidocGenerateProperty();
    params3.key = "Host";
    params3.value = $t("<发送请求时候自动处理>");
    params3.description = $t("<主机信息>");
    defaultHeaders.push(params3);
    //=========================================================================//
    const params4 = apidocGenerateProperty();
    params4.key = "Accept-Encoding";
    params4.value = "gzip, deflate, br";
    params4.description = $t("<客户端理解的编码方式>");
    defaultHeaders.push(params4);
    //=========================================================================//
    const params5 = apidocGenerateProperty();
    params5.key = "Connection";
    params5.value = "keep-alive";
    params5.description = $t("<当前的事务完成后，是否会关闭网络连接>");
    defaultHeaders.push(params5);
    if (contentType) {
        const params6 = apidocGenerateProperty();
        params6.key = "Content-type";
        params6.value = contentType;
        params6.description = $t("<根据body类型自动处理>");
        defaultHeaders.push(params6);
    }
    return defaultHeaders;
}
const cancel: Canceler[] = [] //请求列表
const apidoc = {
    namespaced: true,
    state: {
        /**
         * 实时文档信息
         */
        apidoc: apidocGenerateApidoc(),
        /**
         * 原始文档信息
         */
        originApidoc: apidocGenerateApidoc(),
        /**
         * 默认请求头
         */
        defaultHeaders: [],
        /**
         * 是否正在加载接口
         */
        loading: false,
        /**
         * 是否正在保存接口
         */
        saveLoading: false,
    },
    mutations: {
        /*
        |--------------------------------------------------------------------------
        | url、host、method、name
        |--------------------------------------------------------------------------
        */
        //改变host值
        changeApidocHost(state: ApidocState, host: string): void {
            state.apidoc.item.url.host = host;
        },
        //改变url值
        changeApidocUrl(state: ApidocState, path: string): void {
            state.apidoc.item.url.path = path;
        },
        //改变请求method
        changeApidocMethod(state: ApidocState, method: ApidocHttpRequestMethod): void {
            state.apidoc.item.method = method;
        },
        //改变接口名称
        changeApidocName(state: ApidocState, name: string): void {
            state.apidoc.info.name = name;
        },
        /*
        |--------------------------------------------------------------------------
        | Params
        |--------------------------------------------------------------------------
        */
        //改变path参数
        changePathParams(state: ApidocState, paths: ApidocProperty<"string">[]): void {
            state.apidoc.item.paths = paths
        },
        //在头部插入查询参数
        unshiftQueryParams(state: ApidocState, queryParams: ApidocProperty<"string">[]): void {
            queryParams.forEach((params) => {
                state.apidoc.item.queryParams.unshift(params);
            })
        },
        /*
        |--------------------------------------------------------------------------
        | requestBody
        |--------------------------------------------------------------------------
        */
        //改变body参数mode类型
        changeBodyMode(state: ApidocState, mode: ApidocBodyMode): void {
            state.apidoc.item.requestBody.mode = mode;
        },
        //改变body参数raw的mime类型
        changeBodyRawType(state: ApidocState, rawType: ApidocBodyRawType): void {
            state.apidoc.item.requestBody.raw.dataType = rawType;
        },
        /*
        |--------------------------------------------------------------------------
        | raw参数
        |--------------------------------------------------------------------------
        */
        //改变raw的参数值
        changeBodyRawValue(state: ApidocState, rawValue: string): void {
            state.apidoc.item.requestBody.raw.data = rawValue;
        },
        //改变contentType值
        changeContentType(state: ApidocState, contentType: ApidocContentType): void {
            state.apidoc.item.contentType = contentType;
            const matchedValue = state.defaultHeaders.find((val) => val.key === "Content-type");
            const matchedIndex = state.defaultHeaders.findIndex((val) => val.key === "Content-type");
            if (contentType && matchedValue) { //存在contentType并且默认header值也有
                matchedValue.value = contentType
            } else if (contentType && !matchedValue) { //存在contentType但是默认header没有
                const params = apidocGenerateProperty();
                params.key = "Content-type";
                params.value = contentType;
                params.description = $t("<根据body类型自动处理>");
                state.defaultHeaders.push(params);
            } else if (!contentType && matchedIndex !== -1) {
                state.defaultHeaders.splice(matchedIndex, 1)
            }
        },
        /*
        |--------------------------------------------------------------------------
        | response参数
        |--------------------------------------------------------------------------
        */
        //改变某个response的title参数
        changeResponseParamsTitleByIndex(state: ApidocState, payload: { index: number, title: string }): void {
            const { index, title } = payload
            state.apidoc.item.responseParams[index].title = title;
        },
        //改变某个response的statusCode值
        changeResponseParamsCodeByIndex(state: ApidocState, payload: { index: number, code: number }): void {
            const { index, code } = payload
            state.apidoc.item.responseParams[index].statusCode = code;
        },
        //改变某个response的dataType值
        changeResponseParamsDataTypeByIndex(state: ApidocState, payload: { index: number, type: ApidocContentType }): void {
            const { index, type } = payload
            state.apidoc.item.responseParams[index].value.dataType = type;
        },
        //改变某个response文本value值
        changeResponseParamsTextValueByIndex(state: ApidocState, payload: { index: number, value: string }): void {
            const { index, value } = payload
            state.apidoc.item.responseParams[index].value.text = value;
        },
        //根据index值改变response
        changeResponseByIndex(state: ApidocState, payload: { index: number, value: ApidocProperty[] }): void {
            const { index, value } = payload
            state.apidoc.item.responseParams[index].value.json = value;
        },
        //新增一个response
        addResponseParam(state: ApidocState): void {
            const objectParams = apidocGenerateProperty("object");
            objectParams.children[0] = apidocGenerateProperty();
            state.apidoc.item.responseParams.push({
                _id: uuid(),
                title: $t("返回参数名称"),
                statusCode: 200,
                value: {
                    strJson: "",
                    dataType: "application/json",
                    json: [objectParams],
                    text: "",
                    file: {
                        url: "",
                        raw: "",
                    },
                },
                isMock: false,
            })
        },
        //删除一个response
        deleteResponseByIndex(state: ApidocState, index: number): void {
            state.apidoc.item.responseParams.splice(index, 1);
        },
        /*
        |--------------------------------------------------------------------------
        | 其它
        |--------------------------------------------------------------------------
        |
        */
        //重新赋值apidoc数据
        changeApidoc(state: ApidocState, payload: ApidocDetail): void {
            // queryParams如果没有数据则默认添加一条空数据
            if (payload.item.queryParams.length === 0) {
                payload.item.queryParams.push(apidocGenerateProperty());
            }
            //如果没有commonHeaders则默认添加一条空数据
            if (!payload.commonHeaders?.length) {
                payload.commonHeaders = [];
            }
            // bodyParams如果没有数据则默认添加一条空数据
            // if (payload.item.requestBody.json.length === 0) {
            //     const bodyRootParams = apidocGenerateProperty("object");
            //     bodyRootParams.children[0] = apidocGenerateProperty();
            //     payload.item.requestBody.json.push(bodyRootParams);
            // }
            //formData如果没有数据则默认添加一条空数据
            if (payload.item.requestBody.formdata.length === 0) {
                payload.item.requestBody.formdata.push(apidocGenerateProperty());
            }
            //urlencoded如果没有数据则默认添加一条空数据
            if (payload.item.requestBody.urlencoded.length === 0) {
                payload.item.requestBody.urlencoded.push(apidocGenerateProperty());
            }
            //headers如果没有数据则默认添加一条空数据
            if (payload.item.headers.length === 0) {
                payload.item.headers.push(apidocGenerateProperty());
            }
            state.defaultHeaders = getDefaultHeaders(payload.item.contentType);
            //返回参数为json的如果没有数据则默认添加一条空数据
            payload.item.responseParams.forEach((params) => {
                if (params.value.dataType === "application/json" && params.value.json.length === 0) {
                    const objectParams = apidocGenerateProperty("object");
                    objectParams.children[0] = apidocGenerateProperty();
                    params.value.json.push(objectParams);
                }
            })
            if (payload.item.headers.length === 0) {
                payload.item.headers.push(apidocGenerateProperty());
            }
            state.apidoc = payload;
        },
        //改变apidoc原始缓存值
        changeOriginApidoc(state: ApidocState): void {
            state.originApidoc = cloneDeep(state.apidoc);
        },
        //改变apidoc数据加载状态
        changeApidocLoading(state: ApidocState, loading: boolean): void {
            state.loading = loading;
        },
        //保存apidoc时候更新loading
        changeApidocSaveLoading(state: ApidocState, loading: boolean): void {
            state.saveLoading = loading;
        },
        //添加一个请求参数数据
        addProperty(state: ApidocState, payload: { data: ApidocProperty[], params: ApidocProperty }): void {
            payload.data.push(payload.params);
        },
        //删除一个请求参数数据
        deleteProperty(state: ApidocState, payload: { data: ApidocProperty[], index: number }): void {
            payload.data.splice(payload.index, 1);
        },
        //改变请求参数某个属性的值
        changePropertyValue<K extends keyof ApidocProperty>(state: ApidocState, payload: EditApidocPropertyPayload<K>): void {
            const { data, field, value } = payload;
            data[field] = value;
        },
    },
    actions: {
        /**
         * 获取分享项目基本信息
         */
        getSharedApidocDetail(context: ActionContext<ApidocState, RootState>, payload: { id: string, password: string, shareId: string, projectId: string }): Promise<void> {
            if (cancel.length > 0) {
                cancel.forEach((c) => {
                    c($t("取消请求"));
                })
            }
            return new Promise((resolve, reject) => {
                if (isBuildHtml) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const matchedValue = (window as any).SHARE_DATA.docs.find((v: { _id: string }) => v._id === payload.id);
                    context.commit("changeApidoc", matchedValue)
                    context.commit("changeOriginApidoc")
                    store.commit("apidoc/response/clearResponseInfo")
                    resolve(matchedValue);
                    return
                }
                context.commit("changeApidocLoading", true);
                const params = {
                    password: payload.password,
                    shareId: payload.shareId,
                    _id: payload.id,
                }
                axiosInstance.get<Response<ApidocDetail>, Response<ApidocDetail>>("/api/project/share_doc_detail", {
                    params,
                    cancelToken: new axios.CancelToken((c) => {
                        cancel.push(c);
                    }),
                }).then((res) => {
                    if (res.data === null) { //接口不存在提示用户删除接口
                        confirmInvalidDoc(payload.projectId, payload.id);
                        return;
                    }
                    if (res.code === 101005) {
                        router.replace({
                            path: "/check",
                            query: {
                                share_id: router.currentRoute.value.query.share_id,
                                id: router.currentRoute.value.query.id,
                            },
                        });
                        return;
                    }
                    context.commit("changeApidoc", res.data)
                    context.commit("changeOriginApidoc")
                    store.commit("apidoc/response/clearResponseInfo")
                    resolve()
                }).catch((err) => {
                    console.error(err);
                    reject(err);
                }).finally(() => {
                    context.commit("changeApidocLoading", false);
                })
            });
        },
    },
}

export { apidoc }
