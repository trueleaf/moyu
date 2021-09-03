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
    contentType: string
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
        process: {
            percent: 0,
            total: 0,
            transferred: 0,
        },
        data: {
            file: {
                url: "",
                raw: "",
            },
            type: "",
            text: "",
        },
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
        //改变返回值进度
        changeResponseProgress(state: ApidocResponseState, progress: ApidocResponseState["process"]): void {
            state.process = progress;
        },
        //=====================================返回值====================================//
        //字符串类型返回值
        changeResponseTextValue(state: ApidocResponseState, textValue: string): void {
            state.data.text = textValue;
            state.data.file.url = ""; //清空url
        },
        //文件类型返回值
        changeResponseFileUrl(state: ApidocResponseState, url: string): void {
            state.data.file.url = url;
            state.data.text = ""; //清空文字
        },
        //改变返回data类型
        changeResponseMime(state: ApidocResponseState, type: string): void {
            state.data.type = type;
        },
        //改变返回时间
        changeResponseTime(state: ApidocResponseState, rt: number): void {
            state.rt = rt;
        },
        //改变返回值大小
        changeResponseSize(state: ApidocResponseState, size: number): void {
            state.size = size;
        },
    },
}

export { response }
