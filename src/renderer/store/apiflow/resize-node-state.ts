import { FLowResizeNodeDotState } from '@@/apiflow';
import { defineStore } from 'pinia';

export const useFlowResizeNodeStateStore = defineStore('resizeNodeState', {
  state: (): FLowResizeNodeDotState => {
    return {
      hoverNodeId: '',
      hoverPosition: 'leftTop',
      isMouseDown: false,
      mouseDownClientX: 0,
      mouseDownClientY: 0,
      nodeWidthWhenMouseDown: 0,
      nodeHeightWhenMouseDown: 0,
      nodeOffsetXWhenMouseDown: 0,
      nodeOffsetYWhenMouseDown: 0,
      nodeFixedX: 0,
      nodeFixedY: 0,
    };
  },
});
