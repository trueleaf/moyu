import { useFlowContainerStore } from "@/store/apiflow/container";
import { useFlowCreateLineDotStateStore } from "@/store/apiflow/create-line-state";
import { useFlowLineStateStore } from "@/store/apiflow/line-state";
import { useFlowLinesStore } from "@/store/apiflow/lines";
import { useFlowNodeStateStore } from "@/store/apiflow/node-state";
import { useFlowNodesStore } from "@/store/apiflow/nodes";
import { useFlowResizeNodeStateStore } from "@/store/apiflow/resize-node-state";
import { FlowNodeInfo, FlowValidCreateLineArea, FlowValidResizeArea } from "@@/apiflow";
import { getCreateLineArea, getResizeBarArea, mouseIsInLine } from "../common/common";

/**
 * createLineDot上面移动
 */
export function changeCreateLineDotStateWhenMouseMove(e: MouseEvent): void {
    const createLineDotState = useFlowCreateLineDotStateStore()
    const containerStore = useFlowContainerStore()
    const nodesStore = useFlowNodesStore()
    const nodeStateStore = useFlowNodeStateStore()
    if (nodeStateStore.isMouseDown) {
        return;
    }
    const mouseOffsetX = e.clientX - containerStore.clientX;
    const mouseOffsetY = e.clientY - containerStore.clientY;
    const getMouseIsInCreateDot = (createLineArea: FlowValidCreateLineArea, { x, y }: { x: number; y: number }) => {
        const { leftArea, rightArea, topArea, bottomArea } = createLineArea;
        if (x > leftArea.offsetX && x < leftArea.offsetX2 && y > leftArea.offsetY && y < leftArea.offsetY2) {
            return "left";
        }
        if (x > rightArea.offsetX && x < rightArea.offsetX2 && y > rightArea.offsetY && y < rightArea.offsetY2) {
            return "right";
        }
        if (x > topArea.offsetX && x < topArea.offsetX2 && y > topArea.offsetY && y < topArea.offsetY2) {
            return "top";
        }
        if (x > bottomArea.offsetX && x < bottomArea.offsetX2 && y > bottomArea.offsetY && y < bottomArea.offsetY2) {
            return "bottom";
        }
        return "";
    };
    const matchedNodes: {
        position: ReturnType<typeof getMouseIsInCreateDot>;
        node: FlowNodeInfo;
    }[] = [];
    for (let i = 0; i < nodesStore.nodeList.length; i += 1) {
        const node = nodesStore.nodeList[i];
        const createLineArea = getCreateLineArea(node);
        const mouseInCreateDotPosition = getMouseIsInCreateDot(createLineArea, {
            x: mouseOffsetX,
            y: mouseOffsetY,
        });
        if (mouseInCreateDotPosition && (!nodeStateStore.hoverNodeId || nodeStateStore.hoverNodeId === node.id)) {
            matchedNodes.push({
                node,
                position: mouseInCreateDotPosition,
            });
        }
    }
    if (matchedNodes.length === 0) {
        createLineDotState.$patch({
            hoverNodeId: "",
            hoverPosition: "",
        })
    } else {
        let maxZIndexNode = matchedNodes[0];
        for (let i = 1; i < matchedNodes.length; i += 1) {
            if (matchedNodes[i].node.styleInfo.zIndex > maxZIndexNode.node.styleInfo.zIndex) {
                maxZIndexNode = matchedNodes[i];
            }
        }
        nodeStateStore.$patch({
            hoverNodeId: maxZIndexNode.node.id,
        })
        createLineDotState.$patch({
            hoverNodeId: maxZIndexNode.node.id,
            hoverPosition: maxZIndexNode.position,
        })
    }
}
/**
 * resizeNodeDot上面移动
 */
export function changeResizeDotStateWhenMouseMove(e: MouseEvent): void {
    const resizeNodeDotStore = useFlowResizeNodeStateStore()
    const containerStore = useFlowContainerStore()
    const nodesStore = useFlowNodesStore()
    const nodeStateStore = useFlowNodeStateStore()
    const mouseOffsetX = e.clientX - containerStore.clientX
    const mouseOffsetY = e.clientY - containerStore.clientY
    const getResizeDotArea = (resizeDotArea: FlowValidResizeArea, { x, y }: { x: number; y: number }) => {
        const { leftTopArea, rightTopArea, leftBottomArea, rightBottomArea } = resizeDotArea;
        if (x > leftTopArea.offsetX && x < leftTopArea.offsetX2 && y > leftTopArea.offsetY && y < leftTopArea.offsetY2) {
            return "leftTop";
        }
        if (x > rightTopArea.offsetX && x < rightTopArea.offsetX2 && y > rightTopArea.offsetY && y < rightTopArea.offsetY2) {
            return "rightTop";
        }
        if (x > leftBottomArea.offsetX && x < leftBottomArea.offsetX2 && y > leftBottomArea.offsetY && y < leftBottomArea.offsetY2) {
            return "leftBottom";
        }
        if (x > rightBottomArea.offsetX && x < rightBottomArea.offsetX2 && y > rightBottomArea.offsetY && y < rightBottomArea.offsetY2) {
            return "rightBottom";
        }
        return "";
    }
    for (let i = 0; i < nodesStore.nodeList.length; i += 1) {
        const node = nodesStore.nodeList[i];
        const resizeArea = getResizeBarArea(node);
        const resizeNodeArea = getResizeDotArea(resizeArea, {
            x: mouseOffsetX,
            y: mouseOffsetY
        });
        if (resizeNodeArea && nodeStateStore.activeNodeId === node.id && !resizeNodeDotStore.isMouseDown) {
            resizeNodeDotStore.$patch({
                hoverNodeId: node.id,
                hoverPosition: resizeNodeArea
            })
            break;
        }
        if (!resizeNodeDotStore.isMouseDown) { //click状态保持不变
            resizeNodeDotStore.$patch({
                hoverNodeId: "",
                hoverPosition: ""
            })
        }
    }
}
/**
 * node上面移动
 */
