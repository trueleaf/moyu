/*
    创建者：shuxiaokai
    模块名称：可拖拽节点
    备注：
*/
<template>
    <div
        class="node"
        :style="{
            left: nodeOffsetX + 'px',
            top: nodeOffsetY + 'px',
            width: nodeWidth + 'px',
            height: nodeHeight + 'px',
            zIndex: styleInfo?.zIndex,
        }"
        @click.stop="() => {}"
        @mousedown.stop="handleNodeMousedown"
        @mouseenter="handleNodeMouseEnter"
        @mouseleave="handleNodeMouseLeave"
        @contextmenu="handleOpenContextmenu"
    >
        <template v-if="isSelectedNode">
            <div class="rect lt" @mousedown.stop="handleResizeNodeMousedown($event, 'leftTop')"></div>
            <div class="rect rt" @mousedown.stop="handleResizeNodeMousedown($event, 'rightTop')"></div>
            <div class="rect lb" @mousedown.stop="handleResizeNodeMousedown($event, 'leftBottom')"></div>
            <div class="rect rb" @mousedown.stop="handleResizeNodeMousedown($event, 'rightBottom')"></div>
        </template>
        <template v-if="1 || isMouseInNode">
            <div :style="{zIndex: dotZIndex}" class="dot left" @mousedown.stop="handleMouseDownDot($event, 'left')"></div>
            <div :style="{zIndex: dotZIndex}" class="dot right" @mousedown.stop="handleMouseDownDot($event, 'right')"></div>
            <div :style="{zIndex: dotZIndex}" class="dot top" @mousedown.stop="handleMouseDownDot($event, 'top')"></div>
            <div :style="{zIndex: dotZIndex}" class="dot bottom" @mousedown.stop="handleMouseDownDot($event, 'bottom')"></div>
        </template>
        <teleport to="body">
            <!-- 多个节点操作 -->
            <s-contextmenu v-if="contextmenuVisible" :left="contextmenuLeft" :top="contextmenuTop">
                <s-contextmenu-item label="新增子节点" @click="handleAddSubNode"></s-contextmenu-item>
                <s-contextmenu-item v-if="currentNode?.id !== 'start'" label="新增同级" @click="handleAddSiblingNode"></s-contextmenu-item>
            </s-contextmenu>
            <!-- <canvas ref="lineCanvas"></canvas> -->
            <pre style="position: absolute; right: 720px; top: 40px;">
                isMouseDownCanvasArrow: {{ isMouseDownCanvasArrow }}
                isInArrow: {{ isMouseInLineArrow }}
                isNodeMousedown: {{ isNodeMousedown }}
            </pre>
            <pre style="position: absolute; right: 220px; top: 40px; height: 400px; overflow-y: auto;">{{ { apiflowList } }}</pre>
            <!-- <pre style="position: absolute; right: 320px; top: 40px;">outcomings
                {{ currentNode?.outcomings }}
            </pre> -->
        </teleport>
    </div>
    <!-- <template v-for="(item, index) in currentNode?.outcomings" :key="index">
        <canvas
            ref="outcomingRef"
            class="outcoming"
            :data-id="item.id"
            :style="{
                left: item.offsetX + 'px',
                top: item.offsetY + 'px',
                width: item.width + 'px',
                height: item.height + 'px',
                zIndex: item.zIndex,
                cursor: isMouseInLineArrow ? 'move' : 'default',
            }"
            @mouseleave="handleCanvasLineMouseLeave"
            @mousedown.stop="handleMouseDownCanvas($event, item)"
        >
        </canvas>
    </template> -->
</template>

<script lang="ts" setup>
import { onUnmounted, ref, Ref, computed, onMounted, inject } from "vue";
import { uuid, debounce } from "@/helper";
import { store } from "@/store";
import { ApidocApiflowLineInfo, ApidocApiflowNodeInfo, ApiflowOutComingDirection } from "@@/store";
import { getLineDrawInfo, getZIndex, isInRect } from "../utils/utils";

