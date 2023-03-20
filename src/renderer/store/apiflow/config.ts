import { FlowConfig } from "@@/apiflow"
import { defineStore } from "pinia"

export const useFlowConfigStore = defineStore("flowConfig", {
    state: (): FlowConfig => {
        return {
            minLineWidth: 40,
            minLineHeight: 40,
            createLineDotSize: 12,
            resizeDotSize: 12,
            nodeMinWidth: 100,
            nodeMinHeight: 50,
            lineZIndex: 299,
            dragNodeZIndex: 298,
        }
    }
})
