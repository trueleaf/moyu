import { ActionContext } from "vuex"
import { axios } from "@/api/api"
import type { State as RootState, ApidocProjectBaseInfoState } from "@@/store"
import type { Response } from "@@/global"

const baseInfo = {
    namespaced: true,
    state: {
        hosts: [],
    },
    mutations: {
    },
    actions: {
        /**
         * 获取项目基本信息
         */
        async getProjectBaseInfo(context: ActionContext<ApidocProjectBaseInfoState, RootState>, payload: { projectId: string }): Promise<void> {
            return new Promise((resolve, reject) => {
                const params = {
                    _id: payload.projectId,
                }
                axios.get<Response<ApidocProjectBaseInfoState>, Response<ApidocProjectBaseInfoState>>("/api/project/project_full_info", { params }).then((res) => {
                    console.log(res.data)
                    resolve()
                }).catch((err) => {
                    console.error(err);
                    reject(err);
                })
            });
        },
    },
}

export { baseInfo }
