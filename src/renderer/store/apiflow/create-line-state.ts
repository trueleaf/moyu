import { FLowCreateLineDotState } from "@@/apiflow";
import { defineStore } from "pinia";

export const useFlowCreateLineStateStore = defineStore("createLineState", {
    state: (): FLowCreateLineDotState => {
        return {
            hoverNodeId: "",
            isMouseDown: false,
            hoverPosition: "left",
        };
    },
});
