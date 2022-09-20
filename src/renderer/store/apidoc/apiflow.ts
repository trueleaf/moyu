import type { ApidocApiflowState, ApidocApiflowInfo, ApidocApiflowContainerInfo, ApidocApiflowLineInfo } from "@@/store"

type UpsertOutComingInfo = {
    /**
     * 节点id
     */
    nodeId: string,
    /**
     * 出线id
     */
    lineId?: string,
    /**
     * 出线信息
     */
    lineInfo: ApidocApiflowLineInfo
}

const apiflow = {
    namespaced: true,
    state: {
        zIndex: 1,
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
        //根据id改变节点zIndex值
        changeNodeZIndexById(state: ApidocApiflowState, payload: { id: string, zIndex: number }): void {
            const matchedNode = state.apiflowList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.zIndex = payload.zIndex;
            }
        },
        //获取zIndex值
        increaseZIndex(state: ApidocApiflowState): void {
            state.zIndex += 1;
        },
        /*
        |--------------------------------------------------------------------------
        | 出线
        |--------------------------------------------------------------------------
        */
        //新增或者更新出线信息
        upsertOutComing(state: ApidocApiflowState, payload: UpsertOutComingInfo): void {
            const matchedNode = state.apiflowList.find(v => v.id === payload.nodeId);
            if (matchedNode) {
                // matchedNode.styleInfo.zIndex = payload.;
            }
        }
    },
}

export { apiflow }
