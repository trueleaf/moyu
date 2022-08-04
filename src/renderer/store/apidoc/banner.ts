import { ActionContext } from "vuex"
import type { State as RootState, ApidocBannerState, ApidocMockState } from "@@/store"
import { ApidocBanner, Response } from "@@/global"
import { axios } from "@/api/api"
import { forEachForest, findNodeById } from "@/helper/index"
import shareRouter from "@/pages/modules/apidoc/doc-view/router/index"
import { store } from "../index"

type SplicePayload = {
    opData?: ApidocBanner[],
    start: number,
    deleteCount?: number,
    item: ApidocBanner,
}
type MapId = {
    oldId: string, //历史id
    newId: string, //新id
    oldPid: string, //历史pid
    newPid: string, //新pid
};
type EditBannerPayload<K extends keyof ApidocBanner> = {
    id: string,
    field: K,
    value: ApidocBanner[K],
};

const banner = {
    namespaced: true,
    state: {
        banner: [],
        defaultExpandedKeys: [],
    },
    mutations: {
        //根据id改变节点属性
        changeBannerInfoById<K extends keyof ApidocBanner>(state: ApidocBannerState, payload: EditBannerPayload<K>): void {
            const { id, field, value } = payload;
            const editData = findNodeById(state.banner, id, {
                idKey: "_id",
            }) as ApidocBanner;
            editData[field] = value
        },
        //改变文档banner
        changeAllDocBanner(state: ApidocBannerState, payload: ApidocBanner[]): void {
            state.banner = payload;
        },
        //改变文档的id和pid，一般用在粘贴多个文档的时候
        changeBannerIdAndPid(state: ApidocBannerState, mapIds: MapId[]): void {
            forEachForest(state.banner, (node) => {
                const matchedIdInfo = mapIds.find((v) => v.oldId === node._id)
                if (matchedIdInfo) {
                    node._id = matchedIdInfo.newId;
                    node.pid = matchedIdInfo.newPid;
                }
            });
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
        //新增一个展开项
        addExpandItem(state: ApidocBannerState, payload: string): void {
            state.defaultExpandedKeys.push(payload);
        },
        //改变整个展开项目
        changeExpandItems(state: ApidocBannerState, payload: string[]): void {
            state.defaultExpandedKeys = payload;
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
                    const urlMap: ApidocMockState["urlMap"] = [];
                    forEachForest(res.data, (data) => {
                        if (!data.isFolder) {
                            urlMap.push({
                                url: data.url,
                                customMockUrl: data.customMockUrl,
                                projectId: payload.projectId,
                                method: data.method,
                                id: data._id,
                            });
                        }
                    })
                    store.commit("apidoc/mock/changeMockUrlMap", urlMap);
                    resolve(result);
                }).catch((err) => {
                    reject(err);
                });
            });
        },
        /**
         * 获取分享文档左侧导航数据
         */
        async getSharedDocBanner(context: ActionContext<ApidocBannerState, RootState>, payload: { shareId: string, password: string }): Promise<ApidocBanner> {
            return new Promise((resolve, reject) => {
                const params = {
                    shareId: payload.shareId,
                    password: payload.password,
                };
                axios.get<Response<ApidocBanner>, Response<ApidocBanner>>("/api/project/export/share_banner", { params }).then((res) => {
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
