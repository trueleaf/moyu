import { FlowLineInfo } from "@@/apiflow"
import { defineStore } from "pinia"

export const useFlowLinesStore = defineStore("lines", {
    state: (): FlowLineInfo[] => {
        return []
    }
})
