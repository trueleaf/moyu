import type { ResultRect, Coordinate, LineDrawInfoOptions, LineConfig } from "../utils"

type Options = LineDrawInfoOptions & {
    startInfo: Coordinate,
    endInfo: Coordinate,
    lineConfig: LineConfig
}
/*
|--------------------------------------------------------------------------
| 获取canvas绘制信息
|--------------------------------------------------------------------------
*/
//拖拽时候绘制右侧线条
const drawRightLineWhenDrag = (result: ResultRect, options: Options) => {
    const { lineConfig: { padding }, startInfo, endInfo } = options;
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
            y: Math.abs(endInfo.y - startInfo.y) + padding
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
