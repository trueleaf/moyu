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
const apiflow: Ref<HTMLElement | null> = ref(null);
provide("apiflowWrapper", apiflow)
const wrapX = ref(0);
const wrapY = ref(0);
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
                offsetY: 240,
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
        });
        store.commit("apidoc/apiflow/addNode", startNode)
        store.commit("apidoc/apiflow/addNode", {
            id: "start2",
            type: "node",
            styleInfo: {
                offsetX: 500,
                offsetY: 120,
                width: 220,
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
//线条上面鼠标移动(仅在节点上面生效)
const handleCheckMouseIsInArrow = (e: MouseEvent) => {
    const nodes = apiflowList.value;
    const lines: ApidocApiflowLineInfo[] = [];
    nodes.forEach(node => {
        node.outcomings.forEach(line => {
            lines.push(line)
        })
    })
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const { arrowInfo: { leftTopPoint, rightBottomPoint } } = line;
        const isXIn = e.clientX >= leftTopPoint.clientX && e.clientX <= rightBottomPoint.clientX
        const isYIn = e.clientY >= leftTopPoint.clientY && e.clientY <= rightBottomPoint.clientY
        if (isXIn && isYIn) {
            store.commit("apidoc/apiflow/changeIsMouseInLineArrow", true);
            store.commit("apidoc/apiflow/changeMouseInlineArrrowId", line.id);
            break
        }
        store.commit("apidoc/apiflow/changeIsMouseInLineArrow", false);
        store.commit("apidoc/apiflow/changeMouseInlineArrrowId", "");
    }
    // const drawInfo = getCurrentLineDrawInfo()
    // if (hostNode.value && drawInfo) {
    //     const mouseOffsetPoint = { x: e.clientX - Math.ceil(apiflowWrapperRect.x), y: e.clientY - Math.ceil(apiflowWrapperRect.y) }
    //     const leftTopPoint = {
    //         x: drawInfo.lineInfo.arrowInfo.leftTopPoint.x + props.lineInfo.offsetX,
    //         y: drawInfo.lineInfo.arrowInfo.leftTopPoint.y + props.lineInfo.offsetY,
    //     }
    //     const rightBottomPoint = {
    //         x: drawInfo.lineInfo.arrowInfo.rightBottomPoint.x + props.lineInfo.offsetX,
    //         y: drawInfo.lineInfo.arrowInfo.rightBottomPoint.y + props.lineInfo.offsetY,
    //     }
    //     const isIn = isInRect(mouseOffsetPoint, leftTopPoint, rightBottomPoint);
    //     // isInLineArrow.value = isIn
    //     store.commit("apidoc/apiflow/changeIsMouseInLineArrow", isIn)
    // }
}
onMounted(() => {
    initWidgets();
    document.documentElement.addEventListener("mousemove", debounce(handleCheckMouseIsInArrow));
})
onUnmounted(() => {
    document.documentElement.removeEventListener("mousemove", handleCheckMouseIsInArrow);
})
</script>

<style lang="scss" scoped>
.apiflow {
    height: calc(100vh - #{size(100)});
    overflow: auto;
    position: relative;
}
</style>
