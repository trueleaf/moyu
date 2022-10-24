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
import { ApidocApiflowLineInfo } from "@@/store";
import { debounce } from "@/helper";
import { computed } from "@vue/reactivity";
import { store } from "@/store";
import { getLineDrawInfo, isInRect } from "../utils/utils";

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
const hostNode = computed(() => { //宿主节点
    const { apiflowList } = store.state["apidoc/apiflow"];
    return apiflowList.find(node => node.outcomings.find(line => line.id === props.lineInfo.id))
});
const apiflowWrapper = inject("apiflowWrapper") as Ref<HTMLElement>;
const currentOperatNode = computed(() => store.state["apidoc/apiflow"].currentOperatNode)
const apiflowWrapperRect = apiflowWrapper.value.getBoundingClientRect()
const isMouseInLineArrow = computed(() => store.state["apidoc/apiflow"].isMouseInLineArrow);
const isResizeNodeMousedown = computed(() => store.state["apidoc/apiflow"].isMouseDownResizeDot);
const isMouseDownNode = computed(() => store.state["apidoc/apiflow"].isMouseDownNode);
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
const getCurrentLineDrawInfo = () => {
    if (!hostNode.value) {
        return null
    }
    const startNodeInfo = {
        x: 0,
        y: 0,
    }
    const endNodeInfo = {
        x: props.lineInfo.lineClientEndX - apiflowWrapperRect.x,
        y: props.lineInfo.lineClientEndY - apiflowWrapperRect.y,
    }
    if (props.lineInfo.position === "left") {
        startNodeInfo.x = hostNode.value.styleInfo.offsetX;
        startNodeInfo.y = hostNode.value.styleInfo.offsetY + hostNode.value.styleInfo.height / 2;
    } else if (props.lineInfo.position === "top") {
        startNodeInfo.x = hostNode.value.styleInfo.offsetX + hostNode.value.styleInfo.width / 2;
        startNodeInfo.y = hostNode.value.styleInfo.offsetY;
    } else if (props.lineInfo.position === "right") {
        startNodeInfo.x = hostNode.value.styleInfo.offsetX + hostNode.value.styleInfo.width
        startNodeInfo.y = hostNode.value.styleInfo.offsetY + hostNode.value.styleInfo.height / 2;
    } else if (props.lineInfo.position === "bottom") {
        startNodeInfo.x = hostNode.value.styleInfo.offsetX + hostNode.value.styleInfo.width / 2;
        startNodeInfo.y = hostNode.value.styleInfo.offsetY + hostNode.value.styleInfo.height;
    }
    const drawInfo = getLineDrawInfo(startNodeInfo, endNodeInfo, {
        currentNode: hostNode.value,
        position: props.lineInfo.position,
        currendLine: props.lineInfo
    });
    return drawInfo;
}
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
    const { position } = props.lineInfo
    const startPoint = {
        x: 0,
        y: 0,
    }
    if (position === "left") {
        startPoint.x = hostNode.value.styleInfo.offsetX;
        startPoint.y = hostNode.value.styleInfo.offsetY + hostNode.value.styleInfo.height / 2;
    } else if (position === "top") {
        startPoint.x = hostNode.value.styleInfo.offsetX + hostNode.value.styleInfo.width / 2;
        startPoint.y = hostNode.value.styleInfo.offsetY;
    } else if (position === "right") {
        startPoint.x = hostNode.value.styleInfo.offsetX + hostNode.value.styleInfo.width;
        startPoint.y = hostNode.value.styleInfo.offsetY + hostNode.value.styleInfo.height / 2;
    } else if (position === "bottom") {
        startPoint.x = hostNode.value.styleInfo.offsetX + hostNode.value.styleInfo.width / 2;
        startPoint.y = hostNode.value.styleInfo.offsetY + hostNode.value.styleInfo.height;
    }
    const endPoint = {
        x: e.clientX - apiflowWrapperRect.x,
        y: e.clientY - apiflowWrapperRect.y,
    }
    const drawInfo = getLineDrawInfo(startPoint, endPoint, {
        currentNode: hostNode.value,
        position,
    });
    if (drawInfo.isConnectedNode) {
        store.commit("apidoc/apiflow/upsertIncoming", {
            nodeId: drawInfo.connectedNodeId,
            lineId: props.lineInfo.id,
            lineInfo: {
                ...props.lineInfo,
                position: drawInfo.connectedPosition
            },
        })
    } else {
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
//线条上面鼠标移动(仅在节点上面生效)
const handleCheckMouseIsInArrow = (e: MouseEvent) => {
    const drawInfo = getCurrentLineDrawInfo()
    if (hostNode.value && drawInfo) {
        const mouseOffsetPoint = { x: e.clientX - apiflowWrapperRect.x, y: e.clientY - apiflowWrapperRect.y }
        const leftTopPoint = {
            x: drawInfo.lineInfo.arrowInfo.leftTopPoint.x + props.lineInfo.offsetX,
            y: drawInfo.lineInfo.arrowInfo.leftTopPoint.y + props.lineInfo.offsetY,
        }
        const rightBottomPoint = {
            x: drawInfo.lineInfo.arrowInfo.rightBottomPoint.x + props.lineInfo.offsetX,
            y: drawInfo.lineInfo.arrowInfo.rightBottomPoint.y + props.lineInfo.offsetY,
        }
        const isIn = isInRect(mouseOffsetPoint, leftTopPoint, rightBottomPoint);
        // isInLineArrow.value = isIn
        store.commit("apidoc/apiflow/changeIsMouseInLineArrow", isIn)
    }
}
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
        if (props.lineInfo.position === "right") {
            const startPoint = {
                x: nodeInfo.offsetX + nodeInfo.width,
                y: nodeInfo.offsetY + nodeInfo.height / 2,
            }
            const endPoint = {
                x: e.clientX - apiflowWrapperRect.x,
                y: e.clientY - apiflowWrapperRect.y,
            }
            drawInfo = getLineDrawInfo(startPoint, endPoint, {
                currentNode: hostNode.value,
                position: props.lineInfo.position,
                currendLine: props.lineInfo
            });
        } else if (props.lineInfo.position === "top") {
            const startPoint = {
                x: nodeInfo.offsetX + nodeInfo.width / 2,
                y: nodeInfo.offsetY,
            }
            const endPoint = {
                x: e.clientX - apiflowWrapperRect.x,
                y: e.clientY - apiflowWrapperRect.y,
            }
            drawInfo = getLineDrawInfo(startPoint, endPoint, {
                currentNode: hostNode.value,
                position: props.lineInfo.position,
                currendLine: props.lineInfo
            });
        } else if (props.lineInfo.position === "left") {
            const startPoint = {
                x: nodeInfo.offsetX,
                y: nodeInfo.offsetY + nodeInfo.height / 2,
            }
            const endPoint = {
                x: e.clientX - apiflowWrapperRect.x,
                y: e.clientY - apiflowWrapperRect.y,
            }
            drawInfo = getLineDrawInfo(startPoint, endPoint, {
                currentNode: hostNode.value,
                position: props.lineInfo.position,
                currendLine: props.lineInfo
            });
        } else if (props.lineInfo.position === "bottom") {
            const startPoint = {
                x: nodeInfo.offsetX + nodeInfo.width / 2,
                y: nodeInfo.offsetY + nodeInfo.height,
            }
            const endPoint = {
                x: e.clientX - apiflowWrapperRect.x,
                y: e.clientY - apiflowWrapperRect.y,
            }
            drawInfo = getLineDrawInfo(startPoint, endPoint, {
                currentNode: hostNode.value,
                position: props.lineInfo.position,
                currendLine: props.lineInfo
            });
        }
        if (drawInfo) {
            if (drawInfo.isConnectedNode) {
                store.commit("apidoc/apiflow/upsertIncoming", {
                    nodeId: drawInfo.connectedNodeId,
                    lineId: props.lineInfo.id,
                    lineInfo: {
                        ...props.lineInfo,
                        position: drawInfo.connectedPosition
                    },
                })
            } else {
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
| 节点移动，重绘线条
|--------------------------------------------------------------------------
*/
const handleNodeMouseMove = () => {
    if (!isMouseDownNode.value || isResizeNodeMousedown.value || isMouseInLineArrow.value) {
        return
    }
    const incomings = currentOperatNode.value?.incomings;
    console.log(3, incomings)
    if (currentOperatNode.value?.id !== hostNode.value?.id) {
        return
    }
    if (!hostNode.value) {
        return
    }
    const { styleInfo } = hostNode.value;
    const startNodeInfo = {
        x: 0,
        y: 0,
    }
    let lineClientStartX = 0;
    let lineClientStartY = 0;
    if (props.lineInfo.position === "left") {
        if (styleInfo) {
            lineClientStartX = styleInfo?.offsetX + apiflowWrapperRect.x;
            lineClientStartY = styleInfo?.offsetY + apiflowWrapperRect.y + styleInfo.height / 2;
        }
        startNodeInfo.x = styleInfo.offsetX;
        startNodeInfo.y = styleInfo.offsetY + styleInfo.height / 2;
    } else if (props.lineInfo.position === "top") {
        if (styleInfo) {
            lineClientStartX = styleInfo?.offsetX + apiflowWrapperRect.x + styleInfo.width / 2;
            lineClientStartY = styleInfo?.offsetY + apiflowWrapperRect.y;
        }
        startNodeInfo.x = styleInfo.offsetX + styleInfo.width / 2;
        startNodeInfo.y = styleInfo.offsetY;
    } else if (props.lineInfo.position === "right") {
        if (styleInfo) {
            lineClientStartX = styleInfo?.offsetX + apiflowWrapperRect.x + styleInfo.width;
            lineClientStartY = styleInfo?.offsetY + apiflowWrapperRect.y + styleInfo.height / 2;
        }
        startNodeInfo.x = styleInfo.offsetX + styleInfo.width
        startNodeInfo.y = styleInfo.offsetY + styleInfo.height / 2;
    } else if (props.lineInfo.position === "bottom") {
        if (styleInfo) {
            lineClientStartX = styleInfo?.offsetX + apiflowWrapperRect.x + styleInfo.width / 2;
            lineClientStartY = styleInfo?.offsetY + apiflowWrapperRect.y + styleInfo.height;
        }
        startNodeInfo.x = styleInfo.offsetX + styleInfo.width / 2;
        startNodeInfo.y = styleInfo.offsetY + styleInfo.height;
    }
    const endNodeInfo = {
        x: props.lineInfo.lineClientEndX - apiflowWrapperRect.x,
        y: props.lineInfo.lineClientEndY - apiflowWrapperRect.y,
    }
    const drawInfo = getLineDrawInfo(startNodeInfo, endNodeInfo, {
        currentNode: hostNode.value,
        position: props.lineInfo.position,
        currendLine: props.lineInfo
    });
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
    if (lineRef.value) {
        repaintLine(lineRef.value, drawInfo);
    }
};
onMounted(() => {
    document.documentElement.addEventListener("mousemove", debounce(handleNodeMouseMove));
    document.documentElement.addEventListener("mouseup", handleRemoveTempLine);
    document.documentElement.addEventListener("mousemove", debounce(handleCanvasMouseMove));
    document.documentElement.addEventListener("mousemove", debounce(handleDotMouseMove));
    document.documentElement.addEventListener("mousemove", debounce(handleCheckMouseIsInArrow));
    document.documentElement.addEventListener("mouseup", handleCanvasMouseUp);
})
onUnmounted(() => {
    document.documentElement.removeEventListener("mousemove", handleCanvasMouseMove);
    document.documentElement.removeEventListener("mousemove", handleNodeMouseMove);
    document.documentElement.removeEventListener("mousemove", handleCheckMouseIsInArrow);
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
