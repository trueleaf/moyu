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
            <pre style="position: absolute; right: 820px; top: 40px;">
                {{ canvasClickOffsetX }}
                {{ canvasClickOffsetY }}
                canvasDown: {{ isMouseDownCanvasArrow }}
                isInArrow: {{ isInLineArrow }}
            </pre>
            <pre style="position: absolute; right: 620px; top: 40px;">{{ { ...currentNode, outcomings: [] } }}</pre>
            <pre style="position: absolute; right: 320px; top: 40px;">outcomings
                {{ currentNode?.outcomings }}
            </pre>
        </teleport>
    </div>
    <template v-for="(item, index) in currentNode?.outcomings" :key="index">
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
                cursor: isInLineArrow ? 'move' : 'default',
            }"
            @mouseleave="handleCanvasLineMouseLeave"
            @mousedown.stop="handleMouseDownCanvas($event, item)"
        >
        </canvas>
    </template>
</template>

<script lang="ts" setup>
import { onUnmounted, ref, Ref, computed, onMounted, inject } from "vue";
import { uuid, debounce } from "@/helper";
import { store } from "@/store";
import { ApidocApiflowLineInfo, ApidocApiflowNodeInfo, ApiflowOutComingDirection } from "@@/store";
import { getRectInfo, getZIndex, isInRect } from "./utils";

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
const isInLineArrow = ref(false);
const isMouseDownCanvasArrow = ref(false);
console.log(containerInfo)
/*
|--------------------------------------------------------------------------
| 公共方法
|--------------------------------------------------------------------------
*/
const currentNode = computed(() => store.state["apidoc/apiflow"].apiflowList.find(v => v.id === props.nodeId));
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
    const drawInfo = getRectInfo(startNodeInfo, endNodeInfo, {
        currentNode: currentNode.value as ApidocApiflowNodeInfo
    });
    return drawInfo;
}
//绘制线条
const repaintLine = (dom: HTMLCanvasElement, drawInfo: ReturnType<typeof getRectInfo>) => {
    const ctx = dom.getContext("2d") as CanvasRenderingContext2D;
    dom.width = drawInfo.width;
    dom.height = drawInfo.height;
    const { endX, endY, arrowInfo: { p1, p2, p3 } } = drawInfo.lineInfo
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    ctx.moveTo(drawInfo.lineInfo.startX, drawInfo.lineInfo.startY);
    // ctx.lineTo(endX, endY);
    ctx.quadraticCurveTo(drawInfo.lineInfo.cpx, drawInfo.lineInfo.cpy, endX, endY);
    ctx.stroke();
    ctx.beginPath();
    // ctx.fillStyle = "teal"
    // ctx.fillRect(leftTopPoint.x, leftTopPoint.y, rightBottomPoint.x - leftTopPoint.x, rightBottomPoint.y - leftTopPoint.y)
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.lineTo(p3.x, p3.y)
    ctx.fill();
    ctx.closePath()
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
//重绘出线

//节点移动
const handleNodeMouseMove = (e: MouseEvent) => {
    if (!isNodeMousedown.value || isResizeNodeMousedown.value) {
        return
    }
    const relativeX = e.clientX - nodeMousedownX.value; //相对于mousedown位置移动距离
    const relativeY = e.clientY - nodeMousedownY.value; //相对于mousedown位置移动距离
    nodeOffsetX.value = mousedownNodeX.value + relativeX;
    nodeOffsetY.value = mousedownNodeY.value + relativeY;
    const apiflowWrapperRect = apiflowWrapper.value.getBoundingClientRect();
    currentNode.value?.outcomings.forEach(outcoming => {
        if (!currentNode.value) {
            return
        }
        const startNodeInfo = {
            x: 0,
            y: 0,
        }
        let lineClientStartX = 0;
        let lineClientStartY = 0;
        if (outcoming.position === "left") {
            if (styleInfo.value) {
                lineClientStartX = styleInfo.value?.offsetX + apiflowWrapperRect.x;
                lineClientStartY = styleInfo.value?.offsetY + apiflowWrapperRect.y + styleInfo.value.height / 2;
            }
            startNodeInfo.x = mousedownNodeX.value + relativeX;
            startNodeInfo.y = mousedownNodeY.value + relativeY + currentNode.value.styleInfo.height / 2;
        } else if (outcoming.position === "top") {
            if (styleInfo.value) {
                lineClientStartX = styleInfo.value?.offsetX + apiflowWrapperRect.x + styleInfo.value.width / 2;
                lineClientStartY = styleInfo.value?.offsetY + apiflowWrapperRect.y;
            }
            startNodeInfo.x = mousedownNodeX.value + relativeX + currentNode.value.styleInfo.width / 2;
            startNodeInfo.y = mousedownNodeY.value + relativeY;
        } else if (outcoming.position === "right") {
            if (styleInfo.value) {
                lineClientStartX = styleInfo.value?.offsetX + apiflowWrapperRect.x + styleInfo.value.width;
                lineClientStartY = styleInfo.value?.offsetY + apiflowWrapperRect.y + styleInfo.value.height / 2;
            }
            startNodeInfo.x = mousedownNodeX.value + relativeX + currentNode.value.styleInfo.width;
            startNodeInfo.y = mousedownNodeY.value + relativeY + currentNode.value.styleInfo.height / 2;
        } else if (outcoming.position === "bottom") {
            if (styleInfo.value) {
                lineClientStartX = styleInfo.value?.offsetX + apiflowWrapperRect.x + styleInfo.value.width / 2;
                lineClientStartY = styleInfo.value?.offsetY + apiflowWrapperRect.y + styleInfo.value.height;
            }
            startNodeInfo.x = mousedownNodeX.value + relativeX + currentNode.value.styleInfo.width / 2;
            startNodeInfo.y = mousedownNodeY.value + relativeY + currentNode.value.styleInfo.height;
        }
        const endNodeInfo = {
            x: outcoming.lineClientEndX - apiflowWrapperRect.x,
            y: outcoming.lineClientEndY - apiflowWrapperRect.y,
        }
        const drawInfo = getRectInfo(startNodeInfo, endNodeInfo, {
            currentNode: currentNode.value
        });
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
            const currentOutcoming = outcomingRef.value.find(canvas => (canvas.dataset.id as string) === outcoming.id) || null
            if (currentOutcoming) {
                repaintLine(currentOutcoming, drawInfo);
            }
        }
    })
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
            const currentOutcoming = outcomingRef.value.find(canvas => (canvas.dataset.id as string) === outcoming.id) || null
            if (currentOutcoming) {
                repaintLine(currentOutcoming, drawInfo);
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
        outcomings: []
    }
    store.commit("apidoc/apiflow/addNode", node)
}
const handleAddSiblingNode = () => {
    console.log(2)
}
/*
|--------------------------------------------------------------------------
| 线条绘制
|--------------------------------------------------------------------------
*/
const currentOutcoming: Ref<null | HTMLCanvasElement> = ref(null);
const isMouseDownDot = ref(false);
const dotStartX = ref(0);
const dotStartY = ref(0);
const lineId = ref("");
const handleMouseDownDot = (e: MouseEvent, direction: ApiflowOutComingDirection) => {
    if (!currentNode.value) {
        return;
    }
    const apiflowWrapperRect = apiflowWrapper.value.getBoundingClientRect();
    isMouseDownDot.value = true;
    lineId.value = uuid()
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
    store.commit("apidoc/apiflow/addOutComing", {
        nodeId: props.nodeId,
        lineId: lineId.value,
        lineInfo: {
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
    })
    store.commit("apidoc/apiflow/changeNodeZIndexById", {
        id: currentNode.value?.id,
        zIndex: zIndex + 1,
    })
}
//绘制线条
const handleDotMouseMove = (e: MouseEvent) => {
    if (!isMouseDownDot.value) {
        return;
    }
    const apiflowWrapperRect = apiflowWrapper.value.getBoundingClientRect();
    const startPoint = {
        x: dotStartX.value - apiflowWrapperRect.x,
        y: dotStartY.value - apiflowWrapperRect.y,
    }
    const endPoint = {
        x: e.clientX - apiflowWrapperRect.x,
        y: e.clientY - apiflowWrapperRect.y,
    }
    const drawInfo = getRectInfo(startPoint, endPoint, {
        currentNode: currentNode.value as ApidocApiflowNodeInfo
    });
    store.commit("apidoc/apiflow/changeOutComingInfoById", {
        nodeId: props.nodeId,
        lineId: lineId.value,
        lineInfo: {
            id: lineId.value,
            type: "line",
            lineClientEndX: e.clientX,
            lineClientEndY: e.clientY,
            offsetX: drawInfo.x,
            offsetY: drawInfo.y,
            width: drawInfo.width,
            height: drawInfo.height,
        }
    })
    if (outcomingRef.value) {
        currentOutcoming.value = outcomingRef.value.find(canvas => (canvas.dataset.id as string) === lineId.value) || null
        if (currentOutcoming.value) {
            repaintLine(currentOutcoming.value, drawInfo);
        }
    }
}

//移除无效的线段
const handleRemoveTempLine = () => {
    isMouseDownDot.value = false;
    if (currentOutcoming.value && (currentOutcoming.value.width < 20 && currentOutcoming.value.height < 20)) {
        store.commit("apidoc/apiflow/removeOutcomingById", {
            nodeId: props.nodeId,
            lineId: lineId.value,
        })
    }
}

//线条上面鼠标移动(仅在节点上面生效)
const handleCheckMouseIsInArrow = (e: MouseEvent) => {
    if (currentNode.value) {
        const apiflowWrapperRect = apiflowWrapper.value.getBoundingClientRect();
        isInLineArrow.value = currentNode.value.outcomings.some(outcoming => {
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
            // console.log(mouseOffsetPoint, leftTopPoint, rightBottomPoint)
            const isIn = isInRect(mouseOffsetPoint, leftTopPoint, rightBottomPoint);
            return isIn;
        })
    }
}
//线条点击事件
const canvasClickOffsetX = ref(0);
const canvasClickOffsetY = ref(0);
const currentDragedCanvasInfo: Ref<null | ApidocApiflowLineInfo> = ref(null)
const handleMouseDownCanvas = (e: MouseEvent, item: ApidocApiflowLineInfo) => {
    canvasClickOffsetX.value = e.offsetX;
    canvasClickOffsetY.value = e.offsetY;
    currentDragedCanvasInfo.value = item
    if (isInLineArrow.value) {
        isMouseDownCanvasArrow.value = true;
    }
}
//在canvas可以拖拽区域移动
const handleCanvasMouseMove = (e: MouseEvent) => {
    if (!isMouseDownCanvasArrow.value || !currentDragedCanvasInfo.value) {
        return
    }
    if (currentDragedCanvasInfo.value && currentNode.value) {
        const nodeInfo = currentNode.value.styleInfo;
        const apiflowWrapperRect = apiflowWrapper.value.getBoundingClientRect();
        if (currentDragedCanvasInfo.value.position === "right") {
            const startPoint = {
                x: nodeInfo.offsetX + nodeInfo.width,
                y: nodeInfo.offsetY + nodeInfo.height / 2,
            }
            const endPoint = {
                x: e.clientX - apiflowWrapperRect.x + 2,
                y: e.clientY - apiflowWrapperRect.y,
            }
            const drawInfo = getRectInfo(startPoint, endPoint, {
                currentNode: currentNode.value
            });
            store.commit("apidoc/apiflow/changeOutComingInfoById", {
                nodeId: props.nodeId,
                lineId: currentDragedCanvasInfo.value.id,
                lineInfo: {
                    id: currentDragedCanvasInfo.value.id,
                    type: "line",
                    lineClientEndX: currentDragedCanvasInfo.value.lineClientStartX + drawInfo.width,
                    lineClientEndY: currentDragedCanvasInfo.value.lineClientStartY + drawInfo.height,
                    offsetX: drawInfo.x,
                    offsetY: drawInfo.y,
                    width: drawInfo.width,
                    height: drawInfo.height,
                }
            })
            if (outcomingRef.value) {
                currentOutcoming.value = outcomingRef.value.find(canvas => (canvas.dataset.id as string) === currentDragedCanvasInfo.value?.id) || null
                if (currentOutcoming.value) {
                    repaintLine(currentOutcoming.value, drawInfo);
                }
            }
        }
    }
}
//线条上面鼠标移出
const handleCanvasLineMouseLeave = () => {
    console.log("leave")
}
//取消鼠标在arrow上面样式
const handleCanvasMouseUp = () => {
    isMouseDownCanvasArrow.value = false;
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
document.documentElement.addEventListener("mousemove", debounce(handleDotMouseMove));
document.documentElement.addEventListener("mousemove", debounce(handleNodeMouseMove));
document.documentElement.addEventListener("mousemove", debounce(handleResizeNodeMouseMove));
document.documentElement.addEventListener("mousemove", debounce(handleCanvasMouseMove));
document.documentElement.addEventListener("mousemove", debounce(handleCheckMouseIsInArrow));
document.documentElement.addEventListener("mouseup", handleNodeMouseUp);
document.documentElement.addEventListener("mouseup", handleResizeNodeMouseUp);
document.documentElement.addEventListener("mouseup", handleRemoveTempLine);
document.documentElement.addEventListener("mouseup", handleCanvasMouseUp);
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
.outcoming {
    position: absolute;
    border: 1px solid $gray-500;
}
</style>
