/*
    创建者：shuxiaokai
    模块名称：接口编排
    备注：
*/
<template>
    <div
        ref="apiflow"
        class="apiflow"
        :style="{
            cursor: cursor,
        }"
        @contextmenu.prevent="() => {}"
    >
        <s-node
            v-for="(item, index) in nodeList"
            :key="index"
            :node-id="item.id"
        >
        </s-node>
        <template v-for="(item, index) in nodeList" :key="index">
            <template v-for="(item2, index2) in item.outcomings" :key="index2">
                <s-line :line-info="item2"></s-line>
            </template>
        </template>
        <teleport to="body">
            <pre style="position: absolute; right: 720px; top: 40px;">
                mouseInLineInfo: {{ mouseInLineInfo }}
                mouseInCreateLineDotInfo: {{ mouseInCreateLineDotInfo }}
                hoverNodeId: {{ hoverNodeId }}
                mouseInResizeDotInfo: {{ mouseInResizeDotInfo }}
                activeNodeId: {{ activeNodeId }}
                currentMouseDownNode: {{ currentMouseDownNode }}
            </pre>
            <pre style="position: absolute; right: 220px; top: 40px; height: 400px; overflow-y: auto;">{{ { nodeList } }}</pre>
        </teleport>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref, provide, computed, onUnmounted } from "vue";
import { store } from "@/store";
import { debounce } from "@/helper";
import type { ApiflowNodeInfo } from "@@/store"
import sNode from "./components/node/node.vue"
import sLine from "./components/line/line.vue"
import { getZIndex } from "./components/utils/utils";
import { checkMouseIsInCreateLineDot, checkMouseIsInLineArrow, checkMouseIsInNode, checkMouseIsInResizeDot, calcMouseDownNode } from "./checker/checker";

const nodeMinWidth = 100; //最小宽度
const nodeMinHeight = 50; //最小高度
const nodeList = computed(() => store.state["apidoc/apiflow"].nodeList);
const mouseInCreateLineDotInfo = computed(() => store.state["apidoc/apiflow"].mouseInCreateLineDotInfo)
const mouseInLineInfo = computed(() => store.state["apidoc/apiflow"].mouseInLineInfo)
const mouseInResizeDotInfo = computed(() => store.state["apidoc/apiflow"].mouseInResizeDotInfo)
const activeNodeId = computed(() => store.state["apidoc/apiflow"].activeNodeId);
const hoverNodeId = computed(() => store.state["apidoc/apiflow"].hoverNodeId);
const currentMouseDownNode = computed(() => store.state["apidoc/apiflow"].currentMouseDownNode);
const containerInfo = computed(() => store.state["apidoc/apiflow"].containerInfo)
const cursor = computed(() => {
    if (mouseInCreateLineDotInfo.value.nodeId) {
        return "crosshair"
    }
    if (activeNodeId.value && mouseInResizeDotInfo.value.position === "leftTop") {
        return "se-resize"
    }
    if (activeNodeId.value && mouseInResizeDotInfo.value.position === "rightTop") {
        return "ne-resize"
    }
    if (activeNodeId.value && mouseInResizeDotInfo.value.position === "leftBottom") {
        return "sw-resize"
    }
    if (activeNodeId.value && mouseInResizeDotInfo.value.position === "rightBottom") {
        return "se-resize"
    }
    if (hoverNodeId.value) {
        return "move"
    }
    return ""
})
const apiflow: Ref<HTMLElement | null> = ref(null);
provide("apiflowWrapper", apiflow)

