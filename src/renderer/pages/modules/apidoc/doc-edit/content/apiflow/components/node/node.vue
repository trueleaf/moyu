<template>
    <div
        class="node"
        :style="{
            left: nodeInfo.styleInfo.offsetX * configStore.zoom + 'px',
            top: nodeInfo.styleInfo.offsetY * configStore.zoom + 'px',
            width: nodeInfo.styleInfo.width * configStore.zoom+ 'px',
            height: nodeInfo.styleInfo.height * configStore.zoom + 'px',
            zIndex: nodeInfo.styleInfo.zIndex,
            border: (nodeStateStore.activeNodeId !== props.nodeId ? '1px solid #aaa' : '1px solid transparent')
        }"
    >
        <template v-if="nodeStateStore.activeNodeId === props.nodeId">
            <div
                class="resize-dot lt"
                :style="{
                    width: configStore.resizeDotSize + 'px',
                    height: configStore.resizeDotSize + 'px',
                    left: -configStore.resizeDotSize/2 + 'px',
                    top: -configStore.resizeDotSize/2 + 'px',
                }"
            >
            </div>
            <div
                class="resize-dot rt"
                :style="{
                    width: configStore.resizeDotSize + 'px',
                    height: configStore.resizeDotSize + 'px',
                    top: -configStore.resizeDotSize / 2 + 'px',
                    right: -configStore.resizeDotSize / 2 + 'px',
                }"
            >
            </div>
            <div
                class="resize-dot lb"
                :style="{
                    width: configStore.resizeDotSize + 'px',
                    height: configStore.resizeDotSize + 'px',
                    left: -configStore.resizeDotSize / 2 + 'px',
                    bottom: -configStore.resizeDotSize / 2 + 'px',
                }"
            >
            </div>
            <div
                class="resize-dot rb"
                :style="{
                    width: configStore.resizeDotSize + 'px',
                    height: configStore.resizeDotSize + 'px',
                    bottom: -configStore.resizeDotSize / 2 + 'px',
                    right: -configStore.resizeDotSize / 2 + 'px',
                }"
            >
            </div>
        </template>
        <template v-if="nodeStateStore.hoverNodeId === props.nodeId || nodeStateStore.activeNodeId === props.nodeId">
            <div
                class="create-line-dot"
                :style="{
                    width: configStore.createLineDotSize + 'px',
                    height: configStore.createLineDotSize + 'px',
                    left: -configStore.createLineDotSize / 2 + 'px',
                    top: `calc(50% - ${configStore.createLineDotSize / 2}px)`,
                }"
            >
            </div>
            <div
                class="create-line-dot"
                :style="{
                    width: configStore.createLineDotSize + 'px',
                    height: configStore.createLineDotSize + 'px',
                    right: -configStore.createLineDotSize / 2 + 'px',
                    top: `calc(50% - ${configStore.createLineDotSize / 2}px)`,
                }"
            >
            </div>
            <div
                class="create-line-dot"
                :style="{
                    width: configStore.createLineDotSize + 'px',
                    height: configStore.createLineDotSize + 'px',
                    top: -configStore.createLineDotSize / 2 + 'px',
                    left: `calc(50% - ${configStore.createLineDotSize / 2}px)`,
                }"
            >
            </div>
            <div
                class="create-line-dot"
                :style="{
                    width: configStore.createLineDotSize + 'px',
                    height: configStore.createLineDotSize + 'px',
                    bottom: -configStore.createLineDotSize / 2 + 'px',
                    left: `calc(50% - ${configStore.createLineDotSize / 2}px)`,
                }"
            >
            </div>
        </template>
        <template v-if="nodeStateStore.activeNodeId === props.nodeId">
            <div className="resize-border"></div>
        </template>
        <template v-if="nodeStateStore.activeNodeId === props.nodeId && nodeStateStore.isMove">
            <div className="position-info">
                <span>X: {{ Math.ceil(nodeInfo.styleInfo.offsetX * configStore.zoom) }}&nbsp;&nbsp;&nbsp;</span>
                <span>Y: {{ Math.ceil(nodeInfo.styleInfo.offsetY * configStore.zoom) }}</span>
            </div>
        </template>
        x: {{ Math.ceil(nodeInfo.styleInfo.offsetX * configStore.zoom) }}
        y: {{ Math.ceil(nodeInfo.styleInfo.offsetY * configStore.zoom) }}
        w: {{ Math.ceil(nodeInfo.styleInfo.width * configStore.zoom) }}
        h: {{ Math.ceil(nodeInfo.styleInfo.height * configStore.zoom) }}
    </div>
</template>

<script lang="ts" setup>
import { useFlowNodesStore } from "@/store/apiflow/nodes";
import { useFlowNodeStateStore } from "@/store/apiflow/node-state";
import { useFlowConfigStore } from "@/store/apiflow/config";
import { FlowNodeInfo } from "@@/apiflow";

const props = defineProps({
    nodeId: {
        type: String,
        default: ""
    }
});

const nodesStore = useFlowNodesStore();
const nodeStateStore = useFlowNodeStateStore();
const configStore = useFlowConfigStore();
const nodeInfo = nodesStore.getNodeById(props.nodeId) as FlowNodeInfo;

</script>

<style lang="scss" scoped>
.node {
    position: absolute;
    user-select: none;
    background-color: $white;
    user-select: none;
    // border: 1px solid $gray-500;
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
    .resize-border {
        position: absolute;
        left: 0;
        top: 0;
        z-index: -1;
        border: 1px solid #409EFF;
        width: 100%;
        height: 100%;
    }
    .position-info {
        position: absolute;
        left: 50%;
        transform: translate(-50%, 0);
        white-space: nowrap;
        bottom: -35px;
        padding: 5px 10px;
        border: 1px solid #d0d0d0;
        background-color: #f2f2f2;
    }
}
</style>
