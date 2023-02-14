/*
|--------------------------------------------------------------------------
| 公共方法
|--------------------------------------------------------------------------
*/

import { store } from "@/store";
import { ApidocApiflowNodeInfo } from "@@/store";
import { computed } from "vue";
import { Coordinate } from "../utils";

type OffsetCoordinate = {
    offsetX: number,
    offsetY: number
}
type StickyAreaPosition = {
    stickySize?: number,
    startPoint: Coordinate
}
type Position = "left" | "top" | "right" | "bottom"

const containerInfo = computed(() => store.state["apidoc/apiflow"].containerInfo)
export type StickyArea = {
    leftArea: {
        pointX: number,
        pointY: number,
        offsetX: number,
        offsetX2: number,
        offsetY: number,
        offsetY2: number,
    },
    topArea: {
        pointX: number,
        pointY: number,
        offsetX: number,
        offsetX2: number,
        offsetY: number,
        offsetY2: number,
    },
    rightArea: {
        pointX: number,
        pointY: number,
        offsetX: number,
        offsetX2: number,
        offsetY: number,
        offsetY2: number,
    },
    bottomArea: {
        pointX: number,
        pointY: number,
        offsetX: number,
        offsetX2: number,
        offsetY: number,
        offsetY2: number,
    },
}
//返回节点上下左右四个连接点吸附区域
export function getNodeStickyArea(toNode: ApidocApiflowNodeInfo, options: StickyAreaPosition): StickyArea {
    const { styleInfo } = toNode;
    const { stickySize = 10, startPoint } = options
    const leftMidPoint: OffsetCoordinate = {
        offsetX: styleInfo.offsetX,
        offsetY: styleInfo.offsetY + styleInfo.height / 2
    }
    const topMidPoint: OffsetCoordinate = {
        offsetX: styleInfo.offsetX + styleInfo.width / 2,
        offsetY: styleInfo.offsetY
    }
    const rightMidPoint: OffsetCoordinate = {
        offsetX: styleInfo.offsetX + styleInfo.width,
        offsetY: styleInfo.offsetY + styleInfo.height / 2
    }
    const bottomMidPoint: OffsetCoordinate = {
        offsetX: styleInfo.offsetX + styleInfo.width / 2,
        offsetY: styleInfo.offsetY + styleInfo.height
    }
    // const generateStickyArea = () => {
    // }
    const leftArea = {
        pointX: leftMidPoint.offsetX,
        pointY: leftMidPoint.offsetY,
        offsetX: leftMidPoint.offsetX - stickySize,
        offsetX2: leftMidPoint.offsetX + stickySize,
        offsetY: styleInfo.offsetY + stickySize,
        offsetY2: styleInfo.offsetY + styleInfo.height - stickySize,
    };
    const rightArea = {
        pointX: rightMidPoint.offsetX,
        pointY: rightMidPoint.offsetY,
        offsetX: rightMidPoint.offsetX - stickySize,
        offsetX2: rightMidPoint.offsetX + stickySize,
        offsetY: styleInfo.offsetY + stickySize,
        offsetY2: styleInfo.offsetY + styleInfo.height - stickySize,
    }
    const topArea = {
        pointX: topMidPoint.offsetX,
        pointY: topMidPoint.offsetY,
        offsetX: styleInfo.offsetX + stickySize,
        offsetX2: styleInfo.offsetX + styleInfo.width - stickySize,
        offsetY: topMidPoint.offsetY - stickySize,
        offsetY2: topMidPoint.offsetY + stickySize,
    }
    const bottomArea = {
        pointX: bottomMidPoint.offsetX,
        pointY: bottomMidPoint.offsetY,
        offsetX: styleInfo.offsetX + stickySize,
        offsetX2: styleInfo.offsetX + styleInfo.width - stickySize,
        offsetY: bottomMidPoint.offsetY - stickySize,
        offsetY2: bottomMidPoint.offsetY + stickySize,
    }
    const stickyFactor = 0.618
    const toNodeIsOnRightSide = styleInfo.offsetX > startPoint.x;
    const toNodeIsOnTopSide = styleInfo.offsetY < startPoint.y;
    if (toNodeIsOnRightSide && toNodeIsOnTopSide) { //右上，toNode只可能左、下节点延长吸附区域
        const gapX = Math.abs(styleInfo.offsetX - startPoint.x);
        const gapY = Math.abs(styleInfo.offsetY + styleInfo.height - startPoint.y);
        if (gapX > gapY * stickyFactor) { //toNode延长吸附区域在左侧
            leftArea.offsetX2 = leftMidPoint.offsetX + styleInfo.width - stickySize
        } else { //toNode延长吸附区域在下侧
            bottomArea.offsetY = styleInfo.offsetY + stickySize
        }
    } else if (!toNodeIsOnRightSide && toNodeIsOnTopSide) { //左上，toNode只可能右、下节点延长吸附区域
        const gapX = Math.abs(styleInfo.offsetX + styleInfo.width - startPoint.x);
        const gapY = Math.abs(styleInfo.offsetY + styleInfo.height - startPoint.y);
        if (gapX > gapY * stickyFactor) { //toNode延长吸附区域在右侧
            rightArea.offsetX = leftMidPoint.offsetX + stickySize
        } else { //toNode延长吸附区域在下侧
            bottomArea.offsetY = styleInfo.offsetY + stickySize
        }
    } else if (toNodeIsOnRightSide && !toNodeIsOnTopSide) { //右下，toNode只可能左、上节点延长吸附区域
        const gapX = Math.abs(startPoint.x - styleInfo.offsetX);
        const gapY = Math.abs(startPoint.y - styleInfo.offsetY);
        if (gapX > gapY * stickyFactor) { //toNode延长吸附区域在左侧
            leftArea.offsetX2 = leftMidPoint.offsetX + styleInfo.width - stickySize
        } else { //toNode延长吸附区域在上侧
            topArea.offsetY2 = bottomMidPoint.offsetY - stickySize
        }
    } else if (!toNodeIsOnRightSide && !toNodeIsOnTopSide) { //左下，toNode只可能右、上节点延长吸附区域
        const gapX = Math.abs(styleInfo.offsetX + styleInfo.width - startPoint.x);
        const gapY = Math.abs(startPoint.y - styleInfo.offsetY);
        if (gapX > gapY * stickyFactor) { //toNode延长吸附区域在右侧
            rightArea.offsetX = leftMidPoint.offsetX + stickySize
        } else { //toNode延长吸附区域在上侧
            topArea.offsetY2 = bottomMidPoint.offsetY - stickySize
        }
    }
    return {
        leftArea,
        topArea,
        rightArea,
        bottomArea,
    };
}
export const getLineStickyPosition = (point: Coordinate, stickyArea: StickyArea): Position | null => {
    const isLineXInLeftStickyArea = point.x >= stickyArea.leftArea.offsetX && point.x <= stickyArea.leftArea.offsetX2;
    const isLineYInLeftStickyArea = point.y >= stickyArea.leftArea.offsetY && point.y <= stickyArea.leftArea.offsetY2;
    const isLineXInTopStickyArea = point.x >= stickyArea.topArea.offsetX && point.x <= stickyArea.topArea.offsetX2;
    const isLineYInTopStickyArea = point.y >= stickyArea.topArea.offsetY && point.y <= stickyArea.topArea.offsetY2;
    const isLineXInBottomStickyArea = point.x >= stickyArea.bottomArea.offsetX && point.x <= stickyArea.bottomArea.offsetX2;
    const isLineYInBottomStickyArea = point.y >= stickyArea.bottomArea.offsetY && point.y <= stickyArea.bottomArea.offsetY2;
    const isLineXInRightStickyArea = point.x >= stickyArea.rightArea.offsetX && point.x <= stickyArea.rightArea.offsetX2;
    const isLineYInRightStickyArea = point.y >= stickyArea.rightArea.offsetY && point.y <= stickyArea.rightArea.offsetY2;
    // console.log(point.y, stickyArea.topArea.offsetY, stickyArea.topArea.offsetY2, isLineYInTopStickyArea)
    if (isLineXInLeftStickyArea && isLineYInLeftStickyArea) {
        return "left"
    }
    if (isLineXInTopStickyArea && isLineYInTopStickyArea) {
        return "top"
    }
    if (isLineXInBottomStickyArea && isLineYInBottomStickyArea) {
        return "bottom"
    }
    if (isLineXInRightStickyArea && isLineYInRightStickyArea) {
        return "right"
    }
    return null;
}
export const getContraryPosition = (position: Position): Position => {
    if (position === "left") {
        return "right"
    }
    if (position === "right") {
        return "left"
    }
    if (position === "top") {
        return "bottom"
    }
    if (position === "bottom") {
        return "top"
    }
    return "left"
}
//返回节点上下左右四个连接点区域
export function getCreateLineArea(nodeInfo: ApidocApiflowNodeInfo): StickyArea {
    const { createLineNodeSize } = containerInfo.value
    const leftArea = {
        pointX: nodeInfo.styleInfo.offsetX,
        pointY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height / 2,
        offsetX: nodeInfo.styleInfo.offsetX - createLineNodeSize,
        offsetX2: nodeInfo.styleInfo.offsetX + createLineNodeSize,
        offsetY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height / 2 - createLineNodeSize,
        offsetY2: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height / 2 + createLineNodeSize,
    }
    const rightArea = {
        pointX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width,
        pointY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height / 2,
        offsetX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width - createLineNodeSize,
        offsetX2: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width + createLineNodeSize,
        offsetY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height / 2 - createLineNodeSize,
        offsetY2: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height / 2 + createLineNodeSize,
    }
    const topArea = {
        pointX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width / 2,
        pointY: nodeInfo.styleInfo.offsetY,
        offsetX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width / 2 - createLineNodeSize,
        offsetX2: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width / 2 + createLineNodeSize,
        offsetY: nodeInfo.styleInfo.offsetY - createLineNodeSize,
        offsetY2: nodeInfo.styleInfo.offsetY + createLineNodeSize,
    }
    const bottomArea = {
        pointX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width / 2,
        pointY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height,
        offsetX: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width / 2 - createLineNodeSize,
        offsetX2: nodeInfo.styleInfo.offsetX + nodeInfo.styleInfo.width / 2 + createLineNodeSize,
        offsetY: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height - createLineNodeSize,
        offsetY2: nodeInfo.styleInfo.offsetY + nodeInfo.styleInfo.height + createLineNodeSize,
    }
    return {
        leftArea,
        rightArea,
        topArea,
        bottomArea
    }
}
