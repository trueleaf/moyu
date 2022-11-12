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
| 获取canvas绘制信息
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
//拖拽线条时候绘制右侧线条
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
//当线条与其他节点吸附时候，改变线条绘制路径
const drawRightLineWhenStick = (result: ResultRect, options: Options) => {
    const nodes = store.state["apidoc/apiflow"].apiflowList;
    const { lineConfig: { padding, arrowLength, breakLineOffsetNode, arrowWidth }, endInfo, startInfo } = options;
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i]
        const stickyArea = getNodeStickyArea(node);
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
            result.connectedNodeId = node.id;
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
    }
}
