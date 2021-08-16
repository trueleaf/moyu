import { ActionContext } from "vuex"
import axios, { Canceler } from "axios"
import { axios as axiosInstance } from "@/api/api"
import type { State as RootState, ApidocState } from "@@/store"
import type { ApidocDetail, Response } from "@@/global"

const cancel: Canceler[] = [] //请求列表
const apidoc = {
    namespaced: true,
    state: {
        apidoc: {},
        loading: false,
    },
    mutations: {
        changeApidoc(state: ApidocState, payload: ApidocDetail): void {
            state.apidoc = payload;
        },
        changeApidocLoading(state: ApidocState, loading: boolean): void {
            state.loading = loading;
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
                    console.log(res.data)
                    // context.commit("changeProjectBaseInfo", res.data)
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
