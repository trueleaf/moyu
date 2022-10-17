/*
    创建者：shuxiaokai
    模块名称：接口编排
    备注：
*/
<template>
    <div ref="apiflow" class="apiflow" @contextmenu.prevent="() => {}">
        <dragNode
            v-for="(item, index) in apiflowList"
            :key="index"
            :node-id="item.id"
        >
        </dragNode>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref, provide, computed } from "vue";
import { store } from "@/store";
import type { ApidocApiflowNodeInfo } from "@@/store"
import dragNode from "./components/node/node.vue"
import { getZIndex } from "./components/node/utils";

const apiflowList = computed(() => store.state["apidoc/apiflow"].apiflowList);
const apiflow: Ref<HTMLElement | null> = ref(null);
provide("apiflowWrapper", apiflow)
const wrapX = ref(0);
const wrapY = ref(0);
onMounted(() => {
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
            x: clientRect.x,
            y: clientRect.y,
            width: clientRect.width,
            height: clientRect.height,
        });
        store.commit("apidoc/apiflow/addNode", startNode)
        store.commit("apidoc/apiflow/addNode", {
            id: "start2",
            type: "node",
            styleInfo: {
                offsetX: 500,
                offsetY: 150,
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
})
</script>

<style lang="scss" scoped>
.apiflow {
    height: calc(100vh - #{size(100)});
    overflow: auto;
    position: relative;
}
</style>
