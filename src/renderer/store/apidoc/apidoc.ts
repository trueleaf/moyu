import { ActionContext } from "vuex"
import axios, { Canceler } from "axios"
import { axios as axiosInstance } from "@/api/api"
import type { State as RootState, ApidocState } from "@@/store"
import type { ApidocDetail, Response, ApidocProperty, ApidocBodyMode, ApidocHttpRequestMethod, ApidocBodyRawType, ApidocContentType } from "@@/global"
import { apidocGenerateProperty } from "@/helper/index"

type EditApidocPropertyPayload<K extends keyof ApidocProperty> = {
    data: ApidocProperty,
    field: K,
    value: ApidocProperty[K]
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
                    value: {}
                }],
                headers: [],
                contentType: "",
            },
        },
        loading: false,
    },
    mutations: {
        //重新赋值apidoc数据
        changeApidoc(state: ApidocState, payload: ApidocDetail): void {
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
            state.apidoc = payload;
        },
        //改变apidoc数据加载状态
        changeApidocLoading(state: ApidocState, loading: boolean): void {
            state.loading = loading;
        },
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
        //改变body参数mode类型
        changeBodyMode(state: ApidocState, mode: ApidocBodyMode): void {
            state.apidoc.item.requestBody.mode = mode;
        },
        //改变body参数raw的mime类型
        changeBodyRawType(state: ApidocState, rawType: ApidocBodyRawType): void {
            state.apidoc.item.requestBody.raw.dataType = rawType;
        },
        //改变contentType值
        changeContentType(state: ApidocState, contentType: ApidocContentType): void {
            state.apidoc.item.contentType = contentType;
        },
        //改变path参数
        changePathParams(state: ApidocState, paths: ApidocProperty<"string">[]): void {
            state.apidoc.item.paths = paths
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
