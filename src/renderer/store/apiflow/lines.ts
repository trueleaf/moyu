import { FlowLineInfo } from "@@/apiflow";
import { defineStore } from "pinia";

export const useFlowLinesStore = defineStore("lines", {
    state: (): { lineList: FlowLineInfo[] } => {
        return {
            lineList: [],
        };
    },
    actions: {
        changeLineInfoById(id: string, payload: Partial<FlowLineInfo>) {
            const mathcedLine = this.lineList.find((line) => line.id === id);
            if (!mathcedLine) {
                return
            }
            if (payload.toPosition != null) {
                mathcedLine.toPosition = payload.toPosition;
            }
            if (payload.arrowInfo != null) {
                mathcedLine.arrowInfo = payload.arrowInfo;
            }

            if (payload.id != null) {
                mathcedLine.id = payload.id;
            }
            if (payload.width != null) {
                mathcedLine.width = payload.width;
            }
            if (payload.height != null) {
                mathcedLine.height = payload.height;
            }
            if (payload.offsetX != null) {
                mathcedLine.offsetX = payload.offsetX;
            }
            if (payload.offsetY != null) {
                mathcedLine.offsetY = payload.offsetY;
            }
            if (payload.fromPosition != null) {
                mathcedLine.fromPosition = payload.fromPosition;
            }
            if (payload.toPosition != null) {
                mathcedLine.toPosition = payload.toPosition;
            }
            if (payload.zIndex != null) {
                mathcedLine.zIndex = payload.zIndex;
            }
            if (payload.lineStartOffsetX != null) {
                mathcedLine.lineStartOffsetX = payload.lineStartOffsetX;
            }
            if (payload.lineStartOffsetY != null) {
                mathcedLine.lineStartOffsetY = payload.lineStartOffsetY;
            }
            if (payload.lineEndOffsetX != null) {
                mathcedLine.lineEndOffsetX = payload.lineEndOffsetX;
            }
            if (payload.lineEndOffsetY != null) {
                mathcedLine.lineEndOffsetY = payload.lineEndOffsetY;
            }
            if (payload.canHoverPosition != null) {
                mathcedLine.canHoverPosition = payload.canHoverPosition;
            }
        },
    },
});
