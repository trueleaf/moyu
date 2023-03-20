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
        @mousedown="handleNodeMousedown"
        @mouseenter="handleNodeMouseEnter"
        @mouseleave="handleNodeMouseLeave"
        @contextmenu="handleOpenContextmenu"
    >
        <template v-if="activeNodeId === props.nodeId">
            <div
                class="resize-dot lt"
                :style="{
                    width: containerInfo.resizeNodeBarSize + 'px',
                    height: containerInfo.resizeNodeBarSize + 'px',
                    left: -containerInfo.resizeNodeBarSize/2 + 'px',
                    top: -containerInfo.resizeNodeBarSize/2 + 'px',
                }"
            >
            </div>
            <div
                class="resize-dot rt"
                :style="{
                    width: containerInfo.resizeNodeBarSize + 'px',
                    height: containerInfo.resizeNodeBarSize + 'px',
                    top: -containerInfo.resizeNodeBarSize / 2 + 'px',
                    right: -containerInfo.resizeNodeBarSize / 2 + 'px',
                }"
            >
            </div>
            <div
                class="resize-dot lb"
                :style="{
                    width: containerInfo.resizeNodeBarSize + 'px',
                    height: containerInfo.resizeNodeBarSize + 'px',
                    left: -containerInfo.resizeNodeBarSize / 2 + 'px',
                    bottom: -containerInfo.resizeNodeBarSize / 2 + 'px',
                }"
            >
            </div>
            <div
                class="resize-dot rb"
                :style="{
                    width: containerInfo.resizeNodeBarSize + 'px',
                    height: containerInfo.resizeNodeBarSize + 'px',
                    bottom: -containerInfo.resizeNodeBarSize / 2 + 'px',
                    right: -containerInfo.resizeNodeBarSize / 2 + 'px',
                }"
            >
            </div>
        </template>
        <template v-if="1 || isMouseInNode">
            <div
                class="create-line-dot"
                :style="{
                    zIndex: dotZIndex,
                    width: containerInfo.createLineDotSize + 'px',
                    height: containerInfo.createLineDotSize + 'px',
                    left: -containerInfo.createLineDotSize / 2 + 'px',
                    top: `calc(50% - ${containerInfo.createLineDotSize / 2}px)`,
                }"
            >
            </div>
            <div
                class="create-line-dot"
                :style="{
                    zIndex: dotZIndex,
                    width: containerInfo.createLineDotSize + 'px',
                    height: containerInfo.createLineDotSize + 'px',
                    right: -containerInfo.createLineDotSize / 2 + 'px',
                    top: `calc(50% - ${containerInfo.createLineDotSize / 2}px)`,
                }"
            >
            </div>
            <div
                class="create-line-dot"
                :style="{
                    zIndex: dotZIndex,
                    width: containerInfo.createLineDotSize + 'px',
                    height: containerInfo.createLineDotSize + 'px',
                    top: -containerInfo.createLineDotSize / 2 + 'px',
                    left: `calc(50% - ${containerInfo.createLineDotSize / 2}px)`,
                }"
            >
            </div>
            <div
                class="create-line-dot"
                :style="{
                    zIndex: dotZIndex,
                    width: containerInfo.createLineDotSize + 'px',
                    height: containerInfo.createLineDotSize + 'px',
                    bottom: -containerInfo.createLineDotSize / 2 + 'px',
                    left: `calc(50% - ${containerInfo.createLineDotSize / 2}px)`,
                }"
            >
            </div>
        </template>
        <teleport to="body">
            <!-- 多个节点操作 -->
            <s-contextmenu v-if="contextmenuVisible" :left="contextmenuLeft" :top="contextmenuTop">
                <s-contextmenu-item label="新增子节点" @click="handleAddSubNode"></s-contextmenu-item>
                <s-contextmenu-item v-if="currentNode?.id !== 'start'" label="新增同级" @click="handleAddSiblingNode"></s-contextmenu-item>
            </s-contextmenu>
        </teleport>
    </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref, Ref, computed, inject, onMounted } from "vue";
import { uuid, debounce } from "@/helper";
import { store } from "@/store";
import { ApiflowLineInfo, ApiflowNodeInfo, ApiflowOutComingDirection } from "@@/store";
import { getZIndex } from "../utils/utils";

