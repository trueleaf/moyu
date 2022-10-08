import { store } from "@/store";
import { ApidocApiflowNodeInfo } from "@@/store";

const padding = 15; //绘制图形边距
type Coordinate = {
    x: number,
    y: number
}
type OffsetCoordinate = {
    offsetX: number,
    offsetY: number
}
type ResultRect = {
    x: number,
    y: number,
    width: number,
    height: number,
    lineInfo: {
        cpx: number,
        cpy: number,
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        arrowInfo: {
            leftTopPoint: Coordinate,
            rightTopPoint: Coordinate,
            leftBottomPoint: Coordinate,
            rightBottomPoint: Coordinate,
            p1: Coordinate,
            p2: Coordinate,
            p3: Coordinate,
        },
    },
}

//返回节点上下左右四个连接点吸附区域
function getNodeStickyArea(node: ApidocApiflowNodeInfo, stickySize = 40) {
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
            offsetX: leftMidPoint.offsetX - stickySize,
            offsetX2: leftMidPoint.offsetX + stickySize,
            offsetY: leftMidPoint.offsetY - stickySize,
            offsetY2: leftMidPoint.offsetY + stickySize,
        },
        topArea: {
            offsetX: topMidPoint.offsetX - stickySize,
            offsetX2: topMidPoint.offsetX + stickySize,
            offsetY: topMidPoint.offsetY - stickySize,
            offsetY2: topMidPoint.offsetY + stickySize,
        },
        rightArea: {
            offsetX: rightMidPoint.offsetX - stickySize,
            offsetX2: rightMidPoint.offsetX + stickySize,
            offsetY: rightMidPoint.offsetY - stickySize,
            offsetY2: rightMidPoint.offsetY + stickySize,
        },
        bottomArea: {
            offsetX: bottomMidPoint.offsetX - stickySize,
            offsetX2: bottomMidPoint.offsetX + stickySize,
            offsetY: bottomMidPoint.offsetY - stickySize,
            offsetY2: bottomMidPoint.offsetY + stickySize,
        },
    };
}
//根据起始位置返回节点 width height left top
export function getRectInfo(startInfo: Coordinate, endInfo: Coordinate, options: { currentNode: ApidocApiflowNodeInfo }): ResultRect {
    const nodes = store.state["apidoc/apiflow"].apiflowList;
    const { currentNode } = options;
    const arrowLength = 15;
    const arrowWidth = 5;
    const result: ResultRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        lineInfo: {
            cpx: 0,
            cpy: 0,
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            arrowInfo: {
                leftTopPoint: {
                    x: 0,
                    y: 0,
                },
                rightTopPoint: {
                    x: 0,
                    y: 0,
                },
                leftBottomPoint: {
                    x: 0,
                    y: 0,
                },
                rightBottomPoint: {
                    x: 0,
                    y: 0,
                },
                p1: {
                    x: 0,
                    y: 0,
                },
                p2: {
                    x: 0,
                    y: 0,
                },
                p3: {
                    x: 0,
                    y: 0,
                },
            },
        },
    }
    if (Math.abs(endInfo.x - startInfo.x) < 10 && Math.abs(endInfo.y - startInfo.y) < 10) {
        return result
    }
    if (endInfo.x > startInfo.x && endInfo.y <= startInfo.y) { //第一象限(startPostion为原点)
        //=====================================粘贴效果====================================//
        result.x = startInfo.x - padding;
        result.y = endInfo.y - padding
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding;
        result.height = Math.abs(endInfo.y - startInfo.y) + 2 * padding;
        nodes.forEach(node => {
            if (node.id === currentNode.id) {
                return;
            }
            const { leftArea, /*rightArea, topArea, bottomArea*/ } = getNodeStickyArea(node);
            if (endInfo.x >= leftArea.offsetX && endInfo.x <= leftArea.offsetX2 && endInfo.y >= leftArea.offsetY && endInfo.y <= leftArea.offsetY2) {
                // result.width = Math.abs(leftArea.offsetX + 40 - startInfo.x) + 2 * padding;
                // result.height = Math.abs(leftArea.offsetY + 40 - startInfo.y) + 2 * padding;
                // result.y = leftArea.offsetY + 40 - padding;
                // result.lineInfo.startX = padding;
                // result.lineInfo.startY = result.height - padding;
                // result.lineInfo.endX = result.width - padding;
                // result.lineInfo.endY = padding;
            }
            // if (endInfo.x >= rightArea.offsetX && endInfo.x <= rightArea.offsetX2) {
            //     result.width = Math.abs(rightArea.offsetX + 40 - startInfo.x - padding) + 2 * padding;
            // }
            // if (endInfo.y >= rightArea.offsetY && endInfo.y <= rightArea.offsetY2) {
            //     result.height = Math.abs(rightArea.offsetY + 40 - startInfo.y - padding) + 2 * padding;
            // }
            // if (endInfo.x >= topArea.offsetX && endInfo.x <= topArea.offsetX2) {
            //     result.width = Math.abs(topArea.offsetX + 40 - startInfo.x - padding) + 2 * padding;
            // }
            // if (endInfo.y >= topArea.offsetY && endInfo.y <= topArea.offsetY2) {
            //     result.height = Math.abs(topArea.offsetY + 40 - startInfo.y - padding) + 2 * padding;
            // }
            // if (endInfo.x >= bottomArea.offsetX && endInfo.x <= bottomArea.offsetX2) {
            //     result.width = Math.abs(bottomArea.offsetX + 40 - startInfo.x - padding) + 2 * padding;
            // }
            // if (endInfo.y >= bottomArea.offsetY && endInfo.y <= bottomArea.offsetY2) {
            //     result.height = Math.abs(bottomArea.offsetY + 40 - startInfo.y - padding) + 2 * padding;
            // }
            // console.log(endInfo);
        })
        result.lineInfo.startX = padding;
        result.lineInfo.startY = result.height - padding;
        result.lineInfo.endX = result.width - padding;
        result.lineInfo.endY = padding;
        result.lineInfo.cpx = padding;
        result.lineInfo.cpy = padding;
        //=========================================================================//
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY - padding
        }
        result.lineInfo.arrowInfo.leftBottomPoint = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY + padding
        }
        result.lineInfo.arrowInfo.rightTopPoint = {
            x: result.lineInfo.endX + padding,
            y: result.lineInfo.endY - padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.lineInfo.endX + padding,
            y: result.lineInfo.endY + padding
        }
        //=========================================================================//
        result.lineInfo.arrowInfo.p1 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY - arrowWidth
        }
        result.lineInfo.arrowInfo.p2 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY + arrowWidth
        }
        result.lineInfo.arrowInfo.p3 = {
            x: result.lineInfo.endX + arrowLength,
            y: result.lineInfo.endY
        }
    } else if (endInfo.x <= startInfo.x && endInfo.y <= startInfo.y) { //第二象限
        result.x = endInfo.x - padding;
        result.y = endInfo.y - padding
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding;
        result.height = Math.abs(endInfo.y - startInfo.y) + 2 * padding;
        result.lineInfo.startX = result.width - padding;
        result.lineInfo.startY = result.height - padding;
        result.lineInfo.endX = padding;
        result.lineInfo.endY = padding;
        result.lineInfo.cpx = result.width - padding;
        result.lineInfo.cpy = padding;
        //=========================================================================//
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY - padding
        }
        result.lineInfo.arrowInfo.leftBottomPoint = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY + padding
        }
        result.lineInfo.arrowInfo.rightTopPoint = {
            x: result.lineInfo.endX + padding,
            y: result.lineInfo.endY - padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.lineInfo.endX + padding,
            y: result.lineInfo.endY + padding
        }
        //=========================================================================//
        result.lineInfo.arrowInfo.p1 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY - arrowWidth
        }
        result.lineInfo.arrowInfo.p2 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY + arrowWidth
        }
        result.lineInfo.arrowInfo.p3 = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY
        }
    } else if (endInfo.x <= startInfo.x && endInfo.y > startInfo.y) { //第三象限
        result.x = endInfo.x - padding;
        result.y = startInfo.y - padding
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding;
        result.height = Math.abs(endInfo.y - startInfo.y) + 2 * padding;
        result.lineInfo.startX = result.width - padding;
        result.lineInfo.startY = padding;
        result.lineInfo.endX = padding;
        result.lineInfo.endY = result.height - padding;
        result.lineInfo.cpx = result.width - padding;
        result.lineInfo.cpy = result.height - padding;
        //=========================================================================//
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY - padding
        }
        result.lineInfo.arrowInfo.leftBottomPoint = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY + padding
        }
        result.lineInfo.arrowInfo.rightTopPoint = {
            x: result.lineInfo.endX + padding,
            y: result.lineInfo.endY - padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.lineInfo.endX + padding,
            y: result.lineInfo.endY + padding
        }
        //=========================================================================//
        result.lineInfo.arrowInfo.p1 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY - arrowWidth
        }
        result.lineInfo.arrowInfo.p2 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY + arrowWidth
        }
        result.lineInfo.arrowInfo.p3 = {
            x: result.lineInfo.endX - arrowLength,
            y: result.lineInfo.endY
        }
    } else if (endInfo.x > startInfo.x && endInfo.y > startInfo.y) { //第四象限
        result.x = startInfo.x - padding;
        result.y = startInfo.y - padding
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding;
        result.height = Math.abs(endInfo.y - startInfo.y) + 2 * padding;
        result.lineInfo.startX = padding;
        result.lineInfo.startY = padding;
        result.lineInfo.endX = result.width - padding;
        result.lineInfo.endY = result.height - padding;
        result.lineInfo.cpx = padding;
        result.lineInfo.cpy = result.height - padding;
        //=========================================================================//
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY - padding
        }
        result.lineInfo.arrowInfo.leftBottomPoint = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY + padding
        }
        result.lineInfo.arrowInfo.rightTopPoint = {
            x: result.lineInfo.endX + padding,
            y: result.lineInfo.endY - padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.lineInfo.endX + padding,
            y: result.lineInfo.endY + padding
        }
        //=========================================================================//
        result.lineInfo.arrowInfo.p1 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY - arrowWidth
        }
        result.lineInfo.arrowInfo.p2 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY + arrowWidth
        }
        result.lineInfo.arrowInfo.p3 = {
            x: result.lineInfo.endX + arrowLength,
            y: result.lineInfo.endY
        }
    }
    return result;
}
//获取zIndex值
let zIndex = 0;
export function getZIndex(): number {
    zIndex += 1;
    return zIndex;
}
//判断点是否在矩形内部
export const isInRect = (point: Coordinate, rectLeftTop: Coordinate, rectRightBottom: Coordinate): boolean => {
    if (point.x >= rectLeftTop.x && point.x <= rectRightBottom.x && point.y >= rectLeftTop.y && point.y <= rectRightBottom.y) {
        return true;
    }
    return false;
}
