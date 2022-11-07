import type { ResultRect, Coordinate, LineDrawInfoOptions, LineConfig } from "../utils"

type Options = LineDrawInfoOptions & {
    startInfo: Coordinate,
    endInfo: Coordinate,
    lineConfig: LineConfig
}
type GetArrowInfoOptions = {
    position: "left"| "right" | "top" | "bottom";
}
/*
|--------------------------------------------------------------------------
| 获取canvas绘制信息
|--------------------------------------------------------------------------
*/
//绘制箭头
const getDrawArrowInfo = (point: Coordinate, options: GetArrowInfoOptions): Coordinate[] => {
    const arrowList: Coordinate[] = [];
    const { position } = options;
    if (position === "right") {
        arrowList[0] = {
            x: point.x,
            y: point.x - 2
        }
    }
    return arrowList
}
//绘制右侧线条
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
                position: "right"
            });
            result.lineInfo.arrowInfo.p1 = arrowList[0];
            result.lineInfo.arrowInfo.p2 = arrowList[1];
            result.lineInfo.arrowInfo.p3 = arrowList[2];
            // result.lineInfo.arrowInfo.p1 = {
            //     x: Math.abs(result.width - padding),
            //     y: result.height - padding - arrowWidth
            // }
            // result.lineInfo.arrowInfo.p2 = {
            //     x: Math.abs(result.width - padding),
            //     y: result.height - padding + arrowWidth
            // }
            // result.lineInfo.arrowInfo.p3 = {
            //     x: Math.abs(result.width - padding) + arrowLength,
            //     y: result.height - padding
            // }
        } else {
            result.lineInfo.brokenLinePoints.push({
                x: padding + breakLineWidth / 2,
                y: padding
            })
            result.lineInfo.brokenLinePoints.push({
                x: Math.abs(result.width - padding),
                y: padding
            })
            result.lineInfo.arrowInfo.p1 = {
                x: Math.abs(result.width - padding),
                y: padding - arrowWidth
            }
            result.lineInfo.arrowInfo.p2 = {
                x: Math.abs(result.width - padding),
                y: padding + arrowWidth
            }
            result.lineInfo.arrowInfo.p3 = {
                x: Math.abs(result.width - padding) + arrowLength,
                y: padding
            }
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
        y: result.lineInfo.endY - padding
    }
    result.lineInfo.arrowInfo.rightBottomPoint = {
        x: result.width,
        y: result.lineInfo.endY + padding
    }
    //第三步，根据线条引出时候位置，绘制线条
    if (fromPosition === "right") { //第一象限，从节点右侧引出线条
        drawRightLineWhenDrag(result, options);
    }
}
