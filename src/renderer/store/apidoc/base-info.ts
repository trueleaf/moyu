import { ActionContext } from "vuex"
import type { State as RootState, ApidocProjectBaseInfoState, ApidocProjectParamsTemplate } from "@@/store"
import type { Response, ApidocMindParam } from "@@/global"
import { axios } from "@/api/api"
import shareRouter from "@/pages/modules/apidoc/doc-view/router/index"

const baseInfo = {
    namespaced: true,
    state: {
        _id: "",
        projectName: "",
        variables: [],
        mindParams: [],
        paramsTemplate: [],
        rules: {},
        hosts: [],
        globalCookies: {},
        layout: "horizontal",
        webProxy: true,
        proxy: {
            path: "",
            enabled: false,
        },
        mode: "view",
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
        //改变联想参数信息
        changeMindParams(state: ApidocProjectBaseInfoState, payload: ApidocMindParam[]): void {
            state.mindParams = payload;
        },
        //根据id删除联想参数
        deleteMindParamsById(state: ApidocProjectBaseInfoState, id: string): void {
            const delIndex = state.mindParams.findIndex(v => v._id === id);
            state.mindParams.splice(delIndex, 1)
        },
        //改变hosts
        changeProjectHosts(state: ApidocProjectBaseInfoState, payload: ApidocProjectBaseInfoState["hosts"]): void {
            state.hosts = payload;
        },
        //根据id改变host治
        updateHostById(state: ApidocProjectBaseInfoState, payload: { _id: string, url: string, name: string }): void {
            const matchedHost = state.hosts.find(v => v._id === payload._id);
            if (matchedHost) {
                matchedHost.url = payload.url;
                matchedHost.name = payload.name;
            }
        },
        //初始化cookie值
        initCookies(state: ApidocProjectBaseInfoState): void {
            const localCookies = localStorage.getItem("apidoc/globalCookies") || "{}";
            try {
                const jsonCookies = JSON.parse(localCookies)
                state.globalCookies = jsonCookies;
            } catch (error) {
                console.error(error);
                localStorage.setItem("apidoc/globalCookies", "{}")
            }
        },
        //改变布局方式
        changeLayout(state: ApidocProjectBaseInfoState, layout: "horizontal" | "vertical"): void {
            state.layout = layout;
            localStorage.setItem("apidoc/layout", layout)
        },
        //初始化布局
        initLayout(state: ApidocProjectBaseInfoState): void {
            const localLayout = localStorage.getItem("apidoc/layout");
            if (localLayout !== "horizontal" && localLayout !== "vertical") {
                state.layout = "horizontal";
            } else {
                state.layout = localLayout;
            }
        },
        //添加一个模板
        addParamsTemplate(state: ApidocProjectBaseInfoState, payload: ApidocProjectParamsTemplate): void {
            state.paramsTemplate.push(payload);
        },
        //改变web代理
        changeWebProxy(state: ApidocProjectBaseInfoState, isProxy: boolean): void {
            state.webProxy = isProxy;
        },
        //改变操作模式
        changeMode(state: ApidocProjectBaseInfoState, mode: "edit" | "view"): void {
            state.mode = mode;
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
        /**
         * 获取分享项目基本信息
         */
        async getSharedProjectBaseInfo(context: ActionContext<ApidocProjectBaseInfoState, RootState>, payload: { shareId: string, password: string }): Promise<void> {
            return new Promise((resolve, reject) => {
                const params = {
                    shareId: payload.shareId,
                    password: payload.password,
                };
                axios.get<Response<ApidocProjectBaseInfoState>, Response<ApidocProjectBaseInfoState>>("/api/project/export/share_project_info", { params }).then((res) => {
                    if (res.code === 101005) {
                        shareRouter.replace({
                            path: "/check",
                            query: {
                                share_id: shareRouter.currentRoute.value.query.share_id,
                                id: shareRouter.currentRoute.value.query.id,
                            },
                        });
                        return;
                    }
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
