import { ApidocMockState } from "@@/store"

const mock = {
    namespaced: true,
    state: {
        urlMap: [],
    },
    mutations: {
        //改变mock映射
        changeMockUrlMap(state: ApidocMockState, payload: ApidocMockState["urlMap"]): void {
            state.urlMap = payload
        },
    },
}

export { mock }
