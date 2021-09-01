import { ActionContext } from "vuex"
import axios, { Canceler } from "axios"
import { ElMessageBox } from "element-plus"
import { axios as axiosInstance } from "@/api/api"
import { store } from "@/store/index"
import type { State as RootState, ApidocState, } from "@@/store"
import type { ApidocDetail, Response, ApidocProperty, ApidocBodyMode, ApidocHttpRequestMethod, ApidocBodyRawType, ApidocContentType } from "@@/global"
import { apidocGenerateProperty } from "@/helper/index"

type EditApidocPropertyPayload<K extends keyof ApidocProperty> = {
    data: ApidocProperty,
    field: K,
    value: ApidocProperty[K]
}

//接口删除提示用户
function confirmInvalidDoc(projectId: string, delId: string) {
    ElMessageBox.confirm("当前接口不存在，可能已经被删除!", "提示", {
        confirmButtonText: "关闭接口",
        cancelButtonText: "取消",
        type: "warning",
    }).then(() => {
        store.commit("apidoc/tabs/deleteTabByIds", {
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
function getFilterRequestHeaders(headers: ApidocProperty<"string">[]) {
    const additionalHeaders: ApidocProperty<"string">[] = [];
    const matchedHost = headers.find((params => params.key.toLocaleLowerCase() === "host"));
    const matchedContentLength = headers.find((params => params.key.toLocaleLowerCase() === "contentlength" || params.key.toLocaleLowerCase() === "content-length"));
    const matchedUserAgent = headers.find((params => params.key.toLocaleLowerCase() === "useragent" || params.key.toLocaleLowerCase() === "user-agent"))
    if (!matchedHost) {
        const params = apidocGenerateProperty();
        params.key = "Host";
        params.value = "<发送请求时候自动计算>";
        params.description = "<指明了请求将要发送到的服务器主机名和端口号>";
        additionalHeaders.push(params);
    } else {
        matchedHost.key = "Host";
        matchedHost.value = "<发送请求时候自动计算>";
        matchedHost.description = "<指明了请求将要发送到的服务器主机名和端口号>";
    }

    if (!matchedContentLength) {
        const params = apidocGenerateProperty();
        params.key = "Content-Length";
        params.value = "<发送请求时候自动计算>";
        params.description = "<消息的长度>";
        additionalHeaders.push(params);
    } else {
        console.log(444, matchedContentLength)
        matchedContentLength.key = "Content-Length";
        matchedContentLength.value = "<发送请求时候自动计算>";
        matchedContentLength.description = "<指明了请求将要发送到的服务器主机名和端口号>";
    }

    if (!matchedUserAgent) {
        const params = apidocGenerateProperty();
        params.key = "User-Agent";
        params.value = "<发送请求时候自动处理>";
        params.description = "<用户代理软件信息>";
        additionalHeaders.push(params);
    } else {
        matchedUserAgent.key = "User-Agent";
        matchedUserAgent.value = "<发送请求时候自动处理>";
        matchedUserAgent.description = "<用户代理软件信息>";
    }
    return additionalHeaders;
}

const cancel: Canceler[] = [] //请求列表
const apidoc = {
    namespaced: true,
    state: {
        apidoc: {
            pid: "",
            projectId: "",
            isFolder: false,
            sort: 0,
            info: {
                name: "",
                description: "",
                version: "",
                type: "",
                tag: {
                    _id: "",
                    name: "",
                    color: "",
                },
                creator: "",
                maintainer: "",
                deletePerson: "",
                spendTime: 0,
            },
            item: {
                method: "GET",
                url: {
                    host: "",
                    path: "",
                },
                paths: [],
                queryParams: [],
                requestBody: {
                    mode: "json",
                    json: [],
                    formdata: [],
                    urlencoded: [],
                    raw: {
                        data: "",
                        dataType: "text/plain"
                    },
                    file: {
                        src: "",
                    },
                },
                responseParams: [{
                    title: "成功返回",
                    statusCode: 200,
                    value: {
                        file: {
                            url: "",
                            raw: ""
                        },
                        json: [],
                        dataType: "json",
                        text: ""
                    }
                }],
                headers: [],
                contentType: "",
            },
        },
        addtionalHeaders: [],
        headerReadOnlyKeys: [],
        loading: false,
    },
    mutations: {
        /*
        |--------------------------------------------------------------------------
        | url、host、method
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
        //新增一个response
        addResponseParam(state: ApidocState): void {
            const objectParams = apidocGenerateProperty("object");
            objectParams.children[0] = apidocGenerateProperty();
            state.apidoc.item.responseParams.push({
                title: "返回参数名称",
                statusCode: 200,
                value: {
                    dataType: "application/json",
                    json: [objectParams],
                    text: "",
                    file: {
                        url: "",
                        raw: "",
                    },
                }
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
            state.headerReadOnlyKeys = [];
            // queryParams如果没有数据则默认添加一条空数据
            if (payload.item.queryParams.length === 0) {
                payload.item.queryParams.push(apidocGenerateProperty());
            }
            // bodyParams如果没有数据则默认添加一条空数据
            if (payload.item.requestBody.json.length === 0) {
                const bodyRootParams = apidocGenerateProperty("object");
                bodyRootParams.children[0] = apidocGenerateProperty();
                payload.item.requestBody.json.push(bodyRootParams);
            }
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
            const additionalHeaders = getFilterRequestHeaders(payload.item.headers);
            console.log(additionalHeaders)
            additionalHeaders.forEach((params) => {
                payload.item.headers.unshift(params);
            })
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
        //改变apidoc数据加载状态
        changeApidocLoading(state: ApidocState, loading: boolean): void {
            state.loading = loading;
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
         * 获取项目基本信息
         */
        getApidocDetail(context: ActionContext<ApidocState, RootState>, payload: { id: string, projectId: string }): Promise<void> {
            if (cancel.length > 0) {
                cancel.forEach((c) => {
                    c("取消请求");
                })
            }
            return new Promise((resolve, reject) => {
                context.commit("changeApidocLoading", true);
                const params = {
                    projectId: payload.projectId,
                    _id: payload.id,
                }
                axiosInstance.get<Response<ApidocDetail>, Response<ApidocDetail>>("/api/project/doc_detail", {
                    params,
                    cancelToken: new axios.CancelToken((c) => {
                        cancel.push(c);
                    }),
                }).then((res) => {
                    if (res.data === null) { //接口不存在提示用户删除接口
                        confirmInvalidDoc(payload.projectId, payload.id);
                        return;
                    }
                    context.commit("changeApidoc", res.data)
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
