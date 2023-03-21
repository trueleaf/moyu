import { FlowLineInfo } from "@@/apiflow"
import { defineStore } from "pinia"

export const useFlowLinesStore = defineStore("lines", {
    state: (): { lineList: FlowLineInfo[] } => {
        return {
            lineList: []
        }
    }
})
