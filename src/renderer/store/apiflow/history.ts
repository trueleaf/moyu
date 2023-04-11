import { FlowHistory } from "@@/apiflow"
import { defineStore } from "pinia"

type FlowHistoryStore = {
    readonly maxHistory: number;
    undoList: FlowHistory[];
    redoList: FlowHistory[];
}
export const useFlowHistoryStore = defineStore("flowHistory", {
    state: (): FlowHistoryStore => {
        return {
            maxHistory: 0,
            undoList: [],
            redoList: [],
        }
    }
})
