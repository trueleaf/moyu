/*
    创建者：shuxiaokai
    模块名称：线条绘制(仅绘制出线，入线和出线是同一条线)
    备注：
*/
<template>
    <canvas
        ref="lineRef"
        class="line"
        :data-id="lineInfo.id"
        :style="{
            left: lineInfo.offsetX + 'px',
            top: lineInfo.offsetY + 'px',
            width: lineInfo.width + 'px',
            height: lineInfo.height + 'px',
            zIndex: lineInfo.zIndex,
            cursor: isMouseInLineArrow ? 'move' : 'default',
        }"
        @mousedown.stop="handleMouseDownCanvas"
    >
    </canvas>
    {{ isMouseDownCanvasArrow }}
</template>

<script lang="ts" setup>
import { ref, PropType, inject, Ref, onMounted, onUnmounted } from "vue";
import { ApidocApiflowLineInfo, ApidocApiflowNodeInfo } from "@@/store";
import { debounce } from "@/helper";
import { computed } from "@vue/reactivity";
import { store } from "@/store";
import { getLineDrawInfo } from "../utils/utils";

const props = defineProps({
    lineInfo: { //节点信息
        type: Object as PropType<ApidocApiflowLineInfo>,
        default() {
            return {};
        }
    },
})

const lineRef: Ref<null | HTMLCanvasElement> = ref(null); //线条dom元素
const currentSelectedDotId = computed(() => store.state["apidoc/apiflow"].currentSelectedDotId)
const hostNode = computed(() => { //宿主节点(节点出线包含当前线条，才叫做宿主)
    const { apiflowList } = store.state["apidoc/apiflow"];
    return apiflowList.find(node => node.outcomings.find(line => line.id === props.lineInfo.id))
});
const apiflowWrapper = inject("apiflowWrapper") as Ref<HTMLElement>;
const currentOperatNode = computed(() => store.state["apidoc/apiflow"].currentOperatNode)
const apiflowWrapperRect = apiflowWrapper.value.getBoundingClientRect()
const isMouseInLineArrow = computed(() => store.state["apidoc/apiflow"].isMouseInLineArrow);
const isResizeNodeMousedown = computed(() => store.state["apidoc/apiflow"].isMouseDownResizeDot);
const isMouseDownNode = computed(() => store.state["apidoc/apiflow"].isMouseDownNode);
const isMouseDownResizeDot = computed(() => store.state["apidoc/apiflow"].isMouseDownResizeDot);
const isMouseDownCanvasArrow = ref(false); //鼠标是否点击线条箭头
const lineCanvasClickOffsetX = ref(0);
const lineCanvasClickOffsetY = ref(0);
/*
|--------------------------------------------------------------------------
| 线条相关操作
|--------------------------------------------------------------------------
*/
//绘制线条
const repaintLine = (dom: HTMLCanvasElement, drawInfo: ReturnType<typeof getLineDrawInfo>) => {
    const ctx = dom.getContext("2d") as CanvasRenderingContext2D;
    dom.width = drawInfo.width;
    dom.height = drawInfo.height;
    const { brokenLinePoints, arrowInfo: { p1, p2, p3 } } = drawInfo.lineInfo;
    ctx.beginPath();
    // ctx.fillRect(drawInfo.lineInfo.arrowInfo.leftTopPoint.x, drawInfo.lineInfo.arrowInfo.leftTopPoint.y, drawInfo.lineInfo.arrowInfo.rightBottomPoint.x - drawInfo.lineInfo.arrowInfo.leftTopPoint.x, drawInfo.lineInfo.arrowInfo.rightBottomPoint.y - drawInfo.lineInfo.arrowInfo.leftTopPoint.y)
    ctx.closePath()
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    for (let i = 0; i < brokenLinePoints.length - 1; i += 1) {
        const point = brokenLinePoints[i];
        const point2 = brokenLinePoints[i + 1];
        if (point.x === point2.x) { //画竖线
            ctx.moveTo(point.x + 0.5, point.y);
            ctx.lineTo(point2.x + 0.5, point2.y);
        } else if (point.y === point2.y) { //画横线
            ctx.moveTo(point.x, point.y + 0.5);
            ctx.lineTo(point2.x, point2.y + 0.5);
        }
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(point2.x, point2.y);
        ctx.stroke()
    }
    ctx.closePath()
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.lineTo(p3.x, p3.y)
    ctx.fill();
    ctx.closePath()
}