type ResizeDirection = "leftTop" | "rightTop" | "leftBottom" | "rightBottom";

const props = defineProps({
    nodeId: {
        type: String,
        default: ""
    },
})
/*
|--------------------------------------------------------------------------
| 公共变量
|--------------------------------------------------------------------------
*/
const outcomingRef: Ref<null | HTMLCanvasElement[]> = ref(null);
const containerInfo = computed(() => store.state["apidoc/apiflow"].containerInfo)
const apiflowWrapper = inject("apiflowWrapper") as Ref<HTMLElement>;
const isMouseInLineArrow = computed(() => store.state["apidoc/apiflow"].isMouseInLineArrow);
const isMouseDownCanvasArrow = ref(false);
const apiflowList = computed(() => store.state["apidoc/apiflow"].apiflowList)
const currentNode = computed(() => apiflowList.value.find(v => v.id === props.nodeId));
const nodeOffsetX = computed({ //节点x值
    get() {
        return currentNode.value?.styleInfo.offsetX || 0
    },
    set(v) {
        store.commit("apidoc/apiflow/changeNodeOffsetXById", { id: props.nodeId, x: v })
    },
});
const nodeOffsetY = computed({ //节点y值
    get() {
        return currentNode.value?.styleInfo.offsetY || 0
    },
    set(v) {
        store.commit("apidoc/apiflow/changeNodeOffsetYById", { id: props.nodeId, y: v })
    },
});
const nodeWidth = computed({ //节点宽度
    get() {
        return currentNode.value?.styleInfo.width || 0
    },
    set(v) {
        store.commit("apidoc/apiflow/changeNodeWidthById", { id: props.nodeId, w: v })
    },
});
const nodeHeight = computed({ //节点高度
    get() {
        return currentNode.value?.styleInfo.height || 0
    },
    set(v) {
        store.commit("apidoc/apiflow/changeNodeHeightById", { id: props.nodeId, h: v })
    },
});
console.log(containerInfo)
/*
|--------------------------------------------------------------------------
| 公共方法
|--------------------------------------------------------------------------
*/
//根据线条信息获取线条数据
const getOutcomingDrawInfo = (outcoming: ApidocApiflowLineInfo) => {
    const apiflowWrapperRect = apiflowWrapper.value.getBoundingClientRect();
    const startNodeInfo = {
        x: 0,
        y: 0,
    }
    const endNodeInfo = {
        x: outcoming.lineClientEndX - apiflowWrapperRect.x,
        y: outcoming.lineClientEndY - apiflowWrapperRect.y,
    }
    if (outcoming.position === "left") {
        startNodeInfo.x = nodeOffsetX.value;
        startNodeInfo.y = nodeOffsetY.value + nodeHeight.value / 2;
    } else if (outcoming.position === "top") {
        startNodeInfo.x = nodeOffsetX.value + nodeWidth.value / 2;
        startNodeInfo.y = nodeOffsetY.value;
    } else if (outcoming.position === "right") {
        startNodeInfo.x = nodeOffsetX.value + nodeWidth.value
        startNodeInfo.y = nodeOffsetY.value + nodeHeight.value / 2;
    } else if (outcoming.position === "bottom") {
        startNodeInfo.x = nodeOffsetX.value + nodeWidth.value / 2;
        startNodeInfo.y = nodeOffsetY.value + nodeHeight.value;
    }
    const drawInfo = getLineDrawInfo(startNodeInfo, endNodeInfo, {
        currentNode: currentNode.value as ApidocApiflowNodeInfo,
        position: outcoming.position,
        currendLine: outcoming
    });
    return drawInfo;
}
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
    // ctx.fillStyle = "#abc"
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.lineTo(p3.x, p3.y)
    ctx.fill();
    ctx.closePath()
    // const { endX, endY, arrowInfo: { p1, p2, p3 } } = drawInfo.lineInfo
    // ctx.beginPath();
    // ctx.lineCap = "round";
    // ctx.lineWidth = 2;
    // ctx.moveTo(drawInfo.lineInfo.startX, drawInfo.lineInfo.startY);
    // // ctx.lineTo(endX, endY);
    // ctx.quadraticCurveTo(drawInfo.lineInfo.cpx, drawInfo.lineInfo.cpy, endX, endY);
    // ctx.stroke();
    // ctx.beginPath();
    // // ctx.fillStyle = "teal"
    // // ctx.fillRect(leftTopPoint.x, leftTopPoint.y, rightBottomPoint.x - leftTopPoint.x, rightBottomPoint.y - leftTopPoint.y)
    // ctx.moveTo(p1.x, p1.y)
    // ctx.lineTo(p2.x, p2.y)
    // ctx.lineTo(p3.x, p3.y)
    // ctx.fill();
    // ctx.closePath()
}

