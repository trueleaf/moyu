import { FlowNodeInfo } from "@@/apiflow"
import { defineStore } from "pinia"

export const useFlowNodesStore = defineStore("nodes", {
    state: (): FlowNodeInfo[] => {
        return []
    }
})
