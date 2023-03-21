import { useFlowConfigStore } from "@/store/apiflow/config";
import { useFlowContainerStore } from "@/store/apiflow/container";
import { useFlowCreateLineDotStateStore } from "@/store/apiflow/create-line-state";
import { useFlowLineStateStore } from "@/store/apiflow/line-state";
import { useFlowLinesStore } from "@/store/apiflow/lines";
import { useFlowNodeStateStore } from "@/store/apiflow/node-state";
import { useFlowNodesStore } from "@/store/apiflow/nodes";
import { useFlowResizeNodeStateStore } from "@/store/apiflow/resize-node-state";
import { FlowNodeInfo } from "@@/apiflow";

/**
 * 更新鼠标点击Node信息
 */
export function changeNodeStateWhenMouseDown(e: MouseEvent): void {
    const createLineStateStore = useFlowCreateLineDotStateStore();
    const nodeListStore = useFlowNodesStore()
    const containerInfoStore = useFlowContainerStore();
    const resizeNodeDotStateStore = useFlowResizeNodeStateStore()
    const nodeStateStore = useFlowNodeStateStore();
    const nodesStore = useFlowNodesStore();
    const configStore = useFlowConfigStore();
    if (createLineStateStore.hoverNodeId) {
        return
    }
    const mouseOffsetX = e.clientX - containerInfoStore.clientX
    const mouseOffsetY = e.clientY - containerInfoStore.clientY
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
            dragNodeId: ""
        })
    } else {
        let maxZIndexNode = matchedNodes[0]
        for (let i = 1; i < matchedNodes.length; i += 1) {
            if (matchedNodes[i].styleInfo.zIndex > maxZIndexNode.styleInfo.zIndex) {
                maxZIndexNode = matchedNodes[i]
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
        })
        nodesStore.changeNodeStyleInfoById(maxZIndexNode.id, {
            dragZIndex: configStore.dragNodeZIndex
        })
    }
}
/**
* 更新鼠标点击线条信息
*/
export function changeLineStateWhenMouseDown(): void {
    const lineStateStore = useFlowLineStateStore()
    const linesStore = useFlowLinesStore()
    if (lineStateStore.isHoverDragArrow) {
        lineStateStore.$patch({
            isMouseDownDragArrow: true,
            dragLineId: lineStateStore.hoverDragLineId
        })
    }
    const lines = linesStore.lineList;
    console.log(lines)
}
