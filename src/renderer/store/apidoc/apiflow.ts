import type { ApiflowState, ApiflowNodeInfo, ApiflowContainerInfo, ApiflowLineInfo } from "@@/store"

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
    lineInfo: ApiflowLineInfo
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
        mouseInCreateLineDotInfo: {
            nodeId: "",
            position: "left"
        },
        mouseInResizeDotInfo: {
            nodeId: "",
            position: "",
            isMouseDown: false,
            mouseDownclientX: 0,
            mouseDownclientY: 0,
            mouseDownNodeWidth: 0,
            mouseDownNodeHeight: 0,
            nodeFixedX: 0,
            nodeFixedY: 0,
        },
        mouseInLineInfo: {
            mouseInlineId: "",
            dragLineId: "",
            isInDragArrow: false,
            isMouseDown: false,
        },
        hoverNodeId: "",
        activeNodeId: "",
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
        changeContainerInfo(state: ApiflowState, payload: ApiflowContainerInfo): void {
            state.containerInfo = payload;
        },
        //当前选中dot所对应的id
        changeCurrentSelectedDotId(state: ApiflowState, payload: string): void {
            state.currentSelectedDotId = payload;
        },
        //鼠标是否点击元素
        changeIsMouseDownNode(state: ApiflowState, payload: boolean): void {
            state.isMouseDownNode = payload;
        },
        //当前被mousedown的节点信息
        changeCurrentMouseDownNode(state: ApiflowState, payload: ApiflowNodeInfo | null): void {
            state.currentMouseDownNode = payload;
        },
        //当前鼠标是否在创建线条的圆点上面
        changemouseInCreateLineDotInfo(state: ApiflowState, dotInfo: ApiflowState["mouseInCreateLineDotInfo"]): void {
            state.mouseInCreateLineDotInfo.nodeId = dotInfo.nodeId;
            state.mouseInCreateLineDotInfo.position = dotInfo.position;
        },
        //当前鼠标是否在节点缩放按钮上面
        changeMouseInResizeDotInfo(state: ApiflowState, dotInfo: Partial<ApiflowState["mouseInResizeDotInfo"]>): void {
            if (dotInfo.nodeId != null) {
                state.mouseInResizeDotInfo.nodeId = dotInfo.nodeId;
            }
            if (dotInfo.position != null) {
                state.mouseInResizeDotInfo.position = dotInfo.position;
            }
            if (dotInfo.isMouseDown != null) {
                state.mouseInResizeDotInfo.isMouseDown = dotInfo.isMouseDown;
            }
            if (dotInfo.mouseDownclientX != null) {
                state.mouseInResizeDotInfo.mouseDownclientX = dotInfo.mouseDownclientX;
            }
            if (dotInfo.mouseDownclientY != null) {
                state.mouseInResizeDotInfo.mouseDownclientY = dotInfo.mouseDownclientY;
            }
            if (dotInfo.mouseDownNodeWidth != null) {
                state.mouseInResizeDotInfo.mouseDownNodeWidth = dotInfo.mouseDownNodeWidth;
            }
            if (dotInfo.mouseDownNodeHeight != null) {
                state.mouseInResizeDotInfo.mouseDownNodeHeight = dotInfo.mouseDownNodeHeight;
            }
            if (dotInfo.nodeFixedX != null) {
                state.mouseInResizeDotInfo.nodeFixedX = dotInfo.nodeFixedX;
            }
            if (dotInfo.nodeFixedY != null) {
                state.mouseInResizeDotInfo.nodeFixedY = dotInfo.nodeFixedY;
            }
        },
        //当前鼠标是否在节点上面
        changehoverNodeId(state: ApiflowState, hoverNodeId: string): void {
            state.hoverNodeId = hoverNodeId
        },
        //改变鼠标在线条上的信息
        changeMouseInLineInfo(state: ApiflowState, payload: Partial<ApiflowState["mouseInLineInfo"]>): void {
            if (payload.mouseInlineId != null) {
                state.mouseInLineInfo.mouseInlineId = payload.mouseInlineId;
            }
            if (payload.dragLineId != null) {
                state.mouseInLineInfo.dragLineId = payload.dragLineId;
            }
            if (payload.isInDragArrow != null) {
                state.mouseInLineInfo.isInDragArrow = payload.isInDragArrow;
            }
            if (payload.isMouseDown != null) {
                state.mouseInLineInfo.isMouseDown = payload.isMouseDown;
            }
        },
        /*
        |--------------------------------------------------------------------------
        | node相关操作
        |--------------------------------------------------------------------------
        */
        //根据id改变节点x值
        changeNodeOffsetXById(state: ApiflowState, payload: { id: string, x: number }): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.offsetX = payload.x;
            }
        },
        //根据id改变节点y值
        changeNodeOffsetYById(state: ApiflowState, payload: { id: string, y: number }): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.offsetY = payload.y;
            }
        },
        //根据id改变节点宽度
        changeNodeWidthById(state: ApiflowState, payload: { id: string, w: number }): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.width = payload.w;
            }
        },
        //根据id改变节点高度
        changeNodeHeightById(state: ApiflowState, payload: { id: string, h: number }): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.height = payload.h;
            }
        },
        //新增一个节点
        addNode(state: ApiflowState, payload: ApiflowNodeInfo): void {
            state.nodeList.push(payload);
        },
        //根据id改变节点zIndex值
        changeNodeZIndexById(state: ApiflowState, payload: { id: string, zIndex: number }): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.id);
            if (matchedNode) {
                matchedNode.styleInfo.zIndex = payload.zIndex;
            }
        },
        //改变当前被active的节点id
        changeActiveNodeId(state: ApiflowState, activeNodeId: string): void {
            state.activeNodeId = activeNodeId;
        },
        /*
        |--------------------------------------------------------------------------
        | 出线
        |--------------------------------------------------------------------------
        */
        //新增或者更新出线信息
        upsertOutComing(state: ApiflowState, payload: ChangedLineInfo): void {
            console.log("upOutcomming")
            const matchedNode = state.nodeList.find(v => v.id === payload.nodeId);
            if (matchedNode) {
                // matchedNode.styleInfo.zIndex = payload.;
            }
        },
        //新增一条出线
        addOutComing(state: ApiflowState, payload: ChangedLineInfo): void {
            const matchedNode = state.nodeList.find(v => v.id === payload.nodeId);
            if (matchedNode) {
                matchedNode.outcomings.push(payload.lineInfo)
            }
        },
        //改变出线属性
        changeOutComingInfoById(state: ApiflowState, payload: ChangedLineInfo): void {
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
        removeOutcomingById(state: ApiflowState, payload: { nodeId: string, lineId: string }): void {
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
        addIncoming(state: ApiflowState, payload: AddIncomingInfo): void {
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
        removeIncomingById(state: ApiflowState, payload: { lineId: string }): void {
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
        changeInComingInfoById(state: ApiflowState, payload: ChangedLineInfo): void {
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
