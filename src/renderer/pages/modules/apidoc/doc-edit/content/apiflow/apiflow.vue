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
                mouseIncreateLineDotInfo: {{ mouseIncreateLineDotInfo }}
                hoverNodeId: {{ hoverNodeId }}
                mouseInResizeDotInfo: {{ mouseInResizeDotInfo }}
                activeNodeId: {{ activeNodeId }}
            </pre>
            <pre style="position: absolute; right: 220px; top: 40px; height: 400px; overflow-y: auto;">{{ { nodeList } }}</pre>
        </teleport>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref, provide, computed, onUnmounted } from "vue";
import { store } from "@/store";
import { debounce } from "@/helper";
import type { ApidocApiflowNodeInfo } from "@@/store"
import sNode from "./components/node/node.vue"
import sLine from "./components/line/line.vue"
import { getZIndex } from "./components/utils/utils";
import { checkMouseIsInCreateLineDot, checkMouseIsInLineArrow, checkMouseIsInNode, checkMouseIsInResizeDot } from "./checker/checker";

const nodeList = computed(() => store.state["apidoc/apiflow"].nodeList);
const mouseIncreateLineDotInfo = computed(() => store.state["apidoc/apiflow"].mouseIncreateLineDotInfo)
const mouseInLineInfo = computed(() => store.state["apidoc/apiflow"].mouseInLineInfo)
const mouseInResizeDotInfo = computed(() => store.state["apidoc/apiflow"].mouseInResizeDotInfo)
const activeNodeId = computed(() => store.state["apidoc/apiflow"].activeNodeId);
const hoverNodeId = computed(() => store.state["apidoc/apiflow"].hoverNodeId);
const cursor = computed(() => {
    if (mouseIncreateLineDotInfo.value.nodeId) {
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
        const startNode: ApidocApiflowNodeInfo = {
            id: "start",
            type: "node",
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
            createLineNodeSize: 18,
            resizeNodeSize: 15,
        });
        store.commit("apidoc/apiflow/addNode", startNode)
        store.commit("apidoc/apiflow/addNode", {
            id: "start2",
            type: "node",
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
const handleCheckMouseInNodeOrLine = (e: MouseEvent) => {
    checkMouseIsInCreateLineDot(e);
    checkMouseIsInLineArrow(e);
    checkMouseIsInNode(e);
    checkMouseIsInResizeDot(e);
}
const handleConfirmDragLineId = () => {
    if (mouseInLineInfo.value.isInDragArrow) {
        store.commit("apidoc/apiflow/changeMouseInLineInfo", {
            isMouseDownDragArrow: true,
            dragLineId: mouseInLineInfo.value.mouseInlineId
        });
    }
}
const handleMouseUp = () => {
    store.commit("apidoc/apiflow/changeMouseInLineInfo", {
        isMouseDownDragArrow: false,
        dragLineId: ""
    });
    //清空当前选中节点
    store.commit("apidoc/apiflow/changeActiveNodeId", "")
}
onMounted(() => {
    initWidgets();
    document.documentElement.addEventListener("mousemove", debounce(handleCheckMouseInNodeOrLine));
    document.documentElement.addEventListener("mousedown", handleConfirmDragLineId);
    document.documentElement.addEventListener("mouseup", handleMouseUp);
})
onUnmounted(() => {
    document.documentElement.removeEventListener("mousemove", handleCheckMouseInNodeOrLine);
    document.documentElement.removeEventListener("mousedown", handleConfirmDragLineId);
    document.documentElement.removeEventListener("mouseup", handleMouseUp);
})
</script>

<style lang="scss" scoped>
.apiflow {
    height: calc(100vh - #{size(100)});
    overflow: auto;
    position: relative;
}
</style>