export function changeNodeStateWhenMouseMove(e: MouseEvent): void {
    const createLineDotState = useFlowCreateLineDotStateStore()
    const containerStore = useFlowContainerStore()
    const nodesStore = useFlowNodesStore()
    const nodeStateStore = useFlowNodeStateStore()
    const mouseOffsetX = e.clientX - containerStore.clientX
    const mouseOffsetY = e.clientY - containerStore.clientY
    const matchedNodes: FlowNodeInfo[] = [];
    for (let i = 0; i < nodesStore.nodeList.length; i += 1) {
        const node = nodesStore.nodeList[i];
        const { offsetX, width, offsetY, height } = node.styleInfo;
        const isInX = mouseOffsetX >= offsetX && mouseOffsetX < offsetX + width;
        const isInY = mouseOffsetY >= offsetY && mouseOffsetY < offsetY + height;
        if (isInX && isInY) {
            matchedNodes.push(node);
        }
    }
    if (matchedNodes.length === 0 && !createLineDotState.hoverNodeId) {
        nodeStateStore.$patch({
            hoverNodeId: ""
        })
    } else if (matchedNodes.length !== 0) {
        let maxZIndexNode = matchedNodes[0]
        for (let i = 1; i < matchedNodes.length; i += 1) {
            if (matchedNodes[i].styleInfo.zIndex > maxZIndexNode.styleInfo.zIndex) {
                maxZIndexNode = matchedNodes[i]
            }
        }
        nodeStateStore.$patch({
            hoverNodeId: maxZIndexNode.id
        })
    }
}
/**
 * line上面移动
 */
export function changeLineStateWhenMouseMove(e: MouseEvent): void {
    const linesStore = useFlowLinesStore()
    const lineStateStore = useFlowLineStateStore()
    for (let i = 0; i < linesStore.lineList.length; i += 1) {
        const line = linesStore.lineList[i];
        const { arrowInfo: { leftTopPoint, rightBottomPoint } } = line;
        const isXInLineArrow = e.clientX >= leftTopPoint.clientX && e.clientX <= rightBottomPoint.clientX;
        const isYInLineArrow = e.clientY >= leftTopPoint.clientY && e.clientY <= rightBottomPoint.clientY;
        if (isXInLineArrow && isYInLineArrow) { //鼠标是否在箭头上
            lineStateStore.$patch({
                hoverDragLineId: line.id,
                isHoverDragArrow: true,
            })
            break
        }
        if (mouseIsInLine(e, line)) {
            lineStateStore.$patch({
                hoverDragLineId: "",
                hoverLineId: line.id,
                isHoverDragArrow: false,
            })
            break
        }
        lineStateStore.$patch({
            hoverDragLineId: "",
            isHoverDragArrow: false,
            hoverLineId: "",
        })
    }
}

/**
 * 拖拽node移动
 */
export function changeNodeWhenMouseMove(e: MouseEvent): void {
    const createLineStateStore = useFlowCreateLineDotStateStore();
    const resizeNodeDotStateStore = useFlowResizeNodeStateStore();
    const nodeStateStore = useFlowNodeStateStore();
    const nodesStore = useFlowNodesStore();
    const lineStateStore = useFlowLineStateStore();
    if (!nodeStateStore.isMouseDown || resizeNodeDotStateStore.isMouseDown || lineStateStore.isHoverDragArrow || createLineStateStore.isMouseDown) {
        return
    }
    const matchedNode = nodesStore.nodeList.find(node => node.id === nodeStateStore.dragNodeId)
    if (matchedNode) {
        const relativeX = e.clientX - nodeStateStore.mouseDownClientX; //相对于mousedown位置移动距离
        const relativeY = e.clientY - nodeStateStore.mouseDownClientY; //相对于mousedown位置移动距离
        nodesStore.$patch((state) => {
            const matched = state.nodeList.find(node => node.id === matchedNode.id)
            if (matched) {
                matched.styleInfo.offsetX = nodeStateStore.nodeOffsetXWhenMouseDown + relativeX;
                matched.styleInfo.offsetY = nodeStateStore.nodeOffsetYWhenMouseDown + relativeY;
            }
        })
        nodeStateStore.$patch({
            isMove: true
        })
        // getDrawInfoWhenMoveOrResize(matchedNode)
    }
}
