import { ApidocRequest } from "@@/store";

const request = {
    namespaced: true,
    state: {
        url: "",
        headers: {},
        method: "",
        body: "",
    },
    mutations: {
        //改变最终发送请求信息
        changeFinalRequestInfo(state: ApidocRequest, payload: ApidocRequest): void {
            state.url = payload.url;
            state.headers = payload.headers;
            state.method = payload.method;
            state.body = payload.body;
        },
    },
}

export { request }
