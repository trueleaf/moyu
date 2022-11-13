import { ApidocApiflowLineInfo, ApidocApiflowNodeInfo, ApiflowOutComingDirection } from "@@/store";
import { getQuardantInfo } from "./quadrant/quardant";

export type Coordinate = {
    x: number,
    y: number
}
export type ResultRect = {
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
            rightBottomPoint: Coordinate,
            p1: Coordinate,
            p2: Coordinate,
            p3: Coordinate,
        },
        /**
         * 折线控制点
         */
        brokenLinePoints: Coordinate[],
    },
    /**
     * 是否连接到别的节点
     */
    isConnectedNode: boolean,
    /**
     * 连接到节点位置
     */
    connectedPosition: "left" | "top" | "right" | "bottom"
    /**
     * 被连接的节点id
     */
    connectedNodeId: string,
}
export type LineDrawInfoOptions = {
    fromNode: ApidocApiflowNodeInfo,
    currendLine?: ApidocApiflowLineInfo,
    fromPosition: ApiflowOutComingDirection
}
export type LineConfig = {
    /**
     * 线条与canvas容器之间的安全距离
     */
    padding: number,
    /**
     * 箭头长度
     */
    arrowLength: number,
    /**
     * 箭头宽度
     */
    arrowWidth: number,
    /**
     * 折线吸附阈值
     */
    breakLineSticky: number,
    /**
     * 折现与节点之间间隙
     */
    breakLineOffsetNode: number,
}
//根据起始位置返回节点 width height left top
export function getLineDrawInfo(startInfo: Coordinate, endInfo: Coordinate, options: LineDrawInfoOptions): ResultRect {
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
            brokenLinePoints: [],
        },
        isConnectedNode: false,
        connectedPosition: "left",
        connectedNodeId: ""
    }
    const { fromPosition, fromNode } = options;
    const lineConfig: LineConfig = {
        padding: 15, //绘制图形边距
        arrowLength: 15, //箭头长度, 箭头长度不能超过绘制图形边距
        arrowWidth: 5, //箭头宽度
        breakLineSticky: 5, //折线吸附阈值
        breakLineOffsetNode: 25, //折现与节点之间间隙
    }
    if (Math.abs(endInfo.x - startInfo.x) < 10 && Math.abs(endInfo.y - startInfo.y) < 10) {
        return result
    }
    if (endInfo.x > startInfo.x && endInfo.y <= startInfo.y) { //第一象限(startPostion为原点)
        getQuardantInfo(result, {
            ...options,
            startInfo,
            endInfo,
            lineConfig,
        });
        //=====================================绘制折线====================================//
        // const breakPointStartY = result.lineInfo.startY;
        // const breakPointEndY = result.lineInfo.endY;
        // const breakLineHeight = Math.abs(breakPointEndY - breakPointStartY); //折线高度
        if (fromPosition === "left") {
            /* if (breakLineHeight < fromNode.styleInfo.height / 2 + lineConfig.breakLineOffsetNode) { //节点内部加上缓冲距离
                result.x = fromNode.styleInfo.offsetX - lineConfig.padding - lineConfig.breakLineOffsetNode;
                result.y = fromNode.styleInfo.offsetY - lineConfig.padding - lineConfig.breakLineOffsetNode;
                result.width = Math.abs(endInfo.x - result.x) + lineConfig.padding;
                result.height = fromNode.styleInfo.height / 2 + lineConfig.breakLineOffsetNode + 2 * lineConfig.padding;
                if (result.width < lineConfig.breakLineOffsetNode * 2 + lineConfig.padding * 2) { //宽度二倍breakLineOffsetNode+2*lineConfig.padding
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding + lineConfig.breakLineOffsetNode,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding,
                        y: lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y + lineConfig.arrowLength,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x + lineConfig.arrowWidth,
                        y: endInfo.y - result.y
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x - lineConfig.arrowWidth,
                        y: endInfo.y - result.y
                    }
                } else {
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding + lineConfig.breakLineOffsetNode,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding * 2,
                        y: lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding * 2,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x + lineConfig.arrowLength,
                        y: endInfo.y - result.y,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y + lineConfig.arrowWidth
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - lineConfig.arrowWidth
                    }
                }
            } else { //节点外部
                result.x = fromNode.styleInfo.offsetX - lineConfig.padding - lineConfig.breakLineOffsetNode;
                result.y = endInfo.y - lineConfig.padding;
                result.width = Math.abs(endInfo.x - result.x) + lineConfig.padding;
                result.height = Math.abs(endInfo.y - fromNode.styleInfo.offsetY) + fromNode.styleInfo.height / 2 + 2 * lineConfig.padding;
                // eslint-disable-next-line no-lonely-if
                if (result.width > result.height - lineConfig.breakLineOffsetNode) { //宽度二倍breakLineOffsetNode+2*lineConfig.padding
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding + lineConfig.breakLineOffsetNode,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding,
                        y: lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x + lineConfig.arrowLength,
                        y: endInfo.y - result.y,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y + lineConfig.arrowWidth
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - lineConfig.arrowWidth
                    }
                } else {
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding + lineConfig.breakLineOffsetNode,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: lineConfig.padding + lineConfig.breakLineOffsetNode
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: endInfo.x - result.x,
                        y: lineConfig.padding + lineConfig.breakLineOffsetNode
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - lineConfig.arrowLength,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x + lineConfig.arrowWidth,
                        y: endInfo.y - result.y
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x - lineConfig.arrowWidth,
                        y: endInfo.y - result.y
                    }
                }
            }
            //修复拖拽区域
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: result.width - lineConfig.padding * 2,
                y: endInfo.y - result.y - lineConfig.padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: result.width,
                y: endInfo.y - result.y + lineConfig.padding
            } */
        } else if (fromPosition === "bottom") {
            if (Math.abs(endInfo.x - startInfo.x) < fromNode.styleInfo.width / 2 + lineConfig.breakLineOffsetNode) { //节点内部加上缓冲距离
                result.x = fromNode.styleInfo.offsetX + fromNode.styleInfo.width / 2 - lineConfig.padding;
                result.y = endInfo.y - lineConfig.padding;
                result.width = fromNode.styleInfo.width / 2 + lineConfig.breakLineOffsetNode + 2 * lineConfig.padding;
                result.height = Math.abs(endInfo.y - startInfo.y) + 2 * lineConfig.padding + lineConfig.breakLineOffsetNode;
                if (Math.abs(endInfo.y - startInfo.y) < lineConfig.breakLineOffsetNode) { //箭头朝左
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: Math.abs(endInfo.y - startInfo.y) + lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x - lineConfig.arrowLength,
                        y: endInfo.y - result.y,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y + lineConfig.arrowWidth
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - lineConfig.arrowWidth
                    }
                } else { //箭头朝上
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: Math.abs(endInfo.y - startInfo.y) + lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding,
                        y: endInfo.y - result.y + lineConfig.breakLineOffsetNode
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y + lineConfig.breakLineOffsetNode
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - lineConfig.arrowLength,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x + lineConfig.arrowWidth,
                        y: endInfo.y - result.y
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x - lineConfig.arrowWidth,
                        y: endInfo.y - result.y
                    }
                }
            } else { //节点外部
                result.x = fromNode.styleInfo.offsetX + fromNode.styleInfo.width / 2 - lineConfig.padding;
                result.y = endInfo.y - lineConfig.padding;
                result.width = Math.abs(endInfo.x - startInfo.x) + 2 * lineConfig.padding;
                result.height = Math.abs(endInfo.y - startInfo.y) + 2 * lineConfig.padding + lineConfig.breakLineOffsetNode;
                if (result.width > result.height) { //箭头朝右
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: Math.abs(endInfo.y - startInfo.y) + lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding - lineConfig.breakLineOffsetNode,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding - lineConfig.breakLineOffsetNode,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x + lineConfig.arrowLength,
                        y: endInfo.y - result.y,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y + lineConfig.arrowWidth
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - lineConfig.arrowWidth
                    }
                } else {
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: Math.abs(endInfo.y - startInfo.y) + lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: lineConfig.padding,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - lineConfig.padding,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - lineConfig.arrowLength,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x - lineConfig.arrowWidth,
                        y: endInfo.y - result.y
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x + lineConfig.arrowWidth,
                        y: endInfo.y - result.y
                    }
                }
            }
        }
    } else if (endInfo.x <= startInfo.x && endInfo.y <= startInfo.y) { //第二象限
        result.x = endInfo.x - lineConfig.padding;
        result.y = endInfo.y - lineConfig.padding
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * lineConfig.padding;
        result.height = Math.abs(endInfo.y - startInfo.y) + 2 * lineConfig.padding;
        result.lineInfo.startX = result.width - lineConfig.padding;
        result.lineInfo.startY = result.height - lineConfig.padding;
        result.lineInfo.endX = lineConfig.padding;
        result.lineInfo.endY = lineConfig.padding;
        result.lineInfo.cpx = result.width - lineConfig.padding;
        result.lineInfo.cpy = lineConfig.padding;
        //=========================================================================//
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: result.lineInfo.endX - lineConfig.padding,
            y: result.lineInfo.endY - lineConfig.padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.lineInfo.endX + lineConfig.padding,
            y: result.lineInfo.endY + lineConfig.padding
        }
        //=========================================================================//
        result.lineInfo.arrowInfo.p1 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY - lineConfig.arrowWidth
        }
        result.lineInfo.arrowInfo.p2 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY + lineConfig.arrowWidth
        }
        result.lineInfo.arrowInfo.p3 = {
            x: result.lineInfo.endX - lineConfig.padding,
            y: result.lineInfo.endY
        }
    } else if (endInfo.x <= startInfo.x && endInfo.y > startInfo.y) { //第三象限
        result.x = endInfo.x - lineConfig.padding;
        result.y = startInfo.y - lineConfig.padding
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * lineConfig.padding;
        result.height = Math.abs(endInfo.y - startInfo.y) + 2 * lineConfig.padding;
        result.lineInfo.startX = result.width - lineConfig.padding;
        result.lineInfo.startY = lineConfig.padding;
        result.lineInfo.endX = lineConfig.padding;
        result.lineInfo.endY = result.height - lineConfig.padding;
        result.lineInfo.cpx = result.width - lineConfig.padding;
        result.lineInfo.cpy = result.height - lineConfig.padding;
        //=========================================================================//
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: result.lineInfo.endX - lineConfig.padding,
            y: result.lineInfo.endY - lineConfig.padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.lineInfo.endX + lineConfig.padding,
            y: result.lineInfo.endY + lineConfig.padding
        }
        //=========================================================================//
        result.lineInfo.arrowInfo.p1 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY - lineConfig.arrowWidth
        }
        result.lineInfo.arrowInfo.p2 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY + lineConfig.arrowWidth
        }
        result.lineInfo.arrowInfo.p3 = {
            x: result.lineInfo.endX - lineConfig.arrowLength,
            y: result.lineInfo.endY
        }
    } else if (endInfo.x > startInfo.x && endInfo.y > startInfo.y) { //第四象限
        result.x = startInfo.x - lineConfig.padding;
        result.y = startInfo.y - lineConfig.padding
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * lineConfig.padding;
        result.height = Math.abs(endInfo.y - startInfo.y) + 2 * lineConfig.padding;
        result.lineInfo.startX = lineConfig.padding;
        result.lineInfo.startY = lineConfig.padding;
        result.lineInfo.endX = result.width - lineConfig.padding;
        result.lineInfo.endY = result.height - lineConfig.padding;
        result.lineInfo.cpx = lineConfig.padding;
        result.lineInfo.cpy = result.height - lineConfig.padding;
        //=========================================================================//
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: result.lineInfo.endX - lineConfig.padding,
            y: result.lineInfo.endY - lineConfig.padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.lineInfo.endX + lineConfig.padding,
            y: result.lineInfo.endY + lineConfig.padding
        }
        //=========================================================================//
        result.lineInfo.arrowInfo.p1 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY - lineConfig.arrowWidth
        }
        result.lineInfo.arrowInfo.p2 = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY + lineConfig.arrowWidth
        }
        result.lineInfo.arrowInfo.p3 = {
            x: result.lineInfo.endX + lineConfig.arrowLength,
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