/*
|--------------------------------------------------------------------------
| 线条绘制
|--------------------------------------------------------------------------
*/
const dotStartX = ref(0);
const dotStartY = ref(0);
const lineId = ref("");
const currentDrawLineInfo: Ref<ApidocApiflowLineInfo | null> = ref(null)
const mousedownDotPosition: Ref<ApiflowOutComingDirection> = ref("left")
const handleMouseDownDot = (e: MouseEvent, direction: ApiflowOutComingDirection) => {
    if (!currentNode.value) {
        return;
    }
    mousedownDotPosition.value = direction;
    const apiflowWrapperRect = apiflowWrapper.value.getBoundingClientRect();
    lineId.value = uuid()
    store.commit("apidoc/apiflow/changeCurrentSelectedDotId", lineId.value)
    const zIndex = getZIndex();
    if (direction === "left") {
        dotStartX.value = currentNode.value.styleInfo.offsetX + apiflowWrapperRect.x;
        dotStartY.value = currentNode.value.styleInfo.offsetY + apiflowWrapperRect.y + currentNode.value.styleInfo.height / 2;
    } else if (direction === "top") {
        dotStartX.value = currentNode.value.styleInfo.offsetX + apiflowWrapperRect.x + currentNode.value.styleInfo.width / 2;
        dotStartY.value = currentNode.value.styleInfo.offsetY + apiflowWrapperRect.y;
    } else if (direction === "right") {
        dotStartX.value = currentNode.value.styleInfo.offsetX + apiflowWrapperRect.x + currentNode.value.styleInfo.width;
        dotStartY.value = currentNode.value.styleInfo.offsetY + apiflowWrapperRect.y + currentNode.value.styleInfo.height / 2;
    } else if (direction === "bottom") {
        dotStartX.value = currentNode.value.styleInfo.offsetX + apiflowWrapperRect.x + currentNode.value.styleInfo.width / 2;
        dotStartY.value = currentNode.value.styleInfo.offsetY + apiflowWrapperRect.y + currentNode.value.styleInfo.height;
    }
    currentDrawLineInfo.value = {
        id: lineId.value,
        type: "line",
        position: direction,
        offsetX: 0,
        offsetY: 0,
        width: 0,
        height: 0,
        lineClientStartX: dotStartX.value,
        lineClientStartY: dotStartY.value,
        lineClientEndX: dotStartX.value,
        lineClientEndY: dotStartY.value,
        zIndex,
    }
    store.commit("apidoc/apiflow/addOutComing", {
        nodeId: props.nodeId,
        lineId: lineId.value,
        lineInfo: currentDrawLineInfo.value
    })
    // store.commit("apidoc/apiflow/changeNodeZIndexById", {
    //     id: currentNode.value?.id,
    //     zIndex: zIndex + 1,
    // })
}
//线条上面鼠标移动(仅在节点上面生效)
const handleCheckMouseIsInArrow = (e: MouseEvent) => {
    if (currentNode.value) {
        const apiflowWrapperRect = apiflowWrapper.value.getBoundingClientRect();
        const isInArrow = currentNode.value.outcomings.some(outcoming => {
            const drawInfo = getOutcomingDrawInfo(outcoming)
            const mouseOffsetPoint = { x: e.clientX - apiflowWrapperRect.x, y: e.clientY - apiflowWrapperRect.y }
            const leftTopPoint = {
                x: drawInfo.lineInfo.arrowInfo.leftTopPoint.x + outcoming.offsetX,
                y: drawInfo.lineInfo.arrowInfo.leftTopPoint.y + outcoming.offsetY,
            }
            const rightBottomPoint = {
                x: drawInfo.lineInfo.arrowInfo.rightBottomPoint.x + outcoming.offsetX,
                y: drawInfo.lineInfo.arrowInfo.rightBottomPoint.y + outcoming.offsetY,
            }
            const isIn = isInRect(mouseOffsetPoint, leftTopPoint, rightBottomPoint);
            console.log(2, isIn)
            return isIn;
        })
        console.log(1, isInArrow)
        store.commit("apidoc/apiflow/changeIsMouseInLineArrow", isInArrow)
    }
}
/*
|--------------------------------------------------------------------------
| 节点
|--------------------------------------------------------------------------
*/
const dotZIndex = computed(() => {
    let maxZIndex = 0;
    currentNode.value?.outcomings.forEach(outcoming => {
        if (outcoming.zIndex > maxZIndex) {
            maxZIndex = outcoming.zIndex;
        }
    })
    return maxZIndex + 1;
})
const nodeMousedownX = ref(0);
const nodeMousedownY = ref(0);
const isNodeMousedown = ref(false);
const isMouseInNode = ref(false);
const isSelectedNode = ref(false); //是否选中节点
const styleInfo = computed(() => currentNode.value?.styleInfo)

