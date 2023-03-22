import { useFlowConfigStore } from "@/store/apiflow/config";
import { useFlowContainerStore } from "@/store/apiflow/container";
import { useFlowCreateLineDotStateStore } from "@/store/apiflow/create-line-state";
import { useFlowLineStateStore } from "@/store/apiflow/line-state";
import { useFlowLinesStore } from "@/store/apiflow/lines";
import { useFlowNodeStateStore } from "@/store/apiflow/node-state";
import { useFlowNodesStore } from "@/store/apiflow/nodes";
import { useFlowResizeNodeStateStore } from "@/store/apiflow/resize-node-state";
import { FlowLineInfo, FlowNodeInfo } from "@@/apiflow";
import { uniqueId } from "lodash";

/**
 * 点击Node
 */
export function changeNodeStateWhenMouseDown(e: MouseEvent): void {
    const createLineStateStore = useFlowCreateLineDotStateStore();
    const nodeListStore = useFlowNodesStore();
    const containerInfoStore = useFlowContainerStore();
    const resizeNodeDotStateStore = useFlowResizeNodeStateStore();
    const nodeStateStore = useFlowNodeStateStore();
    const nodesStore = useFlowNodesStore();
    const configStore = useFlowConfigStore();
    if (createLineStateStore.hoverNodeId) {
        return;
    }
    const mouseOffsetX = e.clientX - containerInfoStore.clientX;
    const mouseOffsetY = e.clientY - containerInfoStore.clientY;
    const matchedNodes: FlowNodeInfo[] = [];
    for (let i = 0; i < nodeListStore.nodeList.length; i += 1) {
        const node = nodeListStore.nodeList[i];
        const { offsetX, width, offsetY, height } = node.styleInfo;
        const isInX = mouseOffsetX >= offsetX && mouseOffsetX < offsetX + width;
        const isInY = mouseOffsetY >= offsetY && mouseOffsetY < offsetY + height;
        if ((isInX && isInY) || resizeNodeDotStateStore.hoverNodeId === node.id) {
            matchedNodes.push(node);
        }
    }
    if (matchedNodes.length === 0) {
        nodeStateStore.$patch({
            isMouseDown: false,
            activeNodeId: "",
            dragNodeId: "",
        });
    } else {
        let maxZIndexNode = matchedNodes[0];
        for (let i = 1; i < matchedNodes.length; i += 1) {
            if (matchedNodes[i].styleInfo.zIndex > maxZIndexNode.styleInfo.zIndex) {
                maxZIndexNode = matchedNodes[i];
            }
        }
        nodeStateStore.$patch({
            isMouseDown: true,
            activeNodeId: maxZIndexNode.id,
            mouseDownClientX: e.clientX,
            mouseDownClientY: e.clientY,
            nodeOffsetXWhenMouseDown: maxZIndexNode.styleInfo.offsetX,
            nodeOffsetYWhenMouseDown: maxZIndexNode.styleInfo.offsetY,
            dragNodeId: maxZIndexNode.id,
        });
        nodesStore.changeNodeStyleInfoById(maxZIndexNode.id, {
            dragZIndex: configStore.dragNodeZIndex,
        });
    }
}
/**
 * 点击线条
 */
export function changeLineStateWhenMouseDown(): void {
    const lineStateStore = useFlowLineStateStore();
    const linesStore = useFlowLinesStore();
    if (lineStateStore.isHoverDragArrow) {
        lineStateStore.$patch({
            isMouseDownDragArrow: true,
            dragLineId: lineStateStore.hoverDragLineId,
        });
    }
    const lines = linesStore.lineList;
    console.log(lines);
}
/**
 * 点击resizeDot
 */
export function changeResizeDotWhenMouseDown(e: MouseEvent): void {
    const nodesStore = useFlowNodesStore();
    const nodeState = useFlowNodeStateStore();
    const configStore = useFlowConfigStore();
    const resizeNodeDotState = useFlowResizeNodeStateStore()
    if (!resizeNodeDotState.hoverNodeId) {
        return;
    }
    const matchedNode = nodesStore.nodeList.find(
        (node) => node.id === nodeState.activeNodeId
    );
    if (matchedNode) {
        let nodeFixedX = 0;
        let nodeFixedY = 0;
        const nodeOffsetX = matchedNode.styleInfo.offsetX;
        const nodeOffsetY = matchedNode.styleInfo.offsetY;
        const nodeWidth = matchedNode.styleInfo.width;
        const nodeHeight = matchedNode.styleInfo.height;
        switch (resizeNodeDotState.hoverPosition) {
            case "leftTop":
                nodeFixedX = nodeOffsetX + (nodeWidth - configStore.nodeMinWidth);
                nodeFixedY = nodeOffsetY + (nodeHeight - configStore.nodeMinHeight);
                break;
            case "rightTop":
                nodeFixedX = nodeOffsetX;
                nodeFixedY = nodeOffsetY + (nodeHeight - configStore.nodeMinHeight);
                break;
            case "leftBottom":
                nodeFixedX = nodeOffsetX + (nodeWidth - configStore.nodeMinWidth);
                nodeFixedY = nodeOffsetY;
                break;
            case "rightBottom":
                nodeFixedX = nodeOffsetX;
                nodeFixedY = nodeOffsetY;
                break;
            default:
                break;
        }
        resizeNodeDotState.$patch({
            isMouseDown: true,
            mouseDownClientX: e.clientX,
            mouseDownClientY: e.clientY,
            nodeHeightWhenMouseDown: matchedNode.styleInfo.height,
            nodeWidthWhenMouseDown: matchedNode.styleInfo.width,
            nodeOffsetXWhenMouseDown: matchedNode.styleInfo.offsetX,
            nodeOffsetYWhenMouseDown: matchedNode.styleInfo.offsetY,
            nodeFixedX,
            nodeFixedY,
        })
    }
}
/**
 * 鼠标点击createLineDot
 */
export function changeCreateLineDotWhenMouseDown(): void {
    const createLineDotState = useFlowCreateLineDotStateStore()
    const configStore = useFlowConfigStore()
    const linesStore = useFlowLinesStore()
    const lineStateStore = useFlowLineStateStore()
    const nodesStore = useFlowNodesStore()
    if (createLineDotState.hoverNodeId) {
        createLineDotState.$patch({
            isMouseDown: true,
        })
        const direction = createLineDotState.hoverPosition;
        const lineId = uniqueId();
        const lineInfo: FlowLineInfo = {
            id: lineId,
            fromPosition: direction,
            toPosition: "",
            offsetX: 0,
            offsetY: 0,
            width: 0,
            height: 0,
            lineEndOffsetX: 0,
            lineEndOffsetY: 0,
            lineStartOffsetX: 0,
            lineStartOffsetY: 0,
            canHoverPosition: [],
            arrowInfo: {
                leftTopPoint: {
                    clientX: 0,
                    clientY: 0,
                },
                rightBottomPoint: {
                    clientX: 0,
                    clientY: 0,
                },
            },
            zIndex: configStore.lineZIndex,
        };
        linesStore.$patch((state) => {
            state.lineList.push(lineInfo)
        })
        nodesStore.$patch((state) => {
            const matchedNode = state.nodeList.find(node => node.id === createLineDotState.hoverNodeId);
            matchedNode?.outcomingIds.push(createLineDotState.hoverNodeId)
        })
        lineStateStore.$patch({
            dragLineId: lineId,
            isMouseDownDragArrow: true,
        })
    }
}
