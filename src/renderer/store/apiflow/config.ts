import { FlowConfig } from "@@/apiflow"
import { defineStore } from "pinia"

export const useFlowConfigStore = defineStore("flowConfig", {
    state: (): FlowConfig => {
        return {
            minLineWidth: 40,
            minLineHeight: 40,
            createLineDotSize: 10,
            resizeDotSize: 10,
            nodeMinWidth: 200,
            nodeMinHeight: 130,
            lineZIndex: 299,
            selectedNodeAreaZIndex: 301,
            selectionZIndex: 300,
            dragNodeZIndex: 298,
            zoom: 1,
            selectedNodeAreaPadding: 5,
        }
    }
})
