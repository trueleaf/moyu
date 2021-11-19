import { ApidocDetail } from "@@/global";
import { ApidocMockState, ApidocMockMapInfo } from "@@/store"
import { uniqueByKey } from "@/helper/index"

const mock = {
    namespaced: true,
    state: {
        urlMap: [],
    },
    mutations: {
        //改变mock映射
        changeMockUrlMap(state: ApidocMockState, payload: ApidocMockMapInfo[]): void {
            state.urlMap = uniqueByKey(state.urlMap.concat(payload), "id")
        },
        //新增一条mock映射
        addMockUrl(state: ApidocMockState, payload: ApidocMockMapInfo): void {
            state.urlMap.push(payload);
        },
        //改变当前mock映射
        changeCurrentMockUrl(state: ApidocMockState, payload: { id: string, apidoc: ApidocDetail }): void {
            const index = state.urlMap.findIndex(v => v.id === payload.id);
            if (index !== -1) {
                state.urlMap[index] = {
                    id: payload.apidoc._id,
                    projectId: payload.apidoc.projectId,
                    url: payload.apidoc.item.url.path,
                    method: payload.apidoc.item.method
                }
            } else {
                state.urlMap.push({
                    id: payload.apidoc._id,
                    projectId: payload.apidoc.projectId,
                    url: payload.apidoc.item.url.path,
                    method: payload.apidoc.item.method
                });
            }
        },
    },
}

export { mock }
