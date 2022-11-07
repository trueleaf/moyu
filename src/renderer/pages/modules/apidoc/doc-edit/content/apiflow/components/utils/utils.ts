import { store } from "@/store";
import { ApidocApiflowLineInfo, ApidocApiflowNodeInfo, ApiflowOutComingDirection } from "@@/store";
import { getNodeStickyArea } from "./common/common"
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
    currentNode: ApidocApiflowNodeInfo,
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
    const nodes = store.state["apidoc/apiflow"].apiflowList;
    const { fromPosition, currentNode } = options;
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
        result.lineInfo.startX = lineConfig.padding;
        result.lineInfo.startY = result.height - lineConfig.padding;
        result.lineInfo.endX = result.width - lineConfig.padding;
        result.lineInfo.endY = lineConfig.padding;
        //=====================================绘制折线====================================//
        const breakPointStartX = lineConfig.padding;
        const breakPointStartY = result.lineInfo.startY;
        const breakPointEndX = result.lineInfo.endX;
        const breakPointEndY = result.lineInfo.endY;
        const breakLineWidth = Math.abs(breakPointEndX - breakPointStartX); //折线宽度
        const breakLineHeight = Math.abs(breakPointEndY - breakPointStartY); //折线高度
        //起始点
        if (fromPosition === "right" && breakLineWidth > breakLineHeight) {
            //判断线条是否吸附节点
            nodes.filter(node => node.id !== currentNode.id).forEach(node => {
                const stickyArea = getNodeStickyArea(node);
                const isLeftInLeftStickyArea = endInfo.x >= stickyArea.leftArea.offsetX && endInfo.x <= stickyArea.leftArea.offsetX2;
                const isTopInLeftStickyArea = endInfo.y >= stickyArea.leftArea.offsetY && endInfo.y <= stickyArea.leftArea.offsetY2;
                const isLeftInTopStickyArea = endInfo.x >= stickyArea.topArea.offsetX && endInfo.x <= stickyArea.topArea.offsetX2;
                const isTopInTopStickyArea = endInfo.y >= stickyArea.topArea.offsetY && endInfo.y <= stickyArea.topArea.offsetY2;
                const isLeftInBottomStickyArea = endInfo.x >= stickyArea.bottomArea.offsetX && endInfo.x <= stickyArea.bottomArea.offsetX2;
                const isTopInBottomStickyArea = endInfo.y >= stickyArea.bottomArea.offsetY && endInfo.y <= stickyArea.bottomArea.offsetY2;
                const isLeftInRightStickyArea = endInfo.x >= stickyArea.rightArea.offsetX && endInfo.x <= stickyArea.rightArea.offsetX2;
                const isTopInRightStickyArea = endInfo.y >= stickyArea.rightArea.offsetY && endInfo.y <= stickyArea.rightArea.offsetY2;
                if (isLeftInLeftStickyArea && isTopInLeftStickyArea) {
                    result.width = stickyArea.leftArea.pointX - startInfo.x + 2 * lineConfig.padding;
                    result.height = Math.abs(startInfo.y - stickyArea.leftArea.pointY) + 2 * lineConfig.padding;
                    result.y = stickyArea.leftArea.pointY - lineConfig.padding;
                    result.lineInfo.brokenLinePoints = [];
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x,
                        y: result.height - lineConfig.padding
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: (stickyArea.leftArea.pointX - startInfo.x) / 2,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: (stickyArea.leftArea.pointX - startInfo.x) / 2,
                        y: stickyArea.leftArea.pointY - result.y
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.leftArea.pointX - result.x - lineConfig.arrowLength,
                        y: stickyArea.leftArea.pointY - result.y
                    });
                    result.lineInfo.arrowInfo.p1 = {
                        x: stickyArea.leftArea.pointX - result.x - lineConfig.arrowLength,
                        y: stickyArea.leftArea.pointY - result.y + lineConfig.arrowWidth
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: stickyArea.leftArea.pointX - result.x,
                        y: stickyArea.leftArea.pointY - result.y
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: stickyArea.leftArea.pointX - result.x - lineConfig.arrowLength,
                        y: stickyArea.leftArea.pointY - result.y - lineConfig.arrowWidth
                    }
                    result.lineInfo.arrowInfo.leftTopPoint = {
                        x: result.width - lineConfig.padding * 3,
                        y: result.lineInfo.endY - lineConfig.padding
                    }
                    result.lineInfo.arrowInfo.rightBottomPoint = {
                        x: result.width - lineConfig.padding,
                        y: result.lineInfo.endY + lineConfig.padding
                    }
                    result.isConnectedNode = true
                    result.connectedPosition = "left";
                    result.connectedNodeId = node.id;
                } else if (isLeftInTopStickyArea && isTopInTopStickyArea) {
                    result.width = stickyArea.topArea.pointX - startInfo.x + 2 * lineConfig.padding;
                    result.height = Math.abs(startInfo.y - stickyArea.topArea.pointY) + 2 * lineConfig.padding + lineConfig.breakLineOffsetNode;
                    result.y = stickyArea.topArea.pointY - lineConfig.padding - lineConfig.breakLineOffsetNode;
                    result.lineInfo.brokenLinePoints = [];
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x,
                        y: result.height - lineConfig.padding
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x + lineConfig.breakLineOffsetNode,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x + lineConfig.breakLineOffsetNode,
                        y: stickyArea.topArea.pointY - result.y - lineConfig.breakLineOffsetNode
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.topArea.pointX - result.x,
                        y: stickyArea.topArea.pointY - result.y - lineConfig.breakLineOffsetNode
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.topArea.pointX - result.x,
                        y: stickyArea.topArea.pointY - result.y - lineConfig.padding
                    });
                    result.lineInfo.arrowInfo.p1 = {
                        x: stickyArea.topArea.pointX - result.x - lineConfig.arrowWidth,
                        y: stickyArea.topArea.pointY - result.y - lineConfig.arrowLength
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: stickyArea.topArea.pointX - result.x + lineConfig.arrowWidth,
                        y: stickyArea.topArea.pointY - result.y - lineConfig.arrowLength
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: stickyArea.topArea.pointX - result.x,
                        y: stickyArea.topArea.pointY - result.y
                    }
                    result.lineInfo.arrowInfo.leftTopPoint = {
                        x: result.width - lineConfig.padding * 2,
                        y: stickyArea.topArea.pointY - result.y - lineConfig.padding * 2
                    }
                    result.lineInfo.arrowInfo.rightBottomPoint = {
                        x: result.width,
                        y: stickyArea.topArea.pointY - result.y
                    }
                    result.isConnectedNode = true
                    result.connectedPosition = "top";
                    result.connectedNodeId = node.id;
                } else if (isLeftInBottomStickyArea && isTopInBottomStickyArea) {
                    result.width = stickyArea.bottomArea.pointX - startInfo.x + 2 * lineConfig.padding;
                    result.height = Math.abs(startInfo.y - stickyArea.bottomArea.pointY) + 2 * lineConfig.padding;
                    result.y = stickyArea.bottomArea.pointY - lineConfig.padding;
                    result.lineInfo.brokenLinePoints = [];
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x,
                        y: result.height - lineConfig.padding
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.bottomArea.pointX - startInfo.x + lineConfig.padding,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.bottomArea.pointX - startInfo.x + lineConfig.padding,
                        y: stickyArea.bottomArea.pointY - result.y
                    });
                    result.lineInfo.arrowInfo.p1 = {
                        x: stickyArea.bottomArea.pointX - startInfo.x + lineConfig.padding - lineConfig.arrowWidth,
                        y: stickyArea.bottomArea.pointY - result.y + lineConfig.arrowLength
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: stickyArea.bottomArea.pointX - startInfo.x + lineConfig.padding + lineConfig.arrowWidth,
                        y: stickyArea.bottomArea.pointY - result.y + lineConfig.arrowLength
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: stickyArea.bottomArea.pointX - startInfo.x + lineConfig.padding,
                        y: stickyArea.bottomArea.pointY - result.y
                    }
                    result.lineInfo.arrowInfo.leftTopPoint = {
                        x: result.width - lineConfig.padding * 2,
                        y: stickyArea.bottomArea.pointY - result.y - lineConfig.padding
                    }
                    result.lineInfo.arrowInfo.rightBottomPoint = {
                        x: result.width,
                        y: stickyArea.bottomArea.pointY - result.y + lineConfig.padding
                    }
                    result.isConnectedNode = true
                    result.connectedPosition = "bottom";
                    result.connectedNodeId = node.id;
                } else if (isLeftInRightStickyArea && isTopInRightStickyArea) {
                    result.width = stickyArea.rightArea.pointX - startInfo.x + 2 * lineConfig.padding + lineConfig.breakLineOffsetNode;
                    result.height = Math.abs(startInfo.y - stickyArea.rightArea.pointY) + 2 * lineConfig.padding;
                    result.y = stickyArea.rightArea.pointY - lineConfig.padding;
                    result.lineInfo.brokenLinePoints = [];
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x,
                        y: result.height - lineConfig.padding
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.rightArea.pointX - startInfo.x + lineConfig.padding + lineConfig.breakLineOffsetNode,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.rightArea.pointX - startInfo.x + lineConfig.padding + lineConfig.breakLineOffsetNode,
                        y: stickyArea.rightArea.pointY - result.y
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.rightArea.pointX - startInfo.x + lineConfig.padding * 2,
                        y: stickyArea.rightArea.pointY - result.y
                    });
                    result.lineInfo.arrowInfo.p1 = {
                        x: stickyArea.rightArea.pointX - startInfo.x + lineConfig.padding + lineConfig.arrowLength,
                        y: stickyArea.rightArea.pointY - result.y + lineConfig.arrowWidth
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: stickyArea.rightArea.pointX - startInfo.x + lineConfig.padding + lineConfig.arrowLength,
                        y: stickyArea.rightArea.pointY - result.y - lineConfig.arrowWidth
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: stickyArea.rightArea.pointX - startInfo.x + lineConfig.padding,
                        y: stickyArea.rightArea.pointY - result.y
                    }
                    result.lineInfo.arrowInfo.leftTopPoint = {
                        x: stickyArea.rightArea.pointX - result.x - lineConfig.padding,
                        y: stickyArea.rightArea.pointY - result.y - lineConfig.padding
                    }
                    result.lineInfo.arrowInfo.rightBottomPoint = {
                        x: stickyArea.rightArea.pointX - result.x + lineConfig.padding,
                        y: stickyArea.rightArea.pointY - result.y + lineConfig.padding
                    }
                    result.isConnectedNode = true
                    result.connectedPosition = "right";
                    result.connectedNodeId = node.id;
                }
            })
        } else if (fromPosition === "right" && breakLineWidth <= breakLineHeight) {
            // result.lineInfo.arrowInfo.p1 = {
            //     x: result.lineInfo.endX,
            //     y: result.lineInfo.endY - lineConfig.arrowLength
            // }
            // result.lineInfo.brokenLinePoints.push({
            //     x: breakPointEndX,
            //     y: breakPointEndY
            // })
            // result.lineInfo.arrowInfo.p2 = {
            //     x: result.lineInfo.endX - lineConfig.arrowWidth,
            //     y: result.lineInfo.endY
            // }
            // result.lineInfo.arrowInfo.p3 = {
            //     x: result.lineInfo.endX + lineConfig.arrowWidth,
            //     y: result.lineInfo.endY
            // }
            //=========================================================================//
            //判断线条是否吸附节点
            nodes.filter(node => node.id !== currentNode.id).forEach(node => {
                const stickyArea = getNodeStickyArea(node);
                const isLeftInLeftStickyArea = endInfo.x >= stickyArea.leftArea.offsetX && endInfo.x <= stickyArea.leftArea.offsetX2;
                const isTopInLeftStickyArea = endInfo.y >= stickyArea.leftArea.offsetY && endInfo.y <= stickyArea.leftArea.offsetY2;
                const isLeftInTopStickyArea = endInfo.x >= stickyArea.topArea.offsetX && endInfo.x <= stickyArea.topArea.offsetX2;
                const isTopInTopStickyArea = endInfo.y >= stickyArea.topArea.offsetY && endInfo.y <= stickyArea.topArea.offsetY2;
                const isLeftInBottomStickyArea = endInfo.x >= stickyArea.bottomArea.offsetX && endInfo.x <= stickyArea.bottomArea.offsetX2;
                const isTopInBottomStickyArea = endInfo.y >= stickyArea.bottomArea.offsetY && endInfo.y <= stickyArea.bottomArea.offsetY2;
                const isLeftInRightStickyArea = endInfo.x >= stickyArea.rightArea.offsetX && endInfo.x <= stickyArea.rightArea.offsetX2;
                const isTopInRightStickyArea = endInfo.y >= stickyArea.rightArea.offsetY && endInfo.y <= stickyArea.rightArea.offsetY2;
                if (isLeftInLeftStickyArea && isTopInLeftStickyArea) {
                    result.width = stickyArea.leftArea.pointX - startInfo.x + 2 * lineConfig.padding;
                    result.height = Math.abs(startInfo.y - stickyArea.leftArea.pointY) + 2 * lineConfig.padding;
                    result.y = stickyArea.leftArea.pointY - lineConfig.padding;
                    result.lineInfo.brokenLinePoints = [];
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x,
                        y: result.height - lineConfig.padding
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: (stickyArea.leftArea.pointX - startInfo.x) / 2,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: (stickyArea.leftArea.pointX - startInfo.x) / 2,
                        y: stickyArea.leftArea.pointY - result.y
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.leftArea.pointX - result.x - lineConfig.arrowLength,
                        y: stickyArea.leftArea.pointY - result.y
                    });
                    result.lineInfo.arrowInfo.p1 = {
                        x: stickyArea.leftArea.pointX - result.x - lineConfig.arrowLength,
                        y: stickyArea.leftArea.pointY - result.y + lineConfig.arrowWidth
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: stickyArea.leftArea.pointX - result.x,
                        y: stickyArea.leftArea.pointY - result.y
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: stickyArea.leftArea.pointX - result.x - lineConfig.arrowLength,
                        y: stickyArea.leftArea.pointY - result.y - lineConfig.arrowWidth
                    }
                    result.lineInfo.arrowInfo.leftTopPoint = {
                        x: result.width - lineConfig.padding * 3,
                        y: result.lineInfo.endY - lineConfig.padding
                    }
                    result.lineInfo.arrowInfo.rightBottomPoint = {
                        x: result.width - lineConfig.padding,
                        y: result.lineInfo.endY + lineConfig.padding
                    }
                    result.isConnectedNode = true
                    result.connectedPosition = "left";
                    result.connectedNodeId = node.id;
                } else if (isLeftInTopStickyArea && isTopInTopStickyArea) {
                    result.width = stickyArea.topArea.pointX - startInfo.x + 2 * lineConfig.padding;
                    result.height = Math.abs(startInfo.y - stickyArea.topArea.pointY) + 2 * lineConfig.padding + lineConfig.breakLineOffsetNode;
                    result.y = stickyArea.topArea.pointY - lineConfig.padding - lineConfig.breakLineOffsetNode;
                    result.lineInfo.brokenLinePoints = [];
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x,
                        y: result.height - lineConfig.padding
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x + lineConfig.breakLineOffsetNode,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x + lineConfig.breakLineOffsetNode,
                        y: stickyArea.topArea.pointY - result.y - lineConfig.breakLineOffsetNode
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.topArea.pointX - result.x,
                        y: stickyArea.topArea.pointY - result.y - lineConfig.breakLineOffsetNode
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.topArea.pointX - result.x,
                        y: stickyArea.topArea.pointY - result.y - lineConfig.padding
                    });
                    result.lineInfo.arrowInfo.p1 = {
                        x: stickyArea.topArea.pointX - result.x - lineConfig.arrowWidth,
                        y: stickyArea.topArea.pointY - result.y - lineConfig.arrowLength
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: stickyArea.topArea.pointX - result.x + lineConfig.arrowWidth,
                        y: stickyArea.topArea.pointY - result.y - lineConfig.arrowLength
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: stickyArea.topArea.pointX - result.x,
                        y: stickyArea.topArea.pointY - result.y
                    }
                    result.lineInfo.arrowInfo.leftTopPoint = {
                        x: result.width - lineConfig.padding * 2,
                        y: stickyArea.topArea.pointY - result.y - lineConfig.padding * 2
                    }
                    result.lineInfo.arrowInfo.rightBottomPoint = {
                        x: result.width,
                        y: stickyArea.topArea.pointY - result.y
                    }
                    result.isConnectedNode = true
                    result.connectedPosition = "top";
                    result.connectedNodeId = node.id;
                } else if (isLeftInBottomStickyArea && isTopInBottomStickyArea) {
                    result.width = stickyArea.bottomArea.pointX - startInfo.x + 2 * lineConfig.padding;
                    result.height = Math.abs(startInfo.y - stickyArea.bottomArea.pointY) + 2 * lineConfig.padding;
                    result.y = stickyArea.bottomArea.pointY - lineConfig.padding;
                    result.lineInfo.brokenLinePoints = [];
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x,
                        y: result.height - lineConfig.padding
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.bottomArea.pointX - startInfo.x + lineConfig.padding,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.bottomArea.pointX - startInfo.x + lineConfig.padding,
                        y: stickyArea.bottomArea.pointY - result.y
                    });
                    result.lineInfo.arrowInfo.p1 = {
                        x: stickyArea.bottomArea.pointX - startInfo.x + lineConfig.padding - lineConfig.arrowWidth,
                        y: stickyArea.bottomArea.pointY - result.y + lineConfig.arrowLength
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: stickyArea.bottomArea.pointX - startInfo.x + lineConfig.padding + lineConfig.arrowWidth,
                        y: stickyArea.bottomArea.pointY - result.y + lineConfig.arrowLength
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: stickyArea.bottomArea.pointX - startInfo.x + lineConfig.padding,
                        y: stickyArea.bottomArea.pointY - result.y
                    }
                    result.lineInfo.arrowInfo.leftTopPoint = {
                        x: result.width - lineConfig.padding * 2,
                        y: stickyArea.bottomArea.pointY - result.y - lineConfig.padding
                    }
                    result.lineInfo.arrowInfo.rightBottomPoint = {
                        x: result.width,
                        y: stickyArea.bottomArea.pointY - result.y + lineConfig.padding
                    }
                    result.isConnectedNode = true
                    result.connectedPosition = "bottom";
                    result.connectedNodeId = node.id;
                } else if (isLeftInRightStickyArea && isTopInRightStickyArea) {
                    result.width = stickyArea.rightArea.pointX - startInfo.x + 2 * lineConfig.padding + lineConfig.breakLineOffsetNode;
                    result.height = Math.abs(startInfo.y - stickyArea.rightArea.pointY) + 2 * lineConfig.padding;
                    result.y = stickyArea.rightArea.pointY - lineConfig.padding;
                    result.lineInfo.brokenLinePoints = [];
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x,
                        y: result.height - lineConfig.padding
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.rightArea.pointX - startInfo.x + lineConfig.padding + lineConfig.breakLineOffsetNode,
                        y: result.height - lineConfig.padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.rightArea.pointX - startInfo.x + lineConfig.padding + lineConfig.breakLineOffsetNode,
                        y: stickyArea.rightArea.pointY - result.y
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.rightArea.pointX - startInfo.x + lineConfig.padding * 2,
                        y: stickyArea.rightArea.pointY - result.y
                    });
                    result.lineInfo.arrowInfo.p1 = {
                        x: stickyArea.rightArea.pointX - startInfo.x + lineConfig.padding + lineConfig.arrowLength,
                        y: stickyArea.rightArea.pointY - result.y + lineConfig.arrowWidth
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: stickyArea.rightArea.pointX - startInfo.x + lineConfig.padding + lineConfig.arrowLength,
                        y: stickyArea.rightArea.pointY - result.y - lineConfig.arrowWidth
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: stickyArea.rightArea.pointX - startInfo.x + lineConfig.padding,
                        y: stickyArea.rightArea.pointY - result.y
                    }
                    result.lineInfo.arrowInfo.leftTopPoint = {
                        x: stickyArea.rightArea.pointX - result.x - lineConfig.padding,
                        y: stickyArea.rightArea.pointY - result.y - lineConfig.padding
                    }
                    result.lineInfo.arrowInfo.rightBottomPoint = {
                        x: stickyArea.rightArea.pointX - result.x + lineConfig.padding,
                        y: stickyArea.rightArea.pointY - result.y + lineConfig.padding
                    }
                    result.isConnectedNode = true
                    result.connectedPosition = "right";
                    result.connectedNodeId = node.id;
                }
            })
        } else if (fromPosition === "top" && breakLineWidth > breakLineHeight) {
            if (Math.abs(breakPointEndX - breakPointStartX) < lineConfig.breakLineSticky) { //折线吸附效果
                result.lineInfo.brokenLinePoints.push({
                    x: breakPointStartX,
                    y: breakPointEndY
                })
                result.lineInfo.brokenLinePoints.push({
                    x: breakPointStartX,
                    y: breakPointEndY
                })
                result.lineInfo.arrowInfo.p1 = {
                    x: breakPointStartX,
                    y: breakPointEndY - lineConfig.arrowLength
                }
                result.lineInfo.arrowInfo.p2 = {
                    x: breakPointStartX - lineConfig.arrowWidth,
                    y: breakPointEndY
                }
                result.lineInfo.arrowInfo.p3 = {
                    x: breakPointStartX + lineConfig.arrowWidth,
                    y: breakPointEndY
                }
            } else {
                result.lineInfo.brokenLinePoints.push({
                    x: breakPointStartX,
                    y: breakPointEndY
                })
                result.lineInfo.brokenLinePoints.push({
                    x: breakPointEndX,
                    y: breakPointEndY
                })
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
        } else if (fromPosition === "top" && breakLineWidth <= breakLineHeight) {
            if (Math.abs(breakPointEndX - breakPointStartX) < lineConfig.breakLineSticky) { //折线吸附效果
                result.lineInfo.brokenLinePoints.push({
                    x: breakPointStartX,
                    y: breakPointEndY
                })
                result.lineInfo.brokenLinePoints.push({
                    x: breakPointStartX,
                    y: breakPointEndY
                })
                result.lineInfo.arrowInfo.p1 = {
                    x: breakPointStartX,
                    y: breakPointEndY - lineConfig.arrowLength
                }
                result.lineInfo.arrowInfo.p2 = {
                    x: breakPointStartX - lineConfig.arrowWidth,
                    y: breakPointEndY
                }
                result.lineInfo.arrowInfo.p3 = {
                    x: breakPointStartX + lineConfig.arrowWidth,
                    y: breakPointEndY
                }
            } else {
                result.lineInfo.brokenLinePoints.push({
                    x: breakPointStartX,
                    y: breakPointStartY - breakLineHeight / 2
                })
                result.lineInfo.brokenLinePoints.push({
                    x: breakPointEndX,
                    y: breakPointStartY - breakLineHeight / 2
                })
                result.lineInfo.brokenLinePoints.push({
                    x: breakPointEndX,
                    y: breakPointEndY
                })
                result.lineInfo.arrowInfo.p1 = {
                    x: result.lineInfo.endX,
                    y: result.lineInfo.endY - lineConfig.arrowLength
                }
                result.lineInfo.arrowInfo.p2 = {
                    x: result.lineInfo.endX + lineConfig.arrowWidth,
                    y: result.lineInfo.endY
                }
                result.lineInfo.arrowInfo.p3 = {
                    x: result.lineInfo.endX - lineConfig.arrowWidth,
                    y: result.lineInfo.endY
                }
            }
        } else if (fromPosition === "left") {
            if (breakLineHeight < currentNode.styleInfo.height / 2 + lineConfig.breakLineOffsetNode) { //节点内部加上缓冲距离
                result.x = currentNode.styleInfo.offsetX - lineConfig.padding - lineConfig.breakLineOffsetNode;
                result.y = currentNode.styleInfo.offsetY - lineConfig.padding - lineConfig.breakLineOffsetNode;
                result.width = Math.abs(endInfo.x - result.x) + lineConfig.padding;
                result.height = currentNode.styleInfo.height / 2 + lineConfig.breakLineOffsetNode + 2 * lineConfig.padding;
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
                result.x = currentNode.styleInfo.offsetX - lineConfig.padding - lineConfig.breakLineOffsetNode;
                result.y = endInfo.y - lineConfig.padding;
                result.width = Math.abs(endInfo.x - result.x) + lineConfig.padding;
                result.height = Math.abs(endInfo.y - currentNode.styleInfo.offsetY) + currentNode.styleInfo.height / 2 + 2 * lineConfig.padding;
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
            }
        } else if (fromPosition === "bottom") {
            if (Math.abs(endInfo.x - startInfo.x) < currentNode.styleInfo.width / 2 + lineConfig.breakLineOffsetNode) { //节点内部加上缓冲距离
                result.x = currentNode.styleInfo.offsetX + currentNode.styleInfo.width / 2 - lineConfig.padding;
                result.y = endInfo.y - lineConfig.padding;
                result.width = currentNode.styleInfo.width / 2 + lineConfig.breakLineOffsetNode + 2 * lineConfig.padding;
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
                result.x = currentNode.styleInfo.offsetX + currentNode.styleInfo.width / 2 - lineConfig.padding;
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
