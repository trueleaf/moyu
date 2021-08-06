import { ActionContext } from "vuex"
import { axios } from "@/api/api"
import type { State as RootState, ApidocBannerState } from "@@/store"
import { ApidocBanner } from "@@/global"

type SplicePayload = {
    opData?: ApidocBanner[],
    start: number,
    deleteCount?: number,
    item: ApidocBanner,
}
const banner = {
    namespaced: true,
    state: {
        banner: [],
    },
    mutations: {
        //改变文档banner
        changeAllDocBanner(state: ApidocBannerState, payload: ApidocBanner[]): void {
            state.banner = payload;
        },
        //改变文档数据
        splice(state: ApidocBannerState, payload: SplicePayload): void {
            const { start, deleteCount = 0, item, opData } = payload;
            const currentOperationData = opData || state.banner;
            if (item) {
                currentOperationData.splice(start, deleteCount, item)
            } else {
                currentOperationData.splice(start, deleteCount)
            }
        },
    },
    actions: {
        /**
         * 获取文档左侧导航数据
         */
        async getDocBanner(context: ActionContext<ApidocBannerState, RootState>, payload: { projectId: string }): Promise<ApidocBanner> {
            return new Promise((resolve, reject) => {
                const params = {
                    projectId: payload.projectId,
                };
                axios.get("/api/project/doc_tree_node", { params }).then((res) => {
                    const result = res.data;
                    context.commit("changeAllDocBanner", result);
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            });
        },
    },
}

export { banner }
