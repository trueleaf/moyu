import { ApiflowLineInfo, ApiflowNodeInfo, ApiflowOutComingDirection } from "@@/store";
import { getQuardantInfo } from "./quadrant/quardant";
import { getQuardantInfo2 } from "./quadrant2/quadrant2";
import { getQuardantInfo3 } from "./quadrant3/quadrant3";
import { getQuardantInfo4 } from "./quadrant4/quadrant4";

export type Coordinate = {
    x: number,
    y: number
}
export type ResultRect = {
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
    /**
     * 是否连接到别的节点
     */
    isConnectedNode: boolean,
    /**
     * 连接到节点位置
     */
    connectedPosition: "left" | "top" | "right" | "bottom"
    /**
     * 被连接的节点id
     */
    connectedNodeId: string,
}
export type LineDrawInfoOptions = {
    fromNode: ApiflowNodeInfo,
    currendLine?: ApiflowLineInfo,
    fromPosition: ApiflowOutComingDirection
}
export type LineConfig = {
    /**
     * 线条与canvas容器之间的安全距离
     */
    padding: number,
    /**
     * 箭头长度
     */
    arrowLength: number,
    /**
     * 箭头宽度
     */
    arrowWidth: number,
    /**
     * 折线吸附阈值
     */
    breakLineSticky: number,
    /**
     * 折现与节点之间间隙
     */
    breakLineOffsetNode: number,
}
//根据起始位置返回节点 width height left top
export function getLineDrawInfo(startPoint: Coordinate, endPoint: Coordinate, options: LineDrawInfoOptions): ResultRect {
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
        isConnectedNode: false,
        connectedPosition: "left",
        connectedNodeId: ""
    }
    const lineConfig: LineConfig = {
        padding: 15, //绘制图形边距
        arrowLength: 15, //箭头长度, 箭头长度不能超过绘制图形边距
        arrowWidth: 5, //箭头宽度
        breakLineSticky: 5, //折线吸附阈值
        breakLineOffsetNode: 25, //折现与节点之间间隙
    }
    if (Math.abs(endPoint.x - startPoint.x) < 10 && Math.abs(endPoint.y - startPoint.y) < 10) {
        return result
    }
    if (endPoint.x > startPoint.x && endPoint.y <= startPoint.y) { //第一象限(startPostion为原点)
        getQuardantInfo(result, {
            ...options,
            startPoint,
            endPoint,
            lineConfig,
        });
    } else if (endPoint.x <= startPoint.x && endPoint.y <= startPoint.y) { //第二象限
        getQuardantInfo2(result, {
            ...options,
            startPoint,
            endPoint,
            lineConfig,
        });
    } else if (endPoint.x <= startPoint.x && endPoint.y > startPoint.y) { //第三象限
        getQuardantInfo3(result, {
            ...options,
            startPoint,
            endPoint,
            lineConfig,
        });
    } else if (endPoint.x > startPoint.x && endPoint.y > startPoint.y) { //第四象限
        getQuardantInfo4(result, {
            ...options,
            startPoint,
            endPoint,
            lineConfig,
        });
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
