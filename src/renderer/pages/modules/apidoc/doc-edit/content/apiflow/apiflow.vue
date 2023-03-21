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
        <teleport to="body">
            <pre style="position: absolute; right: 720px; top: 40px;">{{ nodesStore }}</pre>
        </teleport>
    </div>
</template>

<script lang="ts" setup>
import { debounce } from "@/helper";
import { useFlowContainerStore } from "@/store/apiflow/container";
import { useFlowNodesStore } from "@/store/apiflow/nodes";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { changeNodeStateWhenMouseDown } from "./mouse-handler/mousedown";

const apiflow = ref<HTMLDivElement | null>(null)
const containerStore = useFlowContainerStore();
const nodesStore = useFlowNodesStore();

//初始化容器信息
const changeContainerInfo = () => {
    if (apiflow.value !== null) {
        const apiflowRect = apiflow.value.getBoundingClientRect();
        containerStore.width = apiflowRect.width;
        containerStore.height = apiflowRect.height;
        containerStore.clientX = Math.ceil(apiflowRect.x);
        containerStore.clientY = Math.ceil(apiflowRect.y);
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
const handleMouseMove = () => {
    console.log(1)
}
const handleMouseDown = (e: MouseEvent) => {
    changeNodeStateWhenMouseDown(e);
}
const handleMouseUp = () => {
    console.log(1)
}
onMounted(() => {
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
    return "default"
})
</script>

<style lang="scss" scoped>
.apiflow {
    height: calc(100vh - #{size(100)});
    overflow: auto;
    position: relative;
}
</style>
