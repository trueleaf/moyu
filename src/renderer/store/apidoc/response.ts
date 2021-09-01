import { ApidocContentType } from "@@/global";
import type { ApidocResponseState } from "@@/store"

type ResponseBaseInfo = {
    httpVersion: string,
    /**
     * 远端ip信息
     */
    ip: string,
    /**
     * 状态码
     */
    statusCode: number,
    /**
     * 状态信息
     */
    statusMessage: string,
    /**
     * contentType信息
     */
    contentType: ApidocContentType
}

const response = {
    namespaced: true,
    state: {
        header: {},
        contentType: "",
        httpVersion: "",
        ip: "",
        statusCode: 200,
        statusMessage: "",
        rt: 0,
        size: 0,
        loading: false,
    },
    mutations: {
        //改变加载状态
        changeLoading(state: ApidocResponseState, loading: boolean): void {
            state.loading = loading;
        },
        //改变responseHeader
        changeResponseHeader(state: ApidocResponseState, payload: Record<string, unknown>): void {
            // console.log(444, payload)
            state.header = payload;
        },
        //改变response基本信息,
        changeResponseBaseInfo(state: ApidocResponseState, payload: ResponseBaseInfo): void {
            state.httpVersion = payload.httpVersion;
            state.ip = payload.ip;
            state.statusCode = payload.statusCode;
            state.statusMessage = payload.statusMessage;
            state.contentType = payload.contentType;
        },
    },
}

export { response }
