/*
    创建者：shuxiaokai
    模块名称：可拖拽节点
    备注：
*/
<template>
    <div
        class="node"
        :style="{ left: nodeX + 'px', top: nodeY + 'px', width: nodeWidth + 'px', height: nodeHeight + 'px' }"
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
        <template v-if="isMouseInNode">
            <div class="dot left" @mousedown.stop="handleMouseDownDot($event, 'left')"></div>
            <div class="dot right" @mousedown.stop="handleMouseDownDot($event, 'right')"></div>
            <div class="dot top" @mousedown.stop="handleMouseDownDot($event, 'top')"></div>
            <div class="dot bottom" @mousedown.stop="handleMouseDownDot($event, 'bottom')"></div>
        </template>
        <teleport to="body">
            <!-- 多个节点操作 -->
            <s-contextmenu v-if="contextmenuVisible" :left="contextmenuLeft" :top="contextmenuTop">
                <s-contextmenu-item label="新增子节点" @click="handleAddSubNode"></s-contextmenu-item>
                <s-contextmenu-item v-if="currentNode?.id !== 'start'" label="新增同级" @click="handleAddSiblingNode"></s-contextmenu-item>
            </s-contextmenu>
            <!-- <canvas ref="lineCanvas"></canvas> -->
        </teleport>
    </div>
</template>

<script lang="ts" setup>
import { uuid } from "@/helper";
import { store } from "@/store";
import { ApidocApiflowInfo } from "@@/store";
import { onUnmounted, ref, Ref, computed, onMounted, watch } from "vue";

type ResizeDirection = "leftTop" | "rightTop" | "leftBottom" | "rightBottom";

