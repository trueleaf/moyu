/*
|--------------------------------------------------------------------------
| 常用类型命名
|--------------------------------------------------------------------------
| clientX: 相对于浏览器视口距离
| offsetX> 相对于父元素距离
| createLineDot 节点上用于引出线条的小圆点
| resizeNodeDot 用于改变节点宽高的小圆点
| node  代表节点
| line  代表线条
*/

/*
|--------------------------------------------------------------------------
| 画布信息
|--------------------------------------------------------------------------
*/
export type FlowRenderArea = {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
    /**
     * 单个网格大小
     */
    gridUnit: number;
}
/*
|--------------------------------------------------------------------------
| 线条信息
|--------------------------------------------------------------------------
*/
/**
 * 线条可hover区域
 */
export type LineCanHoverPosition = {
    leftTopPosition: {
        clientX: number;
        clientY: number;
    };
    rightBottomPosition: {
        clientX: number;
        clientY: number;
    };
}
/**
 * 线条位置信息，可以从节点的四个方向(上下左右)引出，也可以没有位置信息，代表独立存在的线条
 */
export type FlowLinePosition = "left" | "top" | "right" | "bottom" | "";
/**
 * 鼠标移动到线条上时候，由于是通过canvas绘制的折线，所以需要计算出一组有效hover区域
 */
export type FlowLineCanHoverAreas = {
    leftTopPosition: {
        clientX: number;
        clientY: number;
    };
    rightBottomPosition: {
        clientX: number;
        clientY: number;
    };
};
export type FlowLineInfo = {
    id: string;
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
    lineStartOffsetX: number;
    lineStartOffsetY: number;
    lineEndOffsetX: number;
    lineEndOffsetY: number;
    fromPosition: FlowLinePosition;
    toPosition: FlowLinePosition;
    zIndex: number;
    canHoverPosition: FlowLineCanHoverAreas[];
    /**
     * 线条箭头信息
     */
    arrowInfo: {
        leftTopPoint: {
            clientX: number;
            clientY: number;
        };
        rightBottomPoint: {
            clientX: number;
            clientY: number;
        };
    };
};
/*
|--------------------------------------------------------------------------
| 节点信息
|--------------------------------------------------------------------------
*/
export type FlowNodeType = "rect";
export type FlowNodeInfo = {
    id: string;
    styleInfo: {
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
        zIndex: number;
        dragZIndex: number;
    };
    nodeType: FlowNodeType;
    outcomingIds: string[];
    incomingIds: string[];
};
/*
|--------------------------------------------------------------------------
| 配置信息
|--------------------------------------------------------------------------
*/
export type FlowConfig = {
    /**
     * 节点最小宽度
     */
    nodeMinWidth: number;
    /**
     * 节点最小高度
     */
    nodeMinHeight: number;
    /**
     * 节点上用于引出线条的小圆点大小
     */
    createLineDotSize: number;
    /**
     * 用于改变节点宽高小圆点大小
     */
    resizeDotSize: number;
    /**
     * 线条最小宽度，小于这个宽度将不创建线条
     */
    minLineWidth: number;
    minLineHeight: number;
    /**
     * 线条默认zIndex
     */
    lineZIndex: number;
    /**
     * 拖拽节点默认zIndex
     */
    dragNodeZIndex: number;
    /**
     * 选中区域zIndex
     */
    selectionZIndex: number;
    /**
     * 放大倍数
     */
    zoom: number;
    /**
     * 框选节点区域边距
     */
    selectedNodeAreaPadding: number;
    /**
     * 选中区域zIndex值
     */
    selectedNodeAreaZIndex: number;
};
/*
|--------------------------------------------------------------------------
| 框选信息
|--------------------------------------------------------------------------
*/
export type FlowSelection = {
    isMouseDown: boolean;
    startOffsetX: number;
    startOffsetY: number;
    endOffsetX: number;
    endOffsetY: number;
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
    /**
     * 选中节点后，框选区域矩形范围
     */
    selectedNodeArea: {
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
    },
    selectedNodeIds: string[];
};
/*
|--------------------------------------------------------------------------
| 历史记录
|--------------------------------------------------------------------------
*/
export type FlowHistory = {
    nodeList: FlowNodeInfo[],
    lineList: FlowLineInfo[],
    configInfo: FlowConfig
}
/*
|--------------------------------------------------------------------------
| 容器信息
|--------------------------------------------------------------------------
*/
export type FlowContainerInfo = {
    clientX: number;
    clientY: number;
    width: number;
    height: number;
};
/**
 * 辅助对齐
 */