const mousedownNodeX = ref(0); //鼠标按下时候节点x值
const mousedownNodeY = ref(0); //鼠标按下时候节点y值
const nodeFixedX = ref(0);
const nodeFixedY = ref(0);
const nodeMinWidth = 100; //最小宽度
const nodeMinHeight = 50; //最小高度

/*
|--------------------------------------------------------------------------
| 拖拽节点
|--------------------------------------------------------------------------
*/
const resizeNodeMousedownX = ref(0); //鼠标按下时候resize节点x值
const resizeNodeMousedownY = ref(0); //鼠标按下时候resize节点y值
const isResizeNodeMousedown = ref(false);
const nodeStartResizeWidth = ref(0); //节点开始resize时候宽度
const nodeStartResizeHeight = ref(0); //节点开始resize时候高度
const resizeDirection: Ref<ResizeDirection> = ref("leftTop");
/*
|--------------------------------------------------------------------------
| 节点移动相关事件
|--------------------------------------------------------------------------
*/
//鼠标按下
const handleNodeMousedown = (e: MouseEvent) => {
    nodeMousedownX.value = e.clientX;
    nodeMousedownY.value = e.clientY;
    mousedownNodeX.value = nodeOffsetX.value;
    mousedownNodeY.value = nodeOffsetY.value;
    isNodeMousedown.value = true;
    isSelectedNode.value = true;
}
//鼠标松开
const handleNodeMouseUp = () => {
    isNodeMousedown.value = false;
}
//鼠标移入
const handleNodeMouseEnter = () => {
    isMouseInNode.value = true;
}
//鼠标移出
const handleNodeMouseLeave = () => {
    isMouseInNode.value = false;
}
//节点移动
const handleNodeMouseMove = (e: MouseEvent) => {
    if (!isNodeMousedown.value || isResizeNodeMousedown.value || isMouseInLineArrow.value) {
        return
    }
    const relativeX = e.clientX - nodeMousedownX.value; //相对于mousedown位置移动距离
    const relativeY = e.clientY - nodeMousedownY.value; //相对于mousedown位置移动距离
    nodeOffsetX.value = mousedownNodeX.value + relativeX;
    nodeOffsetY.value = mousedownNodeY.value + relativeY;
}

