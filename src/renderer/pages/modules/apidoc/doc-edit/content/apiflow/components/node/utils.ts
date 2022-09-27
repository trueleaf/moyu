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
        arrowP1: Coordinate,
        arrowP2: Coordinate,
        arrowP3: Coordinate,
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
            arrowP1: {
                x: 0,
                y: 0,
            },
            arrowP2: {
                x: 0,
                y: 0,
            },
            arrowP3: {
                x: 0,
                y: 0,
            }
        },
    }
    if (Math.abs(endInfo.x - startInfo.x) < 10 && Math.abs(endInfo.y - startInfo.y) < 10) {
        return result
    }
    if (endInfo.x > startInfo.x && endInfo.y <= startInfo.y) { //第一象限(startPostion为原点)
        result.lineInfo.cpx = 0;
        result.lineInfo.cpy = 0;
        if (Math.abs(endInfo.y - startInfo.y) < minHeight) {
            result.height = minHeight
            result.y = startInfo.y - minHeight / 2;
            result.lineInfo.startY = minHeight / 2;
            result.lineInfo.endY = minHeight / 2;
            result.lineInfo.cpx = result.lineInfo.endX;
            result.lineInfo.cpy = result.lineInfo.endY;
        } else {
            result.y = endInfo.y;
            result.height = Math.abs(endInfo.y - startInfo.y);
            result.lineInfo.startY = result.height;
            result.lineInfo.endY = arrowWidth;
        }
        if (Math.abs(endInfo.x - startInfo.x) < minWidth) {
            result.lineInfo.endY = 0 + arrowLength;
            result.width = minWidth;
            result.x = startInfo.x - minWidth / 2;
            result.lineInfo.startX = minWidth / 2;
            result.lineInfo.endX = minWidth / 2;
            result.lineInfo.arrowP1.x = result.lineInfo.endX - arrowWidth
            result.lineInfo.arrowP1.y = result.lineInfo.endY
            result.lineInfo.arrowP2.x = result.lineInfo.endX + arrowWidth
            result.lineInfo.arrowP2.y = result.lineInfo.endY
            result.lineInfo.arrowP3.x = result.lineInfo.endX
            result.lineInfo.arrowP3.y = result.lineInfo.endY - arrowLength
            result.lineInfo.cpx = result.lineInfo.endX;
            result.lineInfo.cpy = result.lineInfo.endY;
        } else {
            result.width = Math.abs(endInfo.x - startInfo.x);
            result.x = startInfo.x;
            result.lineInfo.startX = 0;
            result.lineInfo.endX = result.width - arrowLength;
            result.lineInfo.arrowP1.x = result.lineInfo.endX
            result.lineInfo.arrowP1.y = result.lineInfo.endY - arrowWidth
            result.lineInfo.arrowP2.x = result.lineInfo.endX
            result.lineInfo.arrowP2.y = result.lineInfo.endY + arrowWidth
            result.lineInfo.arrowP3.x = result.lineInfo.endX + arrowLength
            result.lineInfo.arrowP3.y = result.lineInfo.endY
        }
    } else if (endInfo.x <= startInfo.x && endInfo.y <= startInfo.y) { //第二象限
        if (Math.abs(endInfo.y - startInfo.y) < minHeight) {
            result.y = startInfo.y - minHeight / 2;
            result.lineInfo.startY = minHeight / 2;
            result.lineInfo.endY = minHeight / 2;
            result.height = minHeight;
        } else {
            result.height = Math.abs(endInfo.y - startInfo.y);
            result.y = endInfo.y;
            result.lineInfo.startY = result.height;
            result.lineInfo.endY = arrowWidth;
        }
        if (Math.abs(endInfo.x - startInfo.x) < minWidth) {
            result.lineInfo.endY = arrowLength;
            result.width = minWidth;
            result.x = startInfo.x - minWidth / 2;
            result.lineInfo.startX = minWidth / 2;
            result.lineInfo.endX = minWidth / 2;
            result.lineInfo.arrowP1.x = result.lineInfo.endX - arrowWidth
            result.lineInfo.arrowP1.y = result.lineInfo.endY
            result.lineInfo.arrowP2.x = result.lineInfo.endX + arrowWidth
            result.lineInfo.arrowP2.y = result.lineInfo.endY
            result.lineInfo.arrowP3.x = result.lineInfo.endX
            result.lineInfo.arrowP3.y = result.lineInfo.endY - arrowLength
        } else {
            result.width = Math.abs(endInfo.x - startInfo.x);
            result.x = endInfo.x;
            result.lineInfo.startX = result.width;
            result.lineInfo.endX = 0 + arrowLength;
            result.lineInfo.arrowP1.x = result.lineInfo.endX
            result.lineInfo.arrowP1.y = result.lineInfo.endY - arrowWidth
            result.lineInfo.arrowP2.x = result.lineInfo.endX
            result.lineInfo.arrowP2.y = result.lineInfo.endY + arrowWidth
            result.lineInfo.arrowP3.x = result.lineInfo.endX - arrowLength
            result.lineInfo.arrowP3.y = result.lineInfo.endY
        }
        if (Math.abs(endInfo.y - startInfo.y) < minHeight || Math.abs(endInfo.x - startInfo.x) < minWidth) {
            result.lineInfo.cpx = result.lineInfo.endX;
            result.lineInfo.cpy = result.lineInfo.endY;
        } else {
            result.lineInfo.cpx = result.width;
            result.lineInfo.cpy = 0;
        }
    } else if (endInfo.x <= startInfo.x && endInfo.y > startInfo.y) { //第三象限
        if (Math.abs(endInfo.y - startInfo.y) < minHeight) {
            result.y = startInfo.y - minHeight / 2;
            result.lineInfo.startY = minHeight / 2;
            result.lineInfo.endY = minHeight / 2;
            result.height = minHeight;
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
            result.lineInfo.arrowP1.x = result.lineInfo.endX - arrowWidth
            result.lineInfo.arrowP1.y = result.lineInfo.endY
            result.lineInfo.arrowP2.x = result.lineInfo.endX + arrowWidth
            result.lineInfo.arrowP2.y = result.lineInfo.endY
            result.lineInfo.arrowP3.x = result.lineInfo.endX
            result.lineInfo.arrowP3.y = result.lineInfo.endY + arrowLength
        } else {
            result.width = Math.abs(endInfo.x - startInfo.x);
            result.x = endInfo.x;
            result.lineInfo.startX = result.width;
            result.lineInfo.endX = 0 + arrowLength;
            result.lineInfo.arrowP1.x = result.lineInfo.endX
            result.lineInfo.arrowP1.y = result.lineInfo.endY - arrowWidth
            result.lineInfo.arrowP2.x = result.lineInfo.endX
            result.lineInfo.arrowP2.y = result.lineInfo.endY + arrowWidth
            result.lineInfo.arrowP3.x = result.lineInfo.endX - arrowLength
            result.lineInfo.arrowP3.y = result.lineInfo.endY
        }
        if (Math.abs(endInfo.y - startInfo.y) < minHeight || Math.abs(endInfo.x - startInfo.x) < minWidth) {
            result.lineInfo.cpx = result.lineInfo.endX;
            result.lineInfo.cpy = result.lineInfo.endY;
        } else {
            result.lineInfo.cpx = result.width;
            result.lineInfo.cpy = result.height;
        }
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
            result.lineInfo.arrowP1.x = result.lineInfo.endX - arrowWidth
            result.lineInfo.arrowP1.y = result.lineInfo.endY
            result.lineInfo.arrowP2.x = result.lineInfo.endX + arrowWidth
            result.lineInfo.arrowP2.y = result.lineInfo.endY
            result.lineInfo.arrowP3.x = result.lineInfo.endX
            result.lineInfo.arrowP3.y = result.lineInfo.endY + arrowLength
            result.lineInfo.cpx = result.lineInfo.endX;
            result.lineInfo.cpy = result.lineInfo.endY;
        } else {
            result.width = Math.abs(endInfo.x - startInfo.x);
            result.x = startInfo.x;
            result.lineInfo.startX = 0;
            result.lineInfo.endX = result.width - arrowLength;
            result.lineInfo.arrowP1.x = result.lineInfo.endX
            result.lineInfo.arrowP1.y = result.lineInfo.endY - arrowWidth
            result.lineInfo.arrowP2.x = result.lineInfo.endX
            result.lineInfo.arrowP2.y = result.lineInfo.endY + arrowWidth
            result.lineInfo.arrowP3.x = result.lineInfo.endX + arrowLength
            result.lineInfo.arrowP3.y = result.lineInfo.endY
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