/*
|--------------------------------------------------------------------------
| 初始化widget
|--------------------------------------------------------------------------
*/
const initWidgets = () => {
    if (apiflow.value) {
        const clientRect = apiflow.value.getBoundingClientRect();
        const startNode: ApiflowNodeInfo = {
            id: "start",
            styleInfo: {
                offsetX: 100,
                offsetY: 130,
                width: 220,
                height: 150,
                zIndex: getZIndex()
            },
            outcomings: [],
            incomings: []
        }
        store.commit("apidoc/apiflow/changeContainerInfo", {
            clientX: Math.floor(clientRect.x),
            clientY: Math.floor(clientRect.y),
            width: clientRect.width,
            height: clientRect.height,
            createLineDotSize: 18,
            resizeNodeBarSize: 15,
        });
        store.commit("apidoc/apiflow/addNode", startNode)
        store.commit("apidoc/apiflow/addNode", {
            id: "start2",
            styleInfo: {
                offsetX: 550,
                offsetY: 300,
                width: 250,
                height: 150,
                zIndex: getZIndex()
            },
            outcomings: [],
            incomings: []
        })
    } else {
        console.warn("容器不存在");
    }
}
/*
|--------------------------------------------------------------------------
| 鼠标在节点上位置手动判断
|--------------------------------------------------------------------------
*/
//鼠标移动时，检测是否到达关键节点
const handleMouseMove = (e: MouseEvent) => {
    checkMouseIsInCreateLineDot(e);
    checkMouseIsInLineArrow(e);
    checkMouseIsInNode(e);
    checkMouseIsInResizeDot(e);
    if (mouseInResizeDotInfo.value.isMouseDown) {
        const { mouseDownNodeWidth, mouseDownNodeHeight, nodeFixedX, nodeFixedY, mouseDownclientX, mouseDownclientY } = mouseInResizeDotInfo.value
        const relativeX = e.clientX - mouseDownclientX; //相对x移动距离
        const relativeY = e.clientY - mouseDownclientY; //相对y移动距离
        let width = 0;
        let height = 0;
        let x = 0;
        let y = 0;
        if (mouseInResizeDotInfo.value.position === "leftTop") {
            if (mouseDownNodeWidth - relativeX < nodeMinWidth) {
                width = nodeMinWidth;
                x = nodeFixedX
            } else {
                width = mouseDownNodeWidth - relativeX
                x = mouseDownclientX - containerInfo.value.clientX + relativeX;
            }
            if (mouseDownNodeHeight - relativeY < nodeMinHeight) {
                height = nodeMinHeight;
                y = nodeFixedY
            } else {
                height = mouseDownNodeHeight - relativeY
                y = mouseDownclientY + relativeY - containerInfo.value.clientY;
            }
        } else if (mouseInResizeDotInfo.value.position === "rightTop") {
            if (mouseDownNodeWidth + relativeX < nodeMinWidth) {
                width = nodeMinWidth;
                x = nodeFixedX
            } else {
                width = mouseDownNodeWidth + relativeX
            }
            if (mouseDownNodeHeight - relativeY < nodeMinHeight) {
                height = nodeMinHeight;
                y = nodeFixedY
            } else {
                height = mouseDownNodeHeight - relativeY
                y = mouseDownclientY + relativeY - containerInfo.value.clientY;
            }
        } else if (mouseInResizeDotInfo.value.position === "leftBottom") {
            if (mouseDownNodeWidth - relativeX < nodeMinWidth) {
                width = nodeMinWidth;
                x = nodeFixedX
            } else {
                width = mouseDownNodeWidth - relativeX;
                x = mouseDownclientX + relativeX - containerInfo.value.clientX;
            }
            if (mouseDownNodeHeight + relativeY < nodeMinHeight) {
                height = nodeMinHeight;
                y = nodeFixedY
            } else {
                height = mouseDownNodeHeight + relativeY
                y = mouseDownclientY;
            }
        } else if (mouseInResizeDotInfo.value.position === "rightBottom") {
            if (mouseDownNodeWidth + relativeX < nodeMinWidth) {
                width = nodeMinWidth;
                x = nodeFixedX
            } else {
                width = mouseDownNodeWidth + relativeX;
            }
            if (mouseDownNodeHeight + relativeY < nodeMinHeight) {
                height = nodeMinHeight;
            } else {
                height = mouseDownNodeHeight + relativeY
                y = mouseDownclientY;
            }
        }
        store.commit("apidoc/apiflow/changeNodeOffsetXById", { id: mouseInResizeDotInfo.value.nodeId, x })
        store.commit("apidoc/apiflow/changeNodeOffsetYById", { id: mouseInResizeDotInfo.value.nodeId, y })
        store.commit("apidoc/apiflow/changeNodeWidthById", { id: mouseInResizeDotInfo.value.nodeId, w: width })
        store.commit("apidoc/apiflow/changeNodeHeightById", { id: mouseInResizeDotInfo.value.nodeId, h: height })
    }
}
const handleMouseDown = (e: MouseEvent) => {
    calcMouseDownNode(e)
    if (mouseInLineInfo.value.isInDragArrow) {
        store.commit("apidoc/apiflow/changeMouseInLineInfo", {
            isMouseDown: true,
            dragLineId: mouseInLineInfo.value.mouseInlineId
        });
    }
    if (mouseInResizeDotInfo.value.nodeId && currentMouseDownNode.value) {
        let nodeFixedX = 0;
        let nodeFixedY = 0;
        const nodeOffsetX = currentMouseDownNode.value.styleInfo.offsetX;
        const nodeOffsetY = currentMouseDownNode.value.styleInfo.offsetY;
        const nodeWidth = currentMouseDownNode.value.styleInfo.width;
        const nodeHeight = currentMouseDownNode.value.styleInfo.height;
        switch (mouseInResizeDotInfo.value.position) {
            case "leftTop":
                nodeFixedX = nodeOffsetX + (nodeWidth - nodeMinWidth)
                nodeFixedY = nodeOffsetY + (nodeHeight - nodeMinHeight)
                break;
            case "rightTop":
                nodeFixedX = nodeOffsetX
                nodeFixedY = nodeOffsetY + (nodeHeight - nodeMinHeight)
                break;
            case "leftBottom":
                nodeFixedX = nodeOffsetX + (nodeWidth - nodeMinWidth)
                nodeFixedY = nodeOffsetY
                break;
            case "rightBottom":
                nodeFixedX = nodeOffsetX
                nodeFixedY = nodeOffsetY
                break;
            default:
                break;
        }
        store.commit("apidoc/apiflow/changeMouseInResizeDotInfo", {
            isMouseDown: true,
            mouseDownclientX: e.clientX,
            mouseDownclientY: e.clientY,
            mouseDownNodeWidth: currentMouseDownNode.value?.styleInfo.width,
            mouseDownNodeHeight: currentMouseDownNode.value?.styleInfo.height,
            nodeFixedX,
            nodeFixedY,
        });
    }
}
const handleMouseUp = () => {
    store.commit("apidoc/apiflow/changeMouseInLineInfo", {
        isMouseDown: false,
        dragLineId: ""
    });
    store.commit("apidoc/apiflow/changeMouseInResizeDotInfo", {
        isMouseDown: false,
        mouseDownclientX: 0,
        mouseDownclientY: 0,
        mouseDownNodeWidth: 0,
        mouseDownNodeHeight: 0,
    });
    //清空当前mousedown的节点
    store.commit("apidoc/apiflow/changeCurrentMouseDownNode", null)
}
const changeContainerInfo = debounce(() => {
    if (apiflow.value) {
        const clientRect = apiflow.value.getBoundingClientRect();
        store.commit("apidoc/apiflow/changeContainerInfo", {
            clientX: Math.floor(clientRect.x),
            clientY: Math.floor(clientRect.y),
            width: clientRect.width,
            height: clientRect.height,
            createLineDotSize: 18,
            resizeNodeBarSize: 15,
        });
    }
})
onMounted(() => {
    changeContainerInfo();
    initWidgets();
    document.documentElement.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mousedown", handleMouseDown);
    document.documentElement.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", changeContainerInfo)
})
onUnmounted(() => {
    document.documentElement.removeEventListener("mousemove", handleMouseMove);
    document.documentElement.removeEventListener("mousedown", handleMouseDown);
    document.documentElement.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("resize", changeContainerInfo)
})
</script>

<style lang="scss" scoped>
.apiflow {
    height: calc(100vh - #{size(100)});
    overflow: auto;
    position: relative;
}
</style>
