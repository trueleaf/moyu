import { store } from "@/store";
import { computed } from "vue";

const mouseInResizeDotInfo = computed(() => store.state["apidoc/apiflow"].mouseInResizeDotInfo)
const currentMouseDownNode = computed(() => store.state["apidoc/apiflow"].currentMouseDownNode);
/**
 * 处理节点拖拽移动
 */
export function handleResizeMouseMove(e: MouseEvent): void {
    console.log(currentMouseDownNode, mouseInResizeDotInfo, e)
}
