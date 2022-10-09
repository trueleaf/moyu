// import { store } from "@/store";
import { ApidocApiflowNodeInfo, ApiflowOutComingDirection } from "@@/store";

const padding = 15; //绘制图形边距
type Coordinate = {
    x: number,
    y: number
}
// type OffsetCoordinate = {
//     offsetX: number,
//     offsetY: number
// }
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
}

//返回节点上下左右四个连接点吸附区域
// function getNodeStickyArea(node: ApidocApiflowNodeInfo, stickySize = 20) {
//     const { styleInfo } = node;
//     const leftMidPoint: OffsetCoordinate = {
//         offsetX: styleInfo.offsetX,
//         offsetY: styleInfo.offsetY + styleInfo.height / 2
//     }
//     const topMidPoint: OffsetCoordinate = {
//         offsetX: styleInfo.offsetX + styleInfo.width / 2,
//         offsetY: styleInfo.offsetY
//     }
//     const rightMidPoint: OffsetCoordinate = {
//         offsetX: styleInfo.offsetX + styleInfo.width,
//         offsetY: styleInfo.offsetY + styleInfo.height / 2
//     }
//     const bottomMidPoint: OffsetCoordinate = {
//         offsetX: styleInfo.offsetX + styleInfo.width / 2,
//         offsetY: styleInfo.offsetY + styleInfo.height
//     }
//     return {
//         leftArea: {
//             pointX: leftMidPoint.offsetX,
//             pointY: leftMidPoint.offsetY,
//             offsetX: leftMidPoint.offsetX - stickySize,
//             offsetX2: leftMidPoint.offsetX + stickySize,
//             offsetY: leftMidPoint.offsetY - stickySize,
//             offsetY2: leftMidPoint.offsetY + stickySize,
//         },
//         topArea: {
//             pointX: topMidPoint.offsetX,
//             pointY: topMidPoint.offsetY,
//             offsetX: topMidPoint.offsetX - stickySize,
//             offsetX2: topMidPoint.offsetX + stickySize,
//             offsetY: topMidPoint.offsetY - stickySize,
//             offsetY2: topMidPoint.offsetY + stickySize,
//         },
//         rightArea: {
//             pointX: rightMidPoint.offsetX,
//             pointY: rightMidPoint.offsetY,
//             offsetX: rightMidPoint.offsetX - stickySize,
//             offsetX2: rightMidPoint.offsetX + stickySize,
//             offsetY: rightMidPoint.offsetY - stickySize,
//             offsetY2: rightMidPoint.offsetY + stickySize,
//         },
//         bottomArea: {
//             pointX: bottomMidPoint.offsetX,
//             pointY: bottomMidPoint.offsetY,
//             offsetX: bottomMidPoint.offsetX - stickySize,
//             offsetX2: bottomMidPoint.offsetX + stickySize,
//             offsetY: bottomMidPoint.offsetY - stickySize,
//             offsetY2: bottomMidPoint.offsetY + stickySize,
//         },
//     };
// }
//根据起始位置返回节点 width height left top
type Options = {
    currentNode: ApidocApiflowNodeInfo,
    position: ApiflowOutComingDirection
}
export function getLineDrawInfo(startInfo: Coordinate, endInfo: Coordinate, options: Options): ResultRect {
    // const nodes = store.state["apidoc/apiflow"].apiflowList;
    const { position, currentNode } = options;
    const arrowLength = 15;
    const arrowWidth = 5;
    const breakLineSticky = 5;
    const breakLineOffsetNode = 40; //线条距离节点最小距离
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
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY - padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.lineInfo.endX + padding,
            y: result.lineInfo.endY + padding
        }
        //=====================================绘制折线====================================//
        const breakPointStartX = result.lineInfo.startX;
        const breakPointStartY = result.lineInfo.startY;
        const breakPointEndX = result.lineInfo.endX;
        const breakPointEndY = result.lineInfo.endY;
        const breakLineWidth = Math.abs(breakPointEndX - breakPointStartX);
        const breakLineHeight = Math.abs(breakPointEndY - breakPointStartY);
        //起始点
        result.lineInfo.brokenLinePoints.push({
            x: breakPointStartX,
            y: breakPointStartY
        })
        if (position === "right" && breakLineWidth > breakLineHeight) {
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
        } else if (position === "right" && breakLineWidth <= breakLineHeight) {
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
        } else if (position === "top" && breakLineWidth > breakLineHeight) {
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
        } else if (position === "top" && breakLineWidth <= breakLineHeight) {
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
        } else if (position === "left") {
            if (breakLineHeight < currentNode.styleInfo.height / 2) { //节点内部
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
        console.log(options)
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
