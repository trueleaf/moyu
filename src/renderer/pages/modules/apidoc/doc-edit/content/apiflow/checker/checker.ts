import { store } from "@/store";
import { ApidocApiflowLineInfo } from "@@/store";
import { computed } from "vue";
import { getCreateLineArea, getResizeBarArea, ResizeDotArea, StickyArea } from "../components/utils/common/common";

/*
|--------------------------------------------------------------------------
| 基础数据
|--------------------------------------------------------------------------
*/
const nodeList = computed(() => store.state["apidoc/apiflow"].nodeList);
const containerInfo = computed(() => store.state["apidoc/apiflow"].containerInfo)
/**
 * 检查鼠标是否在创建连线节点上面
 */
export function checkMouseIsInCreateLineDot(e: MouseEvent): void {
    const mouseOffsetX = e.clientX - containerInfo.value.clientX
    const mouseOffsetY = e.clientY - containerInfo.value.clientY
    const getMouseIsInCreateDot = (createLineArea: StickyArea, { x, y }: { x: number; y: number }) => {
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
        return null;
    }
    const nodes = nodeList.value;
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        const createLineArea = getCreateLineArea(node);
        const mouseInCreateDotPosition = getMouseIsInCreateDot(createLineArea, {
            x: mouseOffsetX,
            y: mouseOffsetY
        })
        if (mouseInCreateDotPosition) {
            store.commit("apidoc/apiflow/changeMouseIncreateLineDotInfo", {
                nodeId: node.id,
                position: mouseInCreateDotPosition
            })
            break
        }
        store.commit("apidoc/apiflow/changeMouseIncreateLineDotInfo", {
            nodeId: "",
            position: ""
        })
    }
}
/**
 * 检查鼠标是否在线条箭头上面
 */
export function checkMouseIsInLineArrow(e: MouseEvent): void {
    const nodes = nodeList.value;
    const lines: ApidocApiflowLineInfo[] = [];
    nodes.forEach(node => {
        node.outcomings.forEach(line => {
            lines.push(line)
        })
    })
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const { arrowInfo: { leftTopPoint, rightBottomPoint } } = line;
        const isXInLineArrow = e.clientX >= leftTopPoint.clientX && e.clientX <= rightBottomPoint.clientX
        const isYInLineArrow = e.clientY >= leftTopPoint.clientY && e.clientY <= rightBottomPoint.clientY
        if (isXInLineArrow && isYInLineArrow) { //鼠标是否在箭头上
            store.commit("apidoc/apiflow/changeMouseInLineInfo", {
                mouseInlineId: line.id,
                isInDragArrow: true
            });
            break
        }
        store.commit("apidoc/apiflow/changeMouseInLineInfo", {
            mouseInlineId: "",
            isInDragArrow: false
        });
    }
}
/**
 * 检查鼠标是否在节点上面
 */
export function checkMouseIsInNode(e: MouseEvent): void {
    const nodes = nodeList.value;
    const mouseOffsetX = e.clientX - containerInfo.value.clientX
    const mouseOffsetY = e.clientY - containerInfo.value.clientY
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        const { offsetX, width, offsetY, height } = node.styleInfo;
        const isInX = mouseOffsetX >= offsetX && mouseOffsetX < offsetX + width;
        const isInY = mouseOffsetY >= offsetY && mouseOffsetY < offsetY + height;
        if (isInX && isInY) {
            store.commit("apidoc/apiflow/changehoverNodeId", node.id);
            break;
        }
        store.commit("apidoc/apiflow/changehoverNodeId", "");
    }
}
/**
 * 当前鼠标是否在节点缩放按钮上面
 */
export function checkMouseIsInResizeDot(e: MouseEvent): void {
    const nodes = nodeList.value;
    const mouseOffsetX = e.clientX - containerInfo.value.clientX
    const mouseOffsetY = e.clientY - containerInfo.value.clientY
    const getResizeDotArea = (resizeDotArea: ResizeDotArea, { x, y }: { x: number; y: number }) => {
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
        return null;
    }
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        const resizeArea = getResizeBarArea(node);
        const resizeNodeArea = getResizeDotArea(resizeArea, {
            x: mouseOffsetX,
            y: mouseOffsetY
        });
        if (resizeNodeArea) {
            store.commit("apidoc/apiflow/changeMouseInResizeDotInfo", {
                nodeId: node.id,
                position: resizeNodeArea
            });
            break;
        }
        store.commit("apidoc/apiflow/changeMouseInResizeDotInfo", {
            nodeId: "",
            position: "",
        });
    }
}
