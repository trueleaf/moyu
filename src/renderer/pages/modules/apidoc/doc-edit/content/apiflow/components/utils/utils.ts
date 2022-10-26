import { store } from "@/store";
import { ApidocApiflowLineInfo, ApidocApiflowNodeInfo, ApiflowOutComingDirection } from "@@/store";

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

//返回节点上下左右四个连接点吸附区域
function getNodeStickyArea(node: ApidocApiflowNodeInfo, stickySize = 10) {
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
//根据起始位置返回节点 width height left top
type Options = {
    currentNode: ApidocApiflowNodeInfo,
    currendLine?: ApidocApiflowLineInfo,
    fromPosition: ApiflowOutComingDirection
}
export function getLineDrawInfo(startInfo: Coordinate, endInfo: Coordinate, options: Options): ResultRect {
    const nodes = store.state["apidoc/apiflow"].apiflowList;
    const { fromPosition, currentNode } = options;
    const arrowLength = 15;
    const arrowWidth = 5;
    const breakLineSticky = 5;
    const breakLineOffsetNode = 25; //线条距离节点最小距离
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
    if (Math.abs(endInfo.x - startInfo.x) < 10 && Math.abs(endInfo.y - startInfo.y) < 10) {
        return result
    }
    if (endInfo.x > startInfo.x && endInfo.y <= startInfo.y) { //第一象限(startPostion为原点)
        result.x = startInfo.x - padding;
        result.y = endInfo.y - padding
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding;
        result.height = Math.abs(endInfo.y - startInfo.y) + 2 * padding;
        result.lineInfo.startX = padding;
        result.lineInfo.startY = result.height - padding;
        result.lineInfo.endX = result.width - padding;
        result.lineInfo.endY = padding;
        //=================================箭头属性========================================//
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: result.width - padding * 2,
            y: result.lineInfo.endY - padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.width,
            y: result.lineInfo.endY + padding
        }
        //=====================================绘制折线====================================//
        const breakPointStartX = result.lineInfo.startX;
        const breakPointStartY = result.lineInfo.startY;
        const breakPointEndX = result.lineInfo.endX;
        const breakPointEndY = result.lineInfo.endY;
        const breakLineWidth = Math.abs(breakPointEndX - breakPointStartX); //折线宽度
        const breakLineHeight = Math.abs(breakPointEndY - breakPointStartY); //折线高度
        //起始点
        result.lineInfo.brokenLinePoints.push({
            x: breakPointStartX,
            y: breakPointStartY
        })
        if (fromPosition === "right" && breakLineWidth > breakLineHeight) {
            result.lineInfo.brokenLinePoints.push({
                x: breakPointStartX + breakLineWidth / 2,
                y: breakPointStartY
            })
            if (Math.abs(breakPointEndY - breakPointStartY) < breakLineSticky) { //折线吸附效果
                result.lineInfo.brokenLinePoints.push({
                    x: breakPointStartX + breakLineWidth / 2,
                    y: breakPointStartY
                })
                result.lineInfo.brokenLinePoints.push({
                    x: breakPointEndX,
                    y: breakPointStartY
                })
                result.lineInfo.arrowInfo.p1 = {
                    x: result.lineInfo.endX,
                    y: breakPointStartY - arrowWidth
                }
                result.lineInfo.arrowInfo.p2 = {
                    x: result.lineInfo.endX,
                    y: breakPointStartY + arrowWidth
                }
                result.lineInfo.arrowInfo.p3 = {
                    x: result.lineInfo.endX + arrowLength,
                    y: breakPointStartY
                }
            } else {
                result.lineInfo.brokenLinePoints.push({
                    x: breakPointStartX + breakLineWidth / 2,
                    y: breakPointEndY
                })
                result.lineInfo.brokenLinePoints.push({
                    x: breakPointEndX,
                    y: breakPointEndY
                })
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
                    result.width = stickyArea.leftArea.pointX - startInfo.x + 2 * padding;
                    result.height = Math.abs(startInfo.y - stickyArea.leftArea.pointY) + 2 * padding;
                    result.y = stickyArea.leftArea.pointY - padding;
                    result.lineInfo.brokenLinePoints = [];
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x,
                        y: result.height - padding
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: (stickyArea.leftArea.pointX - startInfo.x) / 2,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: (stickyArea.leftArea.pointX - startInfo.x) / 2,
                        y: stickyArea.leftArea.pointY - result.y
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.leftArea.pointX - result.x - arrowLength,
                        y: stickyArea.leftArea.pointY - result.y
                    });
                    result.lineInfo.arrowInfo.p1 = {
                        x: stickyArea.leftArea.pointX - result.x - arrowLength,
                        y: stickyArea.leftArea.pointY - result.y + arrowWidth
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: stickyArea.leftArea.pointX - result.x,
                        y: stickyArea.leftArea.pointY - result.y
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: stickyArea.leftArea.pointX - result.x - arrowLength,
                        y: stickyArea.leftArea.pointY - result.y - arrowWidth
                    }
                    result.lineInfo.arrowInfo.leftTopPoint = {
                        x: result.width - padding * 3,
                        y: result.lineInfo.endY - padding
                    }
                    result.lineInfo.arrowInfo.rightBottomPoint = {
                        x: result.width - padding,
                        y: result.lineInfo.endY + padding
                    }
                    result.isConnectedNode = true
                    result.connectedPosition = "left";
                    result.connectedNodeId = node.id;
                } else if (isLeftInTopStickyArea && isTopInTopStickyArea) {
                    result.width = stickyArea.topArea.pointX - startInfo.x + 2 * padding;
                    result.height = Math.abs(startInfo.y - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
                    result.y = stickyArea.topArea.pointY - padding - breakLineOffsetNode;
                    result.lineInfo.brokenLinePoints = [];
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x,
                        y: result.height - padding
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x + breakLineOffsetNode,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x + breakLineOffsetNode,
                        y: stickyArea.topArea.pointY - result.y - breakLineOffsetNode
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.topArea.pointX - result.x,
                        y: stickyArea.topArea.pointY - result.y - breakLineOffsetNode
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.topArea.pointX - result.x,
                        y: stickyArea.topArea.pointY - result.y - padding
                    });
                    result.lineInfo.arrowInfo.p1 = {
                        x: stickyArea.topArea.pointX - result.x - arrowWidth,
                        y: stickyArea.topArea.pointY - result.y - arrowLength
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: stickyArea.topArea.pointX - result.x + arrowWidth,
                        y: stickyArea.topArea.pointY - result.y - arrowLength
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: stickyArea.topArea.pointX - result.x,
                        y: stickyArea.topArea.pointY - result.y
                    }
                    result.lineInfo.arrowInfo.leftTopPoint = {
                        x: result.width - padding * 2,
                        y: stickyArea.topArea.pointY - result.y - padding * 2
                    }
                    result.lineInfo.arrowInfo.rightBottomPoint = {
                        x: result.width,
                        y: stickyArea.topArea.pointY - result.y
                    }
                    result.isConnectedNode = true
                    result.connectedPosition = "top";
                    result.connectedNodeId = node.id;
                } else if (isLeftInBottomStickyArea && isTopInBottomStickyArea) {
                    result.width = stickyArea.bottomArea.pointX - startInfo.x + 2 * padding;
                    result.height = Math.abs(startInfo.y - stickyArea.bottomArea.pointY) + 2 * padding;
                    result.y = stickyArea.bottomArea.pointY - padding;
                    result.lineInfo.brokenLinePoints = [];
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x,
                        y: result.height - padding
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.bottomArea.pointX - startInfo.x + padding,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.bottomArea.pointX - startInfo.x + padding,
                        y: stickyArea.bottomArea.pointY - result.y
                    });
                    result.lineInfo.arrowInfo.p1 = {
                        x: stickyArea.bottomArea.pointX - startInfo.x + padding - arrowWidth,
                        y: stickyArea.bottomArea.pointY - result.y + arrowLength
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: stickyArea.bottomArea.pointX - startInfo.x + padding + arrowWidth,
                        y: stickyArea.bottomArea.pointY - result.y + arrowLength
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: stickyArea.bottomArea.pointX - startInfo.x + padding,
                        y: stickyArea.bottomArea.pointY - result.y
                    }
                    result.lineInfo.arrowInfo.leftTopPoint = {
                        x: result.width - padding * 2,
                        y: stickyArea.bottomArea.pointY - result.y - padding
                    }
                    result.lineInfo.arrowInfo.rightBottomPoint = {
                        x: result.width,
                        y: stickyArea.bottomArea.pointY - result.y + padding
                    }
                    result.isConnectedNode = true
                    result.connectedPosition = "bottom";
                    result.connectedNodeId = node.id;
                } else if (isLeftInRightStickyArea && isTopInRightStickyArea) {
                    result.width = stickyArea.rightArea.pointX - startInfo.x + 2 * padding + breakLineOffsetNode;
                    result.height = Math.abs(startInfo.y - stickyArea.rightArea.pointY) + 2 * padding;
                    result.y = stickyArea.rightArea.pointY - padding;
                    result.lineInfo.brokenLinePoints = [];
                    result.lineInfo.brokenLinePoints.push({
                        x: startInfo.x - result.x,
                        y: result.height - padding
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.rightArea.pointX - startInfo.x + padding + breakLineOffsetNode,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.rightArea.pointX - startInfo.x + padding + breakLineOffsetNode,
                        y: stickyArea.rightArea.pointY - result.y
                    });
                    result.lineInfo.brokenLinePoints.push({
                        x: stickyArea.rightArea.pointX - startInfo.x + padding * 2,
                        y: stickyArea.rightArea.pointY - result.y
                    });
                    result.lineInfo.arrowInfo.p1 = {
                        x: stickyArea.rightArea.pointX - startInfo.x + padding + arrowLength,
                        y: stickyArea.rightArea.pointY - result.y + arrowWidth
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: stickyArea.rightArea.pointX - startInfo.x + padding + arrowLength,
                        y: stickyArea.rightArea.pointY - result.y - arrowWidth
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: stickyArea.rightArea.pointX - startInfo.x + padding,
                        y: stickyArea.rightArea.pointY - result.y
                    }
                    result.lineInfo.arrowInfo.leftTopPoint = {
                        x: stickyArea.rightArea.pointX - result.x - padding,
                        y: stickyArea.rightArea.pointY - result.y - padding
                    }
                    result.lineInfo.arrowInfo.rightBottomPoint = {
                        x: stickyArea.rightArea.pointX - result.x + padding,
                        y: stickyArea.rightArea.pointY - result.y + padding
                    }
                    result.isConnectedNode = true
                    result.connectedPosition = "right";
                    result.connectedNodeId = node.id;
                }
            })
        } else if (fromPosition === "right" && breakLineWidth <= breakLineHeight) {
            result.lineInfo.brokenLinePoints.push({
                x: breakPointStartX + breakLineWidth,
                y: breakPointStartY
            })
            result.lineInfo.arrowInfo.p1 = {
                x: result.lineInfo.endX,
                y: result.lineInfo.endY - arrowLength
            }
            result.lineInfo.brokenLinePoints.push({
                x: breakPointEndX,
                y: breakPointEndY
            })
            result.lineInfo.arrowInfo.p2 = {
                x: result.lineInfo.endX - arrowWidth,
                y: result.lineInfo.endY
            }
            result.lineInfo.arrowInfo.p3 = {
                x: result.lineInfo.endX + arrowWidth,
                y: result.lineInfo.endY
            }
        } else if (fromPosition === "top" && breakLineWidth > breakLineHeight) {
            if (Math.abs(breakPointEndX - breakPointStartX) < breakLineSticky) { //折线吸附效果
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
                    y: breakPointEndY - arrowLength
                }
                result.lineInfo.arrowInfo.p2 = {
                    x: breakPointStartX - arrowWidth,
                    y: breakPointEndY
                }
                result.lineInfo.arrowInfo.p3 = {
                    x: breakPointStartX + arrowWidth,
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
        } else if (fromPosition === "top" && breakLineWidth <= breakLineHeight) {
            if (Math.abs(breakPointEndX - breakPointStartX) < breakLineSticky) { //折线吸附效果
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
                    y: breakPointEndY - arrowLength
                }
                result.lineInfo.arrowInfo.p2 = {
                    x: breakPointStartX - arrowWidth,
                    y: breakPointEndY
                }
                result.lineInfo.arrowInfo.p3 = {
                    x: breakPointStartX + arrowWidth,
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
                    y: result.lineInfo.endY - arrowLength
                }
                result.lineInfo.arrowInfo.p2 = {
                    x: result.lineInfo.endX + arrowWidth,
                    y: result.lineInfo.endY
                }
                result.lineInfo.arrowInfo.p3 = {
                    x: result.lineInfo.endX - arrowWidth,
                    y: result.lineInfo.endY
                }
            }
        } else if (fromPosition === "left") {
            if (breakLineHeight < currentNode.styleInfo.height / 2 + breakLineOffsetNode) { //节点内部加上缓冲距离
                result.x = currentNode.styleInfo.offsetX - padding - breakLineOffsetNode;
                result.y = currentNode.styleInfo.offsetY - padding - breakLineOffsetNode;
                result.width = Math.abs(endInfo.x - result.x) + padding;
                result.height = currentNode.styleInfo.height / 2 + breakLineOffsetNode + 2 * padding;
                if (result.width < breakLineOffsetNode * 2 + padding * 2) { //宽度二倍breakLineOffsetNode+2*padding
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: padding + breakLineOffsetNode,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding,
                        y: padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y + arrowLength,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x + arrowWidth,
                        y: endInfo.y - result.y
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x - arrowWidth,
                        y: endInfo.y - result.y
                    }
                } else {
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: padding + breakLineOffsetNode,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding * 2,
                        y: padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding * 2,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x + arrowLength,
                        y: endInfo.y - result.y,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y + arrowWidth
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - arrowWidth
                    }
                }
            } else { //节点外部
                result.x = currentNode.styleInfo.offsetX - padding - breakLineOffsetNode;
                result.y = endInfo.y - padding;
                result.width = Math.abs(endInfo.x - result.x) + padding;
                result.height = Math.abs(endInfo.y - currentNode.styleInfo.offsetY) + currentNode.styleInfo.height / 2 + 2 * padding;
                // eslint-disable-next-line no-lonely-if
                if (result.width > result.height - breakLineOffsetNode) { //宽度二倍breakLineOffsetNode+2*padding
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: padding + breakLineOffsetNode,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding,
                        y: padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x + arrowLength,
                        y: endInfo.y - result.y,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y + arrowWidth
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - arrowWidth
                    }
                } else {
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: padding + breakLineOffsetNode,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: padding + breakLineOffsetNode
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: endInfo.x - result.x,
                        y: padding + breakLineOffsetNode
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - arrowLength,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x + arrowWidth,
                        y: endInfo.y - result.y
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x - arrowWidth,
                        y: endInfo.y - result.y
                    }
                }
            }
            //修复拖拽区域
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: result.width - padding * 2,
                y: endInfo.y - result.y - padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: result.width,
                y: endInfo.y - result.y + padding
            }
        } else if (fromPosition === "bottom") {
            if (Math.abs(endInfo.x - startInfo.x) < currentNode.styleInfo.width / 2 + breakLineOffsetNode) { //节点内部加上缓冲距离
                result.x = currentNode.styleInfo.offsetX + currentNode.styleInfo.width / 2 - padding;
                result.y = endInfo.y - padding;
                result.width = currentNode.styleInfo.width / 2 + breakLineOffsetNode + 2 * padding;
                result.height = Math.abs(endInfo.y - startInfo.y) + 2 * padding + breakLineOffsetNode;
                if (Math.abs(endInfo.y - startInfo.y) < breakLineOffsetNode) { //箭头朝左
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: Math.abs(endInfo.y - startInfo.y) + padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x - arrowLength,
                        y: endInfo.y - result.y,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y + arrowWidth
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - arrowWidth
                    }
                } else { //箭头朝上
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: Math.abs(endInfo.y - startInfo.y) + padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding,
                        y: endInfo.y - result.y + breakLineOffsetNode
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y + breakLineOffsetNode
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - arrowLength,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x + arrowWidth,
                        y: endInfo.y - result.y
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x - arrowWidth,
                        y: endInfo.y - result.y
                    }
                }
            } else { //节点外部
                result.x = currentNode.styleInfo.offsetX + currentNode.styleInfo.width / 2 - padding;
                result.y = endInfo.y - padding;
                result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding;
                result.height = Math.abs(endInfo.y - startInfo.y) + 2 * padding + breakLineOffsetNode;
                if (result.width > result.height) { //箭头朝右
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: Math.abs(endInfo.y - startInfo.y) + padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding - breakLineOffsetNode,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding - breakLineOffsetNode,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x + arrowLength,
                        y: endInfo.y - result.y,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y + arrowWidth
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - arrowWidth
                    }
                } else {
                    result.lineInfo.brokenLinePoints = []; //清空起始点，特殊情况起始点并非为节点点击位置
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: Math.abs(endInfo.y - startInfo.y) + padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: padding,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding,
                        y: result.height - padding
                    })
                    result.lineInfo.brokenLinePoints.push({
                        x: result.width - padding,
                        y: endInfo.y - result.y
                    })
                    result.lineInfo.arrowInfo.p1 = {
                        x: endInfo.x - result.x,
                        y: endInfo.y - result.y - arrowLength,
                    }
                    result.lineInfo.arrowInfo.p2 = {
                        x: endInfo.x - result.x - arrowWidth,
                        y: endInfo.y - result.y
                    }
                    result.lineInfo.arrowInfo.p3 = {
                        x: endInfo.x - result.x + arrowWidth,
                        y: endInfo.y - result.y
                    }
                }
            }
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
