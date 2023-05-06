import { FlowSelection } from "@@/apiflow"
import { defineStore } from "pinia"

export const useFlowSelectionStore = defineStore("flowSelection", {
    state: (): FlowSelection => {
        return {
            isMouseDown: false,
            isMouseDownSelectedArea: false,
            isMouseDownResizeDot: false,
            isMouseHoverResizeDot: false,
            isHover: false,
            isMove: false,
            startOffsetX: 0,
            startOffsetY: 0,
            endOffsetX: 0,
            endOffsetY: 0,
            nodeOffsetXWhenMouseDown: 0,
            nodeOffsetYWhenMouseDown: 0,
            width: 0,
            height: 0,
            offsetX: 0,
            offsetY: 0,
            selectedNodeArea: {
                width: 0,
                height: 0,
                offsetX: 0,
                offsetY: 0,
            },
            selectedNodeIds: [],
            selectedNodeMouseDownOffsetInfo: [],
        }
    }
})