//根据线条信息获取线条数据
/* const getCurrentLineDrawInfo = () => {
    if (!hostNode.value) {
        return null
    }
    const startNodeInfo = {
        x: 0,
        y: 0,
    }
    const endNodeInfo = {
        x: props.lineInfo.lineClientEndX - Math.ceil(apiflowWrapperRect.x),
        y: props.lineInfo.lineClientEndY - Math.ceil(apiflowWrapperRect.y),
    }
    if (props.lineInfo.fromPosition === "left") {
        startNodeInfo.x = hostNode.value.styleInfo.offsetX;
        startNodeInfo.y = hostNode.value.styleInfo.offsetY + hostNode.value.styleInfo.height / 2;
    } else if (props.lineInfo.fromPosition === "top") {
        startNodeInfo.x = hostNode.value.styleInfo.offsetX + hostNode.value.styleInfo.width / 2;
        startNodeInfo.y = hostNode.value.styleInfo.offsetY;
    } else if (props.lineInfo.fromPosition === "right") {
        startNodeInfo.x = hostNode.value.styleInfo.offsetX + hostNode.value.styleInfo.width
        startNodeInfo.y = hostNode.value.styleInfo.offsetY + hostNode.value.styleInfo.height / 2;
    } else if (props.lineInfo.fromPosition === "bottom") {
        startNodeInfo.x = hostNode.value.styleInfo.offsetX + hostNode.value.styleInfo.width / 2;
        startNodeInfo.y = hostNode.value.styleInfo.offsetY + hostNode.value.styleInfo.height;
    }
    const drawInfo = getLineDrawInfo(startNodeInfo, endNodeInfo, {
        fromNode: hostNode.value,
        fromPosition: props.lineInfo.fromPosition,
        currendLine: props.lineInfo
    });
    return drawInfo;
} */
/*
|--------------------------------------------------------------------------
| 鼠标从节点四个方向绘制出线
|--------------------------------------------------------------------------
*/
//鼠标从节点四个方向绘制出线
const handleDotMouseMove = (e: MouseEvent) => {
    if (!currentSelectedDotId.value || !hostNode.value) {
        return;
    }
    if (currentSelectedDotId.value !== props.lineInfo.id) {
        return
    }
    const { fromPosition } = props.lineInfo
    const startPoint = {
        x: 0,
        y: 0,
    }
    if (fromPosition === "left") {
        startPoint.x = hostNode.value.styleInfo.offsetX;
        startPoint.y = hostNode.value.styleInfo.offsetY + hostNode.value.styleInfo.height / 2;
    } else if (fromPosition === "top") {
        startPoint.x = hostNode.value.styleInfo.offsetX + hostNode.value.styleInfo.width / 2;
        startPoint.y = hostNode.value.styleInfo.offsetY;
    } else if (fromPosition === "right") {
        startPoint.x = hostNode.value.styleInfo.offsetX + hostNode.value.styleInfo.width;
        startPoint.y = hostNode.value.styleInfo.offsetY + hostNode.value.styleInfo.height / 2;
    } else if (fromPosition === "bottom") {
        startPoint.x = hostNode.value.styleInfo.offsetX + hostNode.value.styleInfo.width / 2;
        startPoint.y = hostNode.value.styleInfo.offsetY + hostNode.value.styleInfo.height;
    }
    const endPoint = {
        x: e.clientX - Math.ceil(apiflowWrapperRect.x),
        y: e.clientY - Math.ceil(apiflowWrapperRect.y),
    }
    const drawInfo = getLineDrawInfo(startPoint, endPoint, {
        fromNode: hostNode.value,
        fromPosition,
    });
    if (drawInfo.isConnectedNode) {
        store.commit("apidoc/apiflow/changeOutComingInfoById", {
            nodeId: hostNode.value.id,
            lineId: props.lineInfo.id,
            lineInfo: {
                toPosition: drawInfo.connectedPosition,
            }
        })
        store.commit("apidoc/apiflow/addIncoming", {
            fromNodeId: hostNode.value.id,
            nodeId: drawInfo.connectedNodeId,
            lineId: props.lineInfo.id,
        })
    } else {
        store.commit("apidoc/apiflow/changeOutComingInfoById", {
            nodeId: hostNode.value.id,
            lineId: props.lineInfo.id,
            lineInfo: {
                toPosition: null,
            }
        })
        store.commit("apidoc/apiflow/removeIncomingById", {
            lineId: props.lineInfo.id,
        })
    }
    store.commit("apidoc/apiflow/changeOutComingInfoById", {
        nodeId: hostNode.value.id,
        lineId: props.lineInfo.id,
        lineInfo: {
            id: props.lineInfo.id,
            type: "line",
            lineClientEndX: e.clientX,
            lineClientEndY: e.clientY,
            offsetX: drawInfo.x,
            offsetY: drawInfo.y,
            width: drawInfo.width,
            height: drawInfo.height,
        }
    })
    if (lineRef.value) {
        repaintLine(lineRef.value, drawInfo);
    }
}
//移除无效的线段
const handleRemoveTempLine = () => {
    store.commit("apidoc/apiflow/changeCurrentSelectedDotId", "")
    if (props.lineInfo && (props.lineInfo.width < 40 && props.lineInfo.height < 40) && hostNode.value) {
        store.commit("apidoc/apiflow/removeOutcomingById", {
            nodeId: hostNode.value.id,
            lineId: props.lineInfo.id,
        })
    }
}
/*
|--------------------------------------------------------------------------
| 鼠标在出线arrow上面拖拽
|--------------------------------------------------------------------------
*/

