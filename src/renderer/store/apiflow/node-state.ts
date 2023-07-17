import { FlowNodeState } from '@@/apiflow';
import { defineStore } from 'pinia';

export const useFlowNodeStateStore = defineStore('nodeState', {
    state: (): FlowNodeState => {
        return {
            hoverNodeId: '',
            dragNodeId: '',
            isMouseDown: false,
            isMouseDownHeader: false,
            activeNodeId: '',
            mouseDownClientX: 0,
            mouseDownClientY: 0,
            isMove: false,
            nodeOffsetXWhenMouseDown: 0,
            nodeOffsetYWhenMouseDown: 0,
        };
    },
});
