/*
    创建者：shuxiaokai
    模块名称：接口编排
    备注：
*/
<template>
    <div ref="apiflow" class="apiflow" @contextmenu.prevent="() => {}">
        <s-node
            v-for="(item, index) in apiflowList"
            :key="index"
            :node-id="item.id"
        >
        </s-node>
        <template v-for="(item, index) in apiflowList" :key="index">
            <template v-for="(item2, index2) in item.outcomings" :key="index2">
                <s-line :line-info="item2"></s-line>
            </template>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref, provide, computed, onUnmounted } from "vue";
import { store } from "@/store";
import { debounce } from "@/helper";
import type { ApidocApiflowLineInfo, ApidocApiflowNodeInfo } from "@@/store"
import sNode from "./components/node/node.vue"
import sLine from "./components/line/line.vue"
import { getZIndex } from "./components/utils/utils";

const apiflowList = computed(() => store.state["apidoc/apiflow"].apiflowList);
const isMouseInLineArrow = computed(() => store.state["apidoc/apiflow"].isMouseInLineArrow);
const currentDragLineId = ref("");
const apiflow: Ref<HTMLElement | null> = ref(null);
const wrapX = ref(0);
const wrapY = ref(0);
provide("apiflowWrapper", apiflow)

/*
|--------------------------------------------------------------------------
| 初始化widget
|--------------------------------------------------------------------------
*/
const initWidgets = () => {
    if (apiflow.value) {
        const clientRect = apiflow.value.getBoundingClientRect();
        wrapX.value = clientRect.x;
        wrapY.value = clientRect.y;
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
            x: Math.floor(clientRect.x),
            y: Math.floor(clientRect.y),
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
//鼠标移动时，检测是否到达关键节点
const handleMouseMove = (e: MouseEvent) => {
    const nodes = apiflowList.value;
    const lines: ApidocApiflowLineInfo[] = [];
    nodes.forEach(node => {
        console.log(2, node)
        node.outcomings.forEach(line => {
            lines.push(line)
        })
    })
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const { arrowInfo: { leftTopPoint, rightBottomPoint } } = line;
        const isXInLineArrow = e.clientX >= leftTopPoint.clientX && e.clientX <= rightBottomPoint.clientX
        const isYInLineArrow = e.clientY >= leftTopPoint.clientY && e.clientY <= rightBottomPoint.clientY
        if (isXInLineArrow && isYInLineArrow) { //鼠标是否在箭头上
            store.commit("apidoc/apiflow/changeIsMouseInLineArrow", true);
            currentDragLineId.value = line.id;
            break
        }
        currentDragLineId.value = "";
        store.commit("apidoc/apiflow/changeIsMouseInLineArrow", false);
    }
}
const handleConfirmDragLineId = () => {
    if (isMouseInLineArrow.value) {
        store.commit("apidoc/apiflow/changeCurrentDragLineId", currentDragLineId.value);
    }
}
const handleClearDragLineId = () => {
    store.commit("apidoc/apiflow/changeCurrentDragLineId", "");
}
onMounted(() => {
    initWidgets();
    document.documentElement.addEventListener("mousemove", debounce(handleMouseMove));
    document.documentElement.addEventListener("mousedown", handleConfirmDragLineId);
    document.documentElement.addEventListener("mouseup", handleClearDragLineId);
})
onUnmounted(() => {
    document.documentElement.removeEventListener("mousemove", handleMouseMove);
    document.documentElement.removeEventListener("mousedown", handleConfirmDragLineId);
    document.documentElement.removeEventListener("mouseup", handleClearDragLineId);
})
</script>

<style lang="scss" scoped>
.apiflow {
    height: calc(100vh - #{size(100)});
    overflow: auto;
    position: relative;
}
</style>
