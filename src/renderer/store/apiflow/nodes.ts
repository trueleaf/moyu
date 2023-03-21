import { FlowNodeInfo } from "@@/apiflow"
import { defineStore } from "pinia"

export const useFlowNodesStore = defineStore("nodes", {
    state: (): { nodeList: FlowNodeInfo[] } => {
        return {
            nodeList: []
        }
    },
    actions: {
        changeNodeStyleInfoById(id: string, payload: Partial<FlowNodeInfo["styleInfo"]>) {
            const matchedNode = this.nodeList.find(node => node.id === id);
            if (matchedNode && payload.height != null) {
                matchedNode.styleInfo.height = payload.height
            }
            if (matchedNode && payload.width != null) {
                matchedNode.styleInfo.width = payload.width
            }
            if (matchedNode && payload.offsetX != null) {
                matchedNode.styleInfo.offsetX = payload.offsetX
            }
            if (matchedNode && payload.offsetY != null) {
                matchedNode.styleInfo.offsetY = payload.offsetY
            }
            if (matchedNode && payload.dragZIndex != null) {
                matchedNode.styleInfo.dragZIndex = payload.dragZIndex
            }
        }
    }
})
