/*
    创建者：shuxiaokai
    模块名称：接口编排
    备注：
*/
<template>
    <div ref="apiflow" class="apiflow">
        <dragNode
            v-for="(item, index) in apiflowList"
            :key="index"
            :node-id="item.id"
        >
        </dragNode>
    </div>
</template>

<script lang="ts" setup>
import { axios } from "@/api/api";
import { router } from "@/router";
import { uuid } from "@/helper";
import { store } from "@/store";
import { onMounted, ref, Ref, computed } from "vue";
import type { ApidocApiflowInfo } from "@@/store"
import dragNode from "./components/node/node.vue"

const apiflowList = computed(() => store.state["apidoc/apiflow"].apiflowList)
const loading = ref(false);
const getApiflowList = () => {
    loading.value = true;
    const params = {
        projectId: router.currentRoute.value.query.id
    };
    axios.get("/api/docs/getApiflowList", { params }).then((res) => {
        console.log(res)
    }).catch((err) => {
        console.error(err)
    }).finally(() => {
        loading.value = false;
    })
}
const apiflow: Ref<HTMLElement | null> = ref(null);
const wrapX = ref(0);
const wrapY = ref(0);
onMounted(() => {
    getApiflowList();
    if (apiflow.value) {
        const clientRect = apiflow.value.getBoundingClientRect();
        wrapX.value = clientRect.x;
        wrapY.value = clientRect.y;
        const startNode: ApidocApiflowInfo = {
            id: "start",
            styleInfo: {
                x: 100,
                y: clientRect.height / 2,
                width: 120,
                height: 90,
            },
            outcomings: [{
                id: uuid(),
                startX: 200,
                startY: clientRect.height / 2 + 25,
                endX: 300,
                endY: clientRect.height / 2 + 25 - 100,
            }]
        }
        store.commit("apidoc/apiflow/changeContainerInfo", {
            x: clientRect.x,
            y: clientRect.y,
            width: clientRect.width,
            height: clientRect.height,
        });
        store.commit("apidoc/apiflow/addNode", startNode)
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