import { FlowConfig } from "@@/apiflow"
import { defineStore } from "pinia"

export const useFlowConfigStore = defineStore("flowConfig", {
    state: (): FlowConfig => {
        return {
            minLineWidth: 40,
            minLineHeight: 40,
            createLineDotSize: 8,
            resizeDotSize: 8,
            nodeMinWidth: 100,
            nodeMinHeight: 60,
            lineZIndex: 299,
            selectedNodeAreaZIndex: 301,
            selectionZIndex: 300,
            dragNodeZIndex: 298,
            zoom: 1,
            selectedNodeAreaPadding: 5,
        }
    }
})
