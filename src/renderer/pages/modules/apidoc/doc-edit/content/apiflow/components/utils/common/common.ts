/*
|--------------------------------------------------------------------------
| 公共方法
|--------------------------------------------------------------------------
*/

import { ApidocApiflowNodeInfo } from "@@/store";

type OffsetCoordinate = {
    offsetX: number,
    offsetY: number
}
type StickyArea = {
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
export function getNodeStickyArea(node: ApidocApiflowNodeInfo, stickySize = 10): StickyArea {
    const { styleInfo } = node;
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
    return {
        leftArea: {
            pointX: leftMidPoint.offsetX,
            pointY: leftMidPoint.offsetY,
            offsetX: leftMidPoint.offsetX - stickySize,
            offsetX2: leftMidPoint.offsetX + node.styleInfo.width - stickySize,
            offsetY: node.styleInfo.offsetY + stickySize,
            offsetY2: node.styleInfo.offsetY + node.styleInfo.height - stickySize,
        },
        topArea: {
            pointX: topMidPoint.offsetX,
            pointY: topMidPoint.offsetY,
            offsetX: node.styleInfo.offsetX + stickySize,
            offsetX2: node.styleInfo.offsetX + node.styleInfo.width - stickySize,
            offsetY: topMidPoint.offsetY - stickySize,
            offsetY2: topMidPoint.offsetY + node.styleInfo.height - stickySize,
        },
        rightArea: {
            pointX: rightMidPoint.offsetX,
            pointY: rightMidPoint.offsetY,
            offsetX: rightMidPoint.offsetX - stickySize,
            offsetX2: rightMidPoint.offsetX + stickySize,
            offsetY: node.styleInfo.offsetY + stickySize,
            offsetY2: node.styleInfo.offsetY + node.styleInfo.height - stickySize,
        },
        bottomArea: {
            pointX: bottomMidPoint.offsetX,
            pointY: bottomMidPoint.offsetY,
            offsetX: node.styleInfo.offsetX + stickySize,
            offsetX2: bottomMidPoint.offsetX + node.styleInfo.width - stickySize,
            offsetY: bottomMidPoint.offsetY - stickySize,
            offsetY2: bottomMidPoint.offsetY + stickySize,
        },
    };
}
