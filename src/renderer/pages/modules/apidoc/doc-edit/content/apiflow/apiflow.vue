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
    >
        <s-node v-for="(item, index) in nodesStore.nodeList" :key="index" :node-id="item.id"></s-node>
        <!-- <s-line v-for="(item, index) in linesStore.lineList" :key="index" :line-info="item"></s-line> -->
        <teleport to="body">
            <pre style="position: absolute; right: 720px; top: 40px;">
                lineState: {{ lineStateStore }}
            </pre>
        </teleport>
        <canvas id="apiflowCanvas" ref="apiflowCanvas"></canvas>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { debounce } from "@/helper";
import { useFlowContainerStore } from "@/store/apiflow/container";
import { useFlowNodesStore } from "@/store/apiflow/nodes";
import { useFlowResizeNodeStateStore } from "@/store/apiflow/resize-node-state";
import { useFlowCreateLineDotStateStore } from "@/store/apiflow/create-line-state";
import { useFlowLineStateStore } from "@/store/apiflow/line-state";
import { useFlowNodeStateStore } from "@/store/apiflow/node-state";
// import { useFlowLinesStore } from "@/store/apiflow/lines";
import { FlowNodeInfo } from "@@/apiflow";
import { changeCreateLineDotWhenMouseDown, changeLineStateWhenMouseDown, changeNodeStateWhenMouseDown, changeResizeDotStateWhenMouseDown } from "./mouse-handler/mousedown";
import sNode from "./components/node/node.vue"
// import sLine from "./components/line/line.vue"
import { changeCreateLineDotStateWhenMouseMove, drawLineWhenMouseMove, changeNodeStateWhenMouseMove, changeNodeWhenMouseMove, changeResizeDotStateWhenMouseMove, resizeNodeWhenMouseMove, changeLineStateWhenMouseMove } from "./mouse-handler/mousemove";
import { changeStateWhenMouseUp } from "./mouse-handler/mouseup";

const apiflow = ref<HTMLDivElement | null>(null);
const apiflowCanvas = ref<HTMLCanvasElement | null>(null);
const containerStore = useFlowContainerStore();
const nodesStore = useFlowNodesStore();
// const linesStore = useFlowLinesStore()
const createLineDotStore = useFlowCreateLineDotStateStore()
const lineStateStore = useFlowLineStateStore()
const nodeStateStore = useFlowNodeStateStore()
const resizeNodeStateStore = useFlowResizeNodeStateStore()

//初始化容器信息
const changeContainerInfo = () => {
    if (apiflow.value !== null && apiflowCanvas.value !== null) {
        const apiflowRect = apiflow.value.getBoundingClientRect();
        containerStore.width = apiflowRect.width;
        containerStore.height = apiflowRect.height;
        containerStore.clientX = Math.ceil(apiflowRect.x);
        containerStore.clientY = Math.ceil(apiflowRect.y);
        apiflowCanvas.value.style.width = `${apiflowRect.width}px`
        apiflowCanvas.value.style.height = `${apiflowRect.height}px`
        apiflowCanvas.value.width = apiflowRect.width
        apiflowCanvas.value.height = apiflowRect.height
    }
}
const handleResize = debounce(() => {
    changeContainerInfo()
}, 300)

/*
|--------------------------------------------------------------------------
| 鼠标事件
|--------------------------------------------------------------------------
|
*/
const handleMouseMove = (e: MouseEvent) => {
    changeCreateLineDotStateWhenMouseMove(e);
    changeResizeDotStateWhenMouseMove(e);
    changeNodeStateWhenMouseMove(e);
    changeNodeWhenMouseMove(e);
    resizeNodeWhenMouseMove(e);
    drawLineWhenMouseMove(e);
    changeLineStateWhenMouseMove(e);
}
const handleMouseDown = (e: MouseEvent) => {
    changeNodeStateWhenMouseDown(e);
    changeLineStateWhenMouseDown();
    changeResizeDotStateWhenMouseDown(e);
    changeCreateLineDotWhenMouseDown();
}
const handleMouseUp = () => {
    changeStateWhenMouseUp()
}
const initNodes = () => {
    const nodeList: FlowNodeInfo[] = []
    for (let i = 0; i < 2; i += 1) {
        nodeList.push({
            id: `start${i}`,
            nodeType: "rect",
            styleInfo: {
                offsetX: 230 * (i + 1),
                offsetY: 200,
                width: 200,
                height: 100,
                zIndex: 1,
                dragZIndex: 1,
            },
            outcomingIds: [],
            incomingIds: []
        })
    }
    nodesStore.$patch((state) => {
        state.nodeList = nodeList
    })
}
onMounted(() => {
    initNodes();
    changeContainerInfo();
    window.addEventListener("resize", handleResize)
    document.documentElement.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mousedown", handleMouseDown);
    document.documentElement.addEventListener("mouseup", handleMouseUp);
})
onUnmounted(() => {
    document.documentElement.removeEventListener("mousemove", handleMouseMove);
    document.documentElement.removeEventListener("mousedown", handleMouseDown);
    document.documentElement.removeEventListener("mouseup", handleMouseUp);
})
const cursor = computed(() => {
    if (createLineDotStore.hoverNodeId) {
        return "crosshair"
    }
    if (lineStateStore.hoverLineId) {
        return "pointer"
    }
    if (nodeStateStore.activeNodeId && resizeNodeStateStore.hoverPosition === "leftTop") {
        return "se-resize"
    }
    if (nodeStateStore.activeNodeId && resizeNodeStateStore.hoverPosition === "rightTop") {
        return "ne-resize"
    }
    if (nodeStateStore.activeNodeId && resizeNodeStateStore.hoverPosition === "leftBottom") {
        return "sw-resize"
    }
    if (nodeStateStore.activeNodeId && resizeNodeStateStore.hoverPosition === "rightBottom") {
        return "se-resize"
    }
    if (nodeStateStore.hoverNodeId) {
        return "move"
    }
    if (lineStateStore.hoverDragLineId) {
        return "move"
    }
    return ""
})
</script>

<style lang="scss" scoped>
.apiflow {
    height: calc(100vh - #{size(100)});
    overflow: auto;
    position: relative;
}
</style>
