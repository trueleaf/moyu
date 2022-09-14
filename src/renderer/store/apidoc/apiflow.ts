import type { ApidocApiflowState, ApidocApiflowInfo, ApidocApiflowContainerInfo } from "@@/store"

const apiflow = {
    namespaced: true,
    state: {
        containerInfo: {},
        apiflowList: [],
    },
    mutations: {
        //改变容器大小
        changeContainerInfo(state: ApidocApiflowState, payload: ApidocApiflowContainerInfo): void {
            state.containerInfo = payload;
        },
        //根据id改变节点x值
        changeNodeXById(state: ApidocApiflowState, payload: { id: string, x: number }): void {
            const matchedNode = state.apiflowList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.x = payload.x;
            }
        },
        //根据id改变节点y值
        changeNodeYById(state: ApidocApiflowState, payload: { id: string, y: number }): void {
            const matchedNode = state.apiflowList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.y = payload.y;
            }
        },
        //根据id改变节点宽度
        changeNodeWidthById(state: ApidocApiflowState, payload: { id: string, w: number }): void {
            const matchedNode = state.apiflowList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.width = payload.w;
            }
        },
        //根据id改变节点高度
        changeNodeHeightById(state: ApidocApiflowState, payload: { id: string, h: number }): void {
            const matchedNode = state.apiflowList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.height = payload.h;
            }
        },
        //新增一个节点
        addNode(state: ApidocApiflowState, payload: ApidocApiflowInfo): void {
            state.apiflowList.push(payload);
        },
    },
}

export { apiflow }
