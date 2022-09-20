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
    },
}

//根据起始位置返回节点 width height left top
export function getRectInfo(startInfo: Coordinate, endInfo: Coordinate): ResultRect {
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
        },
    }
    if (endInfo.x > startInfo.x && endInfo.y <= startInfo.y) { //第一象限(startPostion为原点)
        result.width = Math.abs(endInfo.x - startInfo.x);
        result.height = Math.abs(endInfo.y - startInfo.y);
        result.x = startInfo.x;
        result.y = endInfo.y;
        result.lineInfo.startX = 0;
        result.lineInfo.startY = result.height;
        result.lineInfo.endX = result.width;
        result.lineInfo.endY = 0;
        result.lineInfo.cpx = 0;
        result.lineInfo.cpy = 0;
    } else if (endInfo.x <= startInfo.x && endInfo.y <= startInfo.y) { //第二象限
        result.width = Math.abs(endInfo.x - startInfo.x);
        result.height = Math.abs(endInfo.y - startInfo.y);
        result.x = endInfo.x;
        result.y = endInfo.y;
        result.lineInfo.startX = result.width;
        result.lineInfo.startY = result.height;
        result.lineInfo.endX = 0;
        result.lineInfo.endY = 0;
        result.lineInfo.cpx = result.width;
        result.lineInfo.cpy = 0;
    } else if (endInfo.x <= startInfo.x && endInfo.y > startInfo.y) { //第三象限
        result.width = Math.abs(endInfo.x - startInfo.x);
        result.height = Math.abs(endInfo.y - startInfo.y);
        result.x = endInfo.x;
        result.y = startInfo.y;
        result.lineInfo.startX = result.width;
        result.lineInfo.startY = 0;
        result.lineInfo.endX = 0;
        result.lineInfo.endY = result.height;
        result.lineInfo.cpx = result.width;
        result.lineInfo.cpy = result.height;
    } else if (endInfo.x > startInfo.x && endInfo.y > startInfo.y) { //第四象限
        result.width = Math.abs(endInfo.x - startInfo.x);
        result.height = Math.abs(endInfo.y - startInfo.y);
        result.x = startInfo.x;
        result.y = startInfo.y;
        result.lineInfo.startX = 0;
        result.lineInfo.startY = 0;
        result.lineInfo.endX = result.width;
        result.lineInfo.endY = result.height;
        result.lineInfo.cpx = 0;
        result.lineInfo.cpy = result.height;
    }
    return result;
}