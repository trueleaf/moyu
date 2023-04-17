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
            nodeMinHeight: 60,
            lineZIndex: 299,
            selectionZIndex: 300,
            dragNodeZIndex: 298,
            zoom: 1,
            selectedNodeAreaPadding: 5,
        }
    }
})