/*
|--------------------------------------------------------------------------
| 拖拽节点改变节点大小事件
|--------------------------------------------------------------------------
*/
//拖拽节点点击
const handleResizeNodeMousedown = (e: MouseEvent, direction: ResizeDirection) => {
    isResizeNodeMousedown.value = true;
    resizeNodeMousedownX.value = e.clientX;
    resizeNodeMousedownY.value = e.clientY;
    nodeStartResizeWidth.value = nodeWidth.value;
    nodeStartResizeHeight.value = nodeHeight.value;
    mousedownNodeX.value = nodeOffsetX.value;
    mousedownNodeY.value = nodeOffsetY.value;
    resizeDirection.value = direction;
    switch (direction) {
    case "leftTop":
        nodeFixedX.value = nodeOffsetX.value + (nodeWidth.value - nodeMinWidth)
        nodeFixedY.value = nodeOffsetY.value + (nodeHeight.value - nodeMinHeight)
        break;
    case "rightTop":
        nodeFixedX.value = nodeOffsetX.value
        nodeFixedY.value = nodeOffsetY.value + (nodeHeight.value - nodeMinHeight)
        break;
    case "leftBottom":
        nodeFixedX.value = nodeOffsetX.value + (nodeWidth.value - nodeMinWidth)
        nodeFixedY.value = nodeOffsetY.value
        break;
    case "rightBottom":
        nodeFixedX.value = nodeOffsetX.value
        nodeFixedY.value = nodeOffsetY.value
        break;
    default:
        break;
    }
}
//拖拽节点鼠标移动(改变大小)
const handleResizeNodeMouseMove = (e: MouseEvent) => {
    if (!isResizeNodeMousedown.value) {
        return;
    }
    const relativeX = e.clientX - resizeNodeMousedownX.value; //相对x移动距离
    const relativeY = e.clientY - resizeNodeMousedownY.value; //相对y移动距离
    if (resizeDirection.value === "leftTop") {
        if (nodeStartResizeWidth.value - relativeX < nodeMinWidth) {
            nodeWidth.value = nodeMinWidth;
            nodeOffsetX.value = nodeFixedX.value
        } else {
            nodeOffsetX.value = mousedownNodeX.value + relativeX;
            nodeWidth.value = nodeStartResizeWidth.value - relativeX
        }
        if (nodeStartResizeHeight.value - relativeY < nodeMinHeight) {
            nodeHeight.value = nodeMinHeight;
            nodeOffsetY.value = nodeFixedY.value
        } else {
            nodeHeight.value = nodeStartResizeHeight.value - relativeY
            nodeOffsetY.value = mousedownNodeY.value + relativeY;
        }
    } else if (resizeDirection.value === "rightTop") {
        if (nodeStartResizeWidth.value + relativeX < nodeMinWidth) {
            nodeWidth.value = nodeMinWidth;
            nodeOffsetX.value = nodeFixedX.value
        } else {
            nodeWidth.value = nodeStartResizeWidth.value + relativeX
        }
        if (nodeStartResizeHeight.value - relativeY < nodeMinHeight) {
            nodeHeight.value = nodeMinHeight;
            nodeOffsetY.value = nodeFixedY.value
        } else {
            nodeHeight.value = nodeStartResizeHeight.value - relativeY
            nodeOffsetY.value = mousedownNodeY.value + relativeY;
        }
    } else if (resizeDirection.value === "leftBottom") {
        if (nodeStartResizeWidth.value - relativeX < nodeMinWidth) {
            nodeWidth.value = nodeMinWidth;
            nodeOffsetX.value = nodeFixedX.value
        } else {
            nodeWidth.value = nodeStartResizeWidth.value - relativeX;
            nodeOffsetX.value = mousedownNodeX.value + relativeX;
        }
        if (nodeStartResizeHeight.value + relativeY < nodeMinHeight) {
            nodeHeight.value = nodeMinHeight;
            nodeOffsetY.value = nodeFixedY.value
        } else {
            nodeHeight.value = nodeStartResizeHeight.value + relativeY
            nodeOffsetY.value = mousedownNodeY.value;
        }
    } else if (resizeDirection.value === "rightBottom") {
        if (nodeStartResizeWidth.value + relativeX < nodeMinWidth) {
            nodeWidth.value = nodeMinWidth;
            nodeOffsetX.value = nodeFixedX.value
        } else {
            nodeWidth.value = nodeStartResizeWidth.value + relativeX;
        }
        if (nodeStartResizeHeight.value + relativeY < nodeMinHeight) {
            nodeHeight.value = nodeMinHeight;
        } else {
            nodeHeight.value = nodeStartResizeHeight.value + relativeY
            nodeOffsetY.value = mousedownNodeY.value;
        }
    }
    const apiflowWrapperRect = apiflowWrapper.value.getBoundingClientRect();
    currentNode.value?.outcomings.forEach(outcoming => {
        if (!currentNode.value) {
            return
        }
        let lineClientStartX = 0;
        let lineClientStartY = 0;
        if (outcoming.position === "left") {
            if (styleInfo.value) {
                lineClientStartX = styleInfo.value?.offsetX + apiflowWrapperRect.x;
                lineClientStartY = styleInfo.value?.offsetY + apiflowWrapperRect.y + styleInfo.value.height / 2;
            }
        } else if (outcoming.position === "top") {
            if (styleInfo.value) {
                lineClientStartX = styleInfo.value?.offsetX + apiflowWrapperRect.x + styleInfo.value.width / 2;
                lineClientStartY = styleInfo.value?.offsetY + apiflowWrapperRect.y;
            }
        } else if (outcoming.position === "right") {
            if (styleInfo.value) {
                lineClientStartX = styleInfo.value?.offsetX + apiflowWrapperRect.x + styleInfo.value.width;
                lineClientStartY = styleInfo.value?.offsetY + apiflowWrapperRect.y + styleInfo.value.height / 2;
            }
        } else if (outcoming.position === "bottom") {
            if (styleInfo.value) {
                lineClientStartX = styleInfo.value?.offsetX + apiflowWrapperRect.x + styleInfo.value.width / 2;
                lineClientStartY = styleInfo.value?.offsetY + apiflowWrapperRect.y + styleInfo.value.height;
            }
        }
        const drawInfo = getOutcomingDrawInfo(outcoming);
        store.commit("apidoc/apiflow/changeOutComingInfoById", {
            nodeId: props.nodeId,
            lineId: outcoming.id,
            lineInfo: {
                lineClientStartX,
                lineClientStartY,
                offsetX: drawInfo.x,
                offsetY: drawInfo.y,
                width: drawInfo.width,
                height: drawInfo.height,
            }
        })
        if (outcomingRef.value) {
            const oc = outcomingRef.value.find(canvas => (canvas.dataset.id as string) === outcoming.id) || null
            if (oc) {
                repaintLine(oc, drawInfo);
            }
        }
    })
}
//拖拽节点鼠标松开
const handleResizeNodeMouseUp = () => {
    isResizeNodeMousedown.value = false;
}
/*
|--------------------------------------------------------------------------
| 鼠标右键事件
|--------------------------------------------------------------------------
*/
const contextmenuLeft = ref(0);
const contextmenuTop = ref(0);
const contextmenuVisible = ref(false);
const handleOpenContextmenu = (e: MouseEvent) => {
    contextmenuVisible.value = true;
    contextmenuLeft.value = e.x;
    contextmenuTop.value = e.y;
}
//添加子节点
const handleAddSubNode = () => {
    if (!currentNode.value) {
        return
    }
    const node: ApidocApiflowNodeInfo = {
        id: uuid(),
        type: "node",
        styleInfo: {
            offsetX: currentNode.value.styleInfo.offsetX + currentNode.value.styleInfo.width + 200,
            offsetY: currentNode.value.styleInfo.offsetY - 150,
            width: 150,
            height: 150,
            zIndex: getZIndex()
        },
        outcomings: [],
        incomings: [],
    }
    store.commit("apidoc/apiflow/addNode", node)
}
const handleAddSiblingNode = () => {
    console.log(2)
}

