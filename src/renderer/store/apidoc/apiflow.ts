import type { ApidocApiflowState, ApidocApiflowNodeInfo, ApidocApiflowContainerInfo, ApidocApiflowLineInfo } from "@@/store"

type ChangedLineInfo = {
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
type AddIncomingInfo = {
    /**
     * 出线所在节点id
     */
    fromNodeId: string,
    /**
     * 当前需要挂载节点id
     */
    nodeId: string,
    /**
     * 出线id
     */
    lineId: string,
}

const apiflow = {
    namespaced: true,
    state: {
        mouseIncreateLineDotInfo: {
            nodeId: "",
            position: "left"
        },
        mouseInResizeDotInfo: {
            nodeId: "",
            position: ""
        },
        mouseInLineInfo: {
            mouseInlineId: "",
            dragLineId: "",
            isInDragArrow: false,
            isMouseDownDragArrow: false,
        },
        hoverNodeId: "",
        activeNodeId: "",
        isMouseDownResizeDot: false,
        isMouseDownNode: false,
        currentSelectedDotId: "",
        containerInfo: {},
        nodeList: [],
    },
    mutations: {
        /*
        |--------------------------------------------------------------------------
        | 通用
        |--------------------------------------------------------------------------
        */
        //改变容器大小
        changeContainerInfo(state: ApidocApiflowState, payload: ApidocApiflowContainerInfo): void {
            state.containerInfo = payload;
        },
        //当前选中dot所对应的id
        changeCurrentSelectedDotId(state: ApidocApiflowState, payload: string): void {
            state.currentSelectedDotId = payload;
        },
        //鼠标是否点击元素
        changeIsMouseDownNode(state: ApidocApiflowState, payload: boolean): void {
            state.isMouseDownNode = payload;
        },
        //鼠标是否点击节点resizedot
        changeIsMouseDownResizeDot(state: ApidocApiflowState, payload: boolean): void {
            state.isMouseDownResizeDot = payload;
        },
        //改变当前操作的node信息
        changeCurrentOperatNode(state: ApidocApiflowState, payload: ApidocApiflowNodeInfo | null): void {
            state.currentOperatNode = payload;
        },
        //当前鼠标是否在创建线条的圆点上面
        changeMouseIncreateLineDotInfo(state: ApidocApiflowState, dotInfo: ApidocApiflowState["mouseIncreateLineDotInfo"]): void {
            state.mouseIncreateLineDotInfo.nodeId = dotInfo.nodeId;
            state.mouseIncreateLineDotInfo.position = dotInfo.position;
        },
        //当前鼠标是否在节点缩放按钮上面
        changeMouseInResizeDotInfo(state: ApidocApiflowState, dotInfo: ApidocApiflowState["mouseInResizeDotInfo"]): void {
            state.mouseInResizeDotInfo.nodeId = dotInfo.nodeId;
            state.mouseInResizeDotInfo.position = dotInfo.position;
        },
        //当前鼠标是否在节点上面
        changehoverNodeId(state: ApidocApiflowState, hoverNodeId: string): void {
            state.hoverNodeId = hoverNodeId
        },
        //改变鼠标在线条上的信息
        changeMouseInLineInfo(state: ApidocApiflowState, payload: Partial<ApidocApiflowState["mouseInLineInfo"]>): void {
            if (payload.mouseInlineId != null) {
                state.mouseInLineInfo.mouseInlineId = payload.mouseInlineId;
            }
            if (payload.dragLineId != null) {
                state.mouseInLineInfo.dragLineId = payload.dragLineId;
            }
            if (payload.isInDragArrow != null) {
                state.mouseInLineInfo.isInDragArrow = payload.isInDragArrow;
            }
            if (payload.isMouseDownDragArrow != null) {
                state.mouseInLineInfo.isMouseDownDragArrow = payload.isMouseDownDragArrow;
            }
        },
        /*
        |--------------------------------------------------------------------------
        | node相关操作
        |--------------------------------------------------------------------------
        */
        //根据id改变节点x值
        changeNodeOffsetXById(state: ApidocApiflowState, payload: { id: string, x: number }): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.offsetX = payload.x;
            }
        },
        //根据id改变节点y值
        changeNodeOffsetYById(state: ApidocApiflowState, payload: { id: string, y: number }): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.offsetY = payload.y;
            }
        },
        //根据id改变节点宽度
        changeNodeWidthById(state: ApidocApiflowState, payload: { id: string, w: number }): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.width = payload.w;
            }
        },
        //根据id改变节点高度
        changeNodeHeightById(state: ApidocApiflowState, payload: { id: string, h: number }): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.height = payload.h;
            }
        },
        //新增一个节点
        addNode(state: ApidocApiflowState, payload: ApidocApiflowNodeInfo): void {
            state.nodeList.push(payload);
        },
        //根据id改变节点zIndex值
        changeNodeZIndexById(state: ApidocApiflowState, payload: { id: string, zIndex: number }): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.zIndex = payload.zIndex;
            }
        },
        //改变当前被active的节点id
        changeActiveNodeId(state: ApidocApiflowState, activeNodeId: string): void {
            state.activeNodeId = activeNodeId;
        },
        /*
        |--------------------------------------------------------------------------
        | 出线
        |--------------------------------------------------------------------------
        */
        //新增或者更新出线信息
        upsertOutComing(state: ApidocApiflowState, payload: ChangedLineInfo): void {
            console.log("upOutcomming")
            const matchedNode = state.nodeList.find(v => v.id === payload.nodeId);
            if (matchedNode) {
                // matchedNode.styleInfo.zIndex = payload.;
            }
        },
        //新增一条出线
        addOutComing(state: ApidocApiflowState, payload: ChangedLineInfo): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.nodeId);
            if (matchedNode) {
                matchedNode.outcomings.push(payload.lineInfo)
            }
        },
        //改变出线属性
        changeOutComingInfoById(state: ApidocApiflowState, payload: ChangedLineInfo): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.nodeId);
            if (!matchedNode) {
                return
            }
            const matchedLine = matchedNode.outcomings.find(v => v.id === payload.lineId)
            if (matchedLine) {
                Object.assign(matchedLine, payload.lineInfo)
            }
        },
        //根据id删除出线
        removeOutcomingById(state: ApidocApiflowState, payload: { nodeId: string, lineId: string }): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.nodeId);
            if (!matchedNode) {
                return
            }
            const matchedLineIndex = matchedNode.outcomings.findIndex(v => v.id === payload.lineId)
            if (matchedLineIndex !== -1) {
                matchedNode.outcomings.splice(matchedLineIndex, 1)
            }
        },
        /*
        |--------------------------------------------------------------------------
        | 入线
        |--------------------------------------------------------------------------
        */
        //新增一条入线
        addIncoming(state: ApidocApiflowState, payload: AddIncomingInfo): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.nodeId);
            const matchedHostNode = state.nodeList.find(v => v.id === payload.fromNodeId);
            const matchedOutcomingLine = matchedHostNode?.outcomings.find(outcoming => outcoming.id === payload.lineId)
            const matchedIncomingLine = matchedNode?.incomings.find(incoming => incoming.id === payload.lineId)
            const matchedIncomingLineIndex = matchedNode?.incomings.findIndex(incoming => incoming.id === payload.lineId) as number;
            if (matchedNode && !matchedIncomingLine && matchedOutcomingLine) {
                matchedNode.incomings.push(matchedOutcomingLine)
            } else if (matchedNode && matchedIncomingLine && matchedIncomingLineIndex !== -1 && matchedOutcomingLine) {
                matchedNode.incomings[matchedIncomingLineIndex] = matchedOutcomingLine;
            }
        },
        //根据id移除入线
        removeIncomingById(state: ApidocApiflowState, payload: { lineId: string }): void {
            for (let i = 0; i < state.nodeList.length; i += 1) {
                const node = state.nodeList[i];
                const matchedLineIndex = node.incomings.findIndex(v => v.id === payload.lineId);
                if (matchedLineIndex !== -1) {
                    node.incomings.splice(matchedLineIndex, 1)
                    break;
                }
            }
        },
        //改变入线属性
        changeInComingInfoById(state: ApidocApiflowState, payload: ChangedLineInfo): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.nodeId);
            if (!matchedNode) {
                return
            }
            const matchedLine = matchedNode.incomings.find(v => v.id === payload.lineId)
            if (matchedLine) {
                Object.assign(matchedLine, payload.lineInfo)
            }
        },
    },
}

export { apiflow }
