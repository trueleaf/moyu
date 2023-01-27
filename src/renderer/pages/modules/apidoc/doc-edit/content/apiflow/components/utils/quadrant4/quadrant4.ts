import { store } from "@/store";
import { getNodeStickyArea, getLineStickyPosition, getContraryPosition } from "../common/common";
import type { ResultRect, Coordinate, LineDrawInfoOptions, LineConfig } from "../utils"

type Options = LineDrawInfoOptions & {
    startPoint: Coordinate,
    endPoint: Coordinate,
    lineConfig: LineConfig
}
type GetArrowInfoOptions = {
    position: "left"| "right" | "top" | "bottom";
    arrowLength: number;
    arrowWidth: number;
}
/*
|--------------------------------------------------------------------------
| 到达toNode时候线条绘制
|--------------------------------------------------------------------------
*/
//绘制箭头
const getDrawArrowInfo = (point: Coordinate, options: GetArrowInfoOptions): Coordinate[] => {
    const arrowList: Coordinate[] = [];
    const { position, arrowLength, arrowWidth } = options;
    if (position === "right") {
        arrowList[0] = {
            x: point.x,
            y: point.y - arrowWidth
        };
        arrowList[1] = {
            x: point.x,
            y: point.y + arrowWidth
        };
        arrowList[2] = {
            x: point.x + arrowLength,
            y: point.y
        }
    } else if (position === "bottom") {
        arrowList[0] = {
            x: point.x - arrowWidth,
            y: point.y
        };
        arrowList[1] = {
            x: point.x + arrowWidth,
            y: point.y
        };
        arrowList[2] = {
            x: point.x,
            y: point.y + arrowLength
        }
    } else if (position === "left") {
        arrowList[0] = {
            x: point.x,
            y: point.y - arrowWidth
        };
        arrowList[1] = {
            x: point.x,
            y: point.y + arrowWidth
        };
        arrowList[2] = {
            x: point.x - arrowLength,
            y: point.y
        }
    } else if (position === "top") {
        arrowList[0] = {
            x: point.x - arrowWidth,
            y: point.y
        };
        arrowList[1] = {
            x: point.x + arrowWidth,
            y: point.y
        };
        arrowList[2] = {
            x: point.x,
            y: point.y - arrowLength
        }
    }
    return arrowList
}
//当右侧线条与其他节点吸附时候，改变线条绘制路径
const drawRightLineWhenStick = (result: ResultRect, options: Options) => {
    const toNodes = store.state["apidoc/apiflow"].apiflowList;
    const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endPoint, startPoint, fromNode } = options;
    for (let i = 0; i < toNodes.length; i += 1) {
        const toNode = toNodes[i]
        if (toNode.id === options.fromNode.id) {
            continue;
        }
        const stickyArea = getNodeStickyArea(toNode, {
            startPoint
        });
        const stickyNodePosition = getLineStickyPosition({
            x: endPoint.x,
            y: endPoint.y
        }, stickyArea);
        const lineEndPoint: Coordinate = {
            x: 0,
            y: 0,
        };
        if (stickyNodePosition === "left") {
            const gapY = toNode.styleInfo.offsetY - fromNode.styleInfo.offsetY - fromNode.styleInfo.height;
            const gapX = fromNode.styleInfo.offsetX + fromNode.styleInfo.width - toNode.styleInfo.offsetX - toNode.styleInfo.width
            result.width = Math.abs(stickyArea.leftArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode * 2;
            result.height = Math.abs(stickyArea.leftArea.pointY - startPoint.y) + 2 * padding;
            result.y = startPoint.y - padding;
            result.x = stickyArea.leftArea.pointX - padding - breakLineOffsetNode;
            result.lineInfo.brokenLinePoints = [];
            if (gapX < 0 && gapY < 0) {
                result.width = toNode.styleInfo.width + 2 * padding + 2 * breakLineOffsetNode
            }
            if (gapY > 0) {
                result.lineInfo.brokenLinePoints.push({
                    x: startPoint.x - result.x,
                    y: startPoint.y - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: startPoint.y - result.y
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: result.height / 2
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height / 2
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding + breakLineOffsetNode - arrowLength,
                    y: result.height - padding
                });
                lineEndPoint.x = padding + breakLineOffsetNode - arrowLength;
                lineEndPoint.y = result.height - padding;
            } else {
                result.height = Math.abs(toNode.styleInfo.offsetY + toNode.styleInfo.height - startPoint.y) + 2 * padding + breakLineOffsetNode;
                result.lineInfo.brokenLinePoints.push({
                    x: startPoint.x - result.x,
                    y: startPoint.y - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: startPoint.y - result.y
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: stickyArea.leftArea.pointY - result.y
                })
                result.lineInfo.brokenLinePoints.push({
                    x: padding + breakLineOffsetNode - arrowLength,
                    y: stickyArea.leftArea.pointY - result.y
                })
                lineEndPoint.x = padding + breakLineOffsetNode - arrowLength;
                lineEndPoint.y = stickyArea.leftArea.pointY - result.y;
            }
            result.isConnectedNode = true
            result.connectedPosition = "left";
        } else if (stickyNodePosition === "top") {
            const gapX = fromNode.styleInfo.width + fromNode.styleInfo.offsetX - toNode.styleInfo.offsetX - toNode.styleInfo.width;
            const gapY = toNode.styleInfo.offsetY - fromNode.styleInfo.offsetY - fromNode.styleInfo.height
            result.width = Math.abs(stickyArea.topArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding;
            result.x = stickyArea.topArea.pointX - padding;
            result.y = fromNode.styleInfo.offsetY + fromNode.styleInfo.height / 2 - padding;
            result.lineInfo.brokenLinePoints = [];
            if (gapX < 0 && gapY < 0) {
                result.width = toNode.styleInfo.width / 2 + breakLineOffsetNode + padding * 2
            }
            if (gapY > 0) {
                result.lineInfo.brokenLinePoints.push({
                    x: startPoint.x - result.x,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: startPoint.y - fromNode.styleInfo.offsetY + padding + gapY / 2
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: startPoint.y - fromNode.styleInfo.offsetY + padding + gapY / 2
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding - arrowLength
                });
            } else {
                result.height = Math.abs(fromNode.styleInfo.offsetY - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
                result.y = fromNode.styleInfo.offsetY - breakLineOffsetNode - padding;
                result.lineInfo.brokenLinePoints.push({
                    x: startPoint.x - result.x,
                    y: startPoint.y - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: startPoint.y - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding - arrowLength
                });
            }
            lineEndPoint.x = padding;
            lineEndPoint.y = result.height - padding - arrowLength;
            result.isConnectedNode = true
            result.connectedPosition = "top";
        } else if (stickyNodePosition === "bottom") {
            const gapY = fromNode.styleInfo.offsetY + fromNode.styleInfo.height - toNode.styleInfo.offsetY - toNode.styleInfo.height;
            const gapX = fromNode.styleInfo.offsetX + fromNode.styleInfo.width - toNode.styleInfo.offsetX - toNode.styleInfo.width
            result.width = Math.abs(stickyArea.bottomArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(stickyArea.bottomArea.pointY - startPoint.y) + 2 * padding + breakLineOffsetNode;
            result.y = startPoint.y - padding;
            result.x = stickyArea.bottomArea.pointX - padding;
            result.lineInfo.brokenLinePoints = [];
            if (gapX < 0) {
                result.width = toNode.styleInfo.width / 2 + 2 * padding + breakLineOffsetNode
            }
            if (gapY > 0) {
                result.height = fromNode.styleInfo.height / 2 + 2 * padding + breakLineOffsetNode
                // result.y =
            }
            result.lineInfo.brokenLinePoints.push({
                x: startPoint.x - result.x,
                y: startPoint.y - result.y
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: startPoint.y - result.y
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: stickyArea.bottomArea.pointY - result.y + arrowLength
            })
            lineEndPoint.x = padding;
            lineEndPoint.y = stickyArea.bottomArea.pointY - result.y + arrowLength
            result.isConnectedNode = true
            result.connectedPosition = "bottom";
        } else if (stickyNodePosition === "right") {
            result.width = Math.abs(stickyArea.rightArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding;
            result.x = stickyArea.rightArea.pointX - padding;
            result.y = fromNode.styleInfo.offsetY + fromNode.styleInfo.height / 2 - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: startPoint.x - result.x,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding + arrowLength,
                y: result.height - padding
            });
            lineEndPoint.x = padding + arrowLength;
            lineEndPoint.y = result.height - padding;
            result.isConnectedNode = true
            result.connectedPosition = "right";
        }
        if (result.isConnectedNode) {
            result.connectedNodeId = toNode.id;
            const arrowList = getDrawArrowInfo({
                x: lineEndPoint.x,
                y: lineEndPoint.y
            }, {
                position: getContraryPosition(result.connectedPosition),
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: lineEndPoint.x - padding,
                y: lineEndPoint.y - padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: lineEndPoint.x + padding,
                y: lineEndPoint.y + padding
            }
        }
        if (stickyNodePosition != null) {
            break;
        }
    }
}
//当上侧线条与其他节点吸附时候，改变线条绘制路径
const drawTopLineWhenStick = (result: ResultRect, options: Options) => {
    const toNodes = store.state["apidoc/apiflow"].apiflowList;
    const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endPoint, startPoint, fromNode } = options;
    for (let i = 0; i < toNodes.length; i += 1) {
        const toNode = toNodes[i]
        if (toNode.id === options.fromNode.id) {
            continue;
        }
        const stickyArea = getNodeStickyArea(toNode, {
            startPoint
        });
        const stickyNodePosition = getLineStickyPosition({
            x: endPoint.x,
            y: endPoint.y
        }, stickyArea);
        // console.log(stickyArea, stickyNodePosition)
        const lineEndPoint: Coordinate = {
            x: 0,
            y: 0,
        };
        if (stickyNodePosition === "left") {
            const gapY = toNode.styleInfo.offsetY - fromNode.styleInfo.offsetY
            result.width = Math.abs(stickyArea.leftArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(startPoint.y - stickyArea.leftArea.pointY) + 2 * padding + breakLineOffsetNode;
            result.x = stickyArea.leftArea.pointX - padding - breakLineOffsetNode;
            result.y = startPoint.y - padding - breakLineOffsetNode;
            result.lineInfo.brokenLinePoints = [];
            if (gapY < 0) {
                result.y = toNode.styleInfo.offsetY - breakLineOffsetNode - padding;
                result.height = toNode.styleInfo.height / 2 + 2 * padding + breakLineOffsetNode;
            }
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: startPoint.y - result.y
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding + breakLineOffsetNode - arrowLength,
                y: result.height - padding
            });
            lineEndPoint.x = padding + breakLineOffsetNode - arrowLength;
            lineEndPoint.y = result.height - padding;
            result.isConnectedNode = true
            result.connectedPosition = "left";
        } else if (stickyNodePosition === "top") {
            result.width = Math.abs(stickyArea.topArea.pointX - startPoint.x) + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
            result.x = stickyArea.topArea.pointX - padding;
            result.y = startPoint.y - padding - breakLineOffsetNode;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: startPoint.y - result.y
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding - arrowLength
            });
            lineEndPoint.x = padding;
            lineEndPoint.y = result.height - padding - arrowLength;
            result.isConnectedNode = true
            result.connectedPosition = "top";
        } else if (stickyNodePosition === "bottom") {
            const gapX = fromNode.styleInfo.offsetX - toNode.styleInfo.offsetX - toNode.styleInfo.width
            const gapY = toNode.styleInfo.offsetY - fromNode.styleInfo.offsetY
            result.width = Math.abs(stickyArea.bottomArea.pointX - startPoint.x) + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding + breakLineOffsetNode * 2;
            result.x = stickyArea.bottomArea.pointX - padding;
            result.y = startPoint.y - padding - breakLineOffsetNode;
            result.lineInfo.brokenLinePoints = [];
            if (gapX > 0) {
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: startPoint.y - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width / 2,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width / 2,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding - breakLineOffsetNode + arrowLength
                });
                lineEndPoint.x = padding;
                lineEndPoint.y = result.height - padding - breakLineOffsetNode + arrowLength;
            } else {
                if (gapY < 0) {
                    result.height = toNode.styleInfo.height + 2 * padding + 2 * breakLineOffsetNode;
                    result.y = toNode.styleInfo.offsetY - breakLineOffsetNode - padding;
                }
                result.width = Math.abs(startPoint.x - toNode.styleInfo.offsetX + breakLineOffsetNode) + 2 * padding;
                result.x = toNode.styleInfo.offsetX - breakLineOffsetNode - padding;
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: startPoint.y - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.bottomArea.pointX - result.x,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.bottomArea.pointX - result.x,
                    y: result.height - padding - breakLineOffsetNode + arrowLength
                });
                lineEndPoint.x = stickyArea.bottomArea.pointX - result.x;
                lineEndPoint.y = result.height - padding - breakLineOffsetNode + arrowLength;
            }
            result.isConnectedNode = true
            result.connectedPosition = "bottom";
        } else if (stickyNodePosition === "right") {
            const gapX = fromNode.styleInfo.offsetX - toNode.styleInfo.offsetX - toNode.styleInfo.width;
            const gapY = toNode.styleInfo.offsetY - fromNode.styleInfo.offsetY;
            result.width = Math.abs(stickyArea.rightArea.pointX - startPoint.x) + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding + breakLineOffsetNode;
            result.x = stickyArea.rightArea.pointX - padding;
            result.y = startPoint.y - padding - breakLineOffsetNode;
            result.lineInfo.brokenLinePoints = [];
            if (gapX > 2 * (breakLineOffsetNode + arrowLength)) {
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: breakLineOffsetNode + padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding + breakLineOffsetNode + arrowLength,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding + breakLineOffsetNode + arrowLength,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding + arrowLength,
                    y: result.height - padding
                });
                lineEndPoint.x = padding + arrowLength;
                lineEndPoint.y = result.height - padding;
            } else if (gapX > 0) {
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: breakLineOffsetNode + padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding + gapX / 2,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding + gapX / 2,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding + arrowLength,
                    y: result.height - padding
                });
                lineEndPoint.x = padding + arrowLength;
                lineEndPoint.y = result.height - padding;
            } else {
                result.width = fromNode.styleInfo.width + breakLineOffsetNode + 2 * padding;
                result.x = stickyArea.rightArea.pointX - padding;
                if (gapY < 0) {
                    result.y = toNode.styleInfo.offsetY - padding - breakLineOffsetNode;
                    result.height = toNode.styleInfo.height / 2 + 2 * padding + breakLineOffsetNode;
                    result.lineInfo.brokenLinePoints.push({
                        x: startPoint.x - result.x,
                        y: fromNode.styleInfo.offsetY - result.y
                    });
                } else {
                    result.lineInfo.brokenLinePoints.push({
                        x: startPoint.x - result.x,
                        y: breakLineOffsetNode + padding
                    });
                }
                result.lineInfo.brokenLinePoints.push({
                    x: startPoint.x - result.x,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding + arrowLength,
                    y: result.height - padding
                });
                lineEndPoint.x = padding + arrowLength;
                lineEndPoint.y = result.height - padding;
            }
            result.isConnectedNode = true
            result.connectedPosition = "right";
        }
        if (result.isConnectedNode) {
            result.connectedNodeId = toNode.id;
            const arrowList = getDrawArrowInfo({
                x: lineEndPoint.x,
                y: lineEndPoint.y
            }, {
                position: getContraryPosition(result.connectedPosition),
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: lineEndPoint.x - padding,
                y: lineEndPoint.y - padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: lineEndPoint.x + padding,
                y: lineEndPoint.y + padding
            }
        }
        if (stickyNodePosition != null) {
            break;
        }
    }
}
//当左侧线条与其他节点吸附时候，改变线条绘制路径
const drawLeftLineWhenStick = (result: ResultRect, options: Options) => {
    const toNodes = store.state["apidoc/apiflow"].apiflowList;
    const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endPoint, startPoint, fromNode } = options;
    for (let i = 0; i < toNodes.length; i += 1) {
        const toNode = toNodes[i]
        if (toNode.id === options.fromNode.id) {
            continue;
        }
        const stickyArea = getNodeStickyArea(toNode, {
            startPoint
        });
        const stickyNodePosition = getLineStickyPosition({
            x: endPoint.x,
            y: endPoint.y
        }, stickyArea);
        const lineEndPoint: Coordinate = {
            x: 0,
            y: 0,
        };
        if (stickyNodePosition === "left") {
            result.width = Math.abs(stickyArea.leftArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(startPoint.y - stickyArea.leftArea.pointY) + 2 * padding;
            result.x = stickyArea.leftArea.pointX - padding - breakLineOffsetNode;
            result.y = startPoint.y - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding + breakLineOffsetNode - arrowLength,
                y: result.height - padding
            });
            lineEndPoint.x = padding + breakLineOffsetNode - arrowLength;
            lineEndPoint.y = result.height - padding;
            result.isConnectedNode = true;
            result.connectedPosition = "left";
        } else if (stickyNodePosition === "top") {
            result.width = Math.abs(stickyArea.topArea.pointX - startPoint.x) + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding;
            result.x = stickyArea.topArea.pointX - padding;
            result.y = startPoint.y - padding;
            result.lineInfo.brokenLinePoints = []
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding - arrowLength
            })
            lineEndPoint.x = padding;
            lineEndPoint.y = result.height - padding - arrowLength;
            result.isConnectedNode = true
            result.connectedPosition = "top";
        } else if (stickyNodePosition === "bottom") {
            const gapX = fromNode.styleInfo.offsetX - toNode.styleInfo.offsetX - toNode.styleInfo.width;
            // const gapY = stickyArea.bottomArea.pointY - startPoint.y;
            result.width = Math.abs(stickyArea.bottomArea.pointX - startPoint.x) + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding + breakLineOffsetNode;
            result.x = stickyArea.bottomArea.pointX - padding;
            result.y = startPoint.y - padding;
            result.lineInfo.brokenLinePoints = [];
            if (gapX > 0) {
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: toNode.styleInfo.width / 2 + gapX / 2 + padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: toNode.styleInfo.width / 2 + gapX / 2 + padding,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding - breakLineOffsetNode + arrowLength
                });
                lineEndPoint.x = padding;
                lineEndPoint.y = result.height - padding - breakLineOffsetNode + arrowLength
            } else if (gapX <= 0) {
                result.x = toNode.styleInfo.offsetX - breakLineOffsetNode - padding;
                result.width = Math.abs(fromNode.styleInfo.offsetX - toNode.styleInfo.offsetX) + 2 * padding + breakLineOffsetNode;
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.bottomArea.pointX - result.x,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.bottomArea.pointX - result.x,
                    y: result.height - padding - breakLineOffsetNode + arrowLength
                })
                lineEndPoint.x = stickyArea.bottomArea.pointX - result.x;
                lineEndPoint.y = result.height - padding - breakLineOffsetNode + arrowLength
            }
            result.isConnectedNode = true
            result.connectedPosition = "bottom";
        } else if (stickyNodePosition === "right") {
            result.width = Math.abs(stickyArea.rightArea.pointX - startPoint.x) + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding;
            result.x = stickyArea.rightArea.pointX - padding;
            result.y = startPoint.y - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width / 2,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width / 2,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding + arrowLength,
                y: result.height - padding
            });
            lineEndPoint.x = padding + arrowLength;
            lineEndPoint.y = result.height - padding;
            result.isConnectedNode = true
            result.connectedPosition = "right";
        }
        if (result.isConnectedNode) {
            result.connectedNodeId = toNode.id;
            const arrowList = getDrawArrowInfo({
                x: lineEndPoint.x,
                y: lineEndPoint.y
            }, {
                position: getContraryPosition(result.connectedPosition),
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: lineEndPoint.x - padding,
                y: lineEndPoint.y - padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: lineEndPoint.x + padding,
                y: lineEndPoint.y + padding
            }
        }
        if (stickyNodePosition != null) {
            break;
        }
    }
}
//当底部线条与其他节点吸附时候，改变线条绘制路径
const drawBottomLineWhenStick = (result: ResultRect, options: Options) => {
    const toNodes = store.state["apidoc/apiflow"].apiflowList;
    const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endPoint, startPoint, fromNode } = options;
    for (let i = 0; i < toNodes.length; i += 1) {
        const toNode = toNodes[i]
        if (toNode.id === options.fromNode.id) {
            continue;
        }
        const stickyArea = getNodeStickyArea(toNode, {
            startPoint
        });
        const stickyNodePosition = getLineStickyPosition({
            x: endPoint.x,
            y: endPoint.y
        }, stickyArea);
        const lineEndPoint: Coordinate = {
            x: 0,
            y: 0,
        };
        if (stickyNodePosition === "left") {
            const gapY = toNode.styleInfo.offsetY - fromNode.styleInfo.offsetY - fromNode.styleInfo.height
            result.width = Math.abs(stickyArea.leftArea.pointX - startPoint.x) + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(startPoint.y - stickyArea.leftArea.pointY) + 2 * padding;
            result.x = stickyArea.leftArea.pointX - padding - breakLineOffsetNode;
            result.y = startPoint.y - padding;
            result.lineInfo.brokenLinePoints = [];
            if (gapY > 0) {
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: gapY / 2 + padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: gapY / 2 + padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding + breakLineOffsetNode - arrowLength,
                    y: result.height - padding
                });
            } else {
                result.height = Math.abs(toNode.styleInfo.offsetY + toNode.styleInfo.height + breakLineOffsetNode - startPoint.y) + 2 * padding;
                result.y = startPoint.y - padding;
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: stickyArea.leftArea.pointY - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding + breakLineOffsetNode - arrowLength,
                    y: stickyArea.leftArea.pointY - result.y
                });
            }
            lineEndPoint.x = padding + breakLineOffsetNode - arrowLength;
            lineEndPoint.y = stickyArea.leftArea.pointY - result.y;
            result.isConnectedNode = true
            result.connectedPosition = "left";
        } else if (stickyNodePosition === "top") {
            result.width = Math.abs(stickyArea.topArea.pointX - startPoint.x) + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.topArea.pointY) + 2 * padding;
            result.x = stickyArea.topArea.pointX - padding;
            result.y = startPoint.y - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: result.height / 2
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height / 2
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding - arrowLength
            })
            lineEndPoint.x = padding;
            lineEndPoint.y = result.height - padding - arrowLength;
            result.isConnectedNode = true
            result.connectedPosition = "top";
        } else if (stickyNodePosition === "bottom") {
            result.width = Math.abs(stickyArea.bottomArea.pointX - startPoint.x) + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.bottomArea.pointY) + 2 * padding + breakLineOffsetNode;
            result.x = stickyArea.bottomArea.pointX - padding;
            result.y = startPoint.y - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding - breakLineOffsetNode + arrowLength,
            });
            lineEndPoint.x = padding;
            lineEndPoint.y = result.height - padding - breakLineOffsetNode + arrowLength
            result.isConnectedNode = true
            result.connectedPosition = "bottom";
        } else if (stickyNodePosition === "right") {
            result.width = Math.abs(stickyArea.rightArea.pointX - startPoint.x) + 2 * padding;
            result.height = Math.abs(startPoint.y - stickyArea.rightArea.pointY) + 2 * padding;
            result.x = stickyArea.rightArea.pointX - padding;
            result.y = startPoint.y - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding + arrowLength,
                y: result.height - padding
            })
            lineEndPoint.x = padding + arrowLength;
            lineEndPoint.y = result.height - padding;
            result.isConnectedNode = true
            result.connectedPosition = "right";
        }
        if (result.isConnectedNode) {
            result.connectedNodeId = toNode.id;
            const arrowList = getDrawArrowInfo({
                x: lineEndPoint.x,
                y: lineEndPoint.y
            }, {
                position: getContraryPosition(result.connectedPosition),
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: lineEndPoint.x - padding,
                y: lineEndPoint.y - padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: lineEndPoint.x + padding,
                y: lineEndPoint.y + padding
            }
        }
        if (stickyNodePosition != null) {
            break;
        }
    }
}
/*
|--------------------------------------------------------------------------
| fromNode四个点引出线条绘制
|--------------------------------------------------------------------------
*/
//右侧线条
const drawRightLineWhenDrag = (result: ResultRect, options: Options) => {
    const { lineConfig: { padding, arrowLength, arrowWidth }, fromNode, endPoint } = options;
    /*
        示例如下：

               |‾‾‾‾‾‾‾‾‾‾‾‾|                     |‾‾‾‾‾‾‾‾‾‾‾‾‾|
               |            |                     |             |
               |    case1  p|_________            |    case2   p|___
               |            |         |           |             |   |
               |____________|         |________   |_____________|   |
                                                                    |
                                                                    |
                                                                    |
    */
    const p = {
        x: fromNode.styleInfo.width + fromNode.styleInfo.offsetX,
        y: fromNode.styleInfo.height / 2 + fromNode.styleInfo.offsetY
    }
    const endPWidth = Math.abs(endPoint.x - p.x);
    const endPHeight = Math.abs(endPoint.y - p.y);
    result.width = Math.abs(endPoint.x - p.x) + 2 * padding;
    result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
    result.x = p.x - padding;
    result.y = p.y - padding
    if (endPWidth > endPHeight) { //case1
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width / 2,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width / 2,
            y: result.height - padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: result.height - padding,
        })
        const arrowList = getDrawArrowInfo({
            x: result.width - padding,
            y: result.height - padding,
        }, {
            position: "right",
            arrowLength,
            arrowWidth
        });
        result.lineInfo.arrowInfo.p1 = arrowList[0];
        result.lineInfo.arrowInfo.p2 = arrowList[1];
        result.lineInfo.arrowInfo.p3 = arrowList[2];
        //修正可拖拽区域
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: result.width - padding * 2,
            y: result.height - padding * 2
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.width,
            y: result.height
        }
    } else { //case2
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: result.height - padding,
        })
        const arrowList = getDrawArrowInfo({
            x: result.width - padding,
            y: result.height - padding,
        }, {
            position: "bottom",
            arrowLength,
            arrowWidth
        });
        result.lineInfo.arrowInfo.p1 = arrowList[0];
        result.lineInfo.arrowInfo.p2 = arrowList[1];
        result.lineInfo.arrowInfo.p3 = arrowList[2];
        //修正可拖拽区域
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: result.width - padding * 2,
            y: result.height - padding * 2
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.width,
            y: result.height
        }
    }
}
//顶部线条
const drawTopLineWhenDrag = (result: ResultRect, options: Options) => {
    const { lineConfig: { padding, breakLineOffsetNode, arrowLength, arrowWidth }, fromNode, endPoint, startPoint } = options;
    /*
        示例如下：A点到B点范围内，线条方向共2种
                    A                      B
                    |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                         |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                 |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
                    |                     |                         |                        |                 |                        |
    |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|   |        |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|       |  |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|     |
    |              p1                 |   |        |                p1               |       |  |               p1                |     |
    |                                 |   |        |                       end_______|_______|  |                                 |     |
    |                                 |   |        |                                 |          |                                 |     |
    |                                 |   |        |               case1             |          |             case2        _______|_____|
    |                                 |   |        |                                 |          |                         |       |
    |                                 |   |        |                                 |          |                         |       |
    |                                 |   |        |                                 |          |                         |       |
    |                                 |   |        |                                 |          |                        end      |
    |_________________________________|   |        |_________________________________|          |_________________________________|

    */
    const p1 = {
        x: fromNode.styleInfo.width / 2 + fromNode.styleInfo.offsetX,
        y: fromNode.styleInfo.offsetY
    }
    const A = {
        x: fromNode.styleInfo.width / 2 + fromNode.styleInfo.offsetX
    }
    const B = {
        x: fromNode.styleInfo.width + breakLineOffsetNode + fromNode.styleInfo.offsetX
    }
    const p1ToEndWidth = Math.abs(endPoint.x - p1.x);
    const p1ToEndHeight = Math.abs(endPoint.y - p1.y);
    result.lineInfo.brokenLinePoints = [];
    if (endPoint.x > A.x && endPoint.x < B.x) {
        result.width = fromNode.styleInfo.width / 2 + 2 * padding + breakLineOffsetNode;
        result.height = Math.abs(endPoint.y - startPoint.y) + breakLineOffsetNode + 2 * padding;
        result.x = p1.x - padding;
        result.y = p1.y - padding - breakLineOffsetNode;
        if (p1ToEndWidth > p1ToEndHeight) { //如图case1
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: startPoint.y - result.y,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: endPoint.x - result.x,
                y: result.height - padding,
            })
            const arrowList = getDrawArrowInfo({
                x: endPoint.x - result.x,
                y: result.height - padding
            }, {
                position: "left",
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            //修正可拖拽区域
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: endPoint.x - result.x - padding,
                y: result.height - padding * 2
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: endPoint.x - result.x + padding,
                y: result.height
            }
        } else {
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: startPoint.y - result.y,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: result.height - padding - breakLineOffsetNode,
            })
            result.lineInfo.brokenLinePoints.push({
                x: endPoint.x - result.x,
                y: result.height - padding - breakLineOffsetNode,
            })
            result.lineInfo.brokenLinePoints.push({
                x: endPoint.x - result.x,
                y: result.height - padding,
            })
            const arrowList = getDrawArrowInfo({
                x: endPoint.x - result.x,
                y: result.height - padding
            }, {
                position: "bottom",
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            //修正可拖拽区域
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: endPoint.x - result.x - padding,
                y: result.height - padding * 2
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: endPoint.x - result.x + padding,
                y: result.height
            }
        }
    } else {
        /*
            示例如下：

                         |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|                              |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
                         |                           |                              |                             |
        |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|          |            |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|             |
        |                p1               |          |            |                p1               |             |
        |                                 |          |            |                                 |             |
        |                                 |          |            |                                 |             |
        |            case1                |          |___         |               case2             |             |
        |                                 |                       |                                 |             |
        |                                 |                       |                                 |             |
        |                                 |                       |                                 |
        |                                 |                       |                                 |
        |_________________________________|                       |_________________________________|

        */
        result.width = Math.abs(endPoint.x - startPoint.x) + 2 * padding;
        result.height = Math.abs(endPoint.y - startPoint.y) + breakLineOffsetNode + 2 * padding;
        result.x = startPoint.x - padding;
        result.y = endPoint.y - padding;
        if (Math.abs(endPoint.x - startPoint.x) > Math.abs(endPoint.y - startPoint.y)) { //如图case1
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding - breakLineOffsetNode,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - breakLineOffsetNode - padding,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - breakLineOffsetNode - padding,
                y: padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding,
            })
            const arrowList = getDrawArrowInfo({
                x: result.width - padding,
                y: padding
            }, {
                position: "right",
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
        } else {
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding - breakLineOffsetNode,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding,
            })
            const arrowList = getDrawArrowInfo({
                x: result.width - padding,
                y: padding
            }, {
                position: "top",
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
        }
    }
}
//左侧线条
const drawLeftLineWhenDrag = (result: ResultRect, options: Options) => {
    const { lineConfig: { padding, arrowLength, arrowWidth }, fromNode, endPoint } = options;
    /*
                 示例如下：
                 |‾‾‾‾‾‾‾‾‾‾‾‾‾|                      |‾‾‾‾‾‾‾‾‾‾‾‾‾|
                 |             |                      |             |
           |-----| p  case1    |                |-----| p  case2    |
           |     |             |                |     |             |
           |     |_____________|          ______|     |_____________|
           |                             end
           |
          end
    */
    const p = {
        x: fromNode.styleInfo.offsetX,
        y: fromNode.styleInfo.height / 2 + fromNode.styleInfo.offsetY
    }
    const endPWidth = Math.abs(endPoint.x - p.x);
    const endPHeight = Math.abs(endPoint.y - p.y);
    if (endPHeight > endPWidth) { //case1
        result.width = Math.abs(endPoint.x - p.x) + 2 * padding;
        result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
        result.x = endPoint.x - padding;
        result.y = p.y - padding
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding - arrowLength
        })
        const arrowList = getDrawArrowInfo({
            x: padding,
            y: result.height - padding - arrowLength
        }, {
            position: "bottom",
            arrowLength,
            arrowWidth
        });
        result.lineInfo.arrowInfo.p1 = arrowList[0];
        result.lineInfo.arrowInfo.p2 = arrowList[1];
        result.lineInfo.arrowInfo.p3 = arrowList[2];
        //修正可拖拽区域
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: 0,
            y: result.height - 2 * padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: 2 * padding,
            y: result.height
        }
    } else {
        result.width = Math.abs(endPoint.x - p.x) + 2 * padding;
        result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
        result.x = endPoint.x - padding;
        result.y = p.y - padding
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width / 2,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width / 2,
            y: result.height - padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding
        })
        const arrowList = getDrawArrowInfo({
            x: padding,
            y: result.height - padding
        }, {
            position: "left",
            arrowLength,
            arrowWidth
        });
        result.lineInfo.arrowInfo.p1 = arrowList[0];
        result.lineInfo.arrowInfo.p2 = arrowList[1];
        result.lineInfo.arrowInfo.p3 = arrowList[2];
        //修正可拖拽区域
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: 0,
            y: result.height - 2 * padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: 2 * padding,
            y: result.height
        }
    }
}
//底部线条
const drawBottomLineWhenDrag = (result: ResultRect, options: Options) => {
    const { lineConfig: { padding, arrowLength, arrowWidth }, fromNode, endPoint } = options;
    /*
        示例如下：

               |‾‾‾‾‾‾‾‾‾‾‾‾|                     |‾‾‾‾‾‾‾‾‾‾‾‾‾|
               |            |                     |             |
               |    case1   |                     |    case2    |
               |            |                     |             |
               |______p_____|                     |______p______|
                      |                                  |
        ______________|                                  |
       end                                               |
                                           ______________|
                                           |
                                           |
                                           |
                                          end
    */
    const p = {
        x: fromNode.styleInfo.offsetX + fromNode.styleInfo.width / 2,
        y: fromNode.styleInfo.height + fromNode.styleInfo.offsetY
    }
    const endPWidth = Math.abs(endPoint.x - p.x);
    const endPHeight = Math.abs(endPoint.y - p.y);
    if (endPWidth * 0.618 > endPHeight) { //case1
        result.width = Math.abs(endPoint.x - p.x) + 2 * padding;
        result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
        result.x = endPoint.x - padding;
        result.y = p.y - padding
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: result.height - padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding
        })
        const arrowList = getDrawArrowInfo({
            x: padding,
            y: result.height - padding
        }, {
            position: "left",
            arrowLength,
            arrowWidth
        });
        result.lineInfo.arrowInfo.p1 = arrowList[0];
        result.lineInfo.arrowInfo.p2 = arrowList[1];
        result.lineInfo.arrowInfo.p3 = arrowList[2];
        //修正可拖拽区域
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: 0,
            y: result.height - 2 * padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: 2 * padding,
            y: result.height
        }
    } else {
        result.width = Math.abs(endPoint.x - p.x) + 2 * padding;
        result.height = Math.abs(endPoint.y - p.y) + 2 * padding;
        result.x = endPoint.x - padding;
        result.y = p.y - padding
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: result.height / 2,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height / 2
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding
        })
        const arrowList = getDrawArrowInfo({
            x: padding,
            y: result.height - padding
        }, {
            position: "bottom",
            arrowLength,
            arrowWidth
        });
        result.lineInfo.arrowInfo.p1 = arrowList[0];
        result.lineInfo.arrowInfo.p2 = arrowList[1];
        result.lineInfo.arrowInfo.p3 = arrowList[2];
        //修正可拖拽区域
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: 0,
            y: result.height - 2 * padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: 2 * padding,
            y: result.height
        }
    }
}
/*
|--------------------------------------------------------------------------
|
|--------------------------------------------------------------------------
*/
export const getQuardantInfo4 = (result: ResultRect, options: Options): void => {
    const { startPoint, endPoint, lineConfig: { padding }, fromPosition } = options;
    //第一步，确定canvas位置和宽高
    result.x = startPoint.x - padding;
    result.y = endPoint.y - padding
    result.width = Math.abs(endPoint.x - startPoint.x) + 2 * padding;
    result.height = Math.abs(endPoint.y - startPoint.y) + 2 * padding;
    //第二步，确定箭头可拖拽区域
    result.lineInfo.arrowInfo.leftTopPoint = {
        x: result.width - padding * 2,
        y: 0
    }
    result.lineInfo.arrowInfo.rightBottomPoint = {
        x: result.width,
        y: padding * 2
    }
    //第三步，根据线条引出时候位置，绘制线条
    if (fromPosition === "right") { //第一象限，从节点右侧引出线条
        drawRightLineWhenDrag(result, options);
        drawRightLineWhenStick(result, options);
    } else if (fromPosition === "top") { //第一象限，从节点顶部引出线条
        drawTopLineWhenDrag(result, options);
        drawTopLineWhenStick(result, options);
    } else if (fromPosition === "left") { //第一象限，从节点左侧引出线条
        drawLeftLineWhenDrag(result, options);
        drawLeftLineWhenStick(result, options);
    } else if (fromPosition === "bottom") { //第一象限，从节点下侧引出线条
        drawBottomLineWhenDrag(result, options);
        drawBottomLineWhenStick(result, options);
    }
}