/*
|--------------------------------------------------------------------------
| 事件绑定
|--------------------------------------------------------------------------
*/
const handleClickGlobal = () => {
    isSelectedNode.value = false;
    contextmenuVisible.value = false;
}
document.documentElement.addEventListener("mousemove", debounce(handleNodeMouseMove));
document.documentElement.addEventListener("mousemove", debounce(handleResizeNodeMouseMove));
document.documentElement.addEventListener("mousemove", debounce(handleCheckMouseIsInArrow));
document.documentElement.addEventListener("mouseup", handleNodeMouseUp);
document.documentElement.addEventListener("mouseup", handleResizeNodeMouseUp);
document.documentElement.addEventListener("click", handleClickGlobal);
onMounted(() => {
    console.log("mouted")
})

onUnmounted(() => {
    document.documentElement.removeEventListener("mousemove", handleNodeMouseMove);
    document.documentElement.removeEventListener("mousemove", handleResizeNodeMouseMove);
    document.documentElement.removeEventListener("mouseup", handleNodeMouseUp);
    document.documentElement.removeEventListener("mouseup", handleResizeNodeMouseUp);
    document.documentElement.removeEventListener("click", handleClickGlobal);
})

</script>

<style lang="scss" scoped>
$dotWidth: 18;
$dotHeight: 18;
.node {
    border: 1px solid $gray-700;
    position: absolute;
    cursor: move;
    user-select: none;
    .rect {
        width: size($dotWidth);
        height: size($dotHeight);
        border: 1px solid $theme-color;
        position: absolute;
        cursor: pointer;
        background-color: $white;
        &.lt { //左上
            top: -(size(calc($dotWidth/2)));
            left: -(size(calc($dotWidth/2)));
            cursor: se-resize;
        }
        &.rt { //右上
            top: -(size(calc($dotWidth/2)));
            right: -(size(calc($dotWidth/2)));
            cursor: ne-resize;
        }
        &.lb { //左下
            bottom: -(size(calc($dotWidth/2)));
            left: -(size(calc($dotWidth/2)));
            cursor: sw-resize;
        }
        &.rb { //右下
            bottom: -(size(calc($dotWidth/2)));
            right: -(size(calc($dotWidth/2)));
            cursor: se-resize;
        }
    }
    .dot {
        width: size($dotWidth);
        height: size($dotHeight);
        border-radius: 50%;
        border: 1px solid $theme-color;
        position: absolute;
        cursor: pointer;
        background-color: $white;
        &.left { //左
            top: calc(50% - size(calc($dotHeight / 2)));
            left: -(size(calc($dotWidth/2)));
            cursor: crosshair;
        }
        &.right { //右
            top: calc(50% - size(calc($dotHeight / 2)));
            right: -(size(calc($dotWidth/2)));
            cursor: crosshair;
        }
        &.top { //上
            top: -(size(calc($dotHeight/2)));
            left: calc(50% - size(calc($dotHeight / 2)));
            cursor: crosshair;
        }
        &.bottom { //下
            bottom: -(size(calc($dotWidth/2)));
            left: calc(50% - size(calc($dotWidth / 2)));;
            cursor: crosshair;
        }
    }
}
</style>
