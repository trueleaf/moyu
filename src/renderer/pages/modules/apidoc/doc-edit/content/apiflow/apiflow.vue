/*
    创建者：shuxiaokai
    模块名称：接口编排
    备注：
*/
<template>
    <div
        ref="apiflow"
        class="apiflow"
        :style="{cursor: mouseIncreateLineDotInfo.nodeId ? 'crosshair' : ''}"
        @contextmenu.prevent="() => {}"
    >
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
import { getCreateLineArea, StickyArea } from "./components/utils/common/common";

const apiflowList = computed(() => store.state["apidoc/apiflow"].apiflowList);
const containerInfo = computed(() => store.state["apidoc/apiflow"].containerInfo)
const isMouseInLineArrow = computed(() => store.state["apidoc/apiflow"].isMouseInLineArrow);
const mouseIncreateLineDotInfo = computed(() => store.state["apidoc/apiflow"].mouseIncreateLineDotInfo)
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
//检查鼠标是否在创建连线节点上面
const checkMouseIsInCreateLineDot = (e: MouseEvent) => {
    const mouseOffsetX = e.clientX - containerInfo.value.clientX
    const mouseOffsetY = e.clientY - containerInfo.value.clientY
    const getMouseIsInCreateDot = (createLineArea: StickyArea, { x, y }: { x: number; y: number }) => {
        const { leftArea, rightArea, topArea, bottomArea } = createLineArea;
        if (x > leftArea.offsetX && x < leftArea.offsetX2 && y > leftArea.offsetY && y < leftArea.offsetY2) {
            return "left";
        }
        if (x > rightArea.offsetX && x < rightArea.offsetX2 && y > rightArea.offsetY && y < rightArea.offsetY2) {
            return "right";
        }
        if (x > topArea.offsetX && x < topArea.offsetX2 && y > topArea.offsetY && y < topArea.offsetY2) {
            return "top";
        }
        if (x > bottomArea.offsetX && x < bottomArea.offsetX2 && y > bottomArea.offsetY && y < bottomArea.offsetY2) {
            return "bottom";
        }
        return null;
    }
    const nodes = apiflowList.value;
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        const createLineArea = getCreateLineArea(node);
        const mouseInCreateDotPosition = getMouseIsInCreateDot(createLineArea, {
            x: mouseOffsetX,
            y: mouseOffsetY
        })
        if (mouseInCreateDotPosition) {
            store.commit("apidoc/apiflow/changeMouseIncreateLineDotInfo", {
                nodeId: node.id,
                position: mouseInCreateDotPosition
            })
            break
        }
        store.commit("apidoc/apiflow/changeMouseIncreateLineDotInfo", {
            nodeId: "",
            position: ""
        })
    }
}
//检查鼠标是否在线条箭头上面
const checkMouseIsInLineArrow = (e: MouseEvent) => {
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
//检查鼠标是否在节点上面
const checkMouseIsInNode = (e: MouseEvent) => {
    const nodes = apiflowList.value;
    const mouseOffsetX = e.clientX - containerInfo.value.clientX
    const mouseOffsetY = e.clientY - containerInfo.value.clientY
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        const { offsetX, width, offsetY, height } = node.styleInfo;
        const isInX = mouseOffsetX >= offsetX && mouseOffsetX < offsetX + width;
        const isInY = mouseOffsetY >= offsetY && mouseOffsetY < offsetY + height;
        if (isInX && isInY) {
            store.commit("apidoc/apiflow/changeMouseInNodeId", node.id);
            break;
        }
        store.commit("apidoc/apiflow/changeMouseInNodeId", "");
    }
}
//当前鼠标是否在节点缩放按钮上面
// const checkMouseIsInResizeDot = (e: MouseEvent) => {
//     const nodes = apiflowList.value;
//     const mouseOffsetX = e.clientX - containerInfo.value.clientX
//     const mouseOffsetY = e.clientY - containerInfo.value.clientY
//     for (let i = 0; i < nodes.length; i += 1) {
//         const node = nodes[i];
//         const { offsetX, width, offsetY, height } = node.styleInfo;
//         const isInX = mouseOffsetX >= offsetX && mouseOffsetX < offsetX + width;
//         const isInY = mouseOffsetY >= offsetY && mouseOffsetY < offsetY + height;
//         if (isInX && isInY) {
//             store.commit("apidoc/apiflow/changeMouseInResizeDotInfo", {
//                 nodeId: node.id,
//                 position: ""
//             });
//             break;
//         }
//         store.commit("apidoc/apiflow/changeMouseInResizeDotInfo", {
//             nodeId: "",
//             position: "",
//         });
//     }
// }
//鼠标移动时，检测是否到达关键节点
const handleMouseMove = (e: MouseEvent) => {
    checkMouseIsInCreateLineDot(e);
    checkMouseIsInLineArrow(e);
    checkMouseIsInNode(e);
    // checkMouseIsInResizeDot(e);
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