//鼠标点击线条canvas框
const handleMouseDownCanvas = (e: MouseEvent) => {
    lineCanvasClickOffsetX.value = e.offsetX;
    lineCanvasClickOffsetY.value = e.offsetY;
    if (isMouseInLineArrow.value) {
        isMouseDownCanvasArrow.value = true;
    }
}
//拖拽箭头
const handleCanvasMouseMove = (e: MouseEvent) => {
    if (!isMouseDownCanvasArrow.value) {
        return
    }
    if (hostNode.value) {
        const nodeInfo = hostNode.value.styleInfo;
        let drawInfo = null
        if (props.lineInfo.fromPosition === "right") {
            const startPoint = {
                x: nodeInfo.offsetX + nodeInfo.width,
                y: nodeInfo.offsetY + nodeInfo.height / 2,
            }
            const endPoint = {
                x: e.clientX - Math.ceil(apiflowWrapperRect.x),
                y: e.clientY - Math.ceil(apiflowWrapperRect.y),
            }
            drawInfo = getLineDrawInfo(startPoint, endPoint, {
                fromNode: hostNode.value,
                fromPosition: props.lineInfo.fromPosition,
                currendLine: props.lineInfo
            });
        } else if (props.lineInfo.fromPosition === "top") {
            const startPoint = {
                x: nodeInfo.offsetX + nodeInfo.width / 2,
                y: nodeInfo.offsetY,
            }
            const endPoint = {
                x: e.clientX - Math.ceil(apiflowWrapperRect.x),
                y: e.clientY - Math.ceil(apiflowWrapperRect.y),
            }
            drawInfo = getLineDrawInfo(startPoint, endPoint, {
                fromNode: hostNode.value,
                fromPosition: props.lineInfo.fromPosition,
                currendLine: props.lineInfo
            });
        } else if (props.lineInfo.fromPosition === "left") {
            const startPoint = {
                x: nodeInfo.offsetX,
                y: nodeInfo.offsetY + nodeInfo.height / 2,
            }
            const endPoint = {
                x: e.clientX - Math.ceil(apiflowWrapperRect.x),
                y: e.clientY - Math.ceil(apiflowWrapperRect.y),
            }
            drawInfo = getLineDrawInfo(startPoint, endPoint, {
                fromNode: hostNode.value,
                fromPosition: props.lineInfo.fromPosition,
                currendLine: props.lineInfo
            });
        } else if (props.lineInfo.fromPosition === "bottom") {
            const startPoint = {
                x: nodeInfo.offsetX + nodeInfo.width / 2,
                y: nodeInfo.offsetY + nodeInfo.height,
            }
            const endPoint = {
                x: e.clientX - Math.ceil(apiflowWrapperRect.x),
                y: e.clientY - Math.ceil(apiflowWrapperRect.y),
            }
            drawInfo = getLineDrawInfo(startPoint, endPoint, {
                fromNode: hostNode.value,
                fromPosition: props.lineInfo.fromPosition,
                currendLine: props.lineInfo
            });
        }
        if (drawInfo) {
            if (drawInfo.isConnectedNode) {
                store.commit("apidoc/apiflow/changeOutComingInfoById", {
                    nodeId: hostNode.value.id,
                    lineId: props.lineInfo.id,
                    lineInfo: {
                        toPosition: drawInfo.connectedPosition,
                    }
                })
                store.commit("apidoc/apiflow/addIncoming", {
                    fromNodeId: hostNode.value.id,
                    nodeId: drawInfo.connectedNodeId,
                    lineId: props.lineInfo.id,
                })
            } else {
                store.commit("apidoc/apiflow/changeOutComingInfoById", {
                    nodeId: hostNode.value.id,
                    lineId: props.lineInfo.id,
                    lineInfo: {
                        toPosition: null,
                    }
                })
                store.commit("apidoc/apiflow/removeIncomingById", {
                    lineId: props.lineInfo.id,
                })
            }
            store.commit("apidoc/apiflow/changeOutComingInfoById", {
                nodeId: hostNode.value.id,
                lineId: props.lineInfo.id,
                lineInfo: {
                    id: props.lineInfo.id,
                    type: "line",
                    lineClientEndX: e.clientX,
                    lineClientEndY: e.clientY,
                    offsetX: drawInfo.x,
                    offsetY: drawInfo.y,
                    width: drawInfo.width,
                    height: drawInfo.height,
                }
            })
            if (lineRef.value) {
                repaintLine(lineRef.value, drawInfo);
            }
        }
    }
}
//取消鼠标在arrow上面样式
const handleCanvasMouseUp = () => {
    store.commit("apidoc/apiflow/changeCurrentSelectedDotId", "")
    isMouseDownCanvasArrow.value = false;
}
/*
|--------------------------------------------------------------------------
| 节点移动，节点放大缩小，重绘线条
|--------------------------------------------------------------------------
*/
const drawLine = () => {
    if (!hostNode.value) {
        return;
    }
    const incomings = currentOperatNode.value?.incomings;
    const outcomings = currentOperatNode.value?.outcomings;
    const isIncomingLine = incomings && incomings.find(incoming => incoming.id === props.lineInfo.id);
    const isOutcomingLine = outcomings && outcomings.find(outcoming => outcoming.id === props.lineInfo.id);
    const { styleInfo } = hostNode.value;
    const styleInfo2 = currentOperatNode.value?.styleInfo as ApidocApiflowNodeInfo["styleInfo"];
    let lineClientStartX = 0;
    let lineClientStartY = 0;
    let lineClientEndX = 0;
    let lineClientEndY = 0;
    const startNodeInfo = {
        x: 0,
        y: 0,
    }
    if (!isIncomingLine && !isOutcomingLine) {
        return
    }
    const endNodeInfo = {
        x: props.lineInfo.lineClientEndX - Math.ceil(apiflowWrapperRect.x),
        y: props.lineInfo.lineClientEndY - Math.ceil(apiflowWrapperRect.y),
    }
    if (props.lineInfo.fromPosition === "left") {
        if (styleInfo) {
            lineClientStartX = styleInfo?.offsetX + Math.ceil(apiflowWrapperRect.x);
            lineClientStartY = styleInfo?.offsetY + Math.ceil(apiflowWrapperRect.y) + styleInfo.height / 2;
        }
        startNodeInfo.x = styleInfo.offsetX;
        startNodeInfo.y = styleInfo.offsetY + styleInfo.height / 2;
    } else if (props.lineInfo.fromPosition === "top") {
        if (styleInfo) {
            lineClientStartX = styleInfo?.offsetX + Math.ceil(apiflowWrapperRect.x) + styleInfo.width / 2;
            lineClientStartY = styleInfo?.offsetY + Math.ceil(apiflowWrapperRect.y);
        }
        startNodeInfo.x = styleInfo.offsetX + styleInfo.width / 2;
        startNodeInfo.y = styleInfo.offsetY;
    } else if (props.lineInfo.fromPosition === "right") {
        if (styleInfo) {
            lineClientStartX = styleInfo?.offsetX + Math.ceil(apiflowWrapperRect.x) + styleInfo.width;
            lineClientStartY = styleInfo?.offsetY + Math.ceil(apiflowWrapperRect.y) + styleInfo.height / 2;
        }
        startNodeInfo.x = styleInfo.offsetX + styleInfo.width
        startNodeInfo.y = styleInfo.offsetY + styleInfo.height / 2;
    } else if (props.lineInfo.fromPosition === "bottom") {
        if (styleInfo) {
            lineClientStartX = styleInfo?.offsetX + Math.ceil(apiflowWrapperRect.x) + styleInfo.width / 2;
            lineClientStartY = styleInfo?.offsetY + Math.ceil(apiflowWrapperRect.y) + styleInfo.height;
        }
        startNodeInfo.x = styleInfo.offsetX + styleInfo.width / 2;
        startNodeInfo.y = styleInfo.offsetY + styleInfo.height;
    }
    if (isIncomingLine) { //节点移动时，当前线条属于节点的入线
        if (props.lineInfo.toPosition === "left") {
            lineClientEndX = styleInfo2?.offsetX + Math.ceil(apiflowWrapperRect.x);
            lineClientEndY = styleInfo2?.offsetY + Math.ceil(apiflowWrapperRect.y) + styleInfo2.height / 2;
            endNodeInfo.x = styleInfo2.offsetX;
            endNodeInfo.y = styleInfo2.offsetY + styleInfo2.height / 2;
        } else if (props.lineInfo.toPosition === "top") {
            lineClientEndX = styleInfo2?.offsetX + Math.ceil(apiflowWrapperRect.x) + styleInfo2.width / 2;
            lineClientEndY = styleInfo2?.offsetY + Math.ceil(apiflowWrapperRect.y);
            endNodeInfo.x = styleInfo2.offsetX + styleInfo2.width / 2;
            endNodeInfo.y = styleInfo2.offsetY;
        } else if (props.lineInfo.toPosition === "right") {
            lineClientEndX = styleInfo2?.offsetX + Math.ceil(apiflowWrapperRect.x) + styleInfo2.width;
            lineClientEndY = styleInfo2?.offsetY + Math.ceil(apiflowWrapperRect.y) + styleInfo2.height / 2;
            endNodeInfo.x = styleInfo2.offsetX + styleInfo2.width
            endNodeInfo.y = styleInfo2.offsetY + styleInfo2.height / 2;
        } else if (props.lineInfo.toPosition === "bottom") {
            lineClientEndX = styleInfo2?.offsetX + Math.ceil(apiflowWrapperRect.x) + styleInfo2.width / 2;
            lineClientEndY = styleInfo2?.offsetY + Math.ceil(apiflowWrapperRect.y) + styleInfo2.height;
            endNodeInfo.x = styleInfo2.offsetX + styleInfo2.width / 2;
            endNodeInfo.y = styleInfo2.offsetY + styleInfo2.height;
        }
    }

    const drawInfo = getLineDrawInfo(startNodeInfo, endNodeInfo, {
        fromNode: hostNode.value,
        fromPosition: props.lineInfo.fromPosition,
        currendLine: props.lineInfo
    });
    if (isOutcomingLine) {
        store.commit("apidoc/apiflow/changeOutComingInfoById", {
            nodeId: hostNode.value.id,
            lineId: props.lineInfo.id,
            lineInfo: {
                lineClientStartX,
                lineClientStartY,
                offsetX: drawInfo.x,
                offsetY: drawInfo.y,
                width: drawInfo.width,
                height: drawInfo.height,
            }
        })
    } else {
        store.commit("apidoc/apiflow/changeOutComingInfoById", {
            nodeId: hostNode.value.id,
            lineId: props.lineInfo.id,
            lineInfo: {
                lineClientEndX,
                lineClientEndY,
                offsetX: drawInfo.x,
                offsetY: drawInfo.y,
                width: drawInfo.width,
                height: drawInfo.height,
            }
        })
    }
    if (lineRef.value) {
        repaintLine(lineRef.value, drawInfo);
    }
}
const handleNodeMouseMove = () => {
    if (!isMouseDownNode.value || isResizeNodeMousedown.value || isMouseInLineArrow.value || !hostNode.value) {
        return
    }
    drawLine();
};
const handleResizeNodeMouseMove = () => {
    if (!isMouseDownResizeDot.value || !hostNode.value) {
        return;
    }
    drawLine();
}
onMounted(() => {
    document.documentElement.addEventListener("mousemove", debounce(handleNodeMouseMove));
    document.documentElement.addEventListener("mouseup", handleRemoveTempLine);
    document.documentElement.addEventListener("mousemove", debounce(handleCanvasMouseMove));
    document.documentElement.addEventListener("mousemove", debounce(handleDotMouseMove));
    document.documentElement.addEventListener("mousemove", debounce(handleResizeNodeMouseMove));
    document.documentElement.addEventListener("mouseup", handleCanvasMouseUp);
})
onUnmounted(() => {
    document.documentElement.removeEventListener("mousemove", handleCanvasMouseMove);
    document.documentElement.removeEventListener("mousemove", handleNodeMouseMove);
    document.documentElement.removeEventListener("mousemove", handleResizeNodeMouseMove);
    document.documentElement.removeEventListener("mousemove", handleDotMouseMove);
    document.documentElement.removeEventListener("mouseup", handleCanvasMouseUp);
})

</script>

<style lang="scss" scoped>
.line {
    position: absolute;
    border: 1px solid $gray-500;
}
</style>
