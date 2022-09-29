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
//根据起始位置返回节点 width height left top
export function getRectInfo(startInfo: Coordinate, endInfo: Coordinate): ResultRect {
    const arrowLength = 15;
    const arrowWidth = 5;
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
        //=========================================================================//
        result.lineInfo.arrowInfo.leftTopPoint = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY - padding
        }
        result.lineInfo.arrowInfo.leftBottomPoint = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY + padding
        }
        result.lineInfo.arrowInfo.rightTopPoint = {
            x: result.lineInfo.endX + padding,
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
        result.lineInfo.arrowInfo.leftBottomPoint = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY + padding
        }
        result.lineInfo.arrowInfo.rightTopPoint = {
            x: result.lineInfo.endX + padding,
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
        result.lineInfo.arrowInfo.leftBottomPoint = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY + padding
        }
        result.lineInfo.arrowInfo.rightTopPoint = {
            x: result.lineInfo.endX + padding,
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
        result.lineInfo.arrowInfo.leftBottomPoint = {
            x: result.lineInfo.endX - padding,
            y: result.lineInfo.endY + padding
        }
        result.lineInfo.arrowInfo.rightTopPoint = {
            x: result.lineInfo.endX + padding,
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