export type FlowAlignmentInfo = {
    xRange: {
        nodeId: string;
        offsetYOfTop: number;
        offsetYOfBottom: number;
        offsetXOfLeft: number;
        offsetXOfMid: number;
        offsetXOfRight: number;
    }[],
    yRange: {
        nodeId: string;
        offsetXOfTop: number;
        offsetXOfBottom: number;
        offsetYOfLeft: number;
        offsetYOfMid: number;
        offsetYOfRight: number;
    }[],
}
/*
|--------------------------------------------------------------------------
| 节点上创建线条原圆点状态
|--------------------------------------------------------------------------
*/
export type FLowCreateLineDotState = {
    isMouseDown: boolean;
    hoverNodeId: string;
    hoverPosition: FlowLinePosition;
};
/*
|--------------------------------------------------------------------------
| 改变节点大小圆点状态
|--------------------------------------------------------------------------
*/
type FlowResizeNodePosition =
    | "leftTop"
    | "rightTop"
    | "leftBottom"
    | "rightBottom"
    | "";
export type FLowResizeNodeDotState = {
    hoverNodeId: string;
    hoverPosition: FlowResizeNodePosition;
    isMouseDown: boolean;
    mouseDownClientX: number;
    mouseDownClientY: number;
    nodeWidthWhenMouseDown: number;
    nodeHeightWhenMouseDown: number;
    nodeOffsetXWhenMouseDown: number;
    nodeOffsetYWhenMouseDown: number;
    nodeFixedX: number;
    nodeFixedY: number;
};
/*
|--------------------------------------------------------------------------
| 线条状态
|--------------------------------------------------------------------------
*/
export type FlowLineState = {
    hoverDragLineId: string;
    selectedLineId: string;
    hoverLineId: string;
    dragLineId: string;
    isHoverDragArrow: boolean;
    isMouseDownDragArrow: boolean;
    isMove: boolean;
};
/*
|--------------------------------------------------------------------------
| 节点状态
|--------------------------------------------------------------------------
*/
export type FlowNodeState = {
    hoverNodeId: string;
    dragNodeId: string;
    isMouseDown: boolean;
    activeNodeId: string;
    isMove: boolean;
    mouseDownClientX: number;
    mouseDownClientY: number;
    nodeOffsetXWhenMouseDown: number;
    nodeOffsetYWhenMouseDown: number;
}
/*
|--------------------------------------------------------------------------
| 其他类型
|--------------------------------------------------------------------------
*/
type FlowAreaPoint = {
    pointX: number;
    pointY: number;
    offsetX: number;
    offsetX2: number;
    offsetY: number;
    offsetY2: number;
}
/**
 * 创建线条节点有效区域
 */
export type FlowValidCreateLineArea = {
    leftArea: FlowAreaPoint;
    topArea: FlowAreaPoint;
    rightArea: FlowAreaPoint;
    bottomArea: FlowAreaPoint;
};
/**
 * resize节点有效区域
 */
export type FlowValidResizeArea = {
    leftTopArea: FlowAreaPoint;
    rightTopArea: FlowAreaPoint;
    leftBottomArea: FlowAreaPoint;
    rightBottomArea: FlowAreaPoint;
};
