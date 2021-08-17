import { ActionContext } from "vuex"
import axios, { Canceler } from "axios"
import { axios as axiosInstance } from "@/api/api"
import type { State as RootState, ApidocState } from "@@/store"
import type { ApidocDetail, Response } from "@@/global"

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
                requestBody: [],
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
