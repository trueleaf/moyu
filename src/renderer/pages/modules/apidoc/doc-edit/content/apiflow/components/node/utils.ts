type Coordinate = {
    x: number,
    y: number
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
// type Options = {
//     /**
//      * 是否允许拖拽过程中buffer缓存
//      */
//     fixedStartPoint: boolean
// }

//根据起始位置返回节点 width height left top
export function getRectInfo(startInfo: Coordinate, endInfo: Coordinate): ResultRect {
    const arrowLength = 15;
    const arrowWidth = 5;
    const minWidth = 20
    const minHeight = 20
    const padding = 15;
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
        result.x = startInfo.x - padding;
        result.y = endInfo.y - padding
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding;
        result.height = Math.abs(endInfo.y - startInfo.y) + 2 * padding;
        result.lineInfo.startX = padding;
        result.lineInfo.startY = result.height - padding;
        result.lineInfo.endX = result.width - padding;
        result.lineInfo.endY = padding;
        result.lineInfo.cpx = padding;
        result.lineInfo.cpy = padding;
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY - arrowWidth
        }
        result.lineInfo.arrowInfo.leftBottomPoint = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY + arrowWidth
        }
        result.lineInfo.arrowInfo.rightTopPoint = {
            x: result.lineInfo.endX + arrowLength,
            y: result.lineInfo.endY - arrowWidth
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.lineInfo.endX + arrowLength,
            y: result.lineInfo.endY + arrowWidth
        }
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
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: result.lineInfo.endX - arrowLength,
            y: result.lineInfo.endY - arrowWidth
        }
        result.lineInfo.arrowInfo.leftBottomPoint = {
            x: result.lineInfo.endX - arrowLength,
            y: result.lineInfo.endY + arrowWidth
        }
        result.lineInfo.arrowInfo.rightTopPoint = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY - arrowWidth
        }
        result.lineInfo.arrowInfo.rightBottomPoint = {
            x: result.lineInfo.endX,
            y: result.lineInfo.endY + arrowWidth
        }
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
    } else if (endInfo.x <= startInfo.x && endInfo.y > startInfo.y) { //第三象限
        result.x = endInfo.x - padding;
        result.y = startInfo.y - padding
        result.width = Math.abs(endInfo.x - startInfo.x) + 2 * padding;
        result.height = Math.abs(endInfo.y - startInfo.y) + 2 * padding;
        result.lineInfo.startX = result.width - padding;
        result.lineInfo.startY = result.height - padding;
        result.lineInfo.endX = padding;
        result.lineInfo.endY = padding;
        result.lineInfo.cpx = result.width - padding;
        result.lineInfo.cpy = padding;
    } else if (endInfo.x > startInfo.x && endInfo.y > startInfo.y) { //第四象限
        if (Math.abs(endInfo.y - startInfo.y) < minHeight) {
            result.y = startInfo.y - minHeight / 2;
            result.lineInfo.startY = minHeight / 2;
            result.lineInfo.endY = minHeight / 2;
            result.height = minHeight;
            result.lineInfo.cpx = result.lineInfo.endX;
            result.lineInfo.cpy = result.lineInfo.endY;
        } else {
            result.height = Math.abs(endInfo.y - startInfo.y);
            result.y = startInfo.y;
            result.lineInfo.startY = 0;
            result.lineInfo.endY = result.height - arrowWidth;
        }
        if (Math.abs(endInfo.x - startInfo.x) < minWidth) {
            result.width = minWidth;
            result.x = startInfo.x - minWidth / 2;
            result.lineInfo.startX = minWidth / 2;
            result.lineInfo.endX = minWidth / 2;
            result.lineInfo.endY = result.height - arrowLength;
            // result.lineInfo.arrowP1.x = result.lineInfo.endX - arrowWidth
            // result.lineInfo.arrowP1.y = result.lineInfo.endY
            // result.lineInfo.arrowP2.x = result.lineInfo.endX + arrowWidth
            // result.lineInfo.arrowP2.y = result.lineInfo.endY
            // result.lineInfo.arrowP3.x = result.lineInfo.endX
            // result.lineInfo.arrowP3.y = result.lineInfo.endY + arrowLength
            result.lineInfo.cpx = result.lineInfo.endX;
            result.lineInfo.cpy = result.lineInfo.endY;
        } else {
            result.width = Math.abs(endInfo.x - startInfo.x);
            result.x = startInfo.x;
            result.lineInfo.startX = 0;
            result.lineInfo.endX = result.width - arrowLength;
        //     result.lineInfo.arrowP1.x = result.lineInfo.endX
        //     result.lineInfo.arrowP1.y = result.lineInfo.endY - arrowWidth
        //     result.lineInfo.arrowP2.x = result.lineInfo.endX
        //     result.lineInfo.arrowP2.y = result.lineInfo.endY + arrowWidth
        //     result.lineInfo.arrowP3.x = result.lineInfo.endX + arrowLength
        //     result.lineInfo.arrowP3.y = result.lineInfo.endY
        }
        if (Math.abs(endInfo.y - startInfo.y) < minHeight || Math.abs(endInfo.x - startInfo.x) < minWidth) {
            result.lineInfo.cpx = result.lineInfo.endX;
            result.lineInfo.cpy = result.lineInfo.endY;
        } else {
            result.lineInfo.cpx = 0;
            result.lineInfo.cpy = result.height;
        }
    }
    return result;
}
