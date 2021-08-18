import { ActionContext } from "vuex"
import { axios } from "@/api/api"
import type { State as RootState, ApidocProjectBaseInfoState } from "@@/store"
import type { Response } from "@@/global"

const baseInfo = {
    namespaced: true,
    state: {
        _id: "",
        projectName: "",
        variables: [],
        mindParams: [],
        paramsTemplate: [],
        rules: [],
        hosts: [],
    },
    mutations: {
        //改变项目基本信息
        changeProjectBaseInfo(state: ApidocProjectBaseInfoState, payload: ApidocProjectBaseInfoState): void {
            state._id = payload._id;
            state.projectName = payload.projectName;
            state.variables = payload.variables;
            state.mindParams = payload.mindParams;
            state.paramsTemplate = payload.paramsTemplate;
            state.rules = payload.rules;
            state.hosts = payload.hosts;
        },
        //改变hosts
        changeProjectHosts(state: ApidocProjectBaseInfoState, payload: ApidocProjectBaseInfoState["hosts"]): void {
            console.log(444, payload)
            state.hosts = payload;
        },
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
                    context.commit("changeProjectBaseInfo", res.data)
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
