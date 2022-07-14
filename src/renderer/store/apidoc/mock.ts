import { ApidocDetail } from "@@/global";
import { ApidocMockState, ApidocMockMapInfo } from "@@/store"
import { uniqueByKey } from "@/helper/index"
import config from "@/../config/config"
import { store } from "../index";
// import { apidocCache } from "@/cache/apidoc";
// import { router } from "@/router/index"

const mock = {
    namespaced: true,
    state: {
        serverState: "disconnect", //服务器状态
        mockServerPort: config.renderConfig.mock.port, // 端口
        httpStatusCode: 200, //http状态码
        responseDelay: 0, //返回延时(毫秒)
        responseType: "json", //返回数据类型
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
        //根据id改变一条mock映射
        changeMockUrlInfoById(state: ApidocMockState, payload: { id: string, data: ApidocMockMapInfo }): void {
            const matchedMockInfo = state.urlMap.find(v => v.id === payload.id);
            if (matchedMockInfo) {
                Object.assign(matchedMockInfo, payload.data)
            }
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
            } else if (payload.apidoc.projectId) { //不添加无效数据
                state.urlMap.push({
                    id: payload.apidoc._id,
                    projectId: payload.apidoc.projectId,
                    url: payload.apidoc.item.url.path,
                    method: payload.apidoc.item.method
                });
            }
        },
        //改变mock端口
        changeMockServerPort(state: ApidocMockState, port: number): void {
            store.commit("apidoc/apidoc/changeApidocHost", `http://${config.renderConfig.mock.ip}:${port}`);
            state.mockServerPort = port;
        },
        //改变服务器启动状态
        changeMockServerState(state: ApidocMockState, payload: "disconnection" | "connecting" | "connection" | "closing" | "error"): void{
            state.serverState = payload;
        },
        //改变http状态码
        changeHttpStatusCode(state: ApidocMockState, code: number): void {
            state.httpStatusCode = code;
        },
        //改变返回延时
        changeResponseDelay(state: ApidocMockState, delay: number): void {
            state.responseDelay = delay;
        },
        //更改返回数据类型
        changeResponseType(state: ApidocMockState, responseType: ApidocMockState["responseType"]): void {
            state.responseType = responseType;
        },
    },
}

export { mock }
