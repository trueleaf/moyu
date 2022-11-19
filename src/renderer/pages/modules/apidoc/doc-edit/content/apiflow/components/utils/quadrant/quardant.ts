import { store } from "@/store";
import { getNodeStickyArea, StickyArea } from "../common/common";
import type { ResultRect, Coordinate, LineDrawInfoOptions, LineConfig } from "../utils"

type Options = LineDrawInfoOptions & {
    startInfo: Coordinate,
    endInfo: Coordinate,
    lineConfig: LineConfig
}
type GetArrowInfoOptions = {
    position: "left"| "right" | "top" | "bottom";
    arrowLength: number;
    arrowWidth: number;
}
type Position = "left" | "top" | "right" | "bottom"
/*
|--------------------------------------------------------------------------
| 公共方法
|--------------------------------------------------------------------------
*/
const getLineStickyPosition = (point: Coordinate, stickyArea: StickyArea): Position | null => {
    const isLineXInLeftStickyArea = point.x >= stickyArea.leftArea.offsetX && point.x <= stickyArea.leftArea.offsetX2;
    const isLineYInLeftStickyArea = point.y >= stickyArea.leftArea.offsetY && point.y <= stickyArea.leftArea.offsetY2;
    const isLineXInTopStickyArea = point.x >= stickyArea.topArea.offsetX && point.x <= stickyArea.topArea.offsetX2;
    const isLineYInTopStickyArea = point.y >= stickyArea.topArea.offsetY && point.y <= stickyArea.topArea.offsetY2;
    const isLineXInBottomStickyArea = point.x >= stickyArea.bottomArea.offsetX && point.x <= stickyArea.bottomArea.offsetX2;
    const isLineYInBottomStickyArea = point.y >= stickyArea.bottomArea.offsetY && point.y <= stickyArea.bottomArea.offsetY2;
    const isLineXInRightStickyArea = point.x >= stickyArea.rightArea.offsetX && point.x <= stickyArea.rightArea.offsetX2;
    const isLineYInRightStickyArea = point.y >= stickyArea.rightArea.offsetY && point.y <= stickyArea.rightArea.offsetY2;
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
const getContraryPosition = (position: Position): Position => {
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
    const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endInfo, startInfo, fromNode } = options;
    for (let i = 0; i < toNodes.length; i += 1) {
        const toNode = toNodes[i]
        if (toNode.id === options.fromNode.id) {
            continue;
        }
        const stickyArea = getNodeStickyArea(toNode);
        const stickyNodePosition = getLineStickyPosition({
            x: endInfo.x,
            y: endInfo.y
        }, stickyArea);
        const lineEndPoint: Coordinate = {
            x: 0,
            y: 0,
        };
        if (stickyNodePosition === "left") {
            result.width = stickyArea.leftArea.pointX - startInfo.x + 2 * padding;
            result.height = Math.abs(stickyArea.leftArea.pointY - startInfo.y) + 2 * padding;
            result.y = stickyArea.leftArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: startInfo.x - result.x,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: (stickyArea.leftArea.pointX - startInfo.x) / 2 + padding,
                y: result.height - padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: (stickyArea.leftArea.pointX - startInfo.x) / 2 + padding,
                y: stickyArea.leftArea.pointY - result.y
            });
            result.lineInfo.brokenLinePoints.push({
                x: stickyArea.leftArea.pointX - result.x - arrowLength,
                y: stickyArea.leftArea.pointY - result.y
            });
            lineEndPoint.x = stickyArea.leftArea.pointX - result.x - arrowLength;
            lineEndPoint.y = stickyArea.leftArea.pointY - result.y;
            result.isConnectedNode = true
            result.connectedPosition = "left";
        } else if (stickyNodePosition === "top") {
            const gapX = toNode.styleInfo.offsetX - fromNode.styleInfo.offsetX - fromNode.styleInfo.width; //fromNode右侧距离toNode左侧距离
            result.width = stickyArea.topArea.pointX - startInfo.x + 2 * padding;
            result.height = Math.abs(startInfo.y - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
            result.y = stickyArea.topArea.pointY - padding - breakLineOffsetNode;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: startInfo.x - result.x,
                y: result.height - padding
            });
            if (gapX >= 0 && gapX <= breakLineOffsetNode * 2) {
                result.lineInfo.brokenLinePoints.push({
                    x: startInfo.x - result.x + gapX / 2,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: startInfo.x - result.x + gapX / 2,
                    y: stickyArea.topArea.pointY - result.y - breakLineOffsetNode
                });
            } else if (gapX < 0) {
                result.width = toNode.styleInfo.offsetX + toNode.styleInfo.width - fromNode.styleInfo.width - fromNode.styleInfo.offsetX + breakLineOffsetNode + 2 * padding
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: stickyArea.topArea.pointY - result.y - breakLineOffsetNode
                })
            } else {
                result.lineInfo.brokenLinePoints.push({
                    x: startInfo.x - result.x + breakLineOffsetNode,
                    y: result.height - padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: startInfo.x - result.x + breakLineOffsetNode,
                    y: stickyArea.topArea.pointY - result.y - breakLineOffsetNode
                });
            }
            result.lineInfo.brokenLinePoints.push({
                x: stickyArea.topArea.pointX - result.x,
                y: stickyArea.topArea.pointY - result.y - breakLineOffsetNode
            });
            result.lineInfo.brokenLinePoints.push({
                x: stickyArea.topArea.pointX - result.x,
                y: stickyArea.topArea.pointY - result.y - padding
            });
            lineEndPoint.x = stickyArea.topArea.pointX - result.x;
            lineEndPoint.y = stickyArea.topArea.pointY - result.y - padding;
            result.isConnectedNode = true
            result.connectedPosition = "top";
        } else if (stickyNodePosition === "bottom") {
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
                y: stickyArea.bottomArea.pointY - result.y + arrowLength
            });
            lineEndPoint.x = stickyArea.bottomArea.pointX - startInfo.x + padding;
            lineEndPoint.y = stickyArea.bottomArea.pointY - result.y + arrowLength
            result.isConnectedNode = true
            result.connectedPosition = "bottom";
        } else if (stickyNodePosition === "right") {
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
            lineEndPoint.x = stickyArea.rightArea.pointX - startInfo.x + padding * 2;
            lineEndPoint.y = stickyArea.rightArea.pointY - result.y;
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
    const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endInfo, startInfo, fromNode } = options;
    for (let i = 0; i < toNodes.length; i += 1) {
        const toNode = toNodes[i]
        if (toNode.id === options.fromNode.id) {
            continue;
        }
        const stickyArea = getNodeStickyArea(toNode);
        const stickyNodePosition = getLineStickyPosition({
            x: endInfo.x,
            y: endInfo.y
        }, stickyArea);
        const lineEndPoint: Coordinate = {
            x: 0,
            y: 0,
        };
        if (stickyNodePosition === "left") {
            result.width = stickyArea.leftArea.pointX - startInfo.x + 2 * padding;
            result.height = Math.abs(stickyArea.leftArea.pointY - startInfo.y) + 2 * padding;
            result.y = stickyArea.leftArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding - arrowLength,
                y: padding
            });
            lineEndPoint.x = stickyArea.leftArea.pointX - result.x - arrowLength;
            lineEndPoint.y = stickyArea.leftArea.pointY - result.y;
            result.isConnectedNode = true
            result.connectedPosition = "left";
        } else if (stickyNodePosition === "top") {
            result.width = stickyArea.topArea.pointX - startInfo.x + 2 * padding;
            result.height = Math.abs(startInfo.y - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
            result.y = stickyArea.topArea.pointY - padding - breakLineOffsetNode;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding + breakLineOffsetNode - arrowLength
            });
            lineEndPoint.x = stickyArea.topArea.pointX - result.x;
            lineEndPoint.y = stickyArea.topArea.pointY - result.y - padding;
            result.isConnectedNode = true
            result.connectedPosition = "top";
        } else if (stickyNodePosition === "bottom") {
            result.width = stickyArea.bottomArea.pointX - startInfo.x + 2 * padding;
            result.height = Math.abs(startInfo.y - stickyArea.bottomArea.pointY) + 2 * padding;
            result.y = stickyArea.bottomArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height / 2
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: result.height / 2
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: stickyArea.bottomArea.pointY - result.y + arrowLength
            });
            lineEndPoint.x = stickyArea.bottomArea.pointX - startInfo.x + padding;
            lineEndPoint.y = stickyArea.bottomArea.pointY - result.y + arrowLength
            result.isConnectedNode = true
            result.connectedPosition = "bottom";
        } else if (stickyNodePosition === "right") {
            const gapY = Math.abs(toNode.styleInfo.offsetY - fromNode.styleInfo.offsetY) - fromNode.styleInfo.height; //fromNode右侧距离toNode左侧距离
            result.width = stickyArea.rightArea.pointX - startInfo.x + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(startInfo.y - stickyArea.rightArea.pointY) + 2 * padding;
            result.y = stickyArea.rightArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            if (gapY < padding) {
                result.height = Math.abs(startInfo.y - toNode.styleInfo.offsetY) + 2 * padding + breakLineOffsetNode;
                result.y = toNode.styleInfo.offsetY - padding - breakLineOffsetNode;
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: stickyArea.rightArea.pointY - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.rightArea.pointX - result.x + arrowLength,
                    y: stickyArea.rightArea.pointY - result.y
                });
            } else {
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding - gapY / 2
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: result.height - padding - gapY / 2
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: stickyArea.rightArea.pointY - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.rightArea.pointX - result.x + arrowLength,
                    y: stickyArea.rightArea.pointY - result.y
                });
            }
            lineEndPoint.x = stickyArea.rightArea.pointX - startInfo.x + padding * 2;
            lineEndPoint.y = stickyArea.rightArea.pointY - result.y;
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
    const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endInfo, startInfo, fromNode } = options;
    const fromNodeStyleInfo = fromNode.styleInfo;
    for (let i = 0; i < toNodes.length; i += 1) {
        const toNode = toNodes[i]
        if (toNode.id === options.fromNode.id) {
            continue;
        }
        const stickyArea = getNodeStickyArea(toNode);
        const stickyNodePosition = getLineStickyPosition({
            x: endInfo.x,
            y: endInfo.y
        }, stickyArea);
        const lineEndPoint: Coordinate = {
            x: 0,
            y: 0,
        };
        if (stickyNodePosition === "left") {
            result.width = stickyArea.leftArea.pointX - startInfo.x + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(stickyArea.leftArea.pointY - startInfo.y) + 2 * padding;
            result.y = stickyArea.leftArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];

            if (stickyArea.leftArea.pointX > fromNodeStyleInfo.offsetX + fromNodeStyleInfo.width && stickyArea.leftArea.pointY > fromNodeStyleInfo.offsetY) {
                result.height = fromNode.styleInfo.height / 2 + breakLineOffsetNode + 2 * padding;
                result.y = fromNode.styleInfo.offsetY - padding - breakLineOffsetNode
                result.lineInfo.brokenLinePoints.push({
                    x: padding + breakLineOffsetNode,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding - breakLineOffsetNode - arrowLength,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding - breakLineOffsetNode - arrowLength,
                    y: endInfo.y - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: endInfo.y - result.y
                });
            } else {
                result.lineInfo.brokenLinePoints.push({
                    x: padding + breakLineOffsetNode,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding - arrowLength,
                    y: padding
                });
            }
            lineEndPoint.x = stickyArea.leftArea.pointX - result.x - arrowLength;
            lineEndPoint.y = stickyArea.leftArea.pointY - result.y;
            result.isConnectedNode = true
            result.connectedPosition = "left";
        } else if (stickyNodePosition === "top") {
            result.width = stickyArea.topArea.pointX - startInfo.x + 2 * padding;
            result.height = Math.abs(startInfo.y - stickyArea.topArea.pointY) + 2 * padding + breakLineOffsetNode;
            result.y = stickyArea.topArea.pointY - padding - breakLineOffsetNode;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding + breakLineOffsetNode - arrowLength
            });
            lineEndPoint.x = stickyArea.topArea.pointX - result.x;
            lineEndPoint.y = stickyArea.topArea.pointY - result.y - padding;
            result.isConnectedNode = true
            result.connectedPosition = "top";
        } else if (stickyNodePosition === "bottom") {
            result.width = stickyArea.bottomArea.pointX - startInfo.x + 2 * padding;
            result.height = Math.abs(startInfo.y - stickyArea.bottomArea.pointY) + 2 * padding;
            result.y = stickyArea.bottomArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding
            });
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height / 2
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: result.height / 2
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: stickyArea.bottomArea.pointY - result.y + arrowLength
            });
            lineEndPoint.x = stickyArea.bottomArea.pointX - startInfo.x + padding;
            lineEndPoint.y = stickyArea.bottomArea.pointY - result.y + arrowLength
            result.isConnectedNode = true
            result.connectedPosition = "bottom";
        } else if (stickyNodePosition === "right") {
            const gapY = Math.abs(toNode.styleInfo.offsetY - fromNode.styleInfo.offsetY) - fromNode.styleInfo.height; //fromNode右侧距离toNode左侧距离
            result.width = stickyArea.rightArea.pointX - startInfo.x + 2 * padding + breakLineOffsetNode;
            result.height = Math.abs(startInfo.y - stickyArea.rightArea.pointY) + 2 * padding;
            result.y = stickyArea.rightArea.pointY - padding;
            result.lineInfo.brokenLinePoints = [];
            if (gapY < padding) {
                result.height = Math.abs(startInfo.y - toNode.styleInfo.offsetY) + 2 * padding + breakLineOffsetNode;
                result.y = toNode.styleInfo.offsetY - padding - breakLineOffsetNode;
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: padding
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: stickyArea.rightArea.pointY - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.rightArea.pointX - result.x + arrowLength,
                    y: stickyArea.rightArea.pointY - result.y
                });
            } else {
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding
                });
                result.lineInfo.brokenLinePoints.push({
                    x: padding,
                    y: result.height - padding - gapY / 2
                })
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: result.height - padding - gapY / 2
                });
                result.lineInfo.brokenLinePoints.push({
                    x: result.width - padding,
                    y: stickyArea.rightArea.pointY - result.y
                });
                result.lineInfo.brokenLinePoints.push({
                    x: stickyArea.rightArea.pointX - result.x + arrowLength,
                    y: stickyArea.rightArea.pointY - result.y
                });
            }
            lineEndPoint.x = stickyArea.rightArea.pointX - startInfo.x + padding * 2;
            lineEndPoint.y = stickyArea.rightArea.pointY - result.y;
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
    const { lineConfig: { padding, breakLineSticky, arrowLength, arrowWidth } } = options;
    const breakLineWidth = Math.abs(result.width - 2 * padding); //折线宽度
    const breakLineHeight = Math.abs(result.height - 2 * padding); //折线高度
    /*
        示例如下：
                   |‾‾‾‾‾‾‾‾‾‾‾‾‾
        ___________|
    */
    if (breakLineWidth > breakLineHeight) {
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding + breakLineWidth / 2,
            y: result.height - padding
        })
        if (Math.abs(result.height - 2 * padding) < breakLineSticky) { //折线往上移动吸附效果
            result.lineInfo.brokenLinePoints.push({
                x: Math.abs(result.width - padding),
                y: result.height - padding
            })
            const arrowList = getDrawArrowInfo({
                x: result.width - padding,
                y: result.height - padding
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
                x: padding + breakLineWidth / 2,
                y: padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: Math.abs(result.width - padding),
                y: padding
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
        }
    } else {
        /*
        示例如下：
                |
                |
                |
                |
            ____|
        */
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding + breakLineWidth,
            y: result.height - padding
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding + breakLineWidth,
            y: padding
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
//顶部线条
const drawTopLineWhenDrag = (result: ResultRect, options: Options) => {
    const { lineConfig: { padding, breakLineSticky, arrowLength, arrowWidth } } = options;
    const breakLineWidth = Math.abs(result.width - 2 * padding); //折线宽度
    const breakLineHeight = Math.abs(result.height - 2 * padding); //折线高度
    /*
        示例如下：

        |‾‾‾‾‾‾‾‾‾‾‾‾‾
        |
    */
    if (breakLineWidth > breakLineHeight) {
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - 2 * padding,
            y: padding,
        })
        const arrowList = getDrawArrowInfo({
            x: result.width - 2 * padding,
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
        /*
            示例如下：
                  |
                  |
                  |
            |‾‾‾‾‾
            |
            |
        */
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height / 2,
        })
        if (Math.abs(result.width - 2 * padding) < breakLineSticky) { //折线往右移动吸附效果
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding
            })
            const arrowList = getDrawArrowInfo({
                x: padding,
                y: padding
            }, {
                position: "top",
                arrowLength,
                arrowWidth
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
        } else {
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: result.height / 2
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding
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
    const { lineConfig: { padding, breakLineOffsetNode, arrowLength, arrowWidth }, fromNode, endInfo, startInfo } = options;
    /*
        示例如下：
     |‾‾‾‾‾|                             |‾‾‾‾‾|
     |     |                             |     |
     |     |                             |
     |  |‾‾|‾‾‾‾‾‾‾‾‾‾|                  |  |‾‾‾‾‾‾‾‾‾‾‾‾‾|
     |  |  |          |                  |  |             |
     |--|             |                  |--|             |
        |             |                     |             |
        |_____________|                     |_____________|
    */
    if (endInfo.y > (fromNode.styleInfo.offsetY - breakLineOffsetNode) && endInfo.x < fromNode.styleInfo.offsetX + breakLineOffsetNode) {
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding + breakLineOffsetNode;
        result.height = fromNode.styleInfo.height / 2 + breakLineOffsetNode + 2 * padding;
        result.x = startInfo.x - padding - breakLineOffsetNode;
        result.y = fromNode.styleInfo.offsetY - padding - breakLineOffsetNode
        result.lineInfo.brokenLinePoints.push({
            x: padding + breakLineOffsetNode,
            y: result.height - padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding,
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
            y: endInfo.y - result.y - arrowLength,
        })
        const arrowList = getDrawArrowInfo({
            x: result.width - padding,
            y: endInfo.y - result.y - arrowLength
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
            y: endInfo.y - result.y - arrowLength - padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.width,
            y: endInfo.y - result.y - arrowLength + padding
        }
    } else if (endInfo.y > (fromNode.styleInfo.offsetY - breakLineOffsetNode) && endInfo.x >= fromNode.styleInfo.offsetX + breakLineOffsetNode) {
        /*
            示例如下：
        |‾‾‾‾‾‾‾‾‾‾|                  |‾‾‾‾‾|
        |          |                  |      ‾‾‾‾‾
        |  |‾‾‾‾‾‾‾|‾‾‾‾‾‾‾‾|         |  |‾‾‾‾‾‾‾‾‾‾‾‾‾|
        |  |       |____    |         |  |             |
        |--|                |         |--|             |
           |                |            |             |
           |________________|            |_____________|
        */
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding + breakLineOffsetNode;
        result.height = fromNode.styleInfo.height / 2 + breakLineOffsetNode + 2 * padding;
        result.x = startInfo.x - padding - breakLineOffsetNode;
        result.y = fromNode.styleInfo.offsetY - padding - breakLineOffsetNode
        result.lineInfo.brokenLinePoints.push({
            x: padding + breakLineOffsetNode,
            y: result.height - padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding - breakLineOffsetNode,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding - breakLineOffsetNode,
            y: endInfo.y - result.y,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: endInfo.y - result.y,
        })
        const arrowList = getDrawArrowInfo({
            x: result.width - padding,
            y: endInfo.y - result.y
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
            y: endInfo.y - result.y - arrowLength - padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.width,
            y: endInfo.y - result.y - arrowLength + padding
        }
    } else if (endInfo.y <= fromNode.styleInfo.offsetY - breakLineOffsetNode) {
        /*
            示例如下：
               |
               |
               |
        |‾‾‾‾‾‾                    |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
        |                          |
        |                          |
        |  |‾‾‾‾‾‾‾‾‾‾‾‾‾|         |  |‾‾‾‾‾‾‾‾‾‾‾‾‾|
        |  |             |         |  |             |
        |--|      1      |         |--|      2      |
           |             |            |             |
           |_____________|            |_____________|
        */
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding + breakLineOffsetNode;
        result.height = Math.abs(endInfo.y - startInfo.y) + 2 * padding;
        result.x = startInfo.x - padding - breakLineOffsetNode;
        result.y = endInfo.y - padding;
        if (result.width > result.height + breakLineOffsetNode) { //显示图2所示
            result.lineInfo.brokenLinePoints.push({
                x: padding + breakLineOffsetNode,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
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
            //修正可拖拽区域
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: result.width - padding * 2,
                y: endInfo.y - result.y - arrowLength - padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: result.width,
                y: endInfo.y - result.y - arrowLength + padding
            }
        } else {
            result.lineInfo.brokenLinePoints.push({
                x: padding + breakLineOffsetNode,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding + breakLineOffsetNode,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding + breakLineOffsetNode,
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
            //修正可拖拽区域
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: result.width - padding * 2,
                y: endInfo.y - result.y - arrowLength - padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: result.width,
                y: endInfo.y - result.y - arrowLength + padding
            }
        }
    }
}
//底部线条
const drawBottomLineWhenDrag = (result: ResultRect, options: Options) => {
    const { lineConfig: { padding, breakLineOffsetNode, arrowLength, arrowWidth }, fromNode, endInfo, startInfo } = options;
    /*
        示例如下：A点到B点范围内，线条方向共2种
                    A
                    |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
                    |                     |
    |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|   |        |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|          |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
    |                                 |   |        |                                 |          |                                 |
    |                                 |   |        |                                 |          |                                 |
    |                                 |   |        |                                 |          |                    |            |
    |                                 |   |        |               case1             |          |             case2  |            |
    |                                 |   |        |                                 |          |                    |            |
    |                                 |   |        |                    ‾‾‾‾‾‾‾‾‾‾‾‾‾|‾‾‾|      |                    ‾‾‾‾‾‾‾‾‾‾‾‾‾|‾‾‾|
    |                                 |   |        |                                 |   |      |                                 |   |
    |               p1                |   |        |                                 |   |      |                                 |   |
    |_________________________________|   |        |_________________________________|   |      |_________________________________|   |
                    |                     |                        |                     |                      |                     |
                    |_____________________|                        |_____________________|                      |_____________________|
                                            B

    */
    const p1 = {
        x: fromNode.styleInfo.width / 2 + fromNode.styleInfo.offsetX,
        y: fromNode.styleInfo.height + fromNode.styleInfo.offsetY
    }
    if (endInfo.x - p1.x < fromNode.styleInfo.width / 2 + breakLineOffsetNode && endInfo.y < fromNode.styleInfo.offsetY + breakLineOffsetNode) {
        result.width = fromNode.styleInfo.width / 2 + 2 * padding + breakLineOffsetNode;
        result.height = fromNode.styleInfo.height / 2 + breakLineOffsetNode + 2 * padding;
        result.x = startInfo.x - padding - breakLineOffsetNode;
        result.y = fromNode.styleInfo.offsetY - padding - breakLineOffsetNode
        result.lineInfo.brokenLinePoints.push({
            x: padding + breakLineOffsetNode,
            y: result.height - padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding,
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
            y: endInfo.y - result.y - arrowLength,
        })
        const arrowList = getDrawArrowInfo({
            x: result.width - padding,
            y: endInfo.y - result.y - arrowLength
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
            y: endInfo.y - result.y - arrowLength - padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.width,
            y: endInfo.y - result.y - arrowLength + padding
        }
    } else if (endInfo.y > (fromNode.styleInfo.offsetY - breakLineOffsetNode) && endInfo.x >= fromNode.styleInfo.offsetX + breakLineOffsetNode) {
        /*
            示例如下：A点到B点范围内
                        A
                        |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|
                        |                     |
        |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|   |
        |                                 |   |
        |                                 |   |
        |                                 |   |
        |                                 |   |
        |                                 |   |
        |                                 |   |
        |                                 |   |
        |                                 |   |
        |_________________________________|   |
                        |                     |
                        |_____________________|
                                               B

        */
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding + breakLineOffsetNode;
        result.height = fromNode.styleInfo.height / 2 + breakLineOffsetNode + 2 * padding;
        result.x = startInfo.x - padding - breakLineOffsetNode;
        result.y = fromNode.styleInfo.offsetY - padding - breakLineOffsetNode
        result.lineInfo.brokenLinePoints.push({
            x: padding + breakLineOffsetNode,
            y: result.height - padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: result.height - padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: padding,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding - breakLineOffsetNode,
            y: padding,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding - breakLineOffsetNode,
            y: endInfo.y - result.y,
        })
        result.lineInfo.brokenLinePoints.push({
            x: result.width - padding,
            y: endInfo.y - result.y,
        })
        const arrowList = getDrawArrowInfo({
            x: result.width - padding,
            y: endInfo.y - result.y
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
            y: endInfo.y - result.y - arrowLength - padding
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.width,
            y: endInfo.y - result.y - arrowLength + padding
        }
    } else if (endInfo.y <= fromNode.styleInfo.offsetY - breakLineOffsetNode) {
        /*
            示例如下：
               |
               |
               |
        |‾‾‾‾‾‾                    |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
        |                          |
        |                          |
        |  |‾‾‾‾‾‾‾‾‾‾‾‾‾|         |  |‾‾‾‾‾‾‾‾‾‾‾‾‾|
        |  |             |         |  |             |
        |--|      1      |         |--|      2      |
           |             |            |             |
           |_____________|            |_____________|
        */
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding + breakLineOffsetNode;
        result.height = Math.abs(endInfo.y - startInfo.y) + 2 * padding;
        result.x = startInfo.x - padding - breakLineOffsetNode;
        result.y = endInfo.y - padding;
        if (result.width > result.height + breakLineOffsetNode) { //显示图2所示
            result.lineInfo.brokenLinePoints.push({
                x: padding + breakLineOffsetNode,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
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
            //修正可拖拽区域
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: result.width - padding * 2,
                y: endInfo.y - result.y - arrowLength - padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: result.width,
                y: endInfo.y - result.y - arrowLength + padding
            }
        } else {
            result.lineInfo.brokenLinePoints.push({
                x: padding + breakLineOffsetNode,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: result.height - padding,
            })
            result.lineInfo.brokenLinePoints.push({
                x: padding,
                y: padding + breakLineOffsetNode,
            })
            result.lineInfo.brokenLinePoints.push({
                x: result.width - padding,
                y: padding + breakLineOffsetNode,
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
            //修正可拖拽区域
            result.lineInfo.arrowInfo.leftTopPoint = {
                x: result.width - padding * 2,
                y: endInfo.y - result.y - arrowLength - padding
            }
            result.lineInfo.arrowInfo.rightBottomPoint = {
                x: result.width,
                y: endInfo.y - result.y - arrowLength + padding
            }
        }
    }
}
/*
|--------------------------------------------------------------------------
|
|--------------------------------------------------------------------------
*/
export const getQuardantInfo = (result: ResultRect, options: Options): void => {
    const { startInfo, endInfo, lineConfig: { padding }, fromPosition } = options;
    //第一步，确定canvas位置和宽高
    result.x = startInfo.x - padding;
    result.y = endInfo.y - padding
    result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding;
    result.height = Math.abs(endInfo.y - startInfo.y) + 2 * padding;
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
    }
}