const props = defineProps({
    nodeId: {
        type: String,
        default: ""
    },
})
const containerInfo = computed(() => store.state["apidoc/apiflow"].containerInfo)
console.log(containerInfo)
/*
|--------------------------------------------------------------------------
| 节点
|--------------------------------------------------------------------------
*/
const currentNode = computed(() => store.state["apidoc/apiflow"].apiflowList.find(v => v.id === props.nodeId));
const nodeMousedownX = ref(0);
const nodeMousedownY = ref(0);
const isNodeMousedown = ref(false);
const isMouseInNode = ref(false);
const isSelectedNode = ref(false); //是否选中节点
const nodeX = computed({ //节点x值
    get() {
        return currentNode.value?.styleInfo.x || 0
    },
    set(v) {
        store.commit("apidoc/apiflow/changeNodeXById", { id: props.nodeId, x: v })
    },
});
const nodeY = computed({ //节点y值
    get() {
        return currentNode.value?.styleInfo.y || 0
    },
    set(v) {
        store.commit("apidoc/apiflow/changeNodeYById", { id: props.nodeId, y: v })
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
| 节点事件
|--------------------------------------------------------------------------
*/
//鼠标按下
const handleNodeMousedown = (e: MouseEvent) => {
    nodeMousedownX.value = e.clientX;
    nodeMousedownY.value = e.clientY;
    mousedownNodeX.value = nodeX.value;
    mousedownNodeY.value = nodeY.value;
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
//鼠标移动
const handleNodeMousemove = (e: MouseEvent) => {
    if (!isNodeMousedown.value || isResizeNodeMousedown.value) {
        return
    }
    const relativeX = e.clientX - nodeMousedownX.value; //相对于mousedown位置移动距离
    const relativeY = e.clientY - nodeMousedownY.value; //相对于mousedown位置移动距离
    nodeX.value = mousedownNodeX.value + relativeX;
    nodeY.value = mousedownNodeY.value + relativeY;
}
/*
|--------------------------------------------------------------------------
| 拖拽节点事件
|--------------------------------------------------------------------------
*/
//拖拽节点点击
const handleResizeNodeMousedown = (e: MouseEvent, direction: ResizeDirection) => {
    isResizeNodeMousedown.value = true;
    resizeNodeMousedownX.value = e.clientX;
    resizeNodeMousedownY.value = e.clientY;
    nodeStartResizeWidth.value = nodeWidth.value;
    nodeStartResizeHeight.value = nodeHeight.value;
    mousedownNodeX.value = nodeX.value;
    mousedownNodeY.value = nodeY.value;
    resizeDirection.value = direction;
    switch (direction) {
    case "leftTop":
        nodeFixedX.value = nodeX.value + (nodeWidth.value - nodeMinWidth)
        nodeFixedY.value = nodeY.value + (nodeHeight.value - nodeMinHeight)
        break;
    case "rightTop":
        nodeFixedX.value = nodeX.value
        nodeFixedY.value = nodeY.value + (nodeHeight.value - nodeMinHeight)
        break;
    case "leftBottom":
        nodeFixedX.value = nodeX.value + (nodeWidth.value - nodeMinWidth)
        nodeFixedY.value = nodeY.value
        break;
    case "rightBottom":
        nodeFixedX.value = nodeX.value
        nodeFixedY.value = nodeY.value
        break;
    default:
        break;
    }
}
//拖拽节点鼠标移动(改变大小)
const handleResizeNodeMousemove = (e: MouseEvent) => {
    if (!isResizeNodeMousedown.value) {
        return;
    }
    const relativeX = e.clientX - resizeNodeMousedownX.value; //相对x移动距离
    const relativeY = e.clientY - resizeNodeMousedownY.value; //相对y移动距离
    if (resizeDirection.value === "leftTop") {
        if (nodeStartResizeWidth.value - relativeX < nodeMinWidth) {
            nodeWidth.value = nodeMinWidth;
            nodeX.value = nodeFixedX.value
        } else {
            nodeX.value = mousedownNodeX.value + relativeX;
            nodeWidth.value = nodeStartResizeWidth.value - relativeX
        }
        if (nodeStartResizeHeight.value - relativeY < nodeMinHeight) {
            nodeHeight.value = nodeMinHeight;
            nodeY.value = nodeFixedY.value
        } else {
            nodeHeight.value = nodeStartResizeHeight.value - relativeY
            nodeY.value = mousedownNodeY.value + relativeY;
        }
    } else if (resizeDirection.value === "rightTop") {
        if (nodeStartResizeWidth.value + relativeX < nodeMinWidth) {
            nodeWidth.value = nodeMinWidth;
            nodeX.value = nodeFixedX.value
        } else {
            nodeWidth.value = nodeStartResizeWidth.value + relativeX
        }
        if (nodeStartResizeHeight.value - relativeY < nodeMinHeight) {
            nodeHeight.value = nodeMinHeight;
            nodeY.value = nodeFixedY.value
        } else {
            nodeHeight.value = nodeStartResizeHeight.value - relativeY
            nodeY.value = mousedownNodeY.value + relativeY;
        }
    } else if (resizeDirection.value === "leftBottom") {
        if (nodeStartResizeWidth.value - relativeX < nodeMinWidth) {
            nodeWidth.value = nodeMinWidth;
            nodeX.value = nodeFixedX.value
        } else {
            nodeWidth.value = nodeStartResizeWidth.value - relativeX;
            nodeX.value = mousedownNodeX.value + relativeX;
        }
        if (nodeStartResizeHeight.value + relativeY < nodeMinHeight) {
            nodeHeight.value = nodeMinHeight;
            nodeY.value = nodeFixedY.value
        } else {
            nodeHeight.value = nodeStartResizeHeight.value + relativeY
            nodeY.value = mousedownNodeY.value;
        }
    } else if (resizeDirection.value === "rightBottom") {
        if (nodeStartResizeWidth.value + relativeX < nodeMinWidth) {
            nodeWidth.value = nodeMinWidth;
            nodeX.value = nodeFixedX.value
        } else {
            nodeWidth.value = nodeStartResizeWidth.value + relativeX;
        }
        if (nodeStartResizeHeight.value + relativeY < nodeMinHeight) {
            nodeHeight.value = nodeMinHeight;
        } else {
            nodeHeight.value = nodeStartResizeHeight.value + relativeY
            nodeY.value = mousedownNodeY.value;
        }
    }
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
    const node: ApidocApiflowInfo = {
        id: uuid(),
        styleInfo: {
            x: currentNode.value.styleInfo.x + currentNode.value.styleInfo.width + 100,
            y: currentNode.value.styleInfo.y,
            width: 100,
            height: 50,
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
// const bufferDistance = 40;
const handleMouseDownDot = (e: MouseEvent, direction: "left" | "top" | "bottom" | "right") => {
    console.log(e, direction)
}
const lineCanvas: Ref<HTMLCanvasElement | null> = ref(null)
const initLineCanvas = () => {
    if (lineCanvas.value) {
        lineCanvas.value.width = 200
        lineCanvas.value.height = 200
        lineCanvas.value.style.position = "absolute";
        lineCanvas.value.style.left = `${containerInfo.value.x}px`
        lineCanvas.value.style.top = `${containerInfo.value.y}px`
    }
}
const drawLine = () => {
    initLineCanvas();
    if (currentNode.value?.outcomings) {
        const { outcomings } = currentNode.value;
        outcomings.forEach((outcoming) => {
            if (lineCanvas.value) {
                const ctx = lineCanvas.value.getContext("2d");
                if (!ctx) {
                    return;
                }
                ctx.strokeStyle = "red";
                ctx.lineWidth = 1;
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(outcoming.startX, outcoming.startY);
                ctx.lineTo(outcoming.endX, outcoming.endY);
                ctx.stroke();
                ctx.closePath();
            }
        })
    }
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
document.documentElement.addEventListener("mousemove", handleNodeMousemove);
document.documentElement.addEventListener("mousemove", handleResizeNodeMousemove);
document.documentElement.addEventListener("mouseup", handleNodeMouseUp);
document.documentElement.addEventListener("mouseup", handleResizeNodeMouseUp);
document.documentElement.addEventListener("click", handleClickGlobal);
onMounted(() => {
    // initLineCanvas();
    watch(currentNode, () => {
        console.log(222)
        drawLine()
    }, {
        deep: true
    })
})

onUnmounted(() => {
    document.documentElement.removeEventListener("mousemove", handleNodeMousemove);
    document.documentElement.removeEventListener("mousemove", handleResizeNodeMousemove);
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
            top: -(size($dotWidth/2));
            left: -(size($dotWidth/2));
            cursor: se-resize;
        }
        &.rt { //右上
            top: -(size($dotWidth/2));
            right: -(size($dotWidth/2));
            cursor: ne-resize;
        }
        &.lb { //左下
            bottom: -(size($dotWidth/2));
            left: -(size($dotWidth/2));
            cursor: sw-resize;
        }
        &.rb { //右下
            bottom: -(size($dotWidth/2));
            right: -(size($dotWidth/2));
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
            top: calc(50% - size($dotHeight / 2));
            left: -(size($dotWidth/2));
            cursor: crosshair;
        }
        &.right { //右
            top: calc(50% - size($dotHeight / 2));
            right: -(size($dotWidth/2));
            cursor: crosshair;
        }
        &.top { //上
            top: -(size($dotHeight/2));
            left: calc(50% - size($dotHeight / 2));
            cursor: crosshair;
        }
        &.bottom { //下
            bottom: -(size($dotWidth/2));
            left: calc(50% - size($dotWidth / 2));;
            cursor: crosshair;
        }
    }
}
</style>
