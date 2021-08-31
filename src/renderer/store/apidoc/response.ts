import type { ApidocResponseState } from "@@/store"

const response = {
    namespaced: true,
    state: {
        header: {},
        httpVersion: "",
        ip: "",
        statusCode: 200,
        statusMessage: "",
        rt: 0,
        size: 0,
    },
    mutations: {
        //改变responseHeader
        changeResponseHeader(state: ApidocResponseState, payload: Record<string, unknown>): void {
            // console.log(444, payload)
            state.header = payload;
        },
    },
}

export { response }
