<template>
    <div
        class="selected-node-area"
        :style="{
            left: selectionStore.selectedNodeArea.offsetX - configStore.selectedNodeAreaPadding + 'px',
            top: selectionStore.selectedNodeArea.offsetY - configStore.selectedNodeAreaPadding + 'px',
            width: selectionStore.selectedNodeArea.width + 2 * configStore.selectedNodeAreaPadding + 'px',
            height: selectionStore.selectedNodeArea.height + 2 * configStore.selectedNodeAreaPadding + 'px',
            zIndex: configStore.selectionZIndex
        }"
    >
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script lang="ts" setup>
import { useFlowConfigStore } from "@/store/apiflow/config";
import { useFlowSelectionStore } from "@/store/apiflow/selection";
import { onMounted, ref } from "vue";

const selectionStore = useFlowSelectionStore()
const configStore = useFlowConfigStore()
const canvas = ref<HTMLCanvasElement | null>(null)
const initCanvase = () => {
    if (!canvas.value) {
        return
    }
    const { width, height } = selectionStore.selectedNodeArea
    const realWidth = width + 2 * configStore.selectedNodeAreaPadding
    const realHeight = height + 2 * configStore.selectedNodeAreaPadding
    canvas.value.style.width = `${realWidth}px`;
    canvas.value.style.height = `${realHeight}px`;
    canvas.value.width = realWidth
    canvas.value.height = realHeight
    const ctx = canvas.value.getContext("2d") as CanvasRenderingContext2D;
    ctx.beginPath()
    ctx.strokeStyle = "#409EFF";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 10]);
    ctx.strokeRect(0, 0, realWidth, realHeight)
    ctx.closePath()
}

onMounted(() => {
    initCanvase();
})

</script>

<style lang="scss" scoped>
.selected-node-area {
    position: absolute;
    // border: 1px dashed #6eb1eb;
}
</style>
