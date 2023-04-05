import { FlowConfig } from "@@/apiflow"
import { defineStore } from "pinia"

export const useFlowConfigStore = defineStore("flowConfig", {
    state: (): FlowConfig => {
        return {
            minLineWidth: 40,
            minLineHeight: 40,
            createLineDotSize: 12,
            resizeDotSize: 12,
            nodeMinWidth: 200,
            nodeMinHeight: 130,
            lineZIndex: 299,
            dragNodeZIndex: 298,
            zoom: 0.5,
        }
    }
})