const props = defineProps({
    /**
     * 当前节点id
     */
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
const currentMouseDownNode = computed(() => store.state["apidoc/apiflow"].currentMouseDownNode)
const containerInfo = computed(() => store.state["apidoc/apiflow"].containerInfo)
const mouseInCreateLineDotInfo = computed(() => store.state["apidoc/apiflow"].mouseInCreateLineDotInfo)
const apiflowWrapper = inject("apiflowWrapper") as Ref<HTMLElement>;
const mouseInLineInfo = computed(() => store.state["apidoc/apiflow"].mouseInLineInfo);
const nodeList = computed(() => store.state["apidoc/apiflow"].nodeList)
const currentNode = computed(() => nodeList.value.find(v => v.id === props.nodeId));
const mouseInResizeDotInfo = computed(() => store.state["apidoc/apiflow"].mouseInResizeDotInfo)
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
const currentDrawLineInfo: Ref<ApiflowLineInfo | null> = ref(null)
const mousedownDotPosition: Ref<ApiflowOutComingDirection> = ref("left")
const isMousedownDot = ref(false)
const handleMouseDownDot = () => {
    if (!currentNode.value) {
        return;
    }
    if (mouseInCreateLineDotInfo.value.nodeId !== props.nodeId) {
        return
    }
    isMousedownDot.value = true;
    const direction = mouseInCreateLineDotInfo.value.position
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
        arrowInfo: {
            leftTopPoint: {
                clientX: 0,
                clientY: 0,
            },
            rightBottomPoint: {
                clientX: 0,
                clientY: 0,
            },
        }
    }
    store.commit("apidoc/apiflow/addOutComing", {
        nodeId: props.nodeId,
        lineId: lineId.value,
        lineInfo: currentDrawLineInfo.value
    })
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
const activeNodeId = computed(() => store.state["apidoc/apiflow"].activeNodeId); //当前选中节点id
const styleInfo = computed(() => currentNode.value?.styleInfo)

const mousedownNodeX = ref(0); //鼠标按下时候节点x值
const mousedownNodeY = ref(0); //鼠标按下时候节点y值
// const nodeFixedX = ref(0);
// const nodeFixedY = ref(0);
// const nodeMinWidth = 100; //最小宽度
// const nodeMinHeight = 50; //最小高度

/*
|--------------------------------------------------------------------------
| 拖拽节点
|--------------------------------------------------------------------------
*/
// const nodeStartResizeWidth = ref(0); //节点开始resize时候宽度
// const nodeStartResizeHeight = ref(0); //节点开始resize时候高度
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
}
//鼠标松开
const handleNodeMouseUp = () => {
    isMouseDownNode.value = false;
    isMousedownDot.value = false;
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
    if (!isMouseDownNode.value || mouseInResizeDotInfo.value.isMouseDown || mouseInLineInfo.value.isInDragArrow) {
        return
    }
    if (currentMouseDownNode.value?.id !== currentNode.value?.id) {
        return
    }
    if (isMousedownDot.value) {
        return
    }
    const relativeX = e.clientX - nodeMousedownX.value; //相对于mousedown位置移动距离
    const relativeY = e.clientY - nodeMousedownY.value; //相对于mousedown位置移动距离
    nodeOffsetX.value = mousedownNodeX.value + relativeX;
    nodeOffsetY.value = mousedownNodeY.value + relativeY;
}

/*
|--------------------------------------------------------------------------
| 縮放节点改变节点大小事件
|--------------------------------------------------------------------------
*/
//縮放节点点击
// const handleResizeNodeMousedown = (e: MouseEvent, direction: ResizeDirection) => {
//     isMouseDownResizeDot.value = true;
//     resizeNodeMousedownX.value = e.clientX;
//     resizeNodeMousedownY.value = e.clientY;
//     nodeStartResizeWidth.value = nodeWidth.value;
//     nodeStartResizeHeight.value = nodeHeight.value;
//     mousedownNodeX.value = nodeOffsetX.value;
//     mousedownNodeY.value = nodeOffsetY.value;
//     mouseInResizeDotInfo.value.position = direction;
//     switch (direction) {
//         case "leftTop":
//             nodeFixedX.value = nodeOffsetX.value + (nodeWidth.value - nodeMinWidth)
//             nodeFixedY.value = nodeOffsetY.value + (nodeHeight.value - nodeMinHeight)
//             break;
//         case "rightTop":
//             nodeFixedX.value = nodeOffsetX.value
//             nodeFixedY.value = nodeOffsetY.value + (nodeHeight.value - nodeMinHeight)
//             break;
//         case "leftBottom":
//             nodeFixedX.value = nodeOffsetX.value + (nodeWidth.value - nodeMinWidth)
//             nodeFixedY.value = nodeOffsetY.value
//             break;
//         case "rightBottom":
//             nodeFixedX.value = nodeOffsetX.value
//             nodeFixedY.value = nodeOffsetY.value
//             break;
//         default:
//             break;
//     }
// }
//縮放节点鼠标移动(改变大小)
// const handleResizeNodeMouseMove = (e: MouseEvent) => {
//     if (!mouseInResizeDotInfo.value.isMouseDown || currentMouseDownNode.value?.id !== currentNode.value?.id) {
//         return;
//     }
//     const relativeX = e.clientX - mouseInResizeDotInfo.value.clientX; //相对x移动距离
//     const relativeY = e.clientY - mouseInResizeDotInfo.value.clientY; //相对y移动距离
//     if (mouseInResizeDotInfo.value.position === "leftTop") {
//         if (nodeStartResizeWidth.value - relativeX < nodeMinWidth) {
//             nodeWidth.value = nodeMinWidth;
//             nodeOffsetX.value = nodeFixedX.value
//         } else {
//             nodeWidth.value = nodeStartResizeWidth.value - relativeX
//             nodeOffsetX.value = mousedownNodeX.value + relativeX;
//         }
//         if (nodeStartResizeHeight.value - relativeY < nodeMinHeight) {
//             nodeHeight.value = nodeMinHeight;
//             nodeOffsetY.value = nodeFixedY.value
//         } else {
//             nodeHeight.value = nodeStartResizeHeight.value - relativeY
//             nodeOffsetY.value = mousedownNodeY.value + relativeY;
//         }
//     } else if (mouseInResizeDotInfo.value.position === "rightTop") {
//         if (nodeStartResizeWidth.value + relativeX < nodeMinWidth) {
//             nodeWidth.value = nodeMinWidth;
//             nodeOffsetX.value = nodeFixedX.value
//         } else {
//             nodeWidth.value = nodeStartResizeWidth.value + relativeX
//         }
//         if (nodeStartResizeHeight.value - relativeY < nodeMinHeight) {
//             nodeHeight.value = nodeMinHeight;
//             nodeOffsetY.value = nodeFixedY.value
//         } else {
//             nodeHeight.value = nodeStartResizeHeight.value - relativeY
//             nodeOffsetY.value = mousedownNodeY.value + relativeY;
//         }
//     } else if (mouseInResizeDotInfo.value.position === "leftBottom") {
//         if (nodeStartResizeWidth.value - relativeX < nodeMinWidth) {
//             nodeWidth.value = nodeMinWidth;
//             nodeOffsetX.value = nodeFixedX.value
//         } else {
//             nodeWidth.value = nodeStartResizeWidth.value - relativeX;
//             nodeOffsetX.value = mousedownNodeX.value + relativeX;
//         }
//         if (nodeStartResizeHeight.value + relativeY < nodeMinHeight) {
//             nodeHeight.value = nodeMinHeight;
//             nodeOffsetY.value = nodeFixedY.value
//         } else {
//             nodeHeight.value = nodeStartResizeHeight.value + relativeY
//             nodeOffsetY.value = mousedownNodeY.value;
//         }
//     } else if (mouseInResizeDotInfo.value.position === "rightBottom") {
//         if (nodeStartResizeWidth.value + relativeX < nodeMinWidth) {
//             nodeWidth.value = nodeMinWidth;
//             nodeOffsetX.value = nodeFixedX.value
//         } else {
//             nodeWidth.value = nodeStartResizeWidth.value + relativeX;
//         }
//         if (nodeStartResizeHeight.value + relativeY < nodeMinHeight) {
//             nodeHeight.value = nodeMinHeight;
//         } else {
//             nodeHeight.value = nodeStartResizeHeight.value + relativeY
//             nodeOffsetY.value = mousedownNodeY.value;
//         }
//     }
// }
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
    const node: ApiflowNodeInfo = {
        id: uuid(),
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
    contextmenuVisible.value = false;
}
onMounted(() => {
    document.documentElement.addEventListener("mousemove", debounce(handleNodeMouseMove));
    // document.documentElement.addEventListener("mousemove", debounce(handleResizeNodeMouseMove));
    document.documentElement.addEventListener("mouseup", handleNodeMouseUp);
    document.documentElement.addEventListener("click", handleClickGlobal);
    document.documentElement.addEventListener("mousedown", handleMouseDownDot);
})
onUnmounted(() => {
    document.documentElement.removeEventListener("mousemove", handleNodeMouseMove);
    // document.documentElement.removeEventListener("mousemove", handleResizeNodeMouseMove);
    document.documentElement.removeEventListener("mouseup", handleNodeMouseUp);
    document.documentElement.removeEventListener("click", handleClickGlobal);
    document.documentElement.removeEventListener("mousedown", handleMouseDownDot);
})

</script>

<style lang="scss" scoped>
.node {
    border: 1px solid $gray-700;
    position: absolute;
    user-select: none;
    background-color: $white;
    .resize-dot {
        border: 1px solid $theme-color;
        position: absolute;
        background-color: $white;
    }
    .create-line-dot {
        border-radius: 50%;
        border: 1px solid $theme-color;
        position: absolute;
        background-color: $white;
    }
}
</style>
