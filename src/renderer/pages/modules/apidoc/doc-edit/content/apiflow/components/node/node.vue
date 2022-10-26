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
                isMouseDownResizeDot: {{ isMouseDownResizeDot }}
                isMouseDownCanvasArrow: {{ isMouseDownCanvasArrow }}
                isInArrow: {{ isMouseInLineArrow }}
                isMouseDownNode: {{ isMouseDownNode }}
            </pre>
            <pre style="position: absolute; right: 220px; top: 40px; height: 400px; overflow-y: auto;">{{ { apiflowList } }}</pre>
            <!-- <pre style="position: absolute; right: 320px; top: 40px;">outcomings
                {{ currentNode?.outcomings }}
            </pre> -->
        </teleport>
    </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref, Ref, computed, onMounted, inject } from "vue";
import { uuid, debounce } from "@/helper";
import { store } from "@/store";
import { ApidocApiflowLineInfo, ApidocApiflowNodeInfo, ApiflowOutComingDirection } from "@@/store";
import { getZIndex } from "../utils/utils";

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
const currentOperatNode = computed(() => store.state["apidoc/apiflow"].currentOperatNode)
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
        fromPosition: direction,
        toPosition: null,
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
const isMouseDownNode = computed({
    get() {
        return store.state["apidoc/apiflow"].isMouseDownNode;
    },
    set(val) {
        store.commit("apidoc/apiflow/changeIsMouseDownNode", val)
    }
});
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
const isMouseDownResizeDot = computed({
    get() {
        return store.state["apidoc/apiflow"].isMouseDownResizeDot;
    },
    set(val) {
        store.commit("apidoc/apiflow/changeIsMouseDownResizeDot", val)
    }
});
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
    isMouseDownNode.value = true;
    isSelectedNode.value = true;
    store.commit("apidoc/apiflow/changeCurrentOperatNode", currentNode.value)
}
//鼠标松开
const handleNodeMouseUp = () => {
    isMouseDownNode.value = false;
    store.commit("apidoc/apiflow/changeCurrentOperatNode", null)
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
    if (!isMouseDownNode.value || isMouseDownResizeDot.value || isMouseInLineArrow.value) {
        return
    }
    if (currentOperatNode.value?.id !== currentNode.value?.id) {
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
    store.commit("apidoc/apiflow/changeCurrentOperatNode", currentNode.value)
    isMouseDownResizeDot.value = true;
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
    if (!isMouseDownResizeDot.value || currentOperatNode.value?.id !== currentNode.value?.id) {
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
}
//拖拽节点鼠标松开
const handleResizeNodeMouseUp = () => {
    isMouseDownResizeDot.value = false;
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
